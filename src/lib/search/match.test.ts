import {describe, expect, it} from "vitest";
import {matchJob, recommend} from "@/lib/search/match";
import {EMPTY_PROFILE, Profile} from "@/lib/auth/types";
import {makeJob} from "@/test/fixtures";

const profile: Profile = {
    ...EMPTY_PROFILE,
    skills: ["react", "typescript", "graphql"],
    roles: ["frontend"],
    seniority: ["senior"],
    workModes: ["remote"],
};

describe("matchJob", () => {
    it("returns null when there's nothing to match on", () => {
        expect(matchJob(makeJob(), EMPTY_PROFILE)).toBeNull();
    });

    it("scores a perfect fit at 100", () => {
        const job = makeJob({skills: ["react", "typescript"], role: "frontend", seniority: "senior", workMode: "remote"});
        expect(matchJob(job, profile)).toEqual({score: 100, matchedSkills: ["react", "typescript"], missingSkills: []});
    });

    it("splits matched and missing skills", () => {
        const result = matchJob(makeJob({skills: ["react", "go", "kubernetes"]}), profile);
        expect(result?.matchedSkills).toEqual(["react"]);
        expect(result?.missingSkills).toEqual(["go", "kubernetes"]);
    });

    it("gives partial credit for adjacent seniority", () => {
        const base = {skills: ["react"], role: "frontend" as const, workMode: "remote" as const};
        const exact = matchJob(makeJob({...base, seniority: "senior"}), profile)!.score;
        const adjacent = matchJob(makeJob({...base, seniority: "lead"}), profile)!.score;
        const far = matchJob(makeJob({...base, seniority: "intern"}), profile)!.score;
        expect(exact).toBeGreaterThan(adjacent);
        expect(adjacent).toBeGreaterThan(far);
    });
});

describe("recommend", () => {
    it("ranks by score, excludes tracked jobs and respects the limit", () => {
        const great = makeJob({id: 1, skills: ["react", "typescript"], role: "frontend", seniority: "senior", workMode: "remote"});
        const okay = makeJob({id: 2, skills: ["react"], role: "backend"});
        const tracked = makeJob({id: 3, skills: ["react", "typescript"], role: "frontend", seniority: "senior", workMode: "remote"});
        const result = recommend([okay, great, tracked], profile, 5, new Set([3]));
        expect(result.map((job) => job.id)).toEqual([1, 2]);
        expect(recommend([okay, great], profile, 1)).toHaveLength(1);
    });
});
