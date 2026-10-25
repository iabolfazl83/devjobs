import {create} from "zustand";
import {persist} from "zustand/middleware";
import {browserStorage, STORAGE_KEYS} from "@/lib/persist";
import {JobSummary} from "@/lib/catalog/types";
import {randomId} from "@/lib/auth/crypto";
import * as reducers from "@/lib/tracker/reducers";
import {Application, AppStatus, EMPTY_USER_DATA, UserData} from "@/lib/tracker/types";

/** Signed-out visitors still get "recently viewed"; it lives under this key. */
export const GUEST_ID = "guest";

interface TrackerState {
    byUser: Record<string, UserData>;
}

export const useTrackerStore = create<TrackerState>()(
    persist((): TrackerState => ({byUser: {}}), {
        name: STORAGE_KEYS.tracker,
        storage: browserStorage,
        version: 1,
        skipHydration: true,
    }),
);

function update(userId: string, change: (data: UserData) => UserData) {
    useTrackerStore.setState((state) => {
        const current = state.byUser[userId] ?? EMPTY_USER_DATA;
        const next = change(current);
        return next === current ? state : {byUser: {...state.byUser, [userId]: next}};
    });
}

function now() {
    return new Date().toISOString();
}

export function getUserData(userId: string): UserData {
    return useTrackerStore.getState().byUser[userId] ?? EMPTY_USER_DATA;
}

export const tracker = {
    track: (userId: string, job: JobSummary, status: AppStatus = "saved") =>
        update(userId, (data) => reducers.addApplication(data, job, status, now())),

    /** Returns the removed application so the caller can offer "Undo". */
    remove: (userId: string, jobId: number): Application | null => {
        const removed = getUserData(userId).applications[jobId] ?? null;
        update(userId, (data) => reducers.removeApplication(data, jobId));
        return removed;
    },

    restore: (userId: string, application: Application) =>
        update(userId, (data) => reducers.restoreApplication(data, application)),

    setStatus: (userId: string, jobId: number, status: AppStatus) =>
        update(userId, (data) => reducers.setStatus(data, jobId, status, now())),

    setNotes: (userId: string, jobId: number, notes: string) =>
        update(userId, (data) => reducers.setNotes(data, jobId, notes, now())),

    recordView: (userId: string, jobId: number) =>
        update(userId, (data) => reducers.recordView(data, jobId)),

    saveSearch: (userId: string, name: string, query: string) =>
        update(userId, (data) => reducers.addSavedSearch(data, {id: randomId("s_"), name, query, createdAt: now(), lastCheckedAt: now()})),

    removeSearch: (userId: string, id: string) =>
        update(userId, (data) => reducers.removeSavedSearch(data, id)),

    markSearchChecked: (userId: string, id: string) =>
        update(userId, (data) => reducers.markSearchChecked(data, id, now())),

    replace: (userId: string, data: UserData) => update(userId, () => data),

    clear: (userId: string) =>
        useTrackerStore.setState((state) => {
            const byUser = {...state.byUser};
            delete byUser[userId];
            return {byUser};
        }),
};
