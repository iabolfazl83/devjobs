"use client";

import {Bookmark, BookmarkCheck} from "lucide-react";
import {JobSummary} from "@/lib/catalog/types";
import {useSaveJob} from "@/lib/tracker/hooks";
import {STATUS_LABEL} from "@/lib/tracker/types";
import {Button} from "@/components/ui/Button";
import {cn} from "@/lib/cn";

export function SaveButton({job, variant = "icon", className}: {
    job: JobSummary;
    variant?: "icon" | "full";
    className?: string;
}) {
    const {isSaved, application, toggle} = useSaveJob(job);
    const label = isSaved ? `Remove ${job.title} from tracker` : `Save ${job.title}`;
    const Icon = isSaved ? BookmarkCheck : Bookmark;

    if (variant === "full") {
        return (
            <Button variant={isSaved ? "soft" : "outline"} onClick={toggle} aria-pressed={isSaved} className={className}>
                <Icon className={cn(isSaved && "fill-current")}/>
                {application ? (application.status === "saved" ? "Saved" : STATUS_LABEL[application.status]) : "Save"}
            </Button>
        );
    }

    return (
        <Button
            variant="ghost"
            size="icon-sm"
            onClick={(event) => {
                // Cards are links; the bookmark must not navigate.
                event.preventDefault();
                event.stopPropagation();
                toggle();
            }}
            aria-pressed={isSaved}
            aria-label={label}
            title={isSaved ? "Saved — click to remove" : "Save to tracker"}
            className={cn("relative z-10", isSaved ? "text-accent hover:text-accent" : "text-subtle", className)}
        >
            <Icon className={cn(isSaved && "fill-current")}/>
        </Button>
    );
}
