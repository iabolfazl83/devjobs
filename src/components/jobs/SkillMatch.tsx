"use client";

import Link from "next/link";
import {Check, Plus, Sparkles} from "lucide-react";
import {JobSummary} from "@/lib/catalog/types";
import {skillLabel} from "@/lib/catalog/skills";
import {useSession} from "@/lib/auth/hooks";
import {matchJob} from "@/lib/search/match";
import {SkillChips} from "@/components/jobs/JobMeta";
import {cn} from "@/lib/cn";

function ScoreRing({score}: { score: number }) {
    const tone = score >= 75 ? "var(--success)" : score >= 50 ? "var(--accent)" : "var(--warning)";
    return (
        <div
            className="grid size-16 shrink-0 place-items-center rounded-full"
            style={{background: `conic-gradient(${tone} 0 ${score}%, var(--surface-3) 0)`}}
            role="img"
            aria-label={`${score}% match`}
        >
            <span className="grid size-[52px] place-items-center rounded-full bg-surface text-sm font-semibold tabular-nums">{score}%</span>
        </div>
    );
}

/** Skills for the job; for signed-in users with a profile, split into "you have" / "to learn". */
export function SkillMatch({job}: { job: JobSummary }) {
    const {status, profile} = useSession();
    const match = status === "authenticated" ? matchJob(job, profile) : null;

    if (job.skills.length === 0 && !match) return null;

    return (
        <section aria-labelledby={`skills-${job.id}`} className="rounded-2xl border border-border bg-surface-2/50 p-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 id={`skills-${job.id}`} className="text-[15px] font-semibold">Skills & fit</h2>
                    <p className="mt-0.5 text-sm text-muted">
                        {match ? "Compared with the skills and preferences on your profile." : "Detected in the job description."}
                    </p>
                </div>
                {match && <ScoreRing score={match.score}/>}
            </div>

            {match ? (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                        <p className="mb-2 text-xs font-medium text-muted">You have ({match.matchedSkills.length})</p>
                        <ul className="flex flex-wrap gap-1.5">
                            {match.matchedSkills.length === 0 && <li className="text-sm text-subtle">None of the listed skills yet</li>}
                            {match.matchedSkills.map((skill) => (
                                <li key={skill} className="inline-flex items-center gap-1 rounded-md bg-success-soft px-2 py-0.5 text-xs font-medium text-success">
                                    <Check aria-hidden className="size-3"/>{skillLabel(skill)}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <p className="mb-2 text-xs font-medium text-muted">To brush up on ({match.missingSkills.length})</p>
                        <ul className="flex flex-wrap gap-1.5">
                            {match.missingSkills.length === 0 && <li className="text-sm text-subtle">Nothing — you cover them all</li>}
                            {match.missingSkills.map((skill) => (
                                <li key={skill} className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-0.5 text-xs font-medium text-secondary">
                                    <Plus aria-hidden className="size-3"/>{skillLabel(skill)}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            ) : (
                <>
                    <SkillChips skills={job.skills} limit={12} className="mt-4"/>
                    <p className={cn("mt-4 flex items-center gap-1.5 text-sm text-muted", status === "loading" && "invisible")}>
                        <Sparkles aria-hidden className="size-4 text-accent"/>
                        {status === "authenticated" ? (
                            <span><Link href="/profile" className="font-medium text-accent hover:underline">Add your skills</Link> to see how well you match.</span>
                        ) : (
                            <span><Link href="/signup" className="font-medium text-accent hover:underline">Create a free account</Link> to see your match score.</span>
                        )}
                    </p>
                </>
            )}
        </section>
    );
}
