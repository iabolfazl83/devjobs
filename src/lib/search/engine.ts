import {JobSummary, RoleId, SeniorityId, WorkMode} from "@/lib/catalog/types";
import {ROLE_BY_ID} from "@/lib/catalog/taxonomy";
import {SKILL_BY_ID} from "@/lib/catalog/skills";
import {annualMidpoint} from "@/lib/catalog/salary";
import {SearchState} from "@/lib/search/params";

/**
 * Client-side search engine over the static job index (~1k jobs).
 *
 * - Full-text: every query term must match (AND), prefix matching for
 *   type-ahead, weighted by field (title > skills/company > role > location > excerpt).
 * - Facets: multi-select within a facet is OR, across facets is AND.
 * - Facet counts are *disjunctive* — each facet is counted with every other
 *   filter applied except its own — so a count always tells you how many results
 *   you'd get by adding that option. (Same model as Algolia / LinkedIn filters.)
 *
 * At this size a linear scan is well under a millisecond; an inverted index
 * would be the next step past ~50k documents.
 */

export const PAGE_SIZE = 20;

interface SearchDoc {
    job: JobSummary;
    fields: { tokens: string[]; weight: number }[];
    postedMs: number;
    salaryMid: number | null;
    locationText: string;
}

/** Shorthands people type → the token our index actually contains. */
const ALIASES: Record<string, string> = {
    js: "javascript",
    ts: "typescript",
    k8s: "kubernetes",
    golang: "go",
    reactjs: "react",
    py: "python",
    postgresql: "postgres",
};

export function tokenize(text: string): string[] {
    return text
        .toLowerCase()
        .split(/[^a-z0-9+#.]+/)
        .map((token) => token.replace(/^\.+|\.+$/g, ""))
        .filter(Boolean);
}

function queryTerms(query: string): string[] {
    return [...new Set(tokenize(query).map((term) => ALIASES[term] ?? term))];
}

const docCache = new WeakMap<JobSummary[], SearchDoc[]>();

function buildDocs(jobs: JobSummary[]): SearchDoc[] {
    const cached = docCache.get(jobs);
    if (cached) return cached;

    const docs = jobs.map((job) => {
        const skillText = job.skills.map((id) => `${id} ${SKILL_BY_ID[id]?.label ?? ""}`).join(" ");
        const role = ROLE_BY_ID[job.role];
        return {
            job,
            fields: [
                {tokens: tokenize(job.title), weight: 6},
                {tokens: tokenize(skillText), weight: 4},
                {tokens: tokenize(job.company.name), weight: 4},
                {tokens: tokenize(`${role.label} ${role.blurb}`), weight: 2.5},
                {tokens: tokenize(job.locations.join(" ")), weight: 2},
                {tokens: tokenize(job.excerpt), weight: 0.5},
            ],
            postedMs: new Date(job.postedAt).getTime(),
            salaryMid: job.salary ? annualMidpoint(job.salary) : null,
            locationText: job.locations.join(" | ").toLowerCase(),
        };
    });
    docCache.set(jobs, docs);
    return docs;
}

/** 0 means "doesn't match"; higher is better. */
function textScore(doc: SearchDoc, terms: string[]): number {
    let total = 0;
    for (const term of terms) {
        let best = 0;
        for (const field of doc.fields) {
            for (const token of field.tokens) {
                if (token === term) best = Math.max(best, field.weight * 1.5);
                else if (term.length >= 2 && token.startsWith(term)) best = Math.max(best, field.weight);
            }
        }
        if (best === 0) return 0;
        total += best;
    }
    return total;
}

export interface Facets {
    role: Partial<Record<RoleId, number>>;
    level: Partial<Record<SeniorityId, number>>;
    mode: Partial<Record<WorkMode, number>>;
    skill: { id: string; count: number }[];
}

export interface SearchResult {
    results: JobSummary[];
    total: number;
    page: number;
    pageCount: number;
    facets: Facets;
}

type FacetKey = "role" | "level" | "mode" | "skill";

function increment<K extends string>(counts: Partial<Record<K, number>>, key: K) {
    counts[key] = (counts[key] ?? 0) + 1;
}

export function searchJobs(jobs: JobSummary[], state: SearchState, now: number = Date.now(), pageSize: number = PAGE_SIZE): SearchResult {
    const docs = buildDocs(jobs);
    const terms = queryTerms(state.q);
    const loc = state.loc.trim().toLowerCase();
    const postedCutoff = state.posted ? now - Number(state.posted) * 86_400_000 : null;

    const matched: { doc: SearchDoc; score: number }[] = [];
    const facets: Facets = {role: {}, level: {}, mode: {}, skill: []};
    const skillCounts = new Map<string, number>();

    for (const doc of docs) {
        const {job} = doc;
        const score = terms.length ? textScore(doc, terms) : 1;
        if (score === 0) continue;

        // Non-facet filters apply to everything, including facet counts.
        if (state.company && job.company.slug !== state.company) continue;
        if (postedCutoff && doc.postedMs < postedCutoff) continue;
        if (state.salary && !job.salary) continue;
        if (loc && !(loc === "remote" ? job.workMode === "remote" : doc.locationText.includes(loc))) continue;

        const passes: Record<FacetKey, boolean> = {
            role: state.roles.length === 0 || state.roles.includes(job.role),
            level: state.levels.length === 0 || state.levels.includes(job.seniority),
            mode: state.modes.length === 0 || state.modes.includes(job.workMode),
            skill: state.skills.length === 0 || job.skills.some((skill) => state.skills.includes(skill)),
        };
        const passesAllBut = (key: FacetKey) =>
            (Object.keys(passes) as FacetKey[]).every((other) => other === key || passes[other]);

        if (passesAllBut("role")) increment(facets.role, job.role);
        if (passesAllBut("level")) increment(facets.level, job.seniority);
        if (passesAllBut("mode")) increment(facets.mode, job.workMode);
        if (passesAllBut("skill")) job.skills.forEach((skill) => skillCounts.set(skill, (skillCounts.get(skill) ?? 0) + 1));

        if (passes.role && passes.level && passes.mode && passes.skill) matched.push({doc, score});
    }

    const sort = state.sort === "relevance" && terms.length === 0 ? "newest" : state.sort;
    matched.sort((a, b) => {
        if (sort === "salary") return (b.doc.salaryMid ?? -1) - (a.doc.salaryMid ?? -1) || b.doc.postedMs - a.doc.postedMs;
        if (sort === "relevance") return b.score - a.score || b.doc.postedMs - a.doc.postedMs;
        return b.doc.postedMs - a.doc.postedMs;
    });

    facets.skill = [...skillCounts.entries()]
        .map(([id, count]) => ({id, count}))
        .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));

    const pageCount = Math.max(1, Math.ceil(matched.length / pageSize));
    const page = Math.min(state.page, pageCount);
    return {
        // `page === 1` guard: with pageSize = Infinity, (1 - 1) * Infinity is NaN.
        results: matched.slice(page === 1 ? 0 : (page - 1) * pageSize, page * pageSize).map(({doc}) => doc.job),
        total: matched.length,
        page,
        pageCount,
        facets,
    };
}

/** Total matches for a saved search, and how many were posted after `since`. */
export function countMatches(jobs: JobSummary[], state: SearchState, since: string): { total: number; fresh: number } {
    const {results} = searchJobs(jobs, {...state, page: 1}, Date.now(), Number.POSITIVE_INFINITY);
    return {total: results.length, fresh: results.filter((job) => job.postedAt > since).length};
}

/** Fast title/company/skill lookup for the command palette. */
export function quickSearch(jobs: JobSummary[], query: string, limit = 6): JobSummary[] {
    const terms = queryTerms(query);
    if (terms.length === 0) return [];
    return buildDocs(jobs)
        .map((doc) => ({doc, score: textScore(doc, terms)}))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score || b.doc.postedMs - a.doc.postedMs)
        .slice(0, limit)
        .map(({doc}) => doc.job);
}
