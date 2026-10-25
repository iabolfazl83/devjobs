import "server-only";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import {Catalog, Company, CompanySummary, JobDetail, JobSummary} from "@/lib/catalog/types";

/**
 * Build-time access to the full catalog. Server Components run during
 * `next build`, read this file, and bake the result into static HTML —
 * the browser never downloads the full catalog.
 */
let cached: Catalog | null = null;

export function getCatalog(): Catalog {
    if (cached) return cached;
    const file = path.join(process.cwd(), ".data", "catalog.json");
    if (!fs.existsSync(file)) {
        throw new Error("No job catalog found. Run `npm run catalog` (it runs automatically before dev and build).");
    }
    cached = JSON.parse(fs.readFileSync(file, "utf8")) as Catalog;
    return cached;
}

export function toSummary({descriptionHtml: _html, ...summary}: JobDetail): JobSummary {
    return summary;
}

export function toCompanySummary({descriptionHtml: _html, images: _images, ...summary}: Company): CompanySummary {
    return summary;
}

export function getJob(id: number): JobDetail | undefined {
    return getCatalog().jobs.find((job) => job.id === id);
}

export function getCompany(slug: string): Company | undefined {
    return getCatalog().companies.find((company) => company.slug === slug);
}

export function getCompanyJobs(companyId: number): JobSummary[] {
    return getCatalog().jobs.filter((job) => job.company.id === companyId).map(toSummary);
}

/** Newest jobs, one per company, so a single employer's batch upload doesn't fill the page. */
export function getLatestJobs(limit: number): JobSummary[] {
    const seen = new Set<number>();
    const latest: JobSummary[] = [];
    for (const job of getCatalog().jobs) {
        if (seen.has(job.company.id)) continue;
        seen.add(job.company.id);
        latest.push(toSummary(job));
        if (latest.length === limit) break;
    }
    return latest;
}

/** Same role first, then skill overlap, then recency — computed at build time. */
export function getSimilarJobs(job: JobDetail, limit = 4): JobSummary[] {
    const skills = new Set(job.skills);
    // The same title at the same company (re-posts for other cities) only counts once.
    const seen = new Set([`${job.company.id}|${job.title}`]);
    return getCatalog().jobs
        .filter((other) => {
            const key = `${other.company.id}|${other.title}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        })
        .map((other) => ({
            other,
            score: (other.role === job.role ? 3 : 0)
                + other.skills.filter((skill) => skills.has(skill)).length
                + (other.seniority === job.seniority ? 1 : 0)
                - (other.company.id === job.company.id ? 2 : 0),
        }))
        .sort((a, b) => b.score - a.score || b.other.postedAt.localeCompare(a.other.postedAt))
        .slice(0, limit)
        .map(({other}) => toSummary(other));
}

/** Gzipped size of the browser search index, in KB — quoted on the About page. */
export function getIndexSizeKb(): number {
    const file = path.join(process.cwd(), "public", "data", "jobs.json");
    if (!fs.existsSync(file)) return 0;
    return Math.round(zlib.gzipSync(fs.readFileSync(file)).length / 1024);
}
