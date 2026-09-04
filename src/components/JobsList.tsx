"use client";

import {useSearchStore} from "@/lib/store";
import {Job} from "@/lib/types";
import JobListItem from "@/components/JobListItem";

export default function JobsList({jobs}: { jobs: Job[] }) {
    const searchTerm = useSearchStore((state) => state.searchTerm);
    const filteredJobs = jobs.filter((job: Job) =>
        job.name.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase()) ||
        job.company.name.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase()));

    return (
        <div>
            <ul className="flex flex-col gap-2">
                {filteredJobs.map((job) => (
                    <JobListItem job={job} key={job.id}/>
                ))}
            </ul>
        </div>
    );
}