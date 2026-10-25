"use client";

import {useEffect, useMemo, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import {useQuery} from "@tanstack/react-query";
import {
    ArrowRight, Briefcase, Building2, CornerDownLeft, Globe, GraduationCap, Info, LayoutDashboard, LucideIcon, Monitor,
    Moon, Search, Settings, SquareKanban, Sun, UserRound,
} from "lucide-react";
import {Dialog} from "@/components/ui/Dialog";
import {Kbd} from "@/components/ui/Kbd";
import {CompanyLogo} from "@/components/ui/CompanyLogo";
import {closePalette, openPalette, usePaletteStore} from "@/lib/palette";
import {jobsIndexQuery} from "@/lib/data/queries";
import {quickSearch} from "@/lib/search/engine";
import {setThemePreference} from "@/lib/theme";
import {cn} from "@/lib/cn";

interface Command {
    id: string;
    group: "Jobs" | "Companies" | "Go to" | "Quick searches" | "Theme";
    label: string;
    hint?: string;
    icon?: LucideIcon;
    logo?: { name: string; src: string | null };
    run: () => void;
}

function isTypingTarget(target: EventTarget | null) {
    const element = target as HTMLElement | null;
    return Boolean(element?.closest("input, textarea, select, [contenteditable=true]"));
}

/** Global ⌘K / Ctrl+K (and "/") palette: jump to pages, jobs, companies, or switch theme. */
export function CommandPalette() {
    const open = usePaletteStore((state) => state.open);
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [active, setActive] = useState(0);
    const listRef = useRef<HTMLUListElement>(null);
    const {data: index} = useQuery({...jobsIndexQuery, enabled: open});

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                if (usePaletteStore.getState().open) closePalette();
                else openPalette();
            } else if (event.key === "/" && !isTypingTarget(event.target) && !usePaletteStore.getState().open) {
                event.preventDefault();
                openPalette();
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    const commands = useMemo<Command[]>(() => {
        const go = (href: string) => () => router.push(href);
        const text = query.trim().toLowerCase();
        const matches = (label: string) => !text || label.toLowerCase().includes(text);

        const pages: Command[] = [
            {id: "p-jobs", group: "Go to", label: "Find jobs", icon: Search, run: go("/jobs")},
            {id: "p-companies", group: "Go to", label: "Companies", icon: Building2, run: go("/companies")},
            {id: "p-dashboard", group: "Go to", label: "Dashboard", icon: LayoutDashboard, run: go("/dashboard")},
            {id: "p-tracker", group: "Go to", label: "Application tracker", icon: SquareKanban, run: go("/tracker")},
            {id: "p-profile", group: "Go to", label: "Profile & preferences", icon: UserRound, run: go("/profile")},
            {id: "p-settings", group: "Go to", label: "Settings", icon: Settings, run: go("/settings")},
            {id: "p-about", group: "Go to", label: "How it's built", icon: Info, run: go("/about")},
        ].filter((command) => matches(command.label)) as Command[];

        const quick: Command[] = [
            {id: "q-remote", group: "Quick searches", label: "Remote jobs", icon: Globe, run: go("/jobs?mode=remote")},
            {id: "q-entry", group: "Quick searches", label: "Entry level & internships", icon: GraduationCap, run: go("/jobs?level=entry,intern")},
            {id: "q-salary", group: "Quick searches", label: "Jobs with salary info", icon: Briefcase, run: go("/jobs?salary=1&sort=salary")},
        ].filter((command) => matches(command.label)) as Command[];

        const themes: Command[] = [
            {id: "t-light", group: "Theme", label: "Switch to light theme", icon: Sun, run: () => setThemePreference("light")},
            {id: "t-dark", group: "Theme", label: "Switch to dark theme", icon: Moon, run: () => setThemePreference("dark")},
            {id: "t-system", group: "Theme", label: "Use system theme", icon: Monitor, run: () => setThemePreference("system")},
        ].filter((command) => matches(command.label) || (text.length > 1 && "theme".startsWith(text))) as Command[];

        const jobs: Command[] = text && index
            ? quickSearch(index.jobs, text, 6).map((job) => ({
                id: `j-${job.id}`,
                group: "Jobs" as const,
                label: job.title,
                hint: job.company.name,
                logo: {name: job.company.name, src: job.company.logo},
                run: go(`/jobs/${job.id}`),
            }))
            : [];

        const companies: Command[] = [];
        if (text && index) {
            const seen = new Set<string>();
            for (const job of index.jobs) {
                if (seen.has(job.company.slug) || !job.company.name.toLowerCase().includes(text)) continue;
                seen.add(job.company.slug);
                companies.push({
                    id: `c-${job.company.slug}`,
                    group: "Companies",
                    label: job.company.name,
                    logo: {name: job.company.name, src: job.company.logo},
                    run: go(`/companies/${job.company.slug}`),
                });
                if (companies.length === 4) break;
            }
        }

        const searchAll: Command[] = text
            ? [{id: "search", group: "Jobs", label: `Search all jobs for “${query.trim()}”`, icon: ArrowRight, run: go(`/jobs?q=${encodeURIComponent(query.trim())}`)}]
            : [];

        return [...jobs, ...searchAll, ...companies, ...pages, ...quick, ...themes];
    }, [query, index, router]);

    const activeIndex = Math.min(active, Math.max(0, commands.length - 1));

    useEffect(() => {
        listRef.current?.querySelector(`[data-index="${activeIndex}"]`)?.scrollIntoView({block: "nearest"});
    }, [activeIndex]);

    function close() {
        closePalette();
        setQuery("");
        setActive(0);
    }

    function run(command: Command | undefined) {
        if (!command) return;
        close();
        command.run();
    }

    return (
        <Dialog open={open} onClose={close} title="Command palette" variant="palette" hideTitle>
            <div className="flex items-center gap-3 border-b border-border px-4">
                <Search aria-hidden className="size-[18px] shrink-0 text-muted"/>
                <input
                    autoFocus
                    value={query}
                    onChange={(event) => {
                        setQuery(event.target.value);
                        setActive(0);
                    }}
                    onKeyDown={(event) => {
                        if (event.key === "ArrowDown") {
                            event.preventDefault();
                            setActive((activeIndex + 1) % Math.max(commands.length, 1));
                        } else if (event.key === "ArrowUp") {
                            event.preventDefault();
                            setActive((activeIndex - 1 + commands.length) % Math.max(commands.length, 1));
                        } else if (event.key === "Enter") {
                            event.preventDefault();
                            run(commands[activeIndex]);
                        }
                    }}
                    placeholder="Search jobs, companies, pages…"
                    className="h-14 flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-subtle"
                    role="combobox"
                    aria-expanded="true"
                    aria-controls="palette-results"
                    aria-activedescendant={commands[activeIndex] ? `palette-${commands[activeIndex].id}` : undefined}
                    aria-label="Search commands"
                />
                <Kbd>esc</Kbd>
            </div>

            <ul ref={listRef} id="palette-results" role="listbox" aria-label="Results" className="max-h-[50vh] overflow-y-auto p-2 scrollbar-thin">
                {commands.length === 0 && (
                    <li className="px-3 py-10 text-center text-sm text-muted">No results for “{query}”.</li>
                )}
                {commands.map((command, position) => {
                    const header = position === 0 || commands[position - 1].group !== command.group ? command.group : null;
                    const Icon = command.icon;
                    return (
                        <li key={command.id} role="presentation">
                            {header && <p className="px-3 pt-3 pb-1.5 text-[11px] font-semibold tracking-wide text-subtle uppercase">{header}</p>}
                            <div
                                id={`palette-${command.id}`}
                                role="option"
                                aria-selected={position === activeIndex}
                                data-index={position}
                                onMouseMove={() => setActive(position)}
                                onClick={() => run(command)}
                                className={cn(
                                    "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm",
                                    position === activeIndex ? "bg-accent-soft text-foreground" : "text-secondary",
                                )}
                            >
                                {command.logo ? (
                                    <CompanyLogo name={command.logo.name} src={command.logo.src} size="sm" className="size-7"/>
                                ) : Icon ? (
                                    <span className="grid size-7 place-items-center rounded-lg border border-border bg-surface-2 text-muted">
                                        <Icon className="size-4"/>
                                    </span>
                                ) : null}
                                <span className="min-w-0 flex-1 truncate">
                                    {command.label}
                                    {command.hint && <span className="text-muted"> · {command.hint}</span>}
                                </span>
                                {position === activeIndex && <CornerDownLeft aria-hidden className="size-4 text-muted"/>}
                            </div>
                        </li>
                    );
                })}
            </ul>

            <div className="flex items-center gap-4 border-t border-border px-4 py-2.5 text-xs text-muted">
                <span className="flex items-center gap-1"><Kbd>↑</Kbd><Kbd>↓</Kbd> navigate</span>
                <span className="flex items-center gap-1"><Kbd>↵</Kbd> open</span>
                <span className="ml-auto flex items-center gap-1"><Kbd>⌘</Kbd><Kbd>K</Kbd> toggle</span>
            </div>
        </Dialog>
    );
}
