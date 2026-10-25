import {JobSummary} from "@/lib/catalog/types";
import {Application, AppStatus, JobSnapshot, SavedSearch, UserData} from "@/lib/tracker/types";

/**
 * Pure state transitions for a user's tracker data. The store calls these; the
 * unit tests call them directly. No dates are read from the clock in here —
 * `now` is always passed in — so every transition is deterministic.
 */

export const MAX_RECENTLY_VIEWED = 12;

export function snapshotOf(job: JobSummary): JobSnapshot {
    const {id, title, company, locations, workMode, role, seniority, salary, applyUrl, postedAt} = job;
    return {id, title, company, locations, workMode, role, seniority, salary, applyUrl, postedAt};
}

export function addApplication(data: UserData, job: JobSummary, status: AppStatus, now: string): UserData {
    if (data.applications[job.id]) return setStatus(data, job.id, status, now);
    const application: Application = {
        jobId: job.id,
        job: snapshotOf(job),
        status,
        notes: "",
        createdAt: now,
        updatedAt: now,
        history: [{status, at: now}],
    };
    return {...data, applications: {...data.applications, [job.id]: application}};
}

export function removeApplication(data: UserData, jobId: number): UserData {
    if (!data.applications[jobId]) return data;
    const applications = {...data.applications};
    delete applications[jobId];
    return {...data, applications};
}

export function restoreApplication(data: UserData, application: Application): UserData {
    return {...data, applications: {...data.applications, [application.jobId]: application}};
}

export function setStatus(data: UserData, jobId: number, status: AppStatus, now: string): UserData {
    const current = data.applications[jobId];
    if (!current || current.status === status) return data;
    return {
        ...data,
        applications: {
            ...data.applications,
            [jobId]: {...current, status, updatedAt: now, history: [...current.history, {status, at: now}]},
        },
    };
}

export function setNotes(data: UserData, jobId: number, notes: string, now: string): UserData {
    const current = data.applications[jobId];
    if (!current || current.notes === notes) return data;
    return {...data, applications: {...data.applications, [jobId]: {...current, notes, updatedAt: now}}};
}

export function recordView(data: UserData, jobId: number): UserData {
    const recentlyViewed = [jobId, ...data.recentlyViewed.filter((id) => id !== jobId)].slice(0, MAX_RECENTLY_VIEWED);
    return {...data, recentlyViewed};
}

export function addSavedSearch(data: UserData, search: SavedSearch): UserData {
    // Saving the same query twice just renames it.
    const others = data.savedSearches.filter((existing) => existing.query !== search.query);
    return {...data, savedSearches: [search, ...others]};
}

export function removeSavedSearch(data: UserData, id: string): UserData {
    return {...data, savedSearches: data.savedSearches.filter((search) => search.id !== id)};
}

export function markSearchChecked(data: UserData, id: string, now: string): UserData {
    return {
        ...data,
        savedSearches: data.savedSearches.map((search) => (search.id === id ? {...search, lastCheckedAt: now} : search)),
    };
}

/** When each status was first reached — powers the timeline and "applied 3 days ago". */
export function firstReached(application: Application, status: AppStatus): string | null {
    return application.history.find((entry) => entry.status === status)?.at ?? null;
}

/** Imported JSON is untrusted: accept only well-formed records. */
export function parseUserData(input: unknown): UserData | null {
    if (!input || typeof input !== "object") return null;
    const candidate = input as Partial<UserData>;
    if (typeof candidate.applications !== "object" || candidate.applications === null) return null;
    if (!Array.isArray(candidate.savedSearches) || !Array.isArray(candidate.recentlyViewed)) return null;

    const statuses = new Set<AppStatus>(["saved", "applied", "interview", "offer", "rejected"]);
    const applications = Object.fromEntries(
        Object.entries(candidate.applications).filter(([, app]) => {
            const application = app as Application;
            return application && typeof application.jobId === "number" && statuses.has(application.status)
                && typeof application.job?.title === "string" && Array.isArray(application.history);
        }),
    ) as Record<string, Application>;

    return {
        applications,
        savedSearches: candidate.savedSearches.filter((search) => typeof search?.id === "string" && typeof search?.query === "string"),
        recentlyViewed: candidate.recentlyViewed.filter((id) => typeof id === "number").slice(0, MAX_RECENTLY_VIEWED),
    };
}
