import {JobsResponse} from "@/lib/types";
import {Metadata} from "next";
import JobListItem from "@/components/JobListItem";

export const metadata: Metadata = {
    title: "Jobs | jobs",
};

export default async function JobsPage() {
    const response = await fetch('https://www.themuse.com/api/public/jobs?page=0');
    const jobs: JobsResponse = await response.json();
    const {results} = jobs;
    return (
        <div>
            <ul className="flex flex-col gap-2 p-4">
                {
                    results.map((job) => (
                        <JobListItem job={job} key={job.id}/>
                    ))
                }
            </ul>
        </div>
    );
}
