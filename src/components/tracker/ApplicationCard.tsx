"use client";

import {ArrowRightLeft, Ellipsis, ExternalLink, Eye, GripVertical, StickyNote, Trash2} from "lucide-react";
import {Application, AppStatus, STATUS_LABEL, STATUSES} from "@/lib/tracker/types";
import {firstReached} from "@/lib/tracker/reducers";
import {formatSalary} from "@/lib/catalog/salary";
import {timeAgo} from "@/lib/format";
import {CompanyLogo} from "@/components/ui/CompanyLogo";
import {Popover, PopoverItem} from "@/components/ui/Popover";
import {StageDot} from "@/components/dashboard/PipelineBar";
import {cn} from "@/lib/cn";

/** The date that matters for each column: when it was saved, applied, etc. */
function stageNote(application: Application): string {
    const since = firstReached(application, application.status) ?? application.updatedAt;
    const verb: Record<AppStatus, string> = {saved: "Saved", applied: "Applied", interview: "Interviewing", offer: "Offer", rejected: "Closed"};
    return `${verb[application.status]} ${timeAgo(since)}`;
}

export function ApplicationCard({application, dragging, onOpen, onMove, onRemove, onDragStart, onDragEnd}: {
    application: Application;
    dragging: boolean;
    onOpen: () => void;
    onMove: (status: AppStatus) => void;
    onRemove: () => void;
    onDragStart: () => void;
    onDragEnd: () => void;
}) {
    const {job} = application;

    return (
        <article
            draggable
            onDragStart={(event) => {
                event.dataTransfer.setData("text/plain", String(application.jobId));
                event.dataTransfer.effectAllowed = "move";
                onDragStart();
            }}
            onDragEnd={onDragEnd}
            className={cn(
                "group relative cursor-grab rounded-xl border border-border bg-surface p-3 shadow-card transition-[opacity,box-shadow,border-color] hover:border-border-strong hover:shadow-raised active:cursor-grabbing",
                dragging && "opacity-40",
            )}
        >
            <div className="flex items-start gap-2.5">
                <CompanyLogo name={job.company.name} src={job.company.logo} size="sm"/>
                <div className="min-w-0 flex-1">
                    <h3 className="text-sm leading-snug font-semibold text-foreground">
                        <button
                            type="button"
                            onClick={onOpen}
                            className="text-left outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:outline-2 focus-visible:after:outline-accent hover:text-accent"
                        >
                            {job.title}
                        </button>
                    </h3>
                    <p className="truncate text-xs text-muted">{job.company.name}</p>
                </div>
                <GripVertical aria-hidden className="mt-0.5 size-4 shrink-0 text-subtle opacity-0 transition-opacity group-hover:opacity-100"/>
            </div>

            {job.salary && <p className="mt-2 text-xs font-medium text-secondary">{formatSalary(job.salary)}</p>}

            <div className="mt-2.5 flex items-center justify-between gap-2 text-xs text-subtle">
                <span className="flex items-center gap-1.5">
                    {stageNote(application)}
                    {application.notes && <StickyNote aria-label="Has notes" className="size-3.5 text-muted"/>}
                </span>
                <div className="relative z-10">
                    <Popover
                        label={`Actions for ${job.title}`}
                        className="w-52"
                        trigger={(props) => (
                            <button
                                type="button"
                                {...props}
                                aria-label={`Actions for ${job.title}`}
                                className="-mr-1 grid size-7 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-foreground"
                            >
                                <Ellipsis className="size-4"/>
                            </button>
                        )}
                    >
                        {(close) => (
                            <>
                                <p className="flex items-center gap-1.5 px-2.5 pt-1 pb-1.5 text-xs font-medium text-muted"><ArrowRightLeft aria-hidden className="size-3.5"/>Move to</p>
                                {STATUSES.filter((status) => status.id !== application.status).map((status) => (
                                    <PopoverItem key={status.id} onClick={() => {
                                        close();
                                        onMove(status.id);
                                    }}>
                                        <StageDot status={status.id}/>{status.label}
                                    </PopoverItem>
                                ))}
                                <div className="my-1 h-px bg-border"/>
                                <PopoverItem onClick={() => {
                                    close();
                                    onOpen();
                                }}><Eye/>Details & notes</PopoverItem>
                                <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" onClick={close}
                                   className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-secondary hover:bg-surface-2 hover:text-foreground">
                                    <ExternalLink className="size-4"/>Apply page
                                </a>
                                <PopoverItem onClick={() => {
                                    close();
                                    onRemove();
                                }} className="text-danger hover:text-danger"><Trash2/>Remove</PopoverItem>
                            </>
                        )}
                    </Popover>
                </div>
            </div>
            <span className="sr-only">Stage: {STATUS_LABEL[application.status]}</span>
        </article>
    );
}
