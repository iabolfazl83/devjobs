import Link from "next/link";
import {JobSummary} from "@/lib/catalog/types";
import {SENIORITY_LABEL} from "@/lib/catalog/taxonomy";
import {CompanyLogo} from "@/components/ui/CompanyLogo";
import {TimeAgo} from "@/components/ui/TimeAgo";
import {LocationText, SalaryBadge, SkillChips, WorkModeBadge} from "@/components/jobs/JobMeta";
import {SaveButton} from "@/components/jobs/SaveButton";
import {MatchBadge} from "@/components/jobs/MatchBadge";
import {cn} from "@/lib/cn";

/**
 * Works in both Server and Client trees (no hooks of its own); the interactive
 * bits — save, match score — are small client islands inside it.
 * The whole card is one link (a stretched ::after), so it's a single tab stop.
 */
export function JobCard({job, selected, onSelect, compact, className}: {
    job: JobSummary;
    selected?: boolean;
    /** On wide screens the search page opens a preview pane instead of navigating. */
    onSelect?: (id: number) => void;
    compact?: boolean;
    className?: string;
}) {
    return (
        <article
            className={cn(
                "group relative flex gap-3.5 rounded-2xl border bg-surface p-4 transition-[border-color,box-shadow]",
                // "Selected" only means something where the preview pane exists (lg+).
                selected
                    ? "border-border shadow-card lg:border-accent lg:shadow-raised lg:ring-3 lg:ring-accent/15"
                    : "border-border shadow-card hover:border-border-strong hover:shadow-raised",
                className,
            )}
        >
            <CompanyLogo name={job.company.name} src={job.company.logo} size={compact ? "sm" : "md"}/>
            <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                        <h3 className={cn("font-semibold leading-snug text-foreground", compact ? "text-sm" : "text-[15px]")}>
                            <Link
                                href={`/jobs/${job.id}`}
                                onClick={onSelect ? (event) => {
                                    if (window.matchMedia("(min-width: 1024px)").matches && !event.metaKey && !event.ctrlKey) {
                                        event.preventDefault();
                                        onSelect(job.id);
                                    }
                                } : undefined}
                                aria-current={selected ? "true" : undefined}
                                className="outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:outline-2 focus-visible:after:outline-accent group-hover:text-accent"
                            >
                                {job.title}
                            </Link>
                        </h3>
                        <p className="mt-0.5 truncate text-sm text-muted">{job.company.name}</p>
                    </div>
                    <SaveButton job={job} className="-mt-1 -mr-1.5"/>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted">
                    <LocationText locations={job.locations} className="max-w-[14rem]"/>
                    <span>{SENIORITY_LABEL[job.seniority]}</span>
                    <TimeAgo iso={job.postedAt} className="text-subtle"/>
                </div>

                {!compact && (
                    <>
                        <div className="mt-3 flex flex-wrap items-center gap-1.5">
                            <WorkModeBadge mode={job.workMode} size="sm"/>
                            <SalaryBadge job={job} size="sm"/>
                            <MatchBadge job={job}/>
                        </div>
                        <SkillChips skills={job.skills} className="mt-3"/>
                    </>
                )}
            </div>
        </article>
    );
}
