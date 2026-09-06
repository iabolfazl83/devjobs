import {Metadata} from "next";
import {getJobById} from "@/lib/jobs";
import JobListItem from "@/components/JobListItem";
import {SavedJobRow} from "@/lib/types";
import {getSavedJobs} from "@/lib/saved-jobs";

export const metadata: Metadata = {
    title: "Saved Jobs | jobs",
};

export default async function SavedJobsPage() {
    const savedJobs = getSavedJobs();
    const jobs = await Promise.all(
        savedJobs.map((saved:SavedJobRow) => getJobById(saved.job_id))
    );
    if (jobs.length <= 0) {
        return <p className="text-md text-text-muted mt-2 h-full flex justify-center items-center flex-1">save one or more jobs to see them here.</p>;
    }
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