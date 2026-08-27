import {Job} from "@/lib/types";
import {notFound} from "next/navigation";

export async function getJobById(id: number | string): Promise<Job> {
    const res = await fetch(`https://www.themuse.com/api/public/jobs/${id}`);

    if (res.status === 404) {
        notFound();
    }

    if (!res.ok) {
        throw new Error(`Failed to fetch job ${id}: ${res.status}`);
    }

    return res.json();
}