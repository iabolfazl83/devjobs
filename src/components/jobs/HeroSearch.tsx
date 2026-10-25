"use client";

import {useRouter} from "next/navigation";
import {FormEvent, useState} from "react";
import {MapPin, Search} from "lucide-react";
import {Button} from "@/components/ui/Button";
import {DEFAULT_SEARCH, serializeSearch} from "@/lib/search/params";

export function HeroSearch() {
    const router = useRouter();
    const [q, setQ] = useState("");
    const [loc, setLoc] = useState("");

    function submit(event: FormEvent) {
        event.preventDefault();
        const query = serializeSearch({...DEFAULT_SEARCH, q, loc});
        router.push(query ? `/jobs?${query}` : "/jobs");
    }

    return (
        <form
            onSubmit={submit}
            role="search"
            className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-2 shadow-raised sm:flex-row sm:items-center sm:gap-0"
        >
            <label className="flex flex-1 items-center gap-3 px-3">
                <Search aria-hidden className="size-5 shrink-0 text-muted"/>
                <span className="sr-only">Job title, skill or company</span>
                <input
                    value={q}
                    onChange={(event) => setQ(event.target.value)}
                    placeholder="Job title, skill or company"
                    className="h-12 w-full bg-transparent text-[15px] text-foreground outline-none placeholder:text-subtle"
                />
            </label>
            <div className="hidden h-8 w-px bg-border sm:block"/>
            <label className="flex flex-1 items-center gap-3 border-t border-border px-3 sm:border-t-0">
                <MapPin aria-hidden className="size-5 shrink-0 text-muted"/>
                <span className="sr-only">Location</span>
                <input
                    value={loc}
                    onChange={(event) => setLoc(event.target.value)}
                    placeholder="City, country or “remote”"
                    className="h-12 w-full bg-transparent text-[15px] text-foreground outline-none placeholder:text-subtle"
                />
            </label>
            <Button type="submit" size="lg" className="sm:ml-2">
                Search jobs
            </Button>
        </form>
    );
}
