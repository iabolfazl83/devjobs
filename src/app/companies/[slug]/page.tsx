import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {ArrowRight, ArrowUpRight, Briefcase, ChevronRight, Globe, MapPin, Users} from "lucide-react";
import {getCatalog, getCompany, getCompanyJobs} from "@/lib/server/catalog";
import {companySizeLabel, ROLE_BY_ID} from "@/lib/catalog/taxonomy";
import {skillLabel} from "@/lib/catalog/skills";
import {excerpt, htmlToText} from "@/lib/catalog/text";
import {Container} from "@/components/layout/Section";
import {CompanyLogo} from "@/components/ui/CompanyLogo";
import {ButtonAnchor, ButtonLink} from "@/components/ui/Button";
import {Badge} from "@/components/ui/Badge";
import {Card} from "@/components/ui/Card";
import {JobCard} from "@/components/jobs/JobCard";
import {pluralize} from "@/lib/format";

export const dynamicParams = false;

export function generateStaticParams() {
    return getCatalog().companies.map((company) => ({slug: company.slug}));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({params}: Props): Promise<Metadata> {
    const company = getCompany((await params).slug);
    if (!company) return {};
    const description = company.descriptionHtml
        ? excerpt(htmlToText(company.descriptionHtml), 160)
        : `${company.name} has ${pluralize(company.jobCount, "open tech role")}.`;
    return {title: `${company.name} — jobs & company profile`, description};
}

export default async function CompanyPage({params}: Props) {
    const company = getCompany((await params).slug);
    if (!company) notFound();
    const jobs = getCompanyJobs(company.id);
    const [cover] = company.images;

    return (
        <>
            <div className="relative h-44 overflow-hidden border-b border-border bg-surface-2 sm:h-56">
                {cover && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover} alt="" className="size-full object-cover"/>
                )}
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"/>
            </div>

            <Container className="relative -mt-14">
                <nav aria-label="Breadcrumb" className="sr-only">
                    <ol><li><Link href="/companies">Companies</Link></li><li aria-current="page">{company.name}</li></ol>
                </nav>
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex items-end gap-4">
                        <CompanyLogo name={company.name} src={company.logo} size="xl" className="shadow-raised"/>
                        <div className="pb-1">
                            <p className="mb-1 flex items-center gap-1 text-sm text-muted">
                                <Link href="/companies" className="hover:text-foreground">Companies</Link>
                                <ChevronRight aria-hidden className="size-3.5"/>
                            </p>
                            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{company.name}</h1>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <ButtonLink href={`/jobs?company=${company.slug}`}>Search their jobs <ArrowRight/></ButtonLink>
                        {company.profileUrl && (
                            <ButtonAnchor href={company.profileUrl} variant="outline">Full profile <ArrowUpRight/></ButtonAnchor>
                        )}
                    </div>
                </div>

                <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border lg:grid-cols-4">
                    {[
                        {icon: Briefcase, label: "Open tech roles", value: String(company.jobCount)},
                        {icon: Globe, label: "Remote roles", value: String(company.remoteJobCount)},
                        {icon: Users, label: "Size", value: companySizeLabel(company.size) ?? "—"},
                        {icon: MapPin, label: "Based in", value: company.locations.slice(0, 2).join(" · ") || "—"},
                    ].map(({icon: Icon, label, value}) => (
                        <div key={label} className="min-w-0 bg-surface px-5 py-4">
                            <dt className="flex items-center gap-1.5 text-xs text-muted"><Icon aria-hidden className="size-3.5"/>{label}</dt>
                            <dd className="mt-1 truncate font-semibold" title={value}>{value}</dd>
                        </div>
                    ))}
                </dl>

                <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
                    <section aria-labelledby="open-roles">
                        <h2 id="open-roles" className="text-lg font-semibold">Open roles</h2>
                        <ul className="mt-4 grid gap-3 md:grid-cols-2">
                            {jobs.map((job) => <li key={job.id}><JobCard job={job} className="h-full"/></li>)}
                        </ul>
                    </section>

                    <aside className="flex flex-col gap-4">
                        <Card className="p-5">
                            <h2 className="text-[15px] font-semibold">About {company.name}</h2>
                            {company.descriptionHtml ? (
                                <div className="prose prose-sm prose-job mt-3 max-w-none" dangerouslySetInnerHTML={{__html: company.descriptionHtml}}/>
                            ) : (
                                <p className="mt-3 text-sm text-muted">No company description yet.</p>
                            )}
                            {company.industries.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-1.5">
                                    {company.industries.map((name) => <Badge key={name}>{name}</Badge>)}
                                </div>
                            )}
                        </Card>
                        <Card className="p-5">
                            <h2 className="text-[15px] font-semibold">What they hire for</h2>
                            <div className="mt-3 flex flex-wrap gap-1.5">
                                {company.topRoles.map((role) => <Badge key={role} tone="accent">{ROLE_BY_ID[role].label}</Badge>)}
                            </div>
                            {company.topSkills.length > 0 && (
                                <>
                                    <h3 className="mt-4 text-xs font-medium text-muted">Most-requested skills</h3>
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        {company.topSkills.map((skill) => <Badge key={skill} tone="outline">{skillLabel(skill)}</Badge>)}
                                    </div>
                                </>
                            )}
                        </Card>
                    </aside>
                </div>
            </Container>
        </>
    );
}
