import {useMemo} from "react";
import {useRouter} from "next/navigation";
import {JobSummary} from "@/lib/catalog/types";
import {currentPath, loginHref, useSession} from "@/lib/auth/hooks";
import {GUEST_ID, tracker, useTrackerStore} from "@/lib/tracker/store";
import {Application, EMPTY_USER_DATA, STATUS_LABEL, UserData} from "@/lib/tracker/types";
import {toast} from "@/lib/toast";

export function useUserData(): UserData {
    const {userId} = useSession();
    return useTrackerStore((state) => state.byUser[userId ?? GUEST_ID] ?? EMPTY_USER_DATA);
}

export function useApplications(): Application[] {
    const {applications} = useUserData();
    return useMemo(
        () => Object.values(applications).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
        [applications],
    );
}

export function useApplication(jobId: number): Application | null {
    const {applications} = useUserData();
    return applications[jobId] ?? null;
}

/**
 * Save / unsave with the details handled once: guests are sent to sign in
 * (and the job is saved for them when they come back), and removals get an Undo.
 */
export function useSaveJob(job: JobSummary) {
    const {status, userId} = useSession();
    const application = useApplication(job.id);
    const router = useRouter();

    function toggle() {
        if (status === "loading") return;
        if (!userId) {
            router.push(loginHref(currentPath(), {save: String(job.id)}));
            return;
        }

        if (application) {
            const removed = tracker.remove(userId, job.id);
            toast({
                title: "Removed from your tracker",
                description: application.status === "saved" ? job.title : `${job.title} — was “${STATUS_LABEL[application.status]}”`,
                action: removed ? {label: "Undo", onClick: () => tracker.restore(userId, removed)} : undefined,
            });
        } else {
            tracker.track(userId, job);
            toast({
                title: "Saved to your tracker",
                description: `${job.title} · ${job.company.name}`,
                tone: "success",
                action: {label: "View", onClick: () => router.push("/tracker")},
            });
        }
    }

    return {isSaved: Boolean(application), application, toggle, ready: status !== "loading"};
}
