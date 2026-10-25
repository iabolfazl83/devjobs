import {describe, expect, it} from "vitest";
import {countMatches, PAGE_SIZE, quickSearch, searchJobs, tokenize} from "@/lib/search/engine";
import {DEFAULT_SEARCH, SearchState} from "@/lib/search/params";
import {makeJob} from "@/test/fixtures";

const NOW = new Date("2026-10-25T00:00:00Z").getTime();
const search = (jobs: ReturnType<typeof makeJob>[], patch: Partial<SearchState> = {}) =>
    searchJobs(jobs, {...DEFAULT_SEARCH, ...patch}, NOW);

const jobs = [
    makeJob({id: 1, title: "Senior React Engineer", role: "frontend", seniority: "senior", workMode: "remote", skills: ["react", "typescript"], locations: ["Remote"], postedAt: "2026-10-24T00:00:00Z", salary: {min: 150000, max: 180000, currency: "USD", period: "year"}}),
    makeJob({id: 2, title: "Backend Engineer (Go)", role: "backend", seniority: "mid", workMode: "hybrid", skills: ["go", "postgres"], locations: ["Berlin, Germany"], postedAt: "2026-10-20T00:00:00Z"}),
    makeJob({id: 3, title: "Full Stack Developer", role: "fullstack", seniority: "senior", workMode: "remote", skills: ["react", "nodejs"], locations: ["Remote"], postedAt: "2026-09-01T00:00:00Z", salary: {min: 120000, max: 140000, currency: "USD", period: "year"}}),
    makeJob({id: 4, title: "Data Analyst", role: "data", seniority: "entry", workMode: "onsite", skills: ["sql", "tableau"], company: {id: 2, slug: "globex", name: "Globex", logo: null}, postedAt: "2026-10-10T00:00:00Z"}),
];

describe("tokenize", () => {
    it("keeps tech punctuation", () => {
        expect(tokenize("C++ / C# and Node.js!")).toEqual(["c++", "c#", "and", "node.js"]);
    });
});

describe("searchJobs — text", () => {
    it("requires every term to match (AND)", () => {
        expect(search(jobs, {q: "react senior"}).results.map((job) => job.id)).toEqual([1]);
    });

    it("prefix-matches for type-ahead", () => {
        expect(search(jobs, {q: "analy"}).results.map((job) => job.id)).toEqual([4]);
    });

    it("expands common shorthands", () => {
        expect(search(jobs, {q: "golang"}).results.map((job) => job.id)).toEqual([2]);
    });

    it("ranks title matches above skill-only matches", () => {
        // Job 1 has React in the title, job 3 only in its skills.
        expect(search(jobs, {q: "react"}).results.map((job) => job.id)).toEqual([1, 3]);
    });
});

describe("searchJobs — filters & facets", () => {
    it("ORs within a facet and ANDs across facets", () => {
        expect(search(jobs, {roles: ["frontend", "fullstack"]}).total).toBe(2);
        expect(search(jobs, {roles: ["frontend", "fullstack"], levels: ["mid"]}).total).toBe(0);
    });

    it("computes disjunctive facet counts", () => {
        const {facets} = search(jobs, {modes: ["remote"]});
        // Mode counts ignore the mode filter itself, so you can see what adding "hybrid" would give…
        expect(facets.mode).toEqual({remote: 2, hybrid: 1, onsite: 1});
        // …while other facets are counted within the remote results.
        expect(facets.role).toEqual({frontend: 1, fullstack: 1});
    });

    it("filters by company, salary, recency and location", () => {
        expect(search(jobs, {company: "globex"}).results.map((job) => job.id)).toEqual([4]);
        expect(search(jobs, {salary: true}).total).toBe(2);
        expect(search(jobs, {posted: "7"}).results.map((job) => job.id)).toEqual([1, 2]);
        expect(search(jobs, {loc: "berlin"}).results.map((job) => job.id)).toEqual([2]);
        expect(search(jobs, {loc: "remote"}).total).toBe(2);
    });
});

describe("searchJobs — sorting & paging", () => {
    it("sorts newest first by default when there's no query", () => {
        expect(search(jobs).results.map((job) => job.id)).toEqual([1, 2, 4, 3]);
    });

    it("sorts by salary with unlisted salaries last", () => {
        expect(search(jobs, {sort: "salary"}).results.map((job) => job.id)).toEqual([1, 3, 2, 4]);
    });

    it("paginates and clamps out-of-range pages", () => {
        const many = Array.from({length: PAGE_SIZE + 5}, () => makeJob());
        expect(search(many).pageCount).toBe(2);
        expect(search(many, {page: 2}).results).toHaveLength(5);
        expect(search(many, {page: 99}).page).toBe(2);
    });
});

describe("helpers", () => {
    it("quickSearch finds by title or company", () => {
        expect(quickSearch(jobs, "glob").map((job) => job.id)).toEqual([4]);
        expect(quickSearch(jobs, "")).toEqual([]);
    });

    it("countMatches counts everything, and what's new since a date", () => {
        expect(countMatches(jobs, {...DEFAULT_SEARCH, q: "react"}, "2026-10-01T00:00:00Z")).toEqual({total: 2, fresh: 1});
    });
});
