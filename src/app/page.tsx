import Link from "next/link";
import {ArrowRight, ArrowUpRight, Bell, Check, Filter, Monitor, Moon, SquareKanban, Sparkles, Sun} from "lucide-react";
import {getCatalog, getLatestJobs, toCompanySummary} from "@/lib/server/catalog";
import {ROLES} from "@/lib/catalog/taxonomy";
import {skillLabel} from "@/lib/catalog/skills";
import {formatNumber, percent} from "@/lib/format";
import {Container, SectionHeading} from "@/components/layout/Section";
import {HeroSearch} from "@/components/jobs/HeroSearch";
import {JobCard} from "@/components/jobs/JobCard";
import {ROLE_ICON} from "@/components/jobs/RoleIcon";
import {CompanyLogo} from "@/components/ui/CompanyLogo";
import {ButtonLink} from "@/components/ui/Button";
import {DemoButton} from "@/components/auth/DemoButton";
import {TimeAgo} from "@/components/ui/TimeAgo";

const POPULAR = [
    {label: "React", href: "/jobs?q=react"},
    {label: "Python", href: "/jobs?q=python"},
    {label: "Remote", href: "/jobs?mode=remote"},
    {label: "Machine learning", href: "/jobs?role=ml"},
    {label: "Internships", href: "/jobs?level=intern"},
    {label: "Kubernetes", href: "/jobs?q=kubernetes"},
];

export default function HomePage() {
    const {stats, companies, generatedAt} = getCatalog();
    const latest = getLatestJobs(6);
    const topCompanies = companies.filter((company) => company.logo).slice(0, 12).map(toCompanySummary);
    const roles = ROLES.filter((role) => (stats.roleCounts[role.id] ?? 0) > 0)
        .sort((a, b) => (stats.roleCounts[b.id] ?? 0) - (stats.roleCounts[a.id] ?? 0))
        .slice(0, 12);

    return (
        <>
            {/* Hero */}
            <section className="relative overflow-hidden border-b border-border">
                <div aria-hidden className="bg-grid absolute inset-0 opacity-60"/>
                <div aria-hidden className="absolute -top-40 left-1/2 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-accent/15 blur-3xl"/>
                <Container className="relative py-16 sm:py-24">
                    <div className="mx-auto max-w-3xl text-center">
                        <Link
                            href="/jobs?sort=newest"
                            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3 py-1 text-xs font-medium text-secondary shadow-card backdrop-blur transition-colors hover:border-border-strong"
                        >
                            <span className="relative flex size-2">
                                <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60 motion-reduce:hidden"/>
                                <span className="relative inline-flex size-2 rounded-full bg-success"/>
                            </span>
                            {formatNumber(stats.jobCount)} live tech roles · updated <TimeAgo iso={generatedAt}/>
                            <ArrowRight aria-hidden className="size-3.5"/>
                        </Link>
                        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-6xl">
                            Find the role that{" "}
                            <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
                                fits your stack
                            </span>
                        </h1>
                        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-pretty text-muted sm:text-lg">
                            Search {formatNumber(stats.jobCount)} real listings from {formatNumber(stats.companyCount)} companies by
                            skill, seniority and salary — see how well each one matches you — and track every application on one board.
                        </p>
                    </div>
                    <div className="mx-auto mt-10 max-w-3xl">
                        <HeroSearch/>
                        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
                            <span className="text-muted">Popular:</span>
                            {POPULAR.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="rounded-full border border-border bg-surface px-3 py-1 text-secondary transition-colors hover:border-accent/40 hover:text-accent"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <dl className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-4">
                        {[
                            {label: "Open roles", value: formatNumber(stats.jobCount)},
                            {label: "Companies hiring", value: formatNumber(stats.companyCount)},
                            {label: "Remote-friendly", value: percent(stats.remoteShare)},
                            {label: "Show salary", value: percent(stats.salaryShare)},
                        ].map((item) => (
                            <div key={item.label} className="bg-surface px-5 py-4 text-center">
                                <dt className="text-xs font-medium text-muted">{item.label}</dt>
                                <dd className="mt-1 text-2xl font-semibold tracking-tight text-foreground tabular-nums">{item.value}</dd>
                            </div>
                        ))}
                    </dl>
                </Container>
            </section>

            {/* Browse by role */}
            <Container className="py-16 sm:py-20">
                <SectionHeading
                    eyebrow="Browse by role"
                    title="Jump straight to your specialty"
                    description="Every listing is classified by our pipeline from its title and tech stack — not by the upstream feed's categories."
                    action={<ButtonLink href="/jobs" variant="outline">All jobs <ArrowRight/></ButtonLink>}
                />
                <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {roles.map((role) => {
                        const Icon = ROLE_ICON[role.id];
                        return (
                            <li key={role.id}>
                                <Link
                                    href={`/jobs?role=${role.id}`}
                                    className="group flex h-full items-start gap-3 rounded-2xl border border-border bg-surface p-4 shadow-card transition-[border-color,box-shadow] hover:border-accent/40 hover:shadow-raised"
                                >
                                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                                        <Icon className="size-5" aria-hidden/>
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block font-semibold text-foreground group-hover:text-accent">{role.label}</span>
                                        <span className="mt-0.5 block text-xs text-muted">{formatNumber(stats.roleCounts[role.id] ?? 0)} open · {role.blurb}</span>
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </Container>

            {/* Latest jobs */}
            <section className="border-y border-border bg-surface/60">
                <Container className="py-16 sm:py-20">
                    <SectionHeading
                        eyebrow="Fresh this week"
                        title="Latest openings"
                        action={<ButtonLink href="/jobs?sort=newest" variant="outline">See all latest <ArrowRight/></ButtonLink>}
                    />
                    <ul className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {latest.map((job) => (
                            <li key={job.id}><JobCard job={job} className="h-full"/></li>
                        ))}
                    </ul>
                </Container>
            </section>

            {/* Features */}
            <Container className="py-16 sm:py-24">
                <SectionHeading
                    eyebrow="More than a list of links"
                    title="Everything you need from search to signed offer"
                    description="Built like the big job sites — faceted search, fit scoring, saved searches and a pipeline board — without the noise."
                />
                <div className="mt-10 grid gap-4 lg:grid-cols-3">
                    <FeatureCard
                        className="lg:col-span-2"
                        icon={Filter}
                        title="Search that understands your stack"
                        body="Full-text search with typo-tolerant prefix matching, plus filters for role, seniority, work mode, skills, salary and recency. Every count updates live as you filter."
                    >
                        <div className="flex flex-wrap gap-2">
                            {[
                                `Frontend · ${stats.roleCounts.frontend ?? 0}`,
                                `Remote · ${Math.round(stats.remoteShare * stats.jobCount)}`,
                                ...stats.topSkills.slice(0, 2).map(({skill, count}) => `${skillLabel(skill)} · ${count}`),
                                `Has salary · ${Math.round(stats.salaryShare * stats.jobCount)}`,
                            ].map((chip, index) => (
                                <span key={chip} className={`rounded-full border px-3 py-1 text-xs font-medium ${index < 2 ? "border-accent/30 bg-accent-soft text-accent" : "border-border bg-surface-2 text-secondary"}`}>
                                    {chip}
                                </span>
                            ))}
                        </div>
                    </FeatureCard>
                    <FeatureCard icon={Sparkles} title="Know your fit at a glance" body="Add your skills once. Every job shows a match score and exactly which skills you have — and which you'd need.">
                        <div className="flex items-center gap-4">
                            <div className="relative grid size-16 place-items-center rounded-full" style={{background: "conic-gradient(var(--success) 0 87%, var(--surface-3) 0)"}}>
                                <span className="grid size-12 place-items-center rounded-full bg-surface text-sm font-semibold">87%</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {["React", "TypeScript", "GraphQL"].map((skill) => (
                                    <span key={skill} className="inline-flex items-center gap-1 rounded-md bg-success-soft px-1.5 py-0.5 text-[11px] font-medium text-success"><Check className="size-3"/>{skill}</span>
                                ))}
                                <span className="rounded-md bg-surface-2 px-1.5 py-0.5 text-[11px] font-medium text-muted">Go</span>
                            </div>
                        </div>
                    </FeatureCard>
                    <FeatureCard icon={SquareKanban} title="Track every application" body="Drag jobs from Saved to Applied to Offer. Notes, a status timeline and undo on everything.">
                        <div className="grid grid-cols-4 gap-1.5">
                            {[3, 2, 2, 1].map((count, column) => (
                                <div key={column} className="space-y-1.5 rounded-lg bg-surface-2 p-1.5">
                                    {Array.from({length: count}, (_, row) => (
                                        <div key={row} className="h-4 rounded bg-surface shadow-card"/>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </FeatureCard>
                    <FeatureCard icon={Bell} title="Saved searches that show what's new" body="Save any filter combination and see how many new matches arrived since you last looked.">
                        <div className="space-y-2">
                            {[["Remote React roles", 12], ["Senior full-stack", 4]].map(([name, count]) => (
                                <div key={name} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-xs">
                                    <span className="font-medium text-secondary">{name}</span>
                                    <span className="rounded-full bg-accent-soft px-2 py-0.5 font-semibold text-accent">+{count} new</span>
                                </div>
                            ))}
                        </div>
                    </FeatureCard>
                    <FeatureCard icon={Monitor} title="Light, dark or system" body="Three themes with no flash on load, synced across tabs — and every color meets contrast guidelines.">
                        <div className="flex gap-2">
                            {[{icon: Sun, label: "Light", className: "bg-white text-slate-900 border-slate-200"}, {icon: Moon, label: "Dark", className: "bg-slate-900 text-slate-100 border-slate-700"}, {icon: Monitor, label: "System", className: "bg-gradient-to-br from-white from-50% to-slate-900 to-50% text-slate-500 border-border"}].map(({icon: Icon, label, className}) => (
                                <span key={label} className={`flex flex-1 flex-col items-center gap-1 rounded-lg border py-2 text-[11px] font-medium ${className}`}>
                                    <Icon className="size-4"/>{label}
                                </span>
                            ))}
                        </div>
                    </FeatureCard>
                </div>
            </Container>

            {/* Skills + companies */}
            <section className="border-y border-border bg-surface/60">
                <Container className="grid gap-12 py-16 sm:py-20 lg:grid-cols-[1fr_1.3fr]">
                    <div>
                        <SectionHeading eyebrow="In demand" title="Trending skills"
                                        description="Extracted from every job description in the current snapshot."/>
                        <ul className="mt-6 flex flex-wrap gap-2">
                            {stats.topSkills.slice(0, 20).map(({skill, count}) => (
                                <li key={skill}>
                                    <Link
                                        href={`/jobs?skill=${skill}`}
                                        className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-secondary shadow-card transition-colors hover:border-accent/40 hover:text-accent"
                                    >
                                        {skillLabel(skill)}
                                        <span className="text-xs text-subtle tabular-nums">{count}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <SectionHeading
                            eyebrow="Who's hiring"
                            title="Top companies"
                            action={<ButtonLink href="/companies" variant="outline">All companies <ArrowRight/></ButtonLink>}
                        />
                        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {topCompanies.map((company) => (
                                <li key={company.id}>
                                    <Link
                                        href={`/companies/${company.slug}`}
                                        className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 shadow-card transition-colors hover:border-border-strong"
                                    >
                                        <CompanyLogo name={company.name} src={company.logo} size="sm"/>
                                        <span className="min-w-0">
                                            <span className="block truncate text-sm font-medium text-foreground">{company.name}</span>
                                            <span className="block text-xs text-muted">{company.jobCount} open roles</span>
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </Container>
            </section>

            {/* CTA */}
            <Container className="pt-16 sm:pt-24">
                <div className="relative overflow-hidden rounded-3xl border border-border bg-surface px-6 py-12 text-center shadow-raised sm:px-12">
                    <div aria-hidden className="absolute -right-24 -bottom-24 size-72 rounded-full bg-accent/15 blur-3xl"/>
                    <div aria-hidden className="absolute -top-24 -left-24 size-72 rounded-full bg-fuchsia-500/10 blur-3xl"/>
                    <h2 className="relative text-2xl font-semibold tracking-tight sm:text-3xl">See it with real data in one click</h2>
                    <p className="relative mx-auto mt-3 max-w-xl text-muted">
                        The demo account comes with a profile and a tracker already full of applications — no sign-up needed.
                    </p>
                    <div className="relative mt-7 flex flex-wrap justify-center gap-3">
                        <DemoButton variant="primary" size="lg"/>
                        <ButtonLink href="/signup" variant="outline" size="lg">Create an account</ButtonLink>
                        <ButtonLink href="/about" variant="ghost" size="lg">How it&apos;s built <ArrowUpRight/></ButtonLink>
                    </div>
                </div>
            </Container>
        </>
    );
}

function FeatureCard({icon: Icon, title, body, children, className}: {
    icon: typeof Filter;
    title: string;
    body: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={`flex flex-col justify-between gap-6 rounded-2xl border border-border bg-surface p-6 shadow-card ${className ?? ""}`}>
            <div>
                <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent">
                    <Icon className="size-5" aria-hidden/>
                </span>
                <h3 className="mt-4 text-lg font-semibold tracking-tight">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
            </div>
            <div aria-hidden>{children}</div>
        </div>
    );
}
