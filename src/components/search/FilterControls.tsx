"use client";

import {useState} from "react";
import {Banknote, SlidersHorizontal, X} from "lucide-react";
import {ROLE_BY_ID, ROLES, SENIORITIES, SENIORITY_LABEL, WORK_MODE_LABEL, WORK_MODES} from "@/lib/catalog/taxonomy";
import {skillLabel} from "@/lib/catalog/skills";
import {RoleId, SeniorityId, WorkMode} from "@/lib/catalog/types";
import {Facets} from "@/lib/search/engine";
import {activeFilterCount, PostedWithin, SearchState, SortId, toggleValue} from "@/lib/search/params";
import {FacetDropdown, FacetList, FacetOption, RadioList, SearchableFacet} from "@/components/search/Facets";
import {Dialog} from "@/components/ui/Dialog";
import {Button} from "@/components/ui/Button";
import {Select} from "@/components/ui/Field";
import {cn} from "@/lib/cn";
import {pluralize} from "@/lib/format";

type Update = (patch: Partial<SearchState>, options?: { resyncInputs?: boolean }) => void;

const POSTED_OPTIONS: { value: PostedWithin | "any"; label: string }[] = [
    {value: "any", label: "Any time"},
    {value: "1", label: "Past 24 hours"},
    {value: "7", label: "Past week"},
    {value: "30", label: "Past month"},
];

const SORT_OPTIONS: { value: SortId; label: string }[] = [
    {value: "relevance", label: "Most relevant"},
    {value: "newest", label: "Newest first"},
    {value: "salary", label: "Highest salary"},
];

function facetOptions(facets: Facets, state: SearchState) {
    const roles: FacetOption<RoleId>[] = ROLES
        .map((role) => ({value: role.id, label: role.label, count: facets.role[role.id] ?? 0}))
        .sort((a, b) => b.count - a.count);
    const levels: FacetOption<SeniorityId>[] = SENIORITIES.map((level) => ({value: level.id, label: level.label, count: facets.level[level.id] ?? 0}));
    const modes: FacetOption<WorkMode>[] = WORK_MODES.map((mode) => ({value: mode.id, label: mode.label, count: facets.mode[mode.id] ?? 0}));
    const skills: FacetOption<string>[] = facets.skill.map(({id, count}) => ({value: id, label: skillLabel(id), count}));
    // A selected skill with no remaining matches must still be shown so it can be unticked.
    state.skills.filter((id) => !skills.some((skill) => skill.value === id)).forEach((id) => skills.push({value: id, label: skillLabel(id), count: 0}));
    return {roles, levels, modes, skills};
}

export function SortSelect({value, onChange}: { value: SortId; onChange: (value: SortId) => void }) {
    return (
        <label className="flex items-center gap-2 text-sm whitespace-nowrap text-muted">
            <span className="hidden sm:inline">Sort by</span>
            <Select value={value} onChange={(event) => onChange(event.target.value as SortId)} className="h-9 w-auto rounded-full py-0 pl-3.5 text-sm font-medium">
                {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </Select>
        </label>
    );
}

export function FilterBar({state, facets, update, total}: { state: SearchState; facets: Facets; update: Update; total: number }) {
    const [sheetOpen, setSheetOpen] = useState(false);
    const {roles, levels, modes, skills} = facetOptions(facets, state);
    const count = activeFilterCount(state);

    return (
        <>
            <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 no-scrollbar sm:mx-0 sm:px-0">
                <button
                    type="button"
                    onClick={() => setSheetOpen(true)}
                    className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full border border-border bg-surface px-3.5 text-sm font-medium whitespace-nowrap text-secondary transition-colors hover:border-border-strong hover:text-foreground"
                >
                    <SlidersHorizontal aria-hidden className="size-4"/>
                    All filters
                    {count > 0 && <span className="grid size-5 place-items-center rounded-full bg-accent text-[11px] text-accent-foreground">{count}</span>}
                </button>
                <span aria-hidden className="h-6 w-px shrink-0 bg-border"/>
                <FacetDropdown label="Work mode" activeCount={state.modes.length} onClear={() => update({modes: []})}>
                    <FacetList name="Work mode" options={modes} selected={state.modes} onToggle={(mode) => update({modes: toggleValue(state.modes, mode)})}/>
                </FacetDropdown>
                <FacetDropdown label="Role" activeCount={state.roles.length} onClear={() => update({roles: []})}>
                    <FacetList name="Role" options={roles} selected={state.roles} onToggle={(role) => update({roles: toggleValue(state.roles, role)})}/>
                </FacetDropdown>
                <FacetDropdown label="Experience" activeCount={state.levels.length} onClear={() => update({levels: []})}>
                    <FacetList name="Experience" options={levels} selected={state.levels} onToggle={(level) => update({levels: toggleValue(state.levels, level)})}/>
                </FacetDropdown>
                <FacetDropdown label="Skills" activeCount={state.skills.length} onClear={() => update({skills: []})}>
                    <SearchableFacet name="Skills" options={skills} selected={state.skills} onToggle={(skill) => update({skills: toggleValue(state.skills, skill)})}/>
                </FacetDropdown>
                <FacetDropdown label="Date posted" activeCount={state.posted ? 1 : 0} onClear={() => update({posted: null})}>
                    <RadioList
                        name="Date posted"
                        options={POSTED_OPTIONS}
                        value={state.posted ?? "any"}
                        onChange={(value) => update({posted: value === "any" ? null : value})}
                    />
                </FacetDropdown>
                <button
                    type="button"
                    aria-pressed={state.salary}
                    onClick={() => update({salary: !state.salary})}
                    className={cn(
                        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium whitespace-nowrap transition-colors",
                        state.salary ? "border-accent/40 bg-accent-soft text-accent" : "border-border bg-surface text-secondary hover:border-border-strong hover:text-foreground",
                    )}
                >
                    <Banknote aria-hidden className="size-4"/>
                    Shows salary
                </button>
            </div>

            <Dialog open={sheetOpen} onClose={() => setSheetOpen(false)} title="All filters" variant="sheet"
                    footer={(
                        <>
                            <Button
                                variant="ghost"
                                className="mr-auto"
                                disabled={count === 0}
                                // Clears filters but keeps the keyword search.
                                onClick={() => update({roles: [], levels: [], modes: [], skills: [], posted: null, salary: false, company: null, loc: ""}, {resyncInputs: true})}
                            >
                                Clear filters
                            </Button>
                            <Button onClick={() => setSheetOpen(false)}>Show {pluralize(total, "job")}</Button>
                        </>
                    )}>
                <div className="flex flex-col divide-y divide-border">
                    <FilterSection title="Work mode">
                        <FacetList name="Work mode" options={modes} selected={state.modes} onToggle={(mode) => update({modes: toggleValue(state.modes, mode)})}/>
                    </FilterSection>
                    <FilterSection title="Experience">
                        <FacetList name="Experience" options={levels} selected={state.levels} onToggle={(level) => update({levels: toggleValue(state.levels, level)})}/>
                    </FilterSection>
                    <FilterSection title="Role">
                        <FacetList name="Role" options={roles} selected={state.roles} onToggle={(role) => update({roles: toggleValue(state.roles, role)})}/>
                    </FilterSection>
                    <FilterSection title="Skills">
                        <SearchableFacet name="Skills" options={skills} selected={state.skills} onToggle={(skill) => update({skills: toggleValue(state.skills, skill)})}/>
                    </FilterSection>
                    <FilterSection title="Date posted">
                        <RadioList name="Date posted (sheet)" options={POSTED_OPTIONS} value={state.posted ?? "any"} onChange={(value) => update({posted: value === "any" ? null : value})}/>
                    </FilterSection>
                    <FilterSection title="Salary">
                        <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-surface-2">
                            <input type="checkbox" checked={state.salary} onChange={() => update({salary: !state.salary})} className="size-4 accent-accent"/>
                            <span className="text-secondary">Only jobs that list a salary range</span>
                        </label>
                    </FilterSection>
                </div>
            </Dialog>
        </>
    );
}

function FilterSection({title, children}: { title: string; children: React.ReactNode }) {
    return (
        <section className="py-4 first:pt-0">
            <h3 className="mb-2 px-2 text-xs font-semibold tracking-wide text-muted uppercase">{title}</h3>
            {children}
        </section>
    );
}

/** Removable chips for everything currently applied. */
export function ActiveFilters({state, update, reset, companyName}: {
    state: SearchState;
    update: Update;
    reset: () => void;
    companyName: string | null;
}) {
    const chips: { key: string; label: string; remove: () => void }[] = [];
    if (state.q) chips.push({key: "q", label: `“${state.q}”`, remove: () => update({q: ""}, {resyncInputs: true})});
    if (state.loc) chips.push({key: "loc", label: `Near ${state.loc}`, remove: () => update({loc: ""}, {resyncInputs: true})});
    if (state.company) chips.push({key: "company", label: companyName ?? state.company, remove: () => update({company: null})});
    state.modes.forEach((mode) => chips.push({key: `m-${mode}`, label: WORK_MODE_LABEL[mode], remove: () => update({modes: state.modes.filter((value) => value !== mode)})}));
    state.roles.forEach((role) => chips.push({key: `r-${role}`, label: ROLE_BY_ID[role].label, remove: () => update({roles: state.roles.filter((value) => value !== role)})}));
    state.levels.forEach((level) => chips.push({key: `l-${level}`, label: SENIORITY_LABEL[level], remove: () => update({levels: state.levels.filter((value) => value !== level)})}));
    state.skills.forEach((skill) => chips.push({key: `s-${skill}`, label: skillLabel(skill), remove: () => update({skills: state.skills.filter((value) => value !== skill)})}));
    if (state.posted) chips.push({key: "posted", label: POSTED_OPTIONS.find((option) => option.value === state.posted)?.label ?? "", remove: () => update({posted: null})});
    if (state.salary) chips.push({key: "salary", label: "Shows salary", remove: () => update({salary: false})});

    if (chips.length === 0) return null;

    return (
        <ul className="flex flex-wrap items-center gap-1.5" aria-label="Active filters">
            {chips.map((chip) => (
                <li key={chip.key}>
                    <button
                        type="button"
                        onClick={chip.remove}
                        className="group inline-flex items-center gap-1 rounded-full bg-surface-3 py-1 pr-1.5 pl-2.5 text-xs font-medium text-secondary transition-colors hover:bg-danger-soft hover:text-danger"
                        aria-label={`Remove filter: ${chip.label}`}
                    >
                        {chip.label}
                        <X aria-hidden className="size-3.5 opacity-60 group-hover:opacity-100"/>
                    </button>
                </li>
            ))}
            <li>
                <button type="button" onClick={reset} className="px-2 py-1 text-xs font-semibold text-accent hover:underline">Clear all</button>
            </li>
        </ul>
    );
}
