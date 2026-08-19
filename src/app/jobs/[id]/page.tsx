import {Metadata} from "next";
import {getJobById} from "@/lib/jobs";

export const metadata: Metadata = {
    title: "Job Detail | jobs",
};

export default async function JobsDetailPage({params}: {
    params: Promise<{ id: string }>
}) {
    const {id} = await params;
    const job = await getJobById(id);
    const {name, company} = job;

    return (
        <div>
            <h1>{name}</h1>
            <p>{company.name}</p>
        </div>
    )
}