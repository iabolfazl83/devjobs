import {CompanyRef, RoleId, Salary, SeniorityId, WorkMode} from "@/lib/catalog/types";

export type AppStatus = "saved" | "applied" | "interview" | "offer" | "rejected";

export const STATUSES: { id: AppStatus; label: string; description: string }[] = [
    {id: "saved", label: "Saved", description: "Bookmarked to look at later"},
    {id: "applied", label: "Applied", description: "Application sent"},
    {id: "interview", label: "Interviewing", description: "Screens and interview loops"},
    {id: "offer", label: "Offer", description: "Offer received"},
    {id: "rejected", label: "Closed", description: "Rejected, withdrawn or expired"},
];

export const STATUS_LABEL: Record<AppStatus, string> = Object.fromEntries(
    STATUSES.map((status) => [status.id, status.label]),
) as Record<AppStatus, string>;

/**
 * A copy of the job as it was when saved. Listings disappear from the catalog
 * when they close, but the tracker card must keep working.
 */
export interface JobSnapshot {
    id: number;
    title: string;
    company: CompanyRef;
    locations: string[];
    workMode: WorkMode;
    role: RoleId;
    seniority: SeniorityId;
    salary: Salary | null;
    applyUrl: string;
    postedAt: string;
}

export interface Application {
    jobId: number;
    job: JobSnapshot;
    status: AppStatus;
    notes: string;
    createdAt: string;
    updatedAt: string;
    history: { status: AppStatus; at: string }[];
}

export interface SavedSearch {
    id: string;
    name: string;
    /** Serialized URL query string, e.g. "role=frontend&mode=remote". */
    query: string;
    createdAt: string;
    /** Used to count "new since you last looked". */
    lastCheckedAt: string;
}

export interface UserData {
    applications: Record<string, Application>;
    savedSearches: SavedSearch[];
    recentlyViewed: number[];
}

export const EMPTY_USER_DATA: UserData = {applications: {}, savedSearches: [], recentlyViewed: []};
