"use client";

import {useEffect} from "react";
import {useSession} from "@/lib/auth/hooks";
import {GUEST_ID, tracker} from "@/lib/tracker/store";

/** Adds the job to "Recently viewed" once the session is known. Renders nothing. */
export function RecordView({jobId}: { jobId: number }) {
    const {status, userId} = useSession();

    useEffect(() => {
        if (status !== "loading") tracker.recordView(userId ?? GUEST_ID, jobId);
    }, [status, userId, jobId]);

    return null;
}
