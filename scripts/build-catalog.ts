/**
 * Data pipeline: The Muse API → static catalog.
 *
 *   Extract   fetch a fixed plan of job pages + the full company directory
 *   Transform classify roles, drop non-tech rows, extract skills/salary, dedupe, cap
 *   Load      write .data/catalog.json (build-time only) and public/data/* (shipped)
 *
 * Runs before `next dev` / `next build`. Raw responses are cached in .data/raw.json
 * so re-running the transform (e.g. while tuning the classifier) doesn't refetch.
 *
 *   npm run catalog              fetch if the cache is older than CATALOG_MAX_AGE_HOURS (default 6)
 *   npm run catalog -- --refresh always refetch
 *   npm run catalog -- --offline never fetch; transform the cached raw data
 */
import fs from "node:fs/promises";
import path from "node:path";
import {MuseCompany, MuseJob, MusePage} from "../src/lib/catalog/muse-types";
import {buildCatalog, RawSnapshot} from "../src/lib/catalog/transform";
import {Catalog, JobsIndex, JobSummary} from "../src/lib/catalog/types";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, ".data");
const RAW_FILE = path.join(DATA_DIR, "raw.json");
const CATALOG_FILE = path.join(DATA_DIR, "catalog.json");
const PUBLIC_DIR = path.join(ROOT, "public", "data");

const API = "https://www.themuse.com/api/public";
const API_KEY = process.env.MUSE_API_KEY;
const MAX_AGE_HOURS = Number(process.env.CATALOG_MAX_AGE_HOURS ?? 6);
const CONCURRENCY = 4;

/**
 * What to pull from upstream. The category feeds are dominated by a handful of
 * employers, so after a few pages of each we also pull page 0 for every
 * tech-industry company in the directory — that's what gives the board breadth.
 * ~60 slice pages + ~50 directory pages + ~300 company pages stays inside the
 * 500 req/hour anonymous limit (set MUSE_API_KEY for 3,600/hour).
 */
const SE = "Software Engineering";
const SLICES: { category: string; location?: string; level?: string; pages: number }[] = [
    {category: SE, pages: 15},
    {category: SE, location: "Flexible / Remote", pages: 10},
    {category: SE, location: "San Francisco, CA", pages: 2},
    {category: SE, location: "New York, NY", pages: 2},
    {category: SE, location: "London, United Kingdom", pages: 2},
    {category: SE, level: "Internship", pages: 3},
    {category: SE, level: "Entry Level", pages: 3},
    {category: "Data and Analytics", pages: 5},
    {category: "Design and UX", pages: 4},
    {category: "Product Management", pages: 4},
    {category: "Computer and IT", pages: 4},
    {category: "Project Management", pages: 1},
];

const TECH_INDUSTRIES = new Set([
    "Technology", "Software", "Information Technology", "Fintech", "Entertainment & Gaming", "Healthtech",
    "Social Media", "Data Science", "Blockchain", "Telecom",
]);

const args = new Set(process.argv.slice(2));

function log(message: string) {
    console.log(`[catalog] ${message}`);
}

async function sleep(ms: number) {
    await new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson<T>(url: string, attempt = 1): Promise<T> {
    try {
        const response = await fetch(url, {headers: {"User-Agent": "devjobs-catalog (+https://github.com/iabolfazl83/devjobs)"}});
        const remaining = Number(response.headers.get("x-ratelimit-remaining"));
        if (Number.isFinite(remaining)) lowestRemaining = Math.min(lowestRemaining, remaining);
        if (response.status === 429 || response.status >= 500) {
            throw new Error(`HTTP ${response.status}`);
        }
        if (!response.ok) {
            // 4xx (e.g. "page too high") is not worth retrying.
            const body = await response.text();
            throw Object.assign(new Error(`HTTP ${response.status}: ${body.slice(0, 120)}`), {fatal: true});
        }
        return (await response.json()) as T;
    } catch (error) {
        if ((error as { fatal?: boolean }).fatal || attempt >= 4) throw error;
        await sleep(500 * 2 ** attempt);
        return fetchJson<T>(url, attempt + 1);
    }
}

/** Runs async tasks with a fixed concurrency; failures are collected, not thrown. */
async function pool<T>(tasks: (() => Promise<T>)[], concurrency: number): Promise<{ results: T[]; failures: number }> {
    const results: T[] = [];
    let failures = 0;
    let next = 0;
    await Promise.all(Array.from({length: concurrency}, async () => {
        while (next < tasks.length) {
            const task = tasks[next++];
            try {
                results.push(await task());
            } catch (error) {
                failures++;
                log(`request failed: ${(error as Error).message}`);
            }
        }
    }));
    return {results, failures};
}

function url(resource: "jobs" | "companies", params: Record<string, string | number | undefined>) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => value !== undefined && search.set(key, String(value)));
    if (API_KEY) search.set("api_key", API_KEY);
    return `${API}/${resource}?${search}`;
}

let lowestRemaining = Infinity;

async function extract(): Promise<RawSnapshot> {
    const firstCompanies = await fetchJson<MusePage<MuseCompany>>(url("companies", {page: 0}));
    const directoryTasks = Array.from({length: Math.max(0, firstCompanies.page_count - 1)}, (_, index) => () =>
        fetchJson<MusePage<MuseCompany>>(url("companies", {page: index + 1})),
    );
    log(`fetching ${directoryTasks.length + 1} company directory pages…`);
    const directory = await pool(directoryTasks, CONCURRENCY);
    const companies = [...firstCompanies.results, ...directory.results.flatMap((page) => page.results)];

    const techCompanies = companies.filter((company) => company.industries.some((industry) => TECH_INDUSTRIES.has(industry.name)));
    const jobTasks = [
        ...SLICES.flatMap(({pages, ...filters}) =>
            Array.from({length: pages}, (_, page) => () => fetchJson<MusePage<MuseJob>>(url("jobs", {page, ...filters}))),
        ),
        ...techCompanies.map((company) => () => fetchJson<MusePage<MuseJob>>(url("jobs", {page: 0, company: company.name}))),
    ];
    log(`fetching ${jobTasks.length} job pages (${techCompanies.length} of them per-company)…`);
    const jobs = await pool(jobTasks, CONCURRENCY);

    const totalTasks = directoryTasks.length + jobTasks.length;
    const failures = directory.failures + jobs.failures;
    if (failures / totalTasks > 0.2) {
        throw new Error(`${failures}/${totalTasks} requests failed — refusing to publish a partial catalog`);
    }
    if (Number.isFinite(lowestRemaining)) log(`upstream rate limit remaining: ${lowestRemaining}`);

    return {
        fetchedAt: new Date().toISOString(),
        jobs: jobs.results.flatMap((page) => page.results),
        companies,
    };
}

async function readRaw(): Promise<RawSnapshot | null> {
    try {
        return JSON.parse(await fs.readFile(RAW_FILE, "utf8")) as RawSnapshot;
    } catch {
        return null;
    }
}

async function loadRaw(): Promise<RawSnapshot> {
    const cached = await readRaw();
    const ageHours = cached ? (Date.now() - new Date(cached.fetchedAt).getTime()) / 3_600_000 : Infinity;

    if (args.has("--offline")) {
        if (!cached) throw new Error("--offline was passed but there is no cached raw data in .data/raw.json");
        log(`offline: using cached data from ${cached.fetchedAt}`);
        return cached;
    }
    if (cached && !args.has("--refresh") && ageHours < MAX_AGE_HOURS) {
        log(`using cached data (${ageHours.toFixed(1)}h old, refreshes after ${MAX_AGE_HOURS}h)`);
        return cached;
    }

    try {
        const raw = await extract();
        await fs.mkdir(DATA_DIR, {recursive: true});
        await fs.writeFile(RAW_FILE, JSON.stringify(raw));
        return raw;
    } catch (error) {
        // A failed refresh should never take the site down: fall back to the last good snapshot.
        if (cached) {
            log(`fetch failed (${(error as Error).message}); falling back to cached data from ${cached.fetchedAt}`);
            return cached;
        }
        throw error;
    }
}

function toSummary({descriptionHtml: _descriptionHtml, ...summary}: Catalog["jobs"][number]): JobSummary {
    return summary;
}

async function load(catalog: Catalog) {
    await fs.mkdir(DATA_DIR, {recursive: true});
    await fs.writeFile(CATALOG_FILE, JSON.stringify(catalog));

    await fs.rm(PUBLIC_DIR, {recursive: true, force: true});
    await fs.mkdir(path.join(PUBLIC_DIR, "jobs"), {recursive: true});

    const index: JobsIndex = {generatedAt: catalog.generatedAt, jobs: catalog.jobs.map(toSummary)};
    await fs.writeFile(path.join(PUBLIC_DIR, "jobs.json"), JSON.stringify(index));
    await Promise.all(catalog.jobs.map((job) =>
        fs.writeFile(path.join(PUBLIC_DIR, "jobs", `${job.id}.json`), JSON.stringify(job)),
    ));

    const indexBytes = (await fs.stat(path.join(PUBLIC_DIR, "jobs.json"))).size;
    return indexBytes;
}

async function main() {
    const raw = await loadRaw();
    // Imported lazily: jsdom (behind DOMPurify) swaps Node's global fetch dispatcher,
    // which silently drops HTTPS_PROXY settings — so it must load after fetching.
    const {sanitizeDescription} = await import("../src/lib/catalog/sanitize");
    const catalog = buildCatalog(raw, {
        maxPerCompany: 20,
        maxJobs: 1500,
        maxAgeDays: 365,
        sanitize: sanitizeDescription,
    });
    const indexBytes = await load(catalog);

    const {pipeline, remoteShare, salaryShare} = catalog.stats;
    log(`fetched ${pipeline.fetched} rows → kept ${pipeline.kept} ` +
        `(non-tech ${pipeline.droppedNonTech}, duplicate ${pipeline.droppedDuplicate}, ` +
        `stale ${pipeline.droppedStale}, capped ${pipeline.droppedCapped})`);
    log(`${catalog.stats.companyCount} companies · ${(remoteShare * 100).toFixed(0)}% remote · ` +
        `${(salaryShare * 100).toFixed(0)}% with salary · index ${(indexBytes / 1024).toFixed(0)} KB`);
}

main().catch((error) => {
    console.error(`[catalog] ${(error as Error).stack ?? error}`);
    process.exit(1);
});
