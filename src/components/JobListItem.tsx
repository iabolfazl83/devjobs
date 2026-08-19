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
        <li className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 duration-200">
            <Link href={`/jobs/${job.id}`} className="hover:underline">
                {job.name} | {job.company.name}
            </Link>
            <button onClick={() => mutation.mutate()} className="ml-2 underline cursor-pointer">
                {isSaved ? "Unsave" : "Save"}
            </button>
        </li>
    );
}