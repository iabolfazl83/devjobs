"use client";

import {useState} from "react";
import {Check, Plus, Search, X} from "lucide-react";
import {RoleId, SeniorityId, WorkMode} from "@/lib/catalog/types";
import {ROLES, SENIORITIES, WORK_MODES} from "@/lib/catalog/taxonomy";
import {SKILL_GROUPS, SKILLS, skillLabel} from "@/lib/catalog/skills";
import {ROLE_ICON} from "@/components/jobs/RoleIcon";
import {toggleValue} from "@/lib/search/params";
import {cn} from "@/lib/cn";

function Chip({selected, onClick, children}: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            type="button"
            aria-pressed={selected}
            onClick={onClick}
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors [&_svg]:size-4",
                selected ? "border-accent bg-accent-soft text-accent" : "border-border bg-surface text-secondary hover:border-border-strong hover:text-foreground",
            )}
        >
            {selected ? <Check aria-hidden/> : null}
            {children}
        </button>
    );
}

export function RolePicker({value, onChange}: { value: RoleId[]; onChange: (value: RoleId[]) => void }) {
    return (
        <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label="Roles">
            {ROLES.map((role) => {
                const Icon = ROLE_ICON[role.id];
                const selected = value.includes(role.id);
                return (
                    <button
                        key={role.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => onChange(toggleValue(value, role.id))}
                        className={cn(
                            "flex items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                            selected ? "border-accent bg-accent-soft" : "border-border bg-surface hover:border-border-strong",
                        )}
                    >
                        <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg", selected ? "bg-accent text-accent-foreground" : "bg-surface-2 text-muted")}>
                            <Icon aria-hidden className="size-[18px]"/>
                        </span>
                        <span className="min-w-0">
                            <span className={cn("block text-sm font-semibold", selected ? "text-accent" : "text-foreground")}>{role.label}</span>
                            <span className="block truncate text-xs text-muted">{role.blurb}</span>
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

export function LevelPicker({value, onChange}: { value: SeniorityId[]; onChange: (value: SeniorityId[]) => void }) {
    return (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Experience levels">
            {SENIORITIES.map((level) => (
                <Chip key={level.id} selected={value.includes(level.id)} onClick={() => onChange(toggleValue(value, level.id))}>
                    {level.label}
                </Chip>
            ))}
        </div>
    );
}

export function ModePicker({value, onChange}: { value: WorkMode[]; onChange: (value: WorkMode[]) => void }) {
    return (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Work modes">
            {WORK_MODES.map((mode) => (
                <Chip key={mode.id} selected={value.includes(mode.id)} onClick={() => onChange(toggleValue(value, mode.id))}>
                    {mode.label}
                </Chip>
            ))}
        </div>
    );
}

/** Pick from the same dictionary the pipeline extracts from, so matches line up exactly. */
export function SkillPicker({value, onChange}: { value: string[]; onChange: (value: string[]) => void }) {
    const [query, setQuery] = useState("");
    const text = query.trim().toLowerCase();

    return (
        <div className="flex flex-col gap-4">
            {value.length > 0 && (
                <ul className="flex flex-wrap gap-1.5" aria-label="Your skills">
                    {value.map((id) => (
                        <li key={id}>
                            <button
                                type="button"
                                onClick={() => onChange(value.filter((skill) => skill !== id))}
                                className="inline-flex items-center gap-1 rounded-full bg-accent py-1 pr-2 pl-3 text-sm font-medium text-accent-foreground hover:opacity-90"
                                aria-label={`Remove ${skillLabel(id)}`}
                            >
                                {skillLabel(id)}
                                <X aria-hidden className="size-3.5"/>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            <label className="relative">
                <span className="sr-only">Find a skill</span>
                <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"/>
                <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Find a skill — e.g. React, Kubernetes, Figma"
                    className="h-10 w-full rounded-lg border border-border bg-surface pr-3 pl-9 text-sm outline-none placeholder:text-subtle focus:border-accent focus:ring-3 focus:ring-accent/20"
                />
            </label>
            <div className="flex max-h-80 flex-col gap-4 overflow-y-auto pr-1 scrollbar-thin">
                {SKILL_GROUPS.map((group) => {
                    const skills = SKILLS.filter((skill) => skill.group === group.id && (!text || skill.label.toLowerCase().includes(text)));
                    if (skills.length === 0) return null;
                    return (
                        <div key={group.id}>
                            <p className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">{group.label}</p>
                            <div className="flex flex-wrap gap-1.5">
                                {skills.map((skill) => {
                                    const selected = value.includes(skill.id);
                                    return (
                                        <button
                                            key={skill.id}
                                            type="button"
                                            aria-pressed={selected}
                                            onClick={() => onChange(toggleValue(value, skill.id))}
                                            className={cn(
                                                "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                                                selected ? "border-accent bg-accent-soft text-accent" : "border-border text-secondary hover:border-border-strong hover:text-foreground",
                                            )}
                                        >
                                            {selected ? <Check aria-hidden className="size-3"/> : <Plus aria-hidden className="size-3"/>}
                                            {skill.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/** 0–100: how much of the profile is filled in, shown as a nudge. */
export function profileCompleteness(profile: { headline: string; location: string; skills: string[]; roles: RoleId[]; seniority: SeniorityId[]; workModes: WorkMode[] }): number {
    const checks = [
        profile.headline.trim().length > 0,
        profile.location.trim().length > 0,
        profile.skills.length >= 3,
        profile.roles.length > 0,
        profile.seniority.length > 0,
        profile.workModes.length > 0,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}
