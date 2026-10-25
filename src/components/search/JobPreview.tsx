"use client";

import {ArrowUpRight, FileX} from "lucide-react";
import {useJobDetail} from "@/lib/data/queries";
import {JobDetailView} from "@/components/jobs/JobDetailView";
import {Skeleton} from "@/components/ui/Skeleton";
import {EmptyState} from "@/components/ui/EmptyState";
import {ButtonLink} from "@/components/ui/Button";

/** The right-hand pane on wide screens: full job details without leaving the results. */
export function JobPreview({jobId}: { jobId: number }) {
    const {data: job, isPending, isError, refetch} = useJobDetail(jobId);

    if (isPending) {
        return (
            <div className="space-y-5 p-6" aria-busy="true" aria-label="Loading job">
                <div className="flex gap-4">
                    <Skeleton className="size-11 rounded-xl"/>
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-3/4"/>
                        <Skeleton className="h-4 w-1/2"/>
                    </div>
                </div>
                <Skeleton className="h-10 w-72"/>
                <Skeleton className="h-28 w-full rounded-2xl"/>
                <div className="space-y-2">
                    {Array.from({length: 8}, (_, index) => <Skeleton key={index} className="h-4" />)}
                </div>
            </div>
        );
    }

    if (isError || !job) {
        return (
            <EmptyState
                icon={FileX}
                title={isError ? "Couldn't load this job" : "This listing is no longer available"}
                description={isError ? "Check your connection and try again." : "It may have closed since the last snapshot."}
                action={isError ? <button type="button" onClick={() => refetch()} className="text-sm font-medium text-accent hover:underline">Retry</button> : undefined}
            />
        );
    }

    return (
        <div>
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-surface/90 px-6 py-2 backdrop-blur">
                <span className="truncate text-xs font-medium text-muted">{job.company.name}</span>
                <ButtonLink href={`/jobs/${job.id}`} variant="ghost" size="sm" className="-mr-2">
                    Open full page <ArrowUpRight/>
                </ButtonLink>
            </div>
            <div className="p-6">
                <JobDetailView job={job} variant="preview"/>
            </div>
        </div>
    );
}
