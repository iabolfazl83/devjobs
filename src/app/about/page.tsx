import type {Metadata} from "next";
import {
    ArrowDown, ArrowRight, Braces, Database, FileCode2, Globe, Layers, Link2, LucideIcon, MonitorSmartphone, Server,
    ShieldCheck, Sparkles, TestTube2, Workflow, Accessibility, Palette, Filter,
} from "lucide-react";
import {getCatalog, getIndexSizeKb} from "@/lib/server/catalog";
import {formatDate, formatNumber, percent} from "@/lib/format";
import {SITE} from "@/lib/site";
import {Container, SectionHeading} from "@/components/layout/Section";
import {ButtonAnchor, ButtonLink} from "@/components/ui/Button";
import {GithubIcon} from "@/components/layout/Logo";

export const metadata: Metadata = {
    title: "How it's built",
    description: "Architecture, data pipeline and engineering decisions behind DevJobs.",
};

const FLOW: { icon: LucideIcon; title: string; body: string; tag: string }[] = [
    {icon: Globe, title: "The Muse API", body: "Public jobs + company directory. ~400 requests per run, inside the anonymous rate limit.", tag: "source"},
    {icon: Workflow, title: "Catalog pipeline", body: "Extract → classify & clean → write JSON. Runs in GitHub Actions on every push and every 6 hours.", tag: "build time"},
    {icon: FileCode2, title: "Next.js static export", body: "Pre-renders every job and company page to HTML, plus a compact search index.", tag: "build time"},
    {icon: Server, title: "GitHub Pages CDN", body: "Plain files. No server, no database, nothing to patch or scale.", tag: "hosting"},
    {icon: MonitorSmartphone, title: "Your browser", body: "Search engine, React Query cache, Zustand + localStorage for your account and tracker.", tag: "runtime"},
];

const decisions = (jobCount: number, indexKb: number): { icon: LucideIcon; title: string; body: string }[] => [
    {
        icon: Server,
        title: "Static-first, on purpose",
        body: "GitHub Pages can only serve files, so the earlier SQLite/API-route version never actually ran there. Now everything a page needs is computed at build time; the only runtime is the browser. Free to host, nothing to go down.",
    },
    {
        icon: Filter,
        title: "Classify, don't trust",
        body: "Upstream files “Produce Associate” under Software Engineering. The pipeline classifies roles from titles with ordered rules, requires description evidence for ambiguous titles, extracts skills and salary ranges, dedupes, and caps any one employer at 20 jobs.",
    },
    {
        icon: Braces,
        title: "Search runs in the browser",
        body: `The ${formatNumber(jobCount)}-job index is ${indexKb} KB gzipped. A small engine does weighted, prefix-matching full-text search and disjunctive facet counts in well under a millisecond — no search service needed at this scale.`,
    },
    {
        icon: Link2,
        title: "The URL is the state",
        body: "Every filter lives in the query string, written with the native History API (which Next.js syncs with useSearchParams). Searches are shareable and the Back button works; typing replaces history, clicks push it.",
    },
    {
        icon: Layers,
        title: "Server state vs client state",
        body: "TanStack Query owns fetched data (cached forever per deploy). Zustand owns client state — session, tracker, saved searches — persisted to localStorage, hydrated after mount so static HTML and React never disagree.",
    },
    {
        icon: Database,
        title: "A mock backend shaped like a real one",
        body: "Auth and tracker logic sit behind async functions that return result objects, with pure, unit-tested reducers underneath. Replacing localStorage with a real API means rewriting one service file, not the UI.",
    },
    {
        icon: ShieldCheck,
        title: "Security basics, even in a demo",
        body: "Third-party HTML is sanitized with DOMPurify at build time. Passwords are PBKDF2-hashed with a per-user salt and compared in constant time. Login errors don't reveal which accounts exist, and ?next= redirects only accept same-site paths.",
    },
    {
        icon: Palette,
        title: "Three themes, no flash",
        body: "Colors are CSS variables with light and dark values. An inline script sets the theme before first paint, “System” follows the OS live, and changes sync across tabs via the storage event.",
    },
    {
        icon: Accessibility,
        title: "Accessible by construction",
        body: "Native <dialog> for focus trapping, a combobox-pattern command palette, a keyboard/touch “Move to” menu as the alternative to drag-and-drop, live-region announcements, skip link, and reduced-motion support.",
    },
    {
        icon: TestTube2,
        title: "Tested and gated in CI",
        body: "Vitest covers the classifier, skill and salary extraction, search, URL params, match scoring and tracker reducers. Playwright drives the built site end to end. Lint, types, unit and e2e tests all gate the deploy.",
    },
];

const RENDERING: [string, string, string][] = [
    ["/", "Static (SSG)", "Stats, roles, skills and companies are baked in at build time."],
    ["/jobs/[id]", "Static, one page per job", "Real HTML + schema.org JobPosting for SEO; similar jobs computed at build."],
    ["/companies, /companies/[slug]", "Static", "Directory filters instantly in memory; profiles are pre-rendered."],
    ["/jobs", "Static shell + client search", "Results depend on URL params a static page can't know, so search runs in the browser."],
    ["/dashboard, /tracker, /profile", "Client, behind a route guard", "Personal data only exists in your browser; the guard redirects guests to /login?next=…"],
];

const STACK = [
    "Next.js 16 (App Router, static export)", "React 19 + React Compiler", "TypeScript (strict)", "Tailwind CSS v4",
    "TanStack Query", "Zustand (persist)", "DOMPurify", "Web Crypto (PBKDF2)", "lucide-react", "Vitest", "Playwright", "GitHub Actions + Pages",
];

export default function AboutPage() {
    const {stats, generatedAt} = getCatalog();
    const {pipeline} = stats;
    const rows: [string, number][] = [
        ["Fetched from upstream", pipeline.fetched],
        ["Dropped: not a tech role", pipeline.droppedNonTech],
        ["Dropped: duplicates & re-posts", pipeline.droppedDuplicate],
        ["Dropped: older than a year", pipeline.droppedStale],
        ["Dropped: per-company cap", pipeline.droppedCapped],
        ["Published", pipeline.kept],
    ];

    return (
        <>
            <section className="relative overflow-hidden border-b border-border">
                <div aria-hidden className="bg-grid absolute inset-0 opacity-50"/>
                <Container className="relative py-16 sm:py-20">
                    <p className="text-sm font-semibold text-accent">Under the hood</p>
                    <h1 className="mt-2 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                        A real job board with no servers to run
                    </h1>
                    <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
                        DevJobs is a static site: a data pipeline turns a noisy public API into a clean catalog at build time, and
                        everything interactive — search, accounts, the tracker — happens in your browser.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <ButtonAnchor href={SITE.repo} variant="secondary"><GithubIcon/> View the source</ButtonAnchor>
                        <ButtonLink href="/jobs" variant="outline">Try the search <ArrowRight/></ButtonLink>
                    </div>
                </Container>
            </section>

            <Container className="py-16">
                <SectionHeading eyebrow="Architecture" title="From API to your screen"
                                description={`The catalog you're browsing was built ${formatDate(generatedAt)}.`}/>
                <ol className="mt-10 grid gap-3 lg:grid-cols-5">
                    {FLOW.map(({icon: Icon, title, body, tag}, index) => (
                        <li key={title} className="relative flex lg:flex-col">
                            <div className="flex-1 rounded-2xl border border-border bg-surface p-5 shadow-card">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent"><Icon aria-hidden className="size-5"/></span>
                                    <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-muted">{tag}</span>
                                </div>
                                <h3 className="mt-4 font-semibold">{title}</h3>
                                <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p>
                            </div>
                            {index < FLOW.length - 1 && (
                                <span aria-hidden className="absolute -bottom-3 left-1/2 z-10 grid size-6 -translate-x-1/2 place-items-center rounded-full border border-border bg-background text-muted lg:top-1/2 lg:-right-3 lg:bottom-auto lg:left-auto lg:translate-x-0 lg:-translate-y-1/2">
                                    <ArrowDown className="size-3.5 lg:hidden"/>
                                    <ArrowRight className="hidden size-3.5 lg:block"/>
                                </span>
                            )}
                        </li>
                    ))}
                </ol>
            </Container>

            <section className="border-y border-border bg-surface/60">
                <Container className="grid gap-12 py-16 lg:grid-cols-[1fr_1.2fr]">
                    <div>
                        <SectionHeading eyebrow="Data quality" title="What the pipeline throws away"
                                        description="Most of what the upstream feed returns isn't a tech job, or is a duplicate. These are the real numbers from this build."/>
                        <dl className="mt-6 grid grid-cols-2 gap-3">
                            <div className="rounded-2xl border border-border bg-surface p-4">
                                <dt className="text-xs text-muted">Kept</dt>
                                <dd className="mt-1 text-2xl font-semibold">{percent(pipeline.kept / Math.max(pipeline.fetched, 1))}</dd>
                            </div>
                            <div className="rounded-2xl border border-border bg-surface p-4">
                                <dt className="text-xs text-muted">With a salary range</dt>
                                <dd className="mt-1 text-2xl font-semibold">{percent(stats.salaryShare)}</dd>
                            </div>
                        </dl>
                    </div>
                    <figure className="m-0 self-center">
                        <figcaption className="sr-only">Pipeline row counts</figcaption>
                        <table className="w-full text-sm">
                            <tbody>
                            {rows.map(([label, value]) => (
                                <tr key={label}>
                                    <th scope="row" className="w-52 py-2 pr-4 text-left font-normal text-secondary">{label}</th>
                                    <td className="py-2">
                                        <div className="flex items-center gap-3">
                                            <div className="h-3 flex-1">
                                                <div
                                                    className="h-full rounded-r-[4px]"
                                                    style={{width: `${Math.max(0.5, (value / Math.max(pipeline.fetched, 1)) * 100)}%`, background: label === "Published" ? "var(--accent)" : "var(--stage-applied)"}}
                                                />
                                            </div>
                                            <span className="w-14 text-right font-medium text-foreground tabular-nums">{formatNumber(value)}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </figure>
                </Container>
            </section>

            <Container className="py-16">
                <SectionHeading eyebrow="Decisions" title="The choices worth explaining"/>
                <ul className="mt-8 grid gap-4 md:grid-cols-2">
                    {decisions(stats.jobCount, getIndexSizeKb()).map(({icon: Icon, title, body}) => (
                        <li key={title} className="flex gap-4 rounded-2xl border border-border bg-surface p-5 shadow-card">
                            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent"><Icon aria-hidden className="size-5"/></span>
                            <div>
                                <h3 className="font-semibold">{title}</h3>
                                <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </Container>

            <Container className="grid gap-12 pb-4 lg:grid-cols-[1.4fr_1fr]">
                <div>
                    <SectionHeading eyebrow="Rendering" title="How each route is rendered"/>
                    <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-surface shadow-card">
                        <table className="w-full min-w-[560px] text-left text-sm">
                            <thead className="border-b border-border text-xs text-muted">
                            <tr>
                                <th scope="col" className="px-4 py-3 font-medium">Route</th>
                                <th scope="col" className="px-4 py-3 font-medium">Strategy</th>
                                <th scope="col" className="px-4 py-3 font-medium">Why</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                            {RENDERING.map(([route, strategy, why]) => (
                                <tr key={route}>
                                    <td className="px-4 py-3 align-top font-mono text-xs text-foreground">{route}</td>
                                    <td className="px-4 py-3 align-top font-medium whitespace-nowrap">{strategy}</td>
                                    <td className="px-4 py-3 align-top text-muted">{why}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div>
                    <SectionHeading eyebrow="Stack" title="Built with"/>
                    <ul className="mt-6 flex flex-wrap gap-2">
                        {STACK.map((item) => (
                            <li key={item} className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-secondary shadow-card">{item}</li>
                        ))}
                    </ul>
                    <div className="mt-8 rounded-2xl border border-accent/30 bg-accent-soft p-5">
                        <p className="flex items-center gap-2 font-semibold"><Sparkles aria-hidden className="size-4 text-accent"/>What I&apos;d build next</p>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-secondary">
                            <li>Real auth and sync (e.g. Supabase) behind the existing service layer</li>
                            <li>Email alerts for saved searches from the scheduled pipeline run</li>
                            <li>An inverted index in a Web Worker if the catalog grows past ~50k jobs</li>
                        </ul>
                    </div>
                </div>
            </Container>
        </>
    );
}
