import Link from "next/link";
import {GithubIcon, Logo} from "@/components/layout/Logo";
import {SITE} from "@/lib/site";
import {formatDate} from "@/lib/format";
import {getCatalog} from "@/lib/server/catalog";

const COLUMNS = [
    {
        title: "Product",
        links: [
            {href: "/jobs", label: "Find jobs"},
            {href: "/companies", label: "Companies"},
            {href: "/tracker", label: "Application tracker"},
            {href: "/dashboard", label: "Dashboard"},
        ],
    },
    {
        title: "Popular",
        links: [
            {href: "/jobs?mode=remote", label: "Remote jobs"},
            {href: "/jobs?role=frontend", label: "Frontend"},
            {href: "/jobs?role=ml", label: "AI & ML"},
            {href: "/jobs?level=entry,intern", label: "Entry level & internships"},
        ],
    },
    {
        title: "Project",
        links: [
            {href: "/about", label: "How it's built"},
            {href: "/settings", label: "Appearance & data"},
        ],
    },
];

export function SiteFooter() {
    const {generatedAt, stats} = getCatalog();

    return (
        <footer className="mt-24 border-t border-border bg-surface">
            <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
                <div className="max-w-xs">
                    <Logo/>
                    <p className="mt-4 text-sm leading-relaxed text-muted">{SITE.tagline}</p>
                    <a
                        href={SITE.repo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm text-secondary transition-colors hover:border-border-strong hover:text-foreground"
                    >
                        <GithubIcon/>
                        Source on GitHub
                    </a>
                </div>
                {COLUMNS.map((column) => (
                    <div key={column.title}>
                        <h2 className="text-sm font-semibold text-foreground">{column.title}</h2>
                        <ul className="mt-3 space-y-2">
                            {column.links.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-muted transition-colors hover:text-foreground">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
            <div className="border-t border-border">
                <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <p>
                        {stats.jobCount.toLocaleString("en-US")} listings from{" "}
                        <a href={SITE.dataSource.url} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:text-foreground hover:underline">
                            {SITE.dataSource.name}
                        </a>
                        {" "}· snapshot {formatDate(generatedAt)}
                    </p>
                    <p>A portfolio project. Accounts are demo-only and stored in your browser.</p>
                </div>
            </div>
        </footer>
    );
}
