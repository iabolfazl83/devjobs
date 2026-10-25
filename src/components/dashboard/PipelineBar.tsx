import {Application, AppStatus, STATUSES} from "@/lib/tracker/types";
import {cn} from "@/lib/cn";
import {percent} from "@/lib/format";

export const STAGE_COLOR: Record<AppStatus, string> = {
    saved: "var(--stage-saved)",
    applied: "var(--stage-applied)",
    interview: "var(--stage-interview)",
    offer: "var(--stage-offer)",
    rejected: "var(--stage-rejected)",
};

export function StageDot({status, className}: { status: AppStatus; className?: string }) {
    return <span aria-hidden className={cn("inline-block size-2.5 shrink-0 rounded-full", className)} style={{background: STAGE_COLOR[status]}}/>;
}

export function countByStatus(applications: Application[]): Record<AppStatus, number> {
    const counts: Record<AppStatus, number> = {saved: 0, applied: 0, interview: 0, offer: 0, rejected: 0};
    applications.forEach((application) => counts[application.status]++);
    return counts;
}

/**
 * Part-to-whole of the pipeline as one horizontal stacked bar.
 * Ordinal one-hue ramp (Saved → Offer gets darker in light mode, brighter in
 * dark), a 2px surface gap between segments, rounded outer ends, a hover/focus
 * tooltip per segment, and a legend that doubles as the table of exact values.
 */
export function PipelineBar({applications, showLegend = true}: { applications: Application[]; showLegend?: boolean }) {
    const counts = countByStatus(applications);
    const total = applications.length;

    return (
        <figure className="m-0">
            <figcaption className="sr-only">Applications by stage</figcaption>
            {total === 0 ? (
                <div className="h-3 rounded-full bg-surface-3"/>
            ) : (
                <div className="flex h-3 gap-[2px]">
                    {STATUSES.filter((status) => counts[status.id] > 0).map((status) => (
                        <div
                            key={status.id}
                            tabIndex={0}
                            role="img"
                            aria-label={`${status.label}: ${counts[status.id]} of ${total}`}
                            className="group relative h-full outline-none first:rounded-l-[4px] last:rounded-r-[4px] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                            style={{flexGrow: counts[status.id], flexBasis: 0, minWidth: 8, background: STAGE_COLOR[status.id]}}
                        >
                            <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs whitespace-nowrap shadow-raised group-hover:block group-focus-visible:block">
                                <span className="font-semibold text-foreground">{status.label}</span>
                                <span className="text-muted"> · {counts[status.id]} ({percent(counts[status.id] / total)})</span>
                            </span>
                        </div>
                    ))}
                </div>
            )}
            {showLegend && (
                <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-5">
                    {STATUSES.map((status) => (
                        <li key={status.id} className="flex items-center gap-2 text-sm">
                            <StageDot status={status.id}/>
                            <span className="text-secondary">{status.label}</span>
                            <span className="ml-auto font-semibold text-foreground tabular-nums sm:ml-0">{counts[status.id]}</span>
                        </li>
                    ))}
                </ul>
            )}
        </figure>
    );
}
