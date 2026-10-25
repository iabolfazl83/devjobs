"use client";

import {useEffect, useRef, useState} from "react";
import {ArrowUpRight, Check, Trash2} from "lucide-react";
import {Application, AppStatus, STATUS_LABEL, STATUSES} from "@/lib/tracker/types";
import {ROLE_BY_ID, SENIORITY_LABEL, WORK_MODE_LABEL} from "@/lib/catalog/taxonomy";
import {formatSalary} from "@/lib/catalog/salary";
import {formatDate, timeAgo} from "@/lib/format";
import {Dialog} from "@/components/ui/Dialog";
import {Select, Textarea} from "@/components/ui/Field";
import {Button, ButtonAnchor, ButtonLink} from "@/components/ui/Button";
import {CompanyLogo} from "@/components/ui/CompanyLogo";
import {StageDot} from "@/components/dashboard/PipelineBar";

function Notes({application, onSave}: { application: Application; onSave: (notes: string) => void }) {
    const [value, setValue] = useState(application.notes);
    const [saved, setSaved] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pending = useRef<string | null>(null);
    const save = useRef(onSave);

    useEffect(() => {
        save.current = onSave;
    });

    function flush() {
        if (timer.current) clearTimeout(timer.current);
        timer.current = null;
        if (pending.current !== null) {
            save.current(pending.current);
            pending.current = null;
            setSaved(true);
        }
    }

    // Closing the drawer mid-debounce must not lose the last keystrokes.
    useEffect(() => () => {
        if (timer.current) clearTimeout(timer.current);
        if (pending.current !== null) save.current(pending.current);
    }, []);

    return (
        <div>
            <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor={`notes-${application.jobId}`} className="text-sm font-medium">Notes</label>
                <span aria-live="polite" className="flex items-center gap-1 text-xs text-muted">
                    {saved && <><Check aria-hidden className="size-3.5 text-success"/>Saved</>}
                </span>
            </div>
            <Textarea
                id={`notes-${application.jobId}`}
                value={value}
                rows={5}
                placeholder="Recruiter name, interview dates, salary expectations, follow-ups…"
                onChange={(event) => {
                    setValue(event.target.value);
                    setSaved(false);
                    pending.current = event.target.value;
                    if (timer.current) clearTimeout(timer.current);
                    timer.current = setTimeout(flush, 400);
                }}
                onBlur={flush}
            />
        </div>
    );
}

export function ApplicationDrawer({application, onClose, onMove, onNotes, onRemove}: {
    application: Application | null;
    onClose: () => void;
    onMove: (status: AppStatus) => void;
    onNotes: (notes: string) => void;
    onRemove: () => void;
}) {
    const job = application?.job;

    return (
        <Dialog open={Boolean(application)} onClose={onClose} title="Application details" variant="sheet">
            {application && job && (
                <div className="flex flex-col gap-6">
                    <div className="flex items-start gap-3">
                        <CompanyLogo name={job.company.name} src={job.company.logo}/>
                        <div className="min-w-0">
                            <h3 className="text-lg leading-snug font-semibold">{job.title}</h3>
                            <p className="text-sm text-muted">{job.company.name} · {job.locations[0] ?? "—"}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <ButtonLink href={`/jobs/${job.id}`} variant="outline" size="sm" onClick={onClose}>View listing</ButtonLink>
                        <ButtonAnchor href={job.applyUrl} variant="outline" size="sm">Apply page <ArrowUpRight/></ButtonAnchor>
                    </div>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium">Stage</span>
                        <Select value={application.status} onChange={(event) => onMove(event.target.value as AppStatus)}>
                            {STATUSES.map((status) => <option key={status.id} value={status.id}>{status.label} — {status.description}</option>)}
                        </Select>
                    </label>

                    <Notes key={application.jobId} application={application} onSave={onNotes}/>

                    <div>
                        <h4 className="mb-3 text-sm font-medium">Timeline</h4>
                        <ol className="relative flex flex-col gap-3 border-l border-border pl-5">
                            {[...application.history].reverse().map((entry) => (
                                <li key={`${entry.status}-${entry.at}`} className="relative text-sm">
                                    <StageDot status={entry.status} className="absolute top-1.5 -left-[25px] ring-4 ring-surface"/>
                                    <span className="font-medium text-foreground">{STATUS_LABEL[entry.status]}</span>
                                    <span className="text-muted"> · {formatDate(entry.at)} ({timeAgo(entry.at)})</span>
                                </li>
                            ))}
                        </ol>
                    </div>

                    <dl className="grid grid-cols-2 gap-3 rounded-xl border border-border p-4 text-sm">
                        <div><dt className="text-xs text-muted">Role</dt><dd className="font-medium">{ROLE_BY_ID[job.role].label}</dd></div>
                        <div><dt className="text-xs text-muted">Level</dt><dd className="font-medium">{SENIORITY_LABEL[job.seniority]}</dd></div>
                        <div><dt className="text-xs text-muted">Work mode</dt><dd className="font-medium">{WORK_MODE_LABEL[job.workMode]}</dd></div>
                        <div><dt className="text-xs text-muted">Salary</dt><dd className="font-medium">{job.salary ? formatSalary(job.salary) : "Not listed"}</dd></div>
                    </dl>

                    <div className="border-t border-border pt-5">
                        <Button variant="danger" size="sm" onClick={onRemove}><Trash2/> Remove from tracker</Button>
                        <p className="mt-2 text-xs text-muted">You can undo this for a few seconds afterwards.</p>
                    </div>
                </div>
            )}
        </Dialog>
    );
}
