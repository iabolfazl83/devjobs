import {MuseCompany, MuseJob} from "@/lib/catalog/muse-types";
import {Catalog, CatalogStats, Company, CompanyRef, JobDetail, RoleId} from "@/lib/catalog/types";
import {cleanCompanyName, excerpt, htmlToText, normalizeLocation, slugify} from "@/lib/catalog/text";
import {extractSkills} from "@/lib/catalog/skills";
import {classifyRole, classifySeniority, detectWorkMode, refineRole} from "@/lib/catalog/classify";
import {extractSalary} from "@/lib/catalog/salary";

export interface RawSnapshot {
    fetchedAt: string;
    jobs: MuseJob[];
    companies: MuseCompany[];
}

export interface BuildOptions {
    /** Keeps one employer from flooding the board (upstream is dominated by a few). */
    maxPerCompany: number;
    /** Hard cap on catalog size, newest first. */
    maxJobs: number;
    /** Older listings are dropped as likely stale. */
    maxAgeDays: number;
    /** HTML sanitizer — injected so the transform stays pure and unit-testable. */
    sanitize: (html: string) => string;
    now?: Date;
}

const DAY_MS = 86_400_000;

function companyRef(job: MuseJob, directory: Map<number, MuseCompany>): CompanyRef {
    const listed = directory.get(job.company.id);
    const name = cleanCompanyName(listed?.name ?? job.company.name);
    return {
        id: job.company.id,
        slug: job.company.short_name || slugify(name),
        name,
        logo: listed?.refs.logo_image ?? null,
    };
}

/** Raw upstream job → our model, or `null` if it isn't a tech role. */
export function transformJob(job: MuseJob, directory: Map<number, MuseCompany>, sanitize: (html: string) => string): JobDetail | null {
    const title = job.name.replace(/\s+/g, " ").trim();
    const company = companyRef(job, directory);
    const text = htmlToText(job.contents ?? "");
    const {skills, techEvidence} = extractSkills(`${title}\n${text}`, company.name);

    const classified = classifyRole(title, techEvidence);
    if (!classified) return null;
    const role = refineRole(classified, skills);

    const locations = [...new Set(job.locations.map((location) => normalizeLocation(location.name)))];

    return {
        id: job.id,
        title,
        company,
        locations,
        workMode: detectWorkMode(title, locations, text),
        role,
        seniority: classifySeniority(title, job.levels.map((level) => level.name), role),
        skills,
        salary: extractSalary(text),
        postedAt: job.publication_date,
        excerpt: excerpt(text),
        applyUrl: job.refs.landing_page,
        descriptionHtml: sanitize(job.contents ?? ""),
    };
}

function topN<T extends string>(values: T[], n: number): T[] {
    const counts = new Map<T, number>();
    values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([value]) => value);
}

function buildCompanies(jobs: JobDetail[], directory: Map<number, MuseCompany>, sanitize: (html: string) => string): Company[] {
    const byCompany = new Map<number, JobDetail[]>();
    jobs.forEach((job) => byCompany.set(job.company.id, [...(byCompany.get(job.company.id) ?? []), job]));

    return [...byCompany.entries()].map(([id, companyJobs]) => {
        const ref = companyJobs[0].company;
        const listed = directory.get(id);
        const images = [listed?.refs.f1_image, listed?.refs.f2_image, listed?.refs.f3_image].filter((image): image is string => Boolean(image));
        const locations = listed?.locations.length
            ? listed.locations.map((location) => normalizeLocation(location.name))
            : topN(companyJobs.flatMap((job) => job.locations), 5);

        return {
            id,
            slug: ref.slug,
            name: ref.name,
            logo: ref.logo,
            industries: listed?.industries.map((industry) => industry.name) ?? [],
            size: listed?.size?.name ?? null,
            locations: [...new Set(locations)],
            descriptionHtml: listed?.description ? sanitize(listed.description) : "",
            images,
            profileUrl: listed?.refs.landing_page ?? null,
            jobCount: companyJobs.length,
            remoteJobCount: companyJobs.filter((job) => job.workMode === "remote").length,
            topRoles: topN<RoleId>(companyJobs.map((job) => job.role), 3),
            topSkills: topN(companyJobs.flatMap((job) => job.skills), 6),
        };
    }).sort((a, b) => b.jobCount - a.jobCount || a.name.localeCompare(b.name));
}

export function buildCatalog(raw: RawSnapshot, options: BuildOptions): Catalog {
    const now = options.now ?? new Date(raw.fetchedAt);
    const directory = new Map(raw.companies.map((company) => [company.id, company]));
    const pipeline: CatalogStats["pipeline"] = {
        fetched: raw.jobs.length,
        kept: 0,
        droppedNonTech: 0,
        droppedDuplicate: 0,
        droppedStale: 0,
        droppedCapped: 0,
    };

    const seenIds = new Set<number>();
    const seenKeys = new Set<string>();
    const candidates: JobDetail[] = [];
    const cutoff = now.getTime() - options.maxAgeDays * DAY_MS;

    for (const rawJob of raw.jobs) {
        if (seenIds.has(rawJob.id)) {
            pipeline.droppedDuplicate++;
            continue;
        }
        seenIds.add(rawJob.id);

        const job = transformJob(rawJob, directory, options.sanitize);
        if (!job) {
            pipeline.droppedNonTech++;
            continue;
        }

        // The same role re-posted (often once per location batch) reads as noise in results.
        const key = `${job.company.id}|${job.title.toLowerCase()}|${job.locations.join("/")}`;
        if (seenKeys.has(key)) {
            pipeline.droppedDuplicate++;
            continue;
        }
        seenKeys.add(key);

        if (new Date(job.postedAt).getTime() < cutoff) {
            pipeline.droppedStale++;
            continue;
        }
        candidates.push(job);
    }

    candidates.sort((a, b) => b.postedAt.localeCompare(a.postedAt));

    const perCompany = new Map<number, number>();
    const jobs: JobDetail[] = [];
    for (const job of candidates) {
        const count = perCompany.get(job.company.id) ?? 0;
        if (count >= options.maxPerCompany || jobs.length >= options.maxJobs) {
            pipeline.droppedCapped++;
            continue;
        }
        perCompany.set(job.company.id, count + 1);
        jobs.push(job);
    }
    pipeline.kept = jobs.length;

    const companies = buildCompanies(jobs, directory, options.sanitize);
    const roleCounts: CatalogStats["roleCounts"] = {};
    jobs.forEach((job) => (roleCounts[job.role] = (roleCounts[job.role] ?? 0) + 1));

    const skillCounts = new Map<string, number>();
    jobs.forEach((job) => job.skills.forEach((skill) => skillCounts.set(skill, (skillCounts.get(skill) ?? 0) + 1)));

    return {
        generatedAt: raw.fetchedAt,
        jobs,
        companies,
        stats: {
            jobCount: jobs.length,
            companyCount: companies.length,
            remoteShare: jobs.length ? jobs.filter((job) => job.workMode === "remote").length / jobs.length : 0,
            salaryShare: jobs.length ? jobs.filter((job) => job.salary).length / jobs.length : 0,
            roleCounts,
            topSkills: [...skillCounts.entries()]
                .sort((a, b) => b[1] - a[1])
                .slice(0, 24)
                .map(([skill, count]) => ({skill, count})),
            pipeline,
        },
    };
}
