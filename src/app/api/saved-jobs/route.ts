import db from "@/lib/db";
import {NextResponse} from "next/server";
import {getSavedJobs} from "@/lib/saved-jobs";

export async function POST(request: Request): Promise<NextResponse> {
    const {jobId} = await request.json();
    db.prepare('INSERT INTO saved_jobs (job_id, saved_at) VALUES (?, ?)')
    .run(jobId, new Date().toISOString());
    return NextResponse.json({message: 'Job saved successfully'}, {status: 201});
}

export async function GET(): Promise<NextResponse> {
    const savedJobs = getSavedJobs();
    return NextResponse.json({savedJobs, message: 'Jobs Loaded successfully'}, {status: 200});
}