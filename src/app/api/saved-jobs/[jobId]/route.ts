import db from "@/lib/db";
import {NextResponse} from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
    const {jobId} = await request.json();
    db.prepare('INSERT INTO saved_jobs (job_id, saved_at) VALUES (?, ?)')
    .run(jobId, new Date().toISOString());
    return NextResponse.json({message: 'Job saved successfully'}, {status: 201});
}

export async function GET(): Promise<NextResponse> {
    const savedJobs = db.prepare('SELECT * FROM saved_jobs').all();
    return NextResponse.json({savedJobs, message: 'Jobs Loaded successfully'}, {status: 200});
}

export async function DELETE(request: Request, {params}: { params: Promise<{ jobId: string }> }): Promise<NextResponse> {
    const {jobId} = await params;
    db.prepare('DELETE FROM saved_jobs WHERE job_id = ?')
    .run(jobId);
    return NextResponse.json({message: 'Job Deleted successfully'}, {status: 200});
}