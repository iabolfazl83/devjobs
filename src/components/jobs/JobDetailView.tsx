import Link from "next/link";
import {ArrowUpRight} from "lucide-react";
import {JobDetail} from "@/lib/catalog/types";
import {ROLE_BY_ID, SENIORITY_LABEL, WORK_MODE_LABEL} from "@/lib/catalog/taxonomy";
import {formatSalary} from "@/lib/catalog/salary";
import {formatDate} from "@/lib/format";
import {SITE} from "@/lib/site";
import {CompanyLogo} from "@/components/ui/CompanyLogo";
import {TimeAgo} from "@/components/ui/TimeAgo";
import {SalaryBadge, WorkModeBadge} from "@/components/jobs/JobMeta";
import {JobActions} from "@/components/jobs/JobActions";
import {SkillMatch} from "@/components/jobs/SkillMatch";
import {MatchBadge} from "@/components/jobs/MatchBadge";
import {cn} from "@/lib/cn";

/**
 * The full job view. Rendered on the server for /jobs/[id] (static HTML, good
 * for SEO) and on the client inside the search page's preview pane — same
 * component, no "use client", interactive parts are islands.
 */
export function JobDetailView({job, variant = "page"}: { job: JobDetail; variant?: "page" | "preview" }) {
    const Heading = variant === "page" ? "h1" : "h2";
    // Client islands only get the summary: passing the full job would serialize the
    // description into the page's RSC payload once more per island.
    const {descriptionHtml: _descriptionHtml, ...summary} = job;
    const facts = [
        {label: "Role", value: ROLE_BY_ID[job.role].label},
        {label: "Experience", value: SENIORITY_LABEL[job.seniority]},
        {label: "Work mode", value: WORK_MODE_LABEL[job.workMode]},
        {label: "Salary", value: job.salary ? formatSalary(job.salary) : "Not listed"},
        {label: job.locations.length > 1 ? "Locations" : "Location", value: job.locations.join(" · ") || "Not listed"},
        {label: "Posted", value: formatDate(job.postedAt)},
    ];

    return (
        <article className="flex flex-col gap-6">
            <header className="flex flex-col gap-5">
                <div className="flex items-start gap-4">
                    <CompanyLogo name={job.company.name} src={job.company.logo} size={variant === "page" ? "lg" : "md"}/>
                    <div className="min-w-0 flex-1">
                        <Heading className={cn("font-semibold tracking-tight text-balance text-foreground", variant === "page" ? "text-2xl sm:text-3xl" : "text-xl")}>
                            {variant === "preview" ? (
                                <Link href={`/jobs/${job.id}`} className="hover:text-accent">{job.title}</Link>
                            ) : job.title}
                        </Heading>
                        <p className="mt-1.5 text-[15px] text-muted">
                            <Link href={`/companies/${job.company.slug}`} className="font-medium text-secondary hover:text-accent hover:underline">
                                {job.company.name}
                            </Link>
                            {" · "}{job.locations[0] ?? "Location not listed"}
                            {job.locations.length > 1 && ` +${job.locations.length - 1}`}
                            {" · "}<TimeAgo iso={job.postedAt}/>
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-1.5">
                            <WorkModeBadge mode={job.workMode}/>
                            <SalaryBadge job={job}/>
                            <MatchBadge job={summary} className="py-1 text-xs"/>
                        </div>
                    </div>
                </div>
                <JobActions job={summary}/>
            </header>

            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
                {facts.map((fact) => (
                    <div key={fact.label} className="min-w-0 bg-surface px-4 py-3">
                        <dt className="text-xs text-muted">{fact.label}</dt>
                        <dd className="mt-0.5 truncate text-sm font-medium text-foreground" title={fact.value}>{fact.value}</dd>
                    </div>
                ))}
            </dl>

            <SkillMatch job={summary}/>

            <section aria-labelledby={`about-${job.id}`}>
                <h2 id={`about-${job.id}`} className="mb-3 text-[15px] font-semibold">About the role</h2>
                {job.descriptionHtml ? (
                    <div
                        className="prose prose-sm prose-job max-w-none sm:prose-base"
                        // Sanitized with DOMPurify at build time (see lib/catalog/sanitize.ts).
                        dangerouslySetInnerHTML={{__html: job.descriptionHtml}}
                    />
                ) : (
                    <p className="text-sm text-muted">The employer didn&apos;t include a description. See the original listing for details.</p>
                )}
            </section>

            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 text-xs text-muted">
                <span>Listing via <a href={SITE.dataSource.url} target="_blank" rel="noopener noreferrer" className="hover:text-foreground hover:underline">{SITE.dataSource.name}</a>. Details may change — always check the employer&apos;s page.</span>
                <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-accent hover:underline">
                    Original listing <ArrowUpRight aria-hidden className="size-3.5"/>
                </a>
            </footer>
        </article>
    );
}
