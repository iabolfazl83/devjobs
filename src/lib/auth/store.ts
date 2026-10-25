import {create} from "zustand";
import {persist} from "zustand/middleware";
import {browserStorage, STORAGE_KEYS} from "@/lib/persist";
import {Account, Profile, Session} from "@/lib/auth/types";

/**
 * The "database" of the mock backend: accounts, profiles and the current session,
 * persisted to localStorage. Components never write here directly — they go
 * through `auth/service.ts`, which is the only file a real API would replace.
 */
export interface AuthState {
    accounts: Record<string, Account>;
    profiles: Record<string, Profile>;
    session: Session | null;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (): AuthState => ({accounts: {}, profiles: {}, session: null}),
        {
            name: STORAGE_KEYS.auth,
            storage: browserStorage,
            version: 1,
            // Hydrated manually after mount (see hydration.ts) so server HTML and the
            // first client render agree — otherwise React reports a hydration mismatch.
            skipHydration: true,
        },
    ),
);
