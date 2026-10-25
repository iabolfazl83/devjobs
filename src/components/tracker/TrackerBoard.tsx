"use client";

import Link from "next/link";
import {useState} from "react";
import {Columns3, List, Search, SquareKanban} from "lucide-react";
import {useSession} from "@/lib/auth/hooks";
import {useApplications} from "@/lib/tracker/hooks";
import {tracker} from "@/lib/tracker/store";
import {Application, AppStatus, STATUS_LABEL, STATUSES} from "@/lib/tracker/types";
import {formatSalary} from "@/lib/catalog/salary";
import {timeAgo} from "@/lib/format";
import {toast} from "@/lib/toast";
import {Container} from "@/components/layout/Section";
import {SegmentedControl} from "@/components/ui/SegmentedControl";
import {EmptyState} from "@/components/ui/EmptyState";
import {ButtonLink} from "@/components/ui/Button";
import {Select} from "@/components/ui/Field";
import {CompanyLogo} from "@/components/ui/CompanyLogo";
import {DemoButton} from "@/components/auth/DemoButton";
import {PipelineBar, StageDot} from "@/components/dashboard/PipelineBar";
import {ApplicationCard} from "@/components/tracker/ApplicationCard";
import {ApplicationDrawer} from "@/components/tracker/ApplicationDrawer";
import {cn} from "@/lib/cn";

type View = "board" | "list";

/**
 * Kanban tracker. Drag a card between columns with a mouse; every card also has
 * a "Move to" menu, which is the keyboard/touch/screen-reader path (HTML5 drag
 * and drop isn't accessible on its own). Moves are announced via a live region.
 */
export function TrackerBoard() {
    const {userId} = useSession();
    const applications = useApplications();
    const [view, setView] = useState<View>("board");
    const [filter, setFilter] = useState("");
    const [openId, setOpenId] = useState<number | null>(null);
    const [draggingId, setDraggingId] = useState<number | null>(null);
    const [overColumn, setOverColumn] = useState<AppStatus | null>(null);
    const [announcement, setAnnouncement] = useState("");

    if (!userId) return null;
    const uid = userId;

    const text = filter.trim().toLowerCase();
    const visible = text
        ? applications.filter((application) => `${application.job.title} ${application.job.company.name}`.toLowerCase().includes(text))
        : applications;
    const open = applications.find((application) => application.jobId === openId) ?? null;

    function move(application: Application, status: AppStatus) {
        if (application.status === status) return;
        tracker.setStatus(uid, application.jobId, status);
        const message = `Moved ${application.job.title} to ${STATUS_LABEL[status]}`;
        setAnnouncement(message);
        toast({title: message, tone: "success"});
    }

    function remove(application: Application) {
        const removed = tracker.remove(uid, application.jobId);
        setOpenId(null);
        toast({
            title: "Removed from tracker",
            description: application.job.title,
            action: removed ? {label: "Undo", onClick: () => tracker.restore(uid, removed)} : undefined,
        });
    }

    return (
        <Container className="py-8 sm:py-10">
            <p className="sr-only" aria-live="assertive">{announcement}</p>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Application tracker</h1>
                    <p className="mt-1 text-sm text-muted">Drag cards between stages, or use each card&apos;s menu. Everything saves instantly.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <label className="relative">
                        <span className="sr-only">Filter tracker</span>
                        <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"/>
                        <input
                            type="search"
                            value={filter}
                            onChange={(event) => setFilter(event.target.value)}
                            placeholder="Filter by title or company"
                            className="h-9 w-56 rounded-lg border border-border bg-surface pr-3 pl-9 text-sm shadow-card outline-none placeholder:text-subtle focus:border-accent"
                        />
                    </label>
                    <SegmentedControl<View>
                        label="View"
                        value={view}
                        onChange={setView}
                        options={[
                            {value: "board", label: "Board", icon: <Columns3/>},
                            {value: "list", label: "List", icon: <List/>},
                        ]}
                    />
                </div>
            </div>

            {applications.length === 0 ? (
                <div className="mt-8 rounded-2xl border border-dashed border-border-strong">
                    <EmptyState
                        icon={SquareKanban}
                        title="Your tracker is empty"
                        description="Save jobs with the bookmark icon and they'll land in the Saved column, ready to move along as you apply."
                        action={<><ButtonLink href="/jobs">Browse jobs</ButtonLink><DemoButton/></>}
                    />
                </div>
            ) : (
                <>
                    <div className="mt-6 rounded-2xl border border-border bg-surface p-5 shadow-card">
                        <PipelineBar applications={applications}/>
                    </div>

                    {view === "board" ? (
                        <div className="-mx-4 mt-6 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0">
                            <div className="grid min-w-[1100px] grid-cols-5 gap-3">
                                {STATUSES.map((status) => {
                                    const cards = visible.filter((application) => application.status === status.id);
                                    return (
                                        <section
                                            key={status.id}
                                            aria-labelledby={`col-${status.id}`}
                                            onDragOver={(event) => {
                                                event.preventDefault();
                                                event.dataTransfer.dropEffect = "move";
                                                if (overColumn !== status.id) setOverColumn(status.id);
                                            }}
                                            onDragLeave={(event) => {
                                                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOverColumn(null);
                                            }}
                                            onDrop={(event) => {
                                                event.preventDefault();
                                                setOverColumn(null);
                                                const application = applications.find((candidate) => candidate.jobId === Number(event.dataTransfer.getData("text/plain")));
                                                if (application) move(application, status.id);
                                            }}
                                            className={cn(
                                                "flex min-h-96 flex-col rounded-2xl border bg-surface-2/60 p-2 transition-colors",
                                                overColumn === status.id ? "border-accent bg-accent-soft/60" : "border-transparent",
                                            )}
                                        >
                                            <header className="flex items-center gap-2 px-2 pt-1.5 pb-3">
                                                <StageDot status={status.id}/>
                                                <h2 id={`col-${status.id}`} className="text-sm font-semibold">{status.label}</h2>
                                                <span className="ml-auto rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-muted tabular-nums">{cards.length}</span>
                                            </header>
                                            <ul className="flex flex-1 flex-col gap-2">
                                                {cards.map((application) => (
                                                    <li key={application.jobId}>
                                                        <ApplicationCard
                                                            application={application}
                                                            dragging={draggingId === application.jobId}
                                                            onOpen={() => setOpenId(application.jobId)}
                                                            onMove={(next) => move(application, next)}
                                                            onRemove={() => remove(application)}
                                                            onDragStart={() => setDraggingId(application.jobId)}
                                                            onDragEnd={() => {
                                                                setDraggingId(null);
                                                                setOverColumn(null);
                                                            }}
                                                        />
                                                    </li>
                                                ))}
                                                {cards.length === 0 && (
                                                    <li className="grid flex-1 place-items-center rounded-xl border border-dashed border-border px-3 py-8 text-center text-xs text-subtle">
                                                        {draggingId ? "Drop here" : status.description}
                                                    </li>
                                                )}
                                            </ul>
                                        </section>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-surface shadow-card">
                            <table className="w-full min-w-[720px] text-left text-sm">
                                <thead className="border-b border-border text-xs text-muted">
                                <tr>
                                    <th scope="col" className="px-4 py-3 font-medium">Job</th>
                                    <th scope="col" className="px-4 py-3 font-medium">Stage</th>
                                    <th scope="col" className="px-4 py-3 font-medium">Salary</th>
                                    <th scope="col" className="px-4 py-3 font-medium">Last update</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                {visible.map((application) => (
                                    <tr key={application.jobId} className="hover:bg-surface-2/60">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <CompanyLogo name={application.job.company.name} src={application.job.company.logo} size="sm"/>
                                                <div className="min-w-0">
                                                    <button type="button" onClick={() => setOpenId(application.jobId)} className="block max-w-xs truncate text-left font-medium text-foreground hover:text-accent">
                                                        {application.job.title}
                                                    </button>
                                                    <Link href={`/companies/${application.job.company.slug}`} className="text-xs text-muted hover:underline">{application.job.company.name}</Link>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <label>
                                                <span className="sr-only">Stage for {application.job.title}</span>
                                                <Select value={application.status} onChange={(event) => move(application, event.target.value as AppStatus)} className="h-8 w-40 text-sm">
                                                    {STATUSES.map((status) => <option key={status.id} value={status.id}>{status.label}</option>)}
                                                </Select>
                                            </label>
                                        </td>
                                        <td className="px-4 py-3 text-secondary">{application.job.salary ? formatSalary(application.job.salary) : "—"}</td>
                                        <td className="px-4 py-3 text-muted">{timeAgo(application.updatedAt)}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {text && visible.length === 0 && <p className="mt-4 text-sm text-muted">Nothing in your tracker matches “{filter}”.</p>}
                </>
            )}

            <ApplicationDrawer
                application={open}
                onClose={() => setOpenId(null)}
                onMove={(status) => open && move(open, status)}
                onNotes={(notes) => open && tracker.setNotes(uid, open.jobId, notes)}
                onRemove={() => open && remove(open)}
            />
        </Container>
    );
}
