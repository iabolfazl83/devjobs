import {Metadata} from "next";
import {Job} from "@/lib/types";

export const metadata: Metadata = {
    title: "Job Detail | jobs",
};

export default async function JobsDetailPage({params}: {
    params: Promise<{ id: string }>
}) {
    const {id} = await params;
    const response = await fetch(`https://www.themuse.com/api/public/jobs/${id}`);
    const job: Job = await response.json();
    const {name, company} = job;

    return (
        <div>
            <h1>{name}</h1>
            <p>{company.name}</p>
        </div>
    )
}