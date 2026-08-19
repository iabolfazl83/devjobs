import {Metadata} from "next";
import {getJobById} from "@/lib/jobs";
import JobListItem from "@/components/JobListItem";
import {SavedJobRow} from "@/lib/types";

export const metadata: Metadata = {
    title: "Saved Jobs | jobs",
};

export default async function SavedJobsPage() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/saved-jobs`);
    const {savedJobs} = await res.json();
    const jobs = await Promise.all(
        savedJobs.map((saved:SavedJobRow) => getJobById(saved.job_id))
    );
    console.log(jobs);

    return (
        <div>
            <ul className="flex flex-col gap-2 p-4">
                {
                    jobs.map((job) => (
                        <JobListItem job={job} key={job.id}/>
                    ))
                }
            </ul>
        </div>
    )
}