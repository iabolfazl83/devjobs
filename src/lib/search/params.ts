import {RoleId, SeniorityId, WorkMode} from "@/lib/catalog/types";
import {ROLES, SENIORITIES, WORK_MODES} from "@/lib/catalog/taxonomy";
import {SKILL_BY_ID} from "@/lib/catalog/skills";

export type SortId = "relevance" | "newest" | "salary";
export type PostedWithin = "1" | "7" | "30";

/**
 * The whole search lives in the URL (`/jobs?q=react&role=frontend,fullstack&mode=remote`),
 * which makes every search shareable, bookmarkable and back-button friendly.
 * This module is the single place that reads and writes that format.
 */
export interface SearchState {
    q: string;
    loc: string;
    roles: RoleId[];
    levels: SeniorityId[];
    modes: WorkMode[];
    skills: string[];
    company: string | null;
    posted: PostedWithin | null;
    salary: boolean;
    sort: SortId;
    page: number;
}

export const DEFAULT_SEARCH: SearchState = {
    q: "",
    loc: "",
    roles: [],
    levels: [],
    modes: [],
    skills: [],
    company: null,
    posted: null,
    salary: false,
    sort: "relevance",
    page: 1,
};

const ROLE_IDS = new Set<string>(ROLES.map((role) => role.id));
const LEVEL_IDS = new Set<string>(SENIORITIES.map((level) => level.id));
const MODE_IDS = new Set<string>(WORK_MODES.map((mode) => mode.id));

function list<T extends string>(raw: string | null, allowed: (value: string) => boolean): T[] {
    if (!raw) return [];
    return [...new Set(raw.split(",").map((value) => value.trim()).filter(allowed))] as T[];
}

/** Lenient: unknown values are dropped rather than breaking the page. */
export function parseSearch(params: URLSearchParams): SearchState {
    const page = Number.parseInt(params.get("page") ?? "1", 10);
    const sort = params.get("sort");
    const posted = params.get("posted");
    return {
        q: (params.get("q") ?? "").slice(0, 120),
        loc: (params.get("loc") ?? "").slice(0, 80),
        roles: list<RoleId>(params.get("role"), (value) => ROLE_IDS.has(value)),
        levels: list<SeniorityId>(params.get("level"), (value) => LEVEL_IDS.has(value)),
        modes: list<WorkMode>(params.get("mode"), (value) => MODE_IDS.has(value)),
        skills: list(params.get("skill"), (value) => value in SKILL_BY_ID),
        company: params.get("company") || null,
        posted: posted === "1" || posted === "7" || posted === "30" ? posted : null,
        salary: params.get("salary") === "1",
        sort: sort === "newest" || sort === "salary" ? sort : "relevance",
        page: Number.isFinite(page) && page > 0 ? page : 1,
    };
}

/** Canonical form: defaults omitted, fixed key order, sorted lists — equal searches give equal URLs. */
export function serializeSearch(state: SearchState): string {
    const params = new URLSearchParams();
    if (state.q.trim()) params.set("q", state.q.trim());
    if (state.loc.trim()) params.set("loc", state.loc.trim());
    if (state.roles.length) params.set("role", [...state.roles].sort().join(","));
    if (state.levels.length) params.set("level", [...state.levels].sort().join(","));
    if (state.modes.length) params.set("mode", [...state.modes].sort().join(","));
    if (state.skills.length) params.set("skill", [...state.skills].sort().join(","));
    if (state.company) params.set("company", state.company);
    if (state.posted) params.set("posted", state.posted);
    if (state.salary) params.set("salary", "1");
    if (state.sort !== "relevance") params.set("sort", state.sort);
    if (state.page > 1) params.set("page", String(state.page));
    // URLSearchParams encodes "," as %2C; commas are safe in a query string and far more readable.
    return params.toString().replace(/%2C/g, ",");
}

export function activeFilterCount(state: SearchState): number {
    return state.roles.length + state.levels.length + state.modes.length + state.skills.length
        + (state.company ? 1 : 0) + (state.posted ? 1 : 0) + (state.salary ? 1 : 0) + (state.loc ? 1 : 0);
}

export function toggleValue<T>(values: T[], value: T): T[] {
    return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

/** The part of a search that defines *what* matches — used to key saved searches. */
export function searchKey(state: SearchState): string {
    return serializeSearch({...state, page: 1, sort: "relevance"});
}
