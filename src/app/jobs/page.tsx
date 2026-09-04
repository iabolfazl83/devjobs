import {JobsResponse} from "@/lib/types";
import {Metadata} from "next";
import JobsList from "@/components/JobsList";
import SearchBar from "@/components/SearchBar";

export const metadata: Metadata = {
    title: "Jobs | jobs",
};

export default async function JobsPage() {
    const response = await fetch('https://www.themuse.com/api/public/jobs?page=0', {
        next: {revalidate: 300} // ISR: cache for 5 minutes, revalidate in background
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.status}`);
    }

    const jobs: JobsResponse = await response.json();
    const {results} = jobs;
    return (
        <div className="p-4 flex flex-col gap-4">
            <div>
                <SearchBar/>
            </div>
            <div>
                <JobsList jobs={results}/>
            </div>
        </div>
    );
}
