import {describe, expect, it} from "vitest";
import {buildCatalog, RawSnapshot} from "@/lib/catalog/transform";
import {MuseCompany, MuseJob} from "@/lib/catalog/muse-types";

let nextId = 1;

function job(overrides: Partial<MuseJob> & { companyId?: number; companyName?: string } = {}): MuseJob {
    const {companyId = 100, companyName = "Acme", ...rest} = overrides;
    return {
        id: nextId++,
        name: "Senior Frontend Engineer",
        contents: "<p>We build with React, TypeScript and GraphQL. Pay: $140,000 - $170,000.</p>",
        publication_date: "2026-10-01T00:00:00Z",
        short_name: "x",
        type: "external",
        locations: [{name: "Flexible / Remote"}],
        levels: [{name: "Senior Level", short_name: "senior"}],
        categories: [{name: "Software Engineering"}],
        tags: [],
        refs: {landing_page: "https://example.com/apply"},
        company: {id: companyId, short_name: companyName.toLowerCase(), name: companyName},
        ...rest,
    };
}

const acme: MuseCompany = {
    id: 100,
    name: "Acme",
    short_name: "acme",
    description: "<p>We make <script>x</script>things.</p>",
    locations: [{name: "Austin, TX"}],
    industries: [{name: "Software"}],
    size: {name: "Medium Size", short_name: "medium"},
    refs: {logo_image: "https://example.com/logo.png", landing_page: "https://example.com/acme"},
};

const options = {
    maxPerCompany: 2,
    maxJobs: 100,
    maxAgeDays: 365,
    sanitize: (html: string) => html.replace(/<script>.*?<\/script>/g, ""),
    now: new Date("2026-10-25T00:00:00Z"),
};

function snapshot(jobs: MuseJob[]): RawSnapshot {
    return {fetchedAt: "2026-10-25T00:00:00Z", jobs, companies: [acme]};
}

describe("buildCatalog", () => {
    it("transforms a job into our model", () => {
        const {jobs} = buildCatalog(snapshot([job()]), options);
        expect(jobs).toHaveLength(1);
        expect(jobs[0]).toMatchObject({
            title: "Senior Frontend Engineer",
            role: "frontend",
            seniority: "senior",
            workMode: "remote",
            locations: ["Remote"],
            salary: {min: 140000, max: 170000, currency: "USD", period: "year"},
            company: {name: "Acme", slug: "acme", logo: "https://example.com/logo.png"},
        });
        expect(jobs[0].skills).toEqual(expect.arrayContaining(["react", "typescript", "graphql"]));
    });

    it("drops non-tech, duplicate and stale rows and records why", () => {
        const original = job();
        const catalog = buildCatalog(snapshot([
            original,
            {...original},                                   // same id
            job(),                                           // same company + title + location
            job({name: "Produce Associate"}),
            job({name: "Backend Engineer", publication_date: "2024-01-01T00:00:00Z"}),
        ]), options);

        expect(catalog.jobs).toHaveLength(1);
        expect(catalog.stats.pipeline).toMatchObject({
            fetched: 5, kept: 1, droppedNonTech: 1, droppedDuplicate: 2, droppedStale: 1,
        });
    });

    it("caps jobs per company, keeping the newest", () => {
        const catalog = buildCatalog(snapshot([
            job({name: "Backend Engineer", publication_date: "2026-09-01T00:00:00Z"}),
            job({name: "Data Engineer", publication_date: "2026-10-10T00:00:00Z"}),
            job({name: "iOS Engineer", publication_date: "2026-10-05T00:00:00Z"}),
            job({name: "Backend Engineer", companyId: 200, companyName: "Globex"}),
        ]), options);

        const acmeJobs = catalog.jobs.filter((entry) => entry.company.id === 100);
        expect(acmeJobs.map((entry) => entry.title)).toEqual(["Data Engineer", "iOS Engineer"]);
        expect(catalog.stats.pipeline.droppedCapped).toBe(1);
    });

    it("builds company records from the directory, falling back to job data", () => {
        const catalog = buildCatalog(snapshot([
            job(),
            job({name: "Backend Engineer", companyId: 200, companyName: "Globex - Glassdoor ✪ 4.1", locations: [{name: "Berlin, Germany"}]}),
        ]), options);

        const [first, second] = catalog.companies;
        expect(first).toMatchObject({name: "Acme", industries: ["Software"], size: "Medium Size", jobCount: 1, remoteJobCount: 1});
        expect(first.descriptionHtml).toBe("<p>We make things.</p>");
        expect(second).toMatchObject({name: "Globex", logo: null, locations: ["Berlin, Germany"], profileUrl: null});
    });

    it("computes headline stats", () => {
        const {stats} = buildCatalog(snapshot([job(), job({name: "Data Engineer", contents: "<p>SQL</p>"})]), options);
        expect(stats.jobCount).toBe(2);
        expect(stats.remoteShare).toBe(1);
        expect(stats.salaryShare).toBe(0.5);
        expect(stats.roleCounts).toEqual({frontend: 1, data: 1});
    });
});
