"use client";

import {Sparkles} from "lucide-react";
import {JobSummary} from "@/lib/catalog/types";
import {useSession} from "@/lib/auth/hooks";
import {matchJob} from "@/lib/search/match";
import {skillLabel} from "@/lib/catalog/skills";
import {cn} from "@/lib/cn";

/** Only rendered for signed-in users who've told us their skills or roles. */
export function MatchBadge({job, className}: { job: JobSummary; className?: string }) {
    const {profile, status} = useSession();
    if (status !== "authenticated") return null;
    const match = matchJob(job, profile);
    if (!match || match.score < 40) return null;

    const strong = match.score >= 75;
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                strong ? "bg-success-soft text-success" : "bg-surface-2 text-secondary",
                className,
            )}
            title={match.matchedSkills.length ? `Matches your skills: ${match.matchedSkills.map(skillLabel).join(", ")}` : "Matches your preferences"}
        >
            <Sparkles aria-hidden className="size-3"/>
            {match.score}% match
        </span>
    );
}
