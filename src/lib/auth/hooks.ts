import {useEffect, useMemo} from "react";
import {usePathname, useRouter} from "next/navigation";
import {useAuthStore} from "@/lib/auth/store";
import {EMPTY_PROFILE, User} from "@/lib/auth/types";
import {useHydrated} from "@/lib/hydration";
import {BASE_PATH} from "@/lib/site";

export {safeNextPath} from "@/lib/auth/validation";

export type SessionStatus = "loading" | "authenticated" | "guest";

export function useSession() {
    const hydrated = useHydrated();
    const account = useAuthStore((state) => (state.session ? state.accounts[state.session.userId] : undefined));
    const storedProfile = useAuthStore((state) => (state.session ? state.profiles[state.session.userId] : undefined));

    const user = useMemo<User | null>(() => {
        if (!account) return null;
        const {passwordHash: _hash, salt: _salt, ...rest} = account;
        return rest;
    }, [account]);

    const status: SessionStatus = !hydrated ? "loading" : user ? "authenticated" : "guest";
    return {status, user, userId: user?.id ?? null, profile: storedProfile ?? EMPTY_PROFILE};
}

/** The current location, minus the deploy base path, for use as `?next=`. */
export function currentPath(): string {
    const {pathname, search} = window.location;
    const path = BASE_PATH && pathname.startsWith(BASE_PATH) ? pathname.slice(BASE_PATH.length) || "/" : pathname;
    return `${path}${search}`;
}

export function loginHref(next: string, extra: Record<string, string> = {}): string {
    const params = new URLSearchParams({next, ...extra});
    return `/login?${params}`;
}

/**
 * Client-side route guard. On a static host there's no server to redirect from,
 * so protected pages render a skeleton until the session is known, then either
 * show content or bounce to /login with a return path. (Real data protection
 * would live in the API; this guard is about UX.)
 */
export function useRequireAuth() {
    const session = useSession();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (session.status === "guest") router.replace(loginHref(pathname));
    }, [session.status, router, pathname]);

    return session;
}
