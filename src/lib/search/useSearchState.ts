import {useEffect, useMemo, useState} from "react";
import {useSearchParams} from "next/navigation";
import {DEFAULT_SEARCH, parseSearch, SearchState, serializeSearch} from "@/lib/search/params";

type HistoryMode = "push" | "replace";

/**
 * Reads the search from the URL and writes changes back with the native
 * History API, which Next.js keeps in sync with useSearchParams — so filtering
 * never triggers a router fetch, it just re-renders.
 *
 * Discrete changes (a checkbox, a page) push a history entry so Back undoes them;
 * typing replaces, so Back doesn't replay every keystroke.
 */
export function useSearchState() {
    const params = useSearchParams();
    const key = params.toString();
    const state = useMemo(() => parseSearch(new URLSearchParams(key)), [key]);
    const selectedId = Number(params.get("job")) || null;

    // Bumped whenever the URL changes from somewhere other than the text inputs
    // (Back/Forward, "clear all", a removed chip) so uncontrolled inputs remount with the new value.
    const [inputVersion, setInputVersion] = useState(0);

    useEffect(() => {
        const onPopState = () => setInputVersion((version) => version + 1);
        window.addEventListener("popstate", onPopState);
        return () => window.removeEventListener("popstate", onPopState);
    }, []);

    function write(next: SearchState, job: number | null, mode: HistoryMode) {
        const query = [serializeSearch(next), job ? `job=${job}` : ""].filter(Boolean).join("&");
        window.history[mode === "push" ? "pushState" : "replaceState"](null, "", query ? `?${query}` : window.location.pathname);
    }

    /** Reads the live URL rather than the render-time snapshot, so debounced updates never clobber newer ones. */
    function current(): SearchState {
        return parseSearch(new URLSearchParams(window.location.search));
    }

    return {
        state,
        selectedId,
        inputVersion,
        /** Merge a change into the search (back to page 1). */
        update(patch: Partial<SearchState>, {mode = "push", resyncInputs = false}: { mode?: HistoryMode; resyncInputs?: boolean } = {}) {
            write({...current(), page: 1, ...patch}, null, mode);
            if (resyncInputs) setInputVersion((version) => version + 1);
        },
        setPage(page: number) {
            write({...current(), page}, null, "push");
        },
        selectJob(id: number) {
            write(current(), id, "replace");
        },
        reset() {
            write(DEFAULT_SEARCH, null, "push");
            setInputVersion((version) => version + 1);
        },
        /** Load a saved search wholesale. */
        load(query: string) {
            write(parseSearch(new URLSearchParams(query)), null, "push");
            setInputVersion((version) => version + 1);
        },
    };
}
