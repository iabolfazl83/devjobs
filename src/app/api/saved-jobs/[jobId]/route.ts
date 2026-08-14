import db from "@/lib/db";
import {NextResponse} from "next/server";

export async function DELETE(request: Request, {params}: {
    params: Promise<{ jobId: string }>
}): Promise<NextResponse> {
    const {jobId} = await params;
    db.prepare('DELETE FROM saved_jobs WHERE job_id = ?')
    .run(Number(jobId));
    return NextResponse.json({message: 'Job Deleted successfully'}, {status: 200});
}