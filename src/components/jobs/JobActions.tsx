"use client";

import {useState} from "react";
import {ArrowUpRight, Check, Share2} from "lucide-react";
import {JobSummary} from "@/lib/catalog/types";
import {ButtonAnchor, Button} from "@/components/ui/Button";
import {Select} from "@/components/ui/Field";
import {SaveButton} from "@/components/jobs/SaveButton";
import {useSession} from "@/lib/auth/hooks";
import {useApplication} from "@/lib/tracker/hooks";
import {tracker} from "@/lib/tracker/store";
import {AppStatus, STATUS_LABEL, STATUSES} from "@/lib/tracker/types";
import {withBasePath} from "@/lib/site";
import {toast} from "@/lib/toast";
import {cn} from "@/lib/cn";

export function StatusSelect({job, className}: { job: JobSummary; className?: string }) {
    const {userId} = useSession();
    const application = useApplication(job.id);
    if (!userId || !application) return null;

    return (
        <label className={cn("relative", className)}>
            <span className="sr-only">Application status</span>
            <Select
                value={application.status}
                onChange={(event) => {
                    const status = event.target.value as AppStatus;
                    tracker.setStatus(userId, job.id, status);
                    toast({title: `Moved to ${STATUS_LABEL[status]}`, description: job.title, tone: "success"});
                }}
                className="w-auto min-w-36"
            >
                {STATUSES.map((status) => <option key={status.id} value={status.id}>{status.label}</option>)}
            </Select>
        </label>
    );
}

async function share(job: JobSummary) {
    const url = `${window.location.origin}${withBasePath(`/jobs/${job.id}/`)}`;
    const data = {title: `${job.title} at ${job.company.name}`, url};
    try {
        if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
            await navigator.share(data);
            return;
        }
        await navigator.clipboard.writeText(url);
        toast({title: "Link copied", description: url, tone: "success"});
    } catch (error) {
        if ((error as DOMException).name !== "AbortError") toast({title: "Couldn't share this link", tone: "error"});
    }
}

/**
 * Apply opens the employer's page in a new tab. When the visitor comes back,
 * we ask whether they applied — the same nudge LinkedIn uses — so the tracker
 * stays accurate without manual bookkeeping.
 */
export function JobActions({job, className}: { job: JobSummary; className?: string }) {
    const {userId} = useSession();
    const application = useApplication(job.id);
    const [askedApplied, setAskedApplied] = useState(false);
    const canAsk = Boolean(userId) && (!application || application.status === "saved");

    return (
        <div className={className}>
            <div className="flex flex-wrap items-center gap-2">
                <ButtonAnchor href={job.applyUrl} onClick={() => canAsk && setAskedApplied(true)}>
                    Apply on company site
                    <ArrowUpRight/>
                </ButtonAnchor>
                <SaveButton job={job} variant="full"/>
                <StatusSelect job={job}/>
                <Button variant="ghost" size="icon" onClick={() => share(job)} aria-label="Share this job" title="Share">
                    <Share2/>
                </Button>
            </div>

            {askedApplied && canAsk && userId && (
                <div role="status" className="mt-3 flex animate-slide-up flex-wrap items-center gap-3 rounded-xl border border-accent/30 bg-accent-soft px-4 py-3 text-sm">
                    <span className="font-medium text-foreground">Did you apply?</span>
                    <span className="text-muted">We&apos;ll move it to Applied on your tracker.</span>
                    <span className="ml-auto flex gap-2">
                        <Button
                            size="sm"
                            onClick={() => {
                                tracker.track(userId, job, "applied");
                                setAskedApplied(false);
                                toast({title: "Marked as applied", description: job.title, tone: "success"});
                            }}
                        >
                            <Check/> Yes, I applied
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setAskedApplied(false)}>Not yet</Button>
                    </span>
                </div>
            )}
        </div>
    );
}
