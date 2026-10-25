import {JobSummary, SeniorityId} from "@/lib/catalog/types";
import {Profile} from "@/lib/auth/types";

export interface MatchResult {
    /** 0–100 */
    score: number;
    matchedSkills: string[];
    missingSkills: string[];
}

const SENIORITY_ORDER: SeniorityId[] = ["intern", "entry", "mid", "senior", "lead", "manager"];

/**
 * How well a job fits a profile. Weighted, explainable components rather than
 * a black box — the UI shows *why* (matched skills), not just a number.
 *
 *   skills 50% · role 25% · seniority 15% · work mode 10%
 *
 * An empty preference counts as half-credit: "no preference" is neither a hit nor a miss.
 */
export function matchJob(job: JobSummary, profile: Profile): MatchResult | null {
    if (profile.skills.length === 0 && profile.roles.length === 0) return null;

    const mine = new Set(profile.skills);
    const considered = job.skills.slice(0, 8);
    const matchedSkills = considered.filter((skill) => mine.has(skill));
    const missingSkills = considered.filter((skill) => !mine.has(skill));

    const skillScore = considered.length === 0 || profile.skills.length === 0
        ? 0.4
        : Math.min(1, matchedSkills.length / Math.min(considered.length, 5));

    const roleScore = profile.roles.length === 0 ? 0.5 : profile.roles.includes(job.role) ? 1 : 0;

    let seniorityScore = 0.5;
    if (profile.seniority.length > 0) {
        const jobLevel = SENIORITY_ORDER.indexOf(job.seniority);
        const distance = Math.min(...profile.seniority.map((level) => Math.abs(SENIORITY_ORDER.indexOf(level) - jobLevel)));
        seniorityScore = distance === 0 ? 1 : distance === 1 ? 0.5 : 0;
    }

    const modeScore = profile.workModes.length === 0 ? 0.5 : profile.workModes.includes(job.workMode) ? 1 : 0;

    const score = Math.round(100 * (0.5 * skillScore + 0.25 * roleScore + 0.15 * seniorityScore + 0.1 * modeScore));
    return {score, matchedSkills, missingSkills};
}

/** Best-fit jobs for a profile, newest first among equals. */
export function recommend(jobs: JobSummary[], profile: Profile, limit: number, exclude: Set<number> = new Set()): (JobSummary & { match: MatchResult })[] {
    const scored: (JobSummary & { match: MatchResult })[] = [];
    for (const job of jobs) {
        if (exclude.has(job.id)) continue;
        const match = matchJob(job, profile);
        if (match) scored.push({...job, match});
    }
    return scored
        .sort((a, b) => b.match.score - a.match.score || b.postedAt.localeCompare(a.postedAt))
        .slice(0, limit);
}
