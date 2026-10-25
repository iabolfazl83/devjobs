import {JobSummary} from "@/lib/catalog/types";

let nextId = 1000;

/** A valid JobSummary with sensible defaults; override what the test cares about. */
export function makeJob(overrides: Partial<JobSummary> = {}): JobSummary {
    const id = overrides.id ?? nextId++;
    return {
        id,
        title: "Software Engineer",
        company: {id: 1, slug: "acme", name: "Acme", logo: null},
        locations: ["Austin, TX"],
        workMode: "onsite",
        role: "software",
        seniority: "mid",
        skills: [],
        salary: null,
        postedAt: "2026-10-01T00:00:00Z",
        excerpt: "",
        applyUrl: `https://example.com/jobs/${id}`,
        ...overrides,
    };
}
