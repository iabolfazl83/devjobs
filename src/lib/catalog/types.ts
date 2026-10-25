/**
 * Domain types for the job catalog.
 *
 * The raw Muse API shapes live in `muse-types.ts`. Everything in this file is
 * *our* model — produced by the build-time pipeline (`scripts/build-catalog.ts`)
 * and consumed by the UI. Keeping the two separate means the UI never depends
 * on the upstream API's quirks.
 */

export type RoleId =
    | "frontend"
    | "backend"
    | "fullstack"
    | "mobile"
    | "devops"
    | "data"
    | "ml"
    | "security"
    | "qa"
    | "embedded"
    | "design"
    | "product"
    | "it"
    | "leadership"
    | "software";

export type SeniorityId = "intern" | "entry" | "mid" | "senior" | "lead" | "manager";

export type WorkMode = "remote" | "hybrid" | "onsite";

export type Currency = "USD" | "GBP" | "EUR";

export interface Salary {
    min: number;
    max: number;
    currency: Currency;
    period: "year" | "hour";
}

export interface CompanyRef {
    id: number;
    slug: string;
    name: string;
    logo: string | null;
}

/** The lightweight shape shipped to the browser in the search index. */
export interface JobSummary {
    id: number;
    title: string;
    company: CompanyRef;
    locations: string[];
    workMode: WorkMode;
    role: RoleId;
    seniority: SeniorityId;
    skills: string[];
    salary: Salary | null;
    postedAt: string;
    excerpt: string;
    applyUrl: string;
}

/** Full job, used for detail pages and the preview pane. */
export interface JobDetail extends JobSummary {
    descriptionHtml: string;
}

export interface Company {
    id: number;
    slug: string;
    name: string;
    logo: string | null;
    industries: string[];
    size: string | null;
    locations: string[];
    descriptionHtml: string;
    images: string[];
    profileUrl: string | null;
    jobCount: number;
    remoteJobCount: number;
    topRoles: RoleId[];
    topSkills: string[];
}

export type CompanySummary = Omit<Company, "descriptionHtml" | "images">;

export interface CatalogStats {
    jobCount: number;
    companyCount: number;
    remoteShare: number;
    salaryShare: number;
    roleCounts: Partial<Record<RoleId, number>>;
    topSkills: { skill: string; count: number }[];
    /** Raw upstream rows seen vs. kept — shown on the About page. */
    pipeline: {
        fetched: number;
        kept: number;
        droppedNonTech: number;
        droppedDuplicate: number;
        droppedStale: number;
        droppedCapped: number;
    };
}

/** Full build-time catalog. Never shipped to the browser as a whole. */
export interface Catalog {
    generatedAt: string;
    jobs: JobDetail[];
    companies: Company[];
    stats: CatalogStats;
}

/** What the browser downloads to power search. */
export interface JobsIndex {
    generatedAt: string;
    jobs: JobSummary[];
}
