import {JobsResponse} from "@/lib/types";
import {Metadata} from "next";
import JobsList from "@/components/JobsList";

export const metadata: Metadata = {
    title: "Jobs | jobs",
};

export default async function JobsPage() {
    const response = await fetch('https://www.themuse.com/api/public/jobs?page=0');
    const jobs: JobsResponse = await response.json();
    const {results} = jobs;
    return (
        <JobsList jobs={results}/>
    );
}
