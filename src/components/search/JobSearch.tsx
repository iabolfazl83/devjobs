"use client";

import {useEffect, useMemo, useRef} from "react";
import {CloudOff, SearchX} from "lucide-react";
import {useJobsIndex} from "@/lib/data/queries";
import {searchJobs} from "@/lib/search/engine";
import {searchKey} from "@/lib/search/params";
import {useSearchState} from "@/lib/search/useSearchState";
import {useSession} from "@/lib/auth/hooks";
import {useUserData} from "@/lib/tracker/hooks";
import {tracker} from "@/lib/tracker/store";
import {formatNumber} from "@/lib/format";
import {Container} from "@/components/layout/Section";
import {JobCard} from "@/components/jobs/JobCard";
import {SearchBar} from "@/components/search/SearchBar";
import {ActiveFilters, FilterBar, SortSelect} from "@/components/search/FilterControls";
import {Pagination} from "@/components/search/Pagination";
import {JobPreview} from "@/components/search/JobPreview";
import {SaveSearchButton} from "@/components/search/SaveSearchButton";
import {EmptyState} from "@/components/ui/EmptyState";
import {Button} from "@/components/ui/Button";
import {Skeleton} from "@/components/ui/Skeleton";

export function JobSearch() {
    const {state, selectedId, inputVersion, update, setPage, selectJob, reset} = useSearchState();
    const {data: index, isPending, isError, refetch} = useJobsIndex();
    const {userId} = useSession();
    const {savedSearches} = useUserData();
    const listTop = useRef<HTMLDivElement>(null);

    const result = useMemo(() => (index ? searchJobs(index.jobs, state) : null), [index, state]);

    const locations = useMemo(() => {
        const counts = new Map<string, number>();
        index?.jobs.forEach((job) => job.locations.forEach((location) => counts.set(location, (counts.get(location) ?? 0) + 1)));
        return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40).map(([location]) => location);
    }, [index]);

    const companyName = state.company ? index?.jobs.find((job) => job.company.slug === state.company)?.company.name ?? null : null;

    // Opening a saved search counts as "checking" it, which resets its "new" badge.
    const savedId = savedSearches.find((search) => search.query === searchKey(state))?.id;
    useEffect(() => {
        if (userId && savedId) tracker.markSearchChecked(userId, savedId);
    }, [userId, savedId]);

    // On wide screens the first result previews by default, like LinkedIn.
    const previewId = selectedId ?? result?.results[0]?.id ?? null;

    return (
        <>
            <div className="border-b border-border bg-surface">
                <Container className="flex flex-col gap-4 py-5">
                    <h1 className="sr-only">Search jobs</h1>
                    <SearchBar
                        q={state.q}
                        loc={state.loc}
                        version={inputVersion}
                        locations={locations}
                        onChange={(patch) => update(patch, {mode: "replace"})}
                    />
                    {result ? (
                        <FilterBar state={state} facets={result.facets} update={update} total={result.total}/>
                    ) : (
                        <div className="flex gap-2">{Array.from({length: 6}, (_, i) => <Skeleton key={i} className="h-9 w-28 rounded-full"/>)}</div>
                    )}
                </Container>
            </div>

            <Container className="py-6">
                <div ref={listTop} className="flex scroll-mt-24 flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-muted" aria-live="polite">
                        {result ? (
                            <>
                                <span className="font-semibold text-foreground">{formatNumber(result.total)}</span>{" "}
                                {result.total === 1 ? "job" : "jobs"}
                                {state.q && <> for <span className="font-medium text-foreground">“{state.q}”</span></>}
                                {result.pageCount > 1 && <> · page {result.page} of {result.pageCount}</>}
                            </>
                        ) : "Loading jobs…"}
                    </p>
                    <div className="flex items-center gap-2">
                        <SaveSearchButton state={state}/>
                        <SortSelect value={state.sort} onChange={(sort) => update({sort})}/>
                    </div>
                </div>
                <div className="mt-3">
                    <ActiveFilters state={state} update={update} reset={reset} companyName={companyName}/>
                </div>

                {isError && (
                    <EmptyState
                        icon={CloudOff}
                        title="Couldn't load jobs"
                        description="The job index didn't download. Check your connection and try again."
                        action={<Button onClick={() => refetch()}>Retry</Button>}
                    />
                )}

                {isPending && (
                    <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
                        <div className="flex flex-col gap-3">
                            {Array.from({length: 6}, (_, i) => <Skeleton key={i} className="h-36 rounded-2xl"/>)}
                        </div>
                        <Skeleton className="hidden h-[70vh] rounded-2xl lg:block"/>
                    </div>
                )}

                {result && result.total === 0 && (
                    <EmptyState
                        icon={SearchX}
                        title="No jobs match all of that"
                        description="Try removing a filter or two — the counts next to each option show what's available."
                        action={<Button variant="outline" onClick={reset}>Clear search & filters</Button>}
                    />
                )}

                {result && result.total > 0 && (
                    <div className="mt-5 grid items-start gap-6 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
                        <div className="flex flex-col gap-3">
                            <ul className="flex flex-col gap-3">
                                {result.results.map((job) => (
                                    <li key={job.id}>
                                        <JobCard job={job} selected={job.id === previewId} onSelect={selectJob}/>
                                    </li>
                                ))}
                            </ul>
                            <Pagination
                                page={result.page}
                                pageCount={result.pageCount}
                                onPage={(page) => {
                                    setPage(page);
                                    listTop.current?.scrollIntoView({behavior: "smooth", block: "start"});
                                }}
                            />
                        </div>
                        <aside aria-label="Job preview" className="sticky top-20 hidden lg:block">
                            {previewId && (
                                <div key={previewId} className="max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-2xl border border-border bg-surface shadow-card scrollbar-thin">
                                    <JobPreview jobId={previewId}/>
                                </div>
                            )}
                        </aside>
                    </div>
                )}
            </Container>
        </>
    );
}
