import {Job} from "@/lib/types";

export async function getJobById(id: number | string): Promise<Job> {
    const res = await fetch(`https://www.themuse.com/api/public/jobs/${id}`);
    return res.json();
}