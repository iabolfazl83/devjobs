import {JobsResponse} from "@/lib/types";
import Link from "next/link";
import {Metadata} from "next";

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
                        <li key={job.id}
                            className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 duration-200 cursor-pointer">
                            <Link href={`/jobs/${job.id}`}>
                                {job.name}
                                {" | "}
                                {job.company.name}
                            </Link>
                        </li>
                    ))
                }
            </ul>
        </div>
    );
}
