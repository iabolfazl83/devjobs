import {useSyncExternalStore} from "react";
import {DARK_QUERY, THEME_STORAGE_KEY, ThemePreference} from "@/lib/theme-script";

export type {ThemePreference};
export type ResolvedTheme = "light" | "dark";

function readPreference(): ThemePreference {
    try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        return stored === "light" || stored === "dark" ? stored : "system";
    } catch {
        return "system";
    }
}

function resolve(preference: ThemePreference): ResolvedTheme {
    if (preference !== "system") return preference;
    return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

function apply(preference: ThemePreference) {
    const root = document.documentElement;
    const resolved = resolve(preference);
    // Suppress every color transition for one frame so the switch is instant, not a 300-element fade.
    root.classList.add("theme-switching");
    root.setAttribute("data-theme", resolved);
    root.style.colorScheme = resolved;
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("theme-switching")));
}

const listeners = new Set<() => void>();
let snapshot: { preference: ThemePreference; resolved: ResolvedTheme } | null = null;

function emit() {
    snapshot = null;
    listeners.forEach((listener) => listener());
}

export function setThemePreference(preference: ThemePreference) {
    try {
        if (preference === "system") localStorage.removeItem(THEME_STORAGE_KEY);
        else localStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch {
        // Private mode / blocked storage: the choice still applies for this page view.
    }
    apply(preference);
    emit();
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    if (listeners.size === 1) {
        media = window.matchMedia(DARK_QUERY);
        media.addEventListener("change", onSystemChange);
        window.addEventListener("storage", onStorage);
    }
    return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
            media?.removeEventListener("change", onSystemChange);
            window.removeEventListener("storage", onStorage);
        }
    };
}

let media: MediaQueryList | null = null;

function onSystemChange() {
    if (readPreference() === "system") {
        apply("system");
        emit();
    }
}

/** Another tab changed the theme — follow it. */
function onStorage(event: StorageEvent) {
    if (event.key === THEME_STORAGE_KEY || event.key === null) {
        apply(readPreference());
        emit();
    }
}

function getSnapshot() {
    if (!snapshot) {
        const preference = readPreference();
        snapshot = {preference, resolved: resolve(preference)};
    }
    return snapshot;
}

const SERVER_SNAPSHOT = {preference: "system" as ThemePreference, resolved: "light" as ResolvedTheme};

export function useTheme() {
    const {preference, resolved} = useSyncExternalStore(subscribe, getSnapshot, () => SERVER_SNAPSHOT);
    return {preference, resolved, setPreference: setThemePreference};
}
