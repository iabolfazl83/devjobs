import {queryOptions, useQuery} from "@tanstack/react-query";
import {JobDetail, JobsIndex} from "@/lib/catalog/types";
import {withBasePath} from "@/lib/site";

/**
 * Server state lives in TanStack Query; client state (session, tracker) lives in
 * Zustand. Both "endpoints" here are static JSON files produced by the catalog
 * pipeline, served from the same CDN as the HTML.
 */

export const jobsIndexQuery = queryOptions({
    queryKey: ["jobs-index"],
    queryFn: async (): Promise<JobsIndex> => {
        const response = await fetch(withBasePath("/data/jobs.json"));
        if (!response.ok) throw new Error(`Couldn't load jobs (HTTP ${response.status})`);
        return response.json();
    },
    // Immutable for the lifetime of a deploy.
    staleTime: Infinity,
    gcTime: Infinity,
});

export function jobDetailQuery(id: number) {
    return queryOptions({
        queryKey: ["job", id],
        queryFn: async (): Promise<JobDetail | null> => {
            const response = await fetch(withBasePath(`/data/jobs/${id}.json`));
            if (response.status === 404) return null;
            if (!response.ok) throw new Error(`Couldn't load job ${id} (HTTP ${response.status})`);
            return response.json();
        },
        staleTime: Infinity,
    });
}

export function useJobsIndex() {
    return useQuery(jobsIndexQuery);
}

export function useJobDetail(id: number | null) {
    return useQuery({...jobDetailQuery(id ?? 0), enabled: id !== null});
}
