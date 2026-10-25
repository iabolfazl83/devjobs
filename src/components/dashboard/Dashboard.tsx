"use client";

import Link from "next/link";
import {useMemo} from "react";
import {ArrowRight, Bell, Bookmark, Clock, Eye, MessagesSquare, PartyPopper, Send, Sparkles, Trash2, UserRound} from "lucide-react";
import {useSession} from "@/lib/auth/hooks";
import {useApplications, useUserData} from "@/lib/tracker/hooks";
import {tracker} from "@/lib/tracker/store";
import {useJobsIndex} from "@/lib/data/queries";
import {recommend} from "@/lib/search/match";
import {countMatches} from "@/lib/search/engine";
import {parseSearch} from "@/lib/search/params";
import {firstReached} from "@/lib/tracker/reducers";
import {Application, AppStatus} from "@/lib/tracker/types";
import {percent, pluralize, timeAgo} from "@/lib/format";
import {Container} from "@/components/layout/Section";
import {Card, CardHeader} from "@/components/ui/Card";
import {ButtonLink} from "@/components/ui/Button";
import {Skeleton} from "@/components/ui/Skeleton";
import {EmptyState} from "@/components/ui/EmptyState";
import {CompanyLogo} from "@/components/ui/CompanyLogo";
import {JobCard} from "@/components/jobs/JobCard";
import {StatTile} from "@/components/dashboard/StatTile";
import {PipelineBar, StageDot} from "@/components/dashboard/PipelineBar";
import {profileCompleteness} from "@/components/profile/PreferencePickers";
import {describeSearch} from "@/components/search/SaveSearchButton";

const VERB: Record<AppStatus, string> = {
    saved: "Saved",
    applied: "Applied to",
    interview: "Interviewing for",
    offer: "Offer for",
    rejected: "Closed",
};

function greeting(hour: number) {
    if (hour < 5) return "Burning the midnight oil";
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
}

function recentActivity(applications: Application[], limit: number) {
    return applications
        .flatMap((application) => application.history.map((entry) => ({...entry, application})))
        .sort((a, b) => b.at.localeCompare(a.at))
        .slice(0, limit);
}

export function Dashboard() {
    const {user, profile} = useSession();
    const applications = useApplications();
    const {savedSearches, recentlyViewed} = useUserData();
    const {data: index} = useJobsIndex();

    const sent = applications.filter((application) => firstReached(application, "applied")).length;
    const interviews = applications.filter((application) => firstReached(application, "interview")).length;
    const offers = applications.filter((application) => firstReached(application, "offer")).length;
    const completeness = profileCompleteness(profile);

    const recommendations = useMemo(() => {
        if (!index) return [];
        const tracked = new Set(applications.map((application) => application.jobId));
        return recommend(index.jobs, profile, 6, tracked);
    }, [index, profile, applications]);

    const searches = useMemo(() => savedSearches.map((search) => ({
        search,
        counts: index ? countMatches(index.jobs, parseSearch(new URLSearchParams(search.query)), search.lastCheckedAt) : null,
    })), [savedSearches, index]);

    const viewed = useMemo(() => {
        if (!index) return [];
        const byId = new Map(index.jobs.map((job) => [job.id, job]));
        return recentlyViewed.map((id) => byId.get(id)).filter((job) => job !== undefined).slice(0, 5);
    }, [index, recentlyViewed]);

    const activity = recentActivity(applications, 6);

    return (
        <Container className="py-8 sm:py-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm text-muted">{greeting(new Date().getHours())},</p>
                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{user?.name}</h1>
                    {profile.headline && <p className="mt-1 text-sm text-muted">{profile.headline}</p>}
                </div>
                <div className="flex gap-2">
                    <ButtonLink href="/jobs" variant="outline">Find jobs</ButtonLink>
                    <ButtonLink href="/tracker">Open tracker <ArrowRight/></ButtonLink>
                </div>
            </div>

            {completeness < 100 && (
                <Link
                    href="/profile"
                    className="mt-6 flex items-center gap-4 rounded-2xl border border-accent/30 bg-accent-soft p-4 transition-colors hover:border-accent/60"
                >
                    <UserRound aria-hidden className="size-5 shrink-0 text-accent"/>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground">Your profile is {completeness}% complete</p>
                        <p className="text-sm text-muted">Add skills and preferences to sharpen your match scores.</p>
                    </div>
                    <div className="hidden h-2 w-32 overflow-hidden rounded-full bg-surface sm:block" role="img" aria-label={`${completeness}% complete`}>
                        <div className="h-full rounded-full bg-accent" style={{width: `${completeness}%`}}/>
                    </div>
                    <ArrowRight aria-hidden className="size-4 text-accent"/>
                </Link>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatTile icon={Bookmark} label="In your tracker" value={String(applications.length)} detail={pluralize(applications.filter((a) => a.status === "saved").length, "waiting to apply", "waiting to apply")}/>
                <StatTile icon={Send} label="Applications sent" value={String(sent)} detail={`${pluralize(applications.filter((a) => a.status === "applied").length, "awaiting reply", "awaiting reply")}`}/>
                <StatTile icon={MessagesSquare} label="Interview rate" value={sent ? percent(interviews / sent) : "—"} detail={`${pluralize(interviews, "application")} reached interviews`}/>
                <StatTile icon={PartyPopper} label="Offers" value={String(offers)} detail={offers ? "Nice work — compare them on the board" : "Keep going"}/>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
                <div className="flex min-w-0 flex-col gap-6">
                    <Card>
                        <CardHeader
                            title="Pipeline"
                            description="Where each tracked job stands right now."
                            action={<ButtonLink href="/tracker" variant="ghost" size="sm">Board <ArrowRight/></ButtonLink>}
                        />
                        <div className="p-5">
                            <PipelineBar applications={applications}/>
                        </div>
                    </Card>

                    <section aria-labelledby="recommended">
                        <div className="mb-3 flex items-end justify-between gap-3">
                            <div>
                                <h2 id="recommended" className="flex items-center gap-2 text-[15px] font-semibold"><Sparkles aria-hidden className="size-4 text-accent"/>Recommended for you</h2>
                                <p className="text-sm text-muted">Ranked by skills, role, seniority and work mode.</p>
                            </div>
                            <ButtonLink href="/profile" variant="ghost" size="sm">Tune</ButtonLink>
                        </div>
                        {!index ? (
                            <div className="grid gap-3 md:grid-cols-2">{Array.from({length: 4}, (_, i) => <Skeleton key={i} className="h-40 rounded-2xl"/>)}</div>
                        ) : recommendations.length === 0 ? (
                            <Card>
                                <EmptyState icon={Sparkles} title="Tell us what you're after" description="Add a few skills and roles to your profile to get recommendations."
                                            action={<ButtonLink href="/profile">Edit profile</ButtonLink>}/>
                            </Card>
                        ) : (
                            <ul className="grid gap-3 md:grid-cols-2">
                                {recommendations.map((job) => <li key={job.id}><JobCard job={job} className="h-full"/></li>)}
                            </ul>
                        )}
                    </section>
                </div>

                <div className="flex flex-col gap-6">
                    <Card>
                        <CardHeader title="Saved searches" description="New matches since you last looked."/>
                        <div className="p-3">
                            {searches.length === 0 ? (
                                <p className="px-2 py-4 text-sm text-muted">
                                    Save any search from the <Link href="/jobs" className="font-medium text-accent hover:underline">jobs page</Link> to watch it here.
                                </p>
                            ) : (
                                <ul className="flex flex-col">
                                    {searches.map(({search, counts}) => (
                                        <li key={search.id} className="group flex items-center gap-2 rounded-xl px-2 py-2 hover:bg-surface-2">
                                            <Bell aria-hidden className="size-4 shrink-0 text-muted"/>
                                            <Link href={`/jobs?${search.query}`} className="min-w-0 flex-1">
                                                <span className="block truncate text-sm font-medium text-foreground">{search.name}</span>
                                                <span className="block truncate text-xs text-muted">
                                                    {describeSearch(parseSearch(new URLSearchParams(search.query)))}
                                                    {counts && ` · ${pluralize(counts.total, "match", "matches")}`}
                                                </span>
                                            </Link>
                                            {counts && counts.fresh > 0 && (
                                                <span className="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent">+{counts.fresh} new</span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => user && tracker.removeSearch(user.id, search.id)}
                                                className="grid size-7 shrink-0 place-items-center rounded-md text-subtle opacity-0 group-hover:opacity-100 hover:bg-surface-3 hover:text-danger focus-visible:opacity-100"
                                                aria-label={`Delete saved search ${search.name}`}
                                            >
                                                <Trash2 className="size-3.5"/>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </Card>

                    <Card>
                        <CardHeader title="Recent activity"/>
                        <div className="p-5 pt-4">
                            {activity.length === 0 ? (
                                <p className="text-sm text-muted">Save or apply to a job and it&apos;ll show up here.</p>
                            ) : (
                                <ol className="relative flex flex-col gap-4 border-l border-border pl-5">
                                    {activity.map(({status, at, application}) => (
                                        <li key={`${application.jobId}-${status}-${at}`} className="relative">
                                            <StageDot status={status} className="absolute top-1.5 -left-[25px] ring-4 ring-surface"/>
                                            <p className="text-sm text-secondary">
                                                {VERB[status]}{" "}
                                                <Link href={`/jobs/${application.jobId}`} className="font-medium text-foreground hover:text-accent">{application.job.title}</Link>
                                                <span className="text-muted"> · {application.job.company.name}</span>
                                            </p>
                                            <p className="mt-0.5 flex items-center gap-1 text-xs text-subtle"><Clock aria-hidden className="size-3"/>{timeAgo(at)}</p>
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </div>
                    </Card>

                    {viewed.length > 0 && (
                        <Card>
                            <CardHeader title="Recently viewed"/>
                            <ul className="p-3">
                                {viewed.map((job) => (
                                    <li key={job.id}>
                                        <Link href={`/jobs/${job.id}`} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-surface-2">
                                            <CompanyLogo name={job.company.name} src={job.company.logo} size="sm"/>
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate text-sm font-medium text-foreground">{job.title}</span>
                                                <span className="block truncate text-xs text-muted">{job.company.name}</span>
                                            </span>
                                            <Eye aria-hidden className="size-4 shrink-0 text-subtle"/>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    )}
                </div>
            </div>
        </Container>
    );
}
