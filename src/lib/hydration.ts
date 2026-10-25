import {useSyncExternalStore} from "react";
import {useAuthStore} from "@/lib/auth/store";
import {useTrackerStore} from "@/lib/tracker/store";
import {STORAGE_KEYS} from "@/lib/persist";

/**
 * Persisted stores start empty on both the server and the first client render,
 * then load from localStorage after mount. Until then `useHydrated()` is false,
 * and anything that depends on the signed-in user shows a skeleton instead of
 * guessing — that's what keeps static HTML and hydration in agreement.
 */
let hydrated = false;
const listeners = new Set<() => void>();

export async function hydratePersistedStores() {
    if (hydrated) return;
    await Promise.all([useAuthStore.persist.rehydrate(), useTrackerStore.persist.rehydrate()]);
    hydrated = true;
    listeners.forEach((listener) => listener());
}

/** Another tab signed in/out or changed the tracker: reload that store from storage. */
export function syncAcrossTabs(): () => void {
    const onStorage = (event: StorageEvent) => {
        if (event.key === STORAGE_KEYS.auth) void useAuthStore.persist.rehydrate();
        if (event.key === STORAGE_KEYS.tracker) void useTrackerStore.persist.rehydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function useHydrated(): boolean {
    return useSyncExternalStore(subscribe, () => hydrated, () => false);
}
