"use client";

import {useRef} from "react";
import {MapPin, Search} from "lucide-react";

const DEBOUNCE_MS = 200;

/**
 * Search-as-you-type. Inputs are uncontrolled (keyed by `version`) so typing is
 * never fighting a URL round-trip; the URL updates on a short debounce.
 */
export function SearchBar({q, loc, version, onChange, locations}: {
    q: string;
    loc: string;
    version: number;
    onChange: (patch: { q?: string; loc?: string }) => void;
    locations: string[];
}) {
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    function debounced(patch: { q?: string; loc?: string }) {
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => onChange(patch), DEBOUNCE_MS);
    }

    return (
        <form
            role="search"
            onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                if (timer.current) clearTimeout(timer.current);
                onChange({q: String(data.get("q") ?? ""), loc: String(data.get("loc") ?? "")});
            }}
            className="grid gap-2 sm:grid-cols-[1.6fr_1fr]"
        >
            <label className="relative">
                <span className="sr-only">Search by title, skill or company</span>
                <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-muted"/>
                <input
                    key={`q-${version}`}
                    name="q"
                    type="search"
                    defaultValue={q}
                    onChange={(event) => debounced({q: event.target.value})}
                    placeholder="Title, skill or company"
                    autoComplete="off"
                    className="h-12 w-full rounded-xl border border-border bg-surface pr-3 pl-11 text-[15px] text-foreground shadow-card outline-none placeholder:text-subtle hover:border-border-strong focus:border-accent focus:ring-3 focus:ring-accent/20"
                />
            </label>
            <label className="relative">
                <span className="sr-only">Location</span>
                <MapPin aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-muted"/>
                <input
                    key={`loc-${version}`}
                    name="loc"
                    defaultValue={loc}
                    list="search-locations"
                    onChange={(event) => debounced({loc: event.target.value})}
                    placeholder="City, country or “remote”"
                    autoComplete="off"
                    className="h-12 w-full rounded-xl border border-border bg-surface pr-3 pl-11 text-[15px] text-foreground shadow-card outline-none placeholder:text-subtle hover:border-border-strong focus:border-accent focus:ring-3 focus:ring-accent/20"
                />
                <datalist id="search-locations">
                    {locations.map((location) => <option key={location} value={location}/>)}
                </datalist>
            </label>
            <button type="submit" className="sr-only">Search</button>
        </form>
    );
}
