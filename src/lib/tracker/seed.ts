import {JobSummary} from "@/lib/catalog/types";
import {Profile} from "@/lib/auth/types";
import {recommend} from "@/lib/search/match";
import {snapshotOf} from "@/lib/tracker/reducers";
import {Application, AppStatus, UserData} from "@/lib/tracker/types";

const DAY = 86_400_000;

/** [status path, days ago the job was saved, note] — every column gets something. */
const PLAN: [AppStatus[], number, string][] = [
    [["saved", "applied", "interview", "offer"], 21, "Offer call Thursday. Ask about equity refresh and on-call expectations."],
    [["saved", "applied", "interview"], 16, "Recruiter screen went well — system design round next week."],
    [["saved", "applied", "interview"], 12, "Take-home due Monday. Keep it under 4 hours."],
    [["saved", "applied"], 9, "Referral from a former teammate."],
    [["saved", "applied"], 6, ""],
    [["saved", "applied", "rejected"], 18, "Role was filled internally."],
    [["saved"], 3, "Strong match — tailor resume to the design-systems work."],
    [["saved"], 2, ""],
    [["saved"], 1, ""],
];

/** Builds a believable tracker for the demo account from the live catalog. */
export function seedDemoData(jobs: JobSummary[], profile: Profile, now: Date): UserData {
    const picks = recommend(jobs, profile, PLAN.length + 4);
    const applications: Record<string, Application> = {};

    PLAN.forEach(([path, daysAgo, notes], index) => {
        const job = picks[index];
        if (!job) return;
        const start = now.getTime() - daysAgo * DAY;
        // Spread the status changes evenly between "saved" and today.
        const step = (daysAgo * DAY) / Math.max(path.length, 2);
        const history = path.map((status, position) => ({status, at: new Date(start + position * step).toISOString()}));
        applications[job.id] = {
            jobId: job.id,
            job: snapshotOf(job),
            status: path[path.length - 1],
            notes,
            createdAt: history[0].at,
            updatedAt: history[history.length - 1].at,
            history,
        };
    });

    const threeDaysAgo = new Date(now.getTime() - 3 * DAY).toISOString();
    return {
        applications,
        savedSearches: [
            {id: "s_demo_remote", name: "Remote React roles", query: "q=react&mode=remote", createdAt: threeDaysAgo, lastCheckedAt: threeDaysAgo},
            {id: "s_demo_fullstack", name: "Senior full-stack", query: "role=fullstack&level=senior", createdAt: threeDaysAgo, lastCheckedAt: threeDaysAgo},
        ],
        recentlyViewed: picks.slice(PLAN.length, PLAN.length + 4).map((job) => job.id),
    };
}
