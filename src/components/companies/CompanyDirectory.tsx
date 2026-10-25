"use client";

import Link from "next/link";
import {useMemo, useState} from "react";
import {Building2, Globe, Search} from "lucide-react";
import {CompanySummary} from "@/lib/catalog/types";
import {companySizeLabel, ROLE_BY_ID} from "@/lib/catalog/taxonomy";
import {CompanyLogo} from "@/components/ui/CompanyLogo";
import {Badge} from "@/components/ui/Badge";
import {Select} from "@/components/ui/Field";
import {EmptyState} from "@/components/ui/EmptyState";
import {SegmentedControl} from "@/components/ui/SegmentedControl";
import {pluralize} from "@/lib/format";

type Sort = "roles" | "name";

/** Small dataset (~150 companies), so it ships with the page and filters instantly in memory. */
export function CompanyDirectory({companies}: { companies: CompanySummary[] }) {
    const [query, setQuery] = useState("");
    const [industry, setIndustry] = useState("");
    const [remoteOnly, setRemoteOnly] = useState(false);
    const [sort, setSort] = useState<Sort>("roles");

    const industries = useMemo(() => {
        const counts = new Map<string, number>();
        companies.forEach((company) => company.industries.forEach((name) => counts.set(name, (counts.get(name) ?? 0) + 1)));
        return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name);
    }, [companies]);

    const text = query.trim().toLowerCase();
    const visible = companies
        .filter((company) => !text || company.name.toLowerCase().includes(text) || company.industries.some((name) => name.toLowerCase().includes(text)))
        .filter((company) => !industry || company.industries.includes(industry))
        .filter((company) => !remoteOnly || company.remoteJobCount > 0)
        .sort((a, b) => (sort === "name" ? a.name.localeCompare(b.name) : b.jobCount - a.jobCount || a.name.localeCompare(b.name)));

    return (
        <div>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <label className="relative flex-1">
                    <span className="sr-only">Search companies</span>
                    <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted"/>
                    <input
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search by company or industry"
                        className="h-10 w-full rounded-lg border border-border bg-surface pr-3 pl-10 text-sm shadow-card outline-none placeholder:text-subtle focus:border-accent focus:ring-3 focus:ring-accent/20"
                    />
                </label>
                <div className="flex flex-wrap items-center gap-2">
                    <label>
                        <span className="sr-only">Industry</span>
                        <Select value={industry} onChange={(event) => setIndustry(event.target.value)} className="w-auto">
                            <option value="">All industries</option>
                            {industries.map((name) => <option key={name} value={name}>{name}</option>)}
                        </Select>
                    </label>
                    <label className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm text-secondary shadow-card">
                        <input type="checkbox" checked={remoteOnly} onChange={() => setRemoteOnly((value) => !value)} className="size-4 accent-accent"/>
                        Hiring remotely
                    </label>
                    <SegmentedControl<Sort>
                        label="Sort companies"
                        value={sort}
                        onChange={setSort}
                        options={[{value: "roles", label: "Most roles"}, {value: "name", label: "A–Z"}]}
                    />
                </div>
            </div>

            <p className="mt-5 text-sm text-muted" aria-live="polite">{pluralize(visible.length, "company", "companies")}</p>

            {visible.length === 0 ? (
                <EmptyState icon={Building2} title="No companies match" description="Try a different name or industry."/>
            ) : (
                <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {visible.map((company) => (
                        <li key={company.id}>
                            <Link
                                href={`/companies/${company.slug}`}
                                className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-4 shadow-card transition-[border-color,box-shadow] hover:border-border-strong hover:shadow-raised"
                            >
                                <div className="flex items-start gap-3">
                                    <CompanyLogo name={company.name} src={company.logo}/>
                                    <div className="min-w-0 flex-1">
                                        <h2 className="truncate font-semibold text-foreground group-hover:text-accent">{company.name}</h2>
                                        <p className="truncate text-sm text-muted">
                                            {[company.industries[0], companySizeLabel(company.size)].filter(Boolean).join(" · ")}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-1.5">
                                    {company.topRoles.map((role) => <Badge key={role} size="sm">{ROLE_BY_ID[role].label}</Badge>)}
                                </div>
                                <div className="mt-auto flex items-center justify-between gap-2 pt-4 text-sm">
                                    <span className="font-medium text-foreground">{pluralize(company.jobCount, "open role")}</span>
                                    {company.remoteJobCount > 0 && (
                                        <span className="inline-flex items-center gap-1 text-xs text-success">
                                            <Globe aria-hidden className="size-3.5"/>{company.remoteJobCount} remote
                                        </span>
                                    )}
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
