import {useEffect, useRef} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {useQueryClient} from "@tanstack/react-query";
import {safeNextPath, useSession} from "@/lib/auth/hooks";
import {User} from "@/lib/auth/types";
import {jobsIndexQuery} from "@/lib/data/queries";
import {tracker} from "@/lib/tracker/store";
import {toast} from "@/lib/toast";

/**
 * Shared by sign-in and sign-up:
 * - already signed in? go straight to `?next=` (what the old middleware did on the server);
 * - after auth, finish what the visitor was doing — e.g. `?save=123` saves that job —
 *   then return them to `?next=`.
 */
export function useAuthRedirect() {
    const router = useRouter();
    const params = useSearchParams();
    const queryClient = useQueryClient();
    const {status} = useSession();
    const submitted = useRef(false);
    const next = safeNextPath(params.get("next"));

    useEffect(() => {
        if (status === "authenticated" && !submitted.current) router.replace(next);
    }, [status, next, router]);

    async function complete(user: User, {isNew = false} = {}) {
        const saveId = Number(params.get("save"));
        if (saveId) {
            try {
                const index = await queryClient.fetchQuery(jobsIndexQuery);
                const job = index.jobs.find((candidate) => candidate.id === saveId);
                if (job) {
                    tracker.track(user.id, job);
                    toast({title: "Saved to your tracker", description: `${job.title} · ${job.company.name}`, tone: "success"});
                }
            } catch {
                // Saving is a nicety; never block sign-in on it.
            }
        }
        router.replace(isNew ? `/onboarding?next=${encodeURIComponent(next)}` : next);
    }

    return {
        next,
        /** Call before signing in so the "already signed in" redirect doesn't race `complete()`. */
        markSubmitted: () => {
            submitted.current = true;
        },
        complete,
    };
}
