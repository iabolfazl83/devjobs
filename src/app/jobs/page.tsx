import type {Metadata} from "next";
import {Suspense} from "react";
import {JobSearch} from "@/components/search/JobSearch";
import {Container} from "@/components/layout/Section";
import {Skeleton} from "@/components/ui/Skeleton";

export const metadata: Metadata = {
    title: "Find tech jobs",
    description: "Search real software, data, design and product jobs by skill, seniority, work mode and salary.",
};

/**
 * The search is driven entirely by URL params, which a static page can't know
 * at build time — so the interactive part renders on the client, and this
 * Suspense fallback is what ships in the HTML.
 */
export default function JobsPage() {
    return (
        <Suspense fallback={<SearchFallback/>}>
            <JobSearch/>
        </Suspense>
    );
}

function SearchFallback() {
    return (
        <>
            <div className="border-b border-border bg-surface">
                <Container className="flex flex-col gap-4 py-5">
                    <Skeleton className="h-12 rounded-xl"/>
                    <div className="flex gap-2">{Array.from({length: 6}, (_, i) => <Skeleton key={i} className="h-9 w-28 rounded-full"/>)}</div>
                </Container>
            </div>
            <Container className="py-6">
                <Skeleton className="h-5 w-40"/>
                <div className="mt-5 flex max-w-[440px] flex-col gap-3">
                    {Array.from({length: 4}, (_, i) => <Skeleton key={i} className="h-36 rounded-2xl"/>)}
                </div>
            </Container>
        </>
    );
}
