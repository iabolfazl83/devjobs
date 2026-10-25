import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {ArrowRight, ChevronRight} from "lucide-react";
import {getCatalog, getCompany, getJob, getSimilarJobs} from "@/lib/server/catalog";
import {companySizeLabel, ROLE_BY_ID} from "@/lib/catalog/taxonomy";
import {JobDetail} from "@/lib/catalog/types";
import {SITE} from "@/lib/site";
import {Container} from "@/components/layout/Section";
import {JobDetailView} from "@/components/jobs/JobDetailView";
import {JobCard} from "@/components/jobs/JobCard";
import {RecordView} from "@/components/jobs/RecordView";
import {CompanyLogo} from "@/components/ui/CompanyLogo";
import {ButtonLink} from "@/components/ui/Button";
import {Card} from "@/components/ui/Card";
import {htmlToText, excerpt} from "@/lib/catalog/text";

// Every job in the catalog is pre-rendered at build time; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
    return getCatalog().jobs.map((job) => ({id: String(job.id)}));
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({params}: Props): Promise<Metadata> {
    const job = getJob(Number((await params).id));
    if (!job) return {};
    const title = `${job.title} at ${job.company.name}`;
    return {
        title,
        description: job.excerpt,
        alternates: {canonical: `/jobs/${job.id}/`},
        openGraph: {title, description: job.excerpt, type: "article"},
    };
}

/**
 * schema.org JobPosting — what Google for Jobs reads. `<` is escaped so a
 * crafted title can't close the script tag (per the Next.js JSON-LD guide).
 */
function jobPostingJsonLd(job: JobDetail) {
    const remote = job.workMode === "remote";
    const places = job.locations.filter((location) => location !== "Remote");
    const data = {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        title: job.title,
        description: job.descriptionHtml || job.excerpt,
        datePosted: job.postedAt,
        directApply: false,
        url: `${SITE.url}/jobs/${job.id}/`,
        hiringOrganization: {
            "@type": "Organization",
            name: job.company.name,
            ...(job.company.logo ? {logo: job.company.logo} : {}),
        },
        ...(places.length ? {
            jobLocation: places.map((place) => ({
                "@type": "Place",
                address: {"@type": "PostalAddress", addressLocality: place},
            })),
        } : {}),
        ...(remote ? {jobLocationType: "TELECOMMUTE"} : {}),
        ...(job.salary ? {
            baseSalary: {
                "@type": "MonetaryAmount",
                currency: job.salary.currency,
                value: {
                    "@type": "QuantitativeValue",
                    minValue: job.salary.min,
                    maxValue: job.salary.max,
                    unitText: job.salary.period === "year" ? "YEAR" : "HOUR",
                },
            },
        } : {}),
    };
    return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default async function JobPage({params}: Props) {
    const job = getJob(Number((await params).id));
    if (!job) notFound();

    const company = getCompany(job.company.slug);
    const similar = getSimilarJobs(job, 4);
    const role = ROLE_BY_ID[job.role];

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{__html: jobPostingJsonLd(job)}}/>
            <RecordView jobId={job.id}/>

            <div className="border-b border-border bg-surface">
                <Container className="py-3">
                    <nav aria-label="Breadcrumb">
                        <ol className="flex min-w-0 items-center gap-1.5 text-sm text-muted">
                            <li><Link href="/jobs" className="hover:text-foreground">Jobs</Link></li>
                            <li aria-hidden><ChevronRight className="size-3.5"/></li>
                            <li><Link href={`/jobs?role=${job.role}`} className="hover:text-foreground">{role.label}</Link></li>
                            <li aria-hidden><ChevronRight className="size-3.5"/></li>
                            <li className="truncate text-foreground" aria-current="page">{job.title}</li>
                        </ol>
                    </nav>
                </Container>
            </div>

            <Container className="grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:py-10">
                <Card className="p-5 sm:p-8">
                    <JobDetailView job={job}/>
                </Card>

                <aside className="flex flex-col gap-6">
                    <Card className="p-5">
                        <div className="flex items-center gap-3">
                            <CompanyLogo name={job.company.name} src={job.company.logo}/>
                            <div className="min-w-0">
                                <p className="truncate font-semibold">{job.company.name}</p>
                                <p className="truncate text-sm text-muted">
                                    {[company?.industries[0], companySizeLabel(company?.size ?? null)].filter(Boolean).join(" · ") || "Hiring now"}
                                </p>
                            </div>
                        </div>
                        {company?.descriptionHtml && (
                            <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-muted">{excerpt(htmlToText(company.descriptionHtml), 280)}</p>
                        )}
                        <ButtonLink href={`/companies/${job.company.slug}`} variant="outline" className="mt-4 w-full">
                            {company && company.jobCount > 1 ? `See all ${company.jobCount} open roles` : "View company"}
                            <ArrowRight/>
                        </ButtonLink>
                    </Card>

                    {similar.length > 0 && (
                        <section aria-labelledby="similar-heading">
                            <h2 id="similar-heading" className="mb-3 text-[15px] font-semibold">Similar jobs</h2>
                            <ul className="flex flex-col gap-2.5">
                                {similar.map((other) => (
                                    <li key={other.id}><JobCard job={other} compact/></li>
                                ))}
                            </ul>
                            <ButtonLink href={`/jobs?role=${job.role}`} variant="ghost" className="mt-2 w-full">
                                More {role.label} jobs <ArrowRight/>
                            </ButtonLink>
                        </section>
                    )}
                </aside>
            </Container>
        </>
    );
}
