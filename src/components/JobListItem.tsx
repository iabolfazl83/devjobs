"use client";

import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {Job, SavedJobRow} from "@/lib/types";
import Link from "next/link";

export default function JobListItem({job}: { job: Job }) {
    const queryClient = useQueryClient();

    // 1. READ: get the current list of saved jobs
    const {data: savedJobs = []} = useQuery<SavedJobRow[]>({
        queryKey: ["saved-jobs"],
        queryFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/saved-jobs`);
            const json = await res.json();
            return json.savedJobs;
        },
    });

    const isSaved: boolean = savedJobs.some((saved: { job_id: number }) => saved.job_id === job.id);

    // 2. WRITE: toggle save/unsave
    const mutation = useMutation({
        mutationFn: async () => {
            if (isSaved) {
                await fetch(`/api/saved-jobs/${job.id}`, {method: "DELETE"});
            } else {
                await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/saved-jobs`, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({jobId: job.id}),
                });
            }
        },
        onSuccess: () => {
            // tell React Query the "saved-jobs" cache is stale, refetch it
            queryClient.invalidateQueries({queryKey: ["saved-jobs"]});
        },
    });

    return (
        <li className="flex items-center justify-between gap-4 p-4 bg-surface border border-border rounded-lg hover:border-accent transition-colors">
            <Link href={`/jobs/${job.id}`} className="flex-1 hover:text-accent transition-colors">
                <span className="font-medium">{job.name}</span>
                <span className="text-text-muted"> · {job.company.name}</span>
            </Link>
            <button
                onClick={() => mutation.mutate()}
                className={`
                    px-3 py-1 text-sm rounded-full
                    ${isSaved
                    ? "bg-accent text-background font-medium"
                    : "border border-border text-text-muted hover:border-accent hover:text-accent transition-colors"
                }`}>
                {isSaved ? "Saved" : "Save"}
            </button>
        </li>
    );
}