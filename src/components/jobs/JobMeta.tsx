import {Banknote, Building, Globe, House, MapPin} from "lucide-react";
import {JobSummary, WorkMode} from "@/lib/catalog/types";
import {WORK_MODE_LABEL} from "@/lib/catalog/taxonomy";
import {formatSalary} from "@/lib/catalog/salary";
import {skillLabel} from "@/lib/catalog/skills";
import {Badge} from "@/components/ui/Badge";
import {cn} from "@/lib/cn";

const MODE_ICON: Record<WorkMode, typeof Globe> = {remote: Globe, hybrid: House, onsite: Building};

export function WorkModeBadge({mode, size}: { mode: WorkMode; size?: "sm" | "md" }) {
    const Icon = MODE_ICON[mode];
    return (
        <Badge tone={mode === "remote" ? "success" : mode === "hybrid" ? "info" : "neutral"} size={size}>
            <Icon aria-hidden/>
            {WORK_MODE_LABEL[mode]}
        </Badge>
    );
}

export function SalaryBadge({job, size}: { job: Pick<JobSummary, "salary">; size?: "sm" | "md" }) {
    if (!job.salary) return null;
    return (
        <Badge tone="accent" size={size} title="Taken from the listing's pay-transparency range">
            <Banknote aria-hidden/>
            {formatSalary(job.salary)}
        </Badge>
    );
}

/** "Austin, TX +2" — the full list goes in the title attribute. */
export function LocationText({locations, className}: { locations: string[]; className?: string }) {
    const shown = locations.filter((location) => location !== "Remote");
    const primary = shown[0] ?? (locations.includes("Remote") ? "Remote" : "Location not listed");
    const extra = shown.length - 1;
    return (
        <span className={cn("inline-flex min-w-0 items-center gap-1", className)} title={locations.join(" · ")}>
            <MapPin aria-hidden className="size-3.5 shrink-0"/>
            <span className="truncate">{primary}</span>
            {extra > 0 && <span className="shrink-0 text-subtle">+{extra}</span>}
        </span>
    );
}

export function SkillChips({skills, limit = 4, highlight, className}: {
    skills: string[];
    limit?: number;
    highlight?: Set<string>;
    className?: string;
}) {
    const shown = skills.slice(0, limit);
    if (shown.length === 0) return null;
    return (
        <ul className={cn("flex flex-wrap gap-1.5", className)} aria-label="Skills">
            {shown.map((skill) => (
                <li
                    key={skill}
                    className={cn(
                        "rounded-md border px-1.5 py-0.5 text-[11px] font-medium",
                        highlight?.has(skill) ? "border-accent/30 bg-accent-soft text-accent" : "border-border bg-surface-2 text-secondary",
                    )}
                >
                    {skillLabel(skill)}
                </li>
            ))}
            {skills.length > limit && <li className="px-1 py-0.5 text-[11px] text-subtle">+{skills.length - limit}</li>}
        </ul>
    );
}
