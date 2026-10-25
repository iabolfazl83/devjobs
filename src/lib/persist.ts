import {createJSONStorage, StateStorage} from "zustand/middleware";

/** localStorage that never throws — private browsing and blocked storage degrade to in-memory. */
const safeLocalStorage: StateStorage = {
    getItem: (name) => {
        try {
            return localStorage.getItem(name);
        } catch {
            return null;
        }
    },
    setItem: (name, value) => {
        try {
            localStorage.setItem(name, value);
        } catch {
            // Quota exceeded or storage disabled: state still lives for this session.
        }
    },
    removeItem: (name) => {
        try {
            localStorage.removeItem(name);
        } catch {
            // ignore
        }
    },
};

export const browserStorage = createJSONStorage(() => safeLocalStorage);

export const STORAGE_KEYS = {
    auth: "devjobs:auth",
    tracker: "devjobs:tracker",
} as const;

/** Simulated network latency for the mock backend, so loading states are real and visible. */
export function latency(ms = 350): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
