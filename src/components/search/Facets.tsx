"use client";

import {useState} from "react";
import {ChevronDown, Search} from "lucide-react";
import {Popover} from "@/components/ui/Popover";
import {cn} from "@/lib/cn";
import {formatNumber} from "@/lib/format";

export interface FacetOption<T extends string> {
    value: T;
    label: string;
    count: number;
}

/** A list of checkboxes with live counts. Zero-count options stay visible but dimmed, so the list doesn't jump around. */
export function FacetList<T extends string>({options, selected, onToggle, name}: {
    options: FacetOption<T>[];
    selected: T[];
    onToggle: (value: T) => void;
    name: string;
}) {
    return (
        <ul className="flex flex-col" aria-label={name}>
            {options.map((option) => {
                const checked = selected.includes(option.value);
                const empty = option.count === 0 && !checked;
                return (
                    <li key={option.value}>
                        <label
                            className={cn(
                                "flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-surface-2",
                                empty && "opacity-50",
                            )}
                        >
                            <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => onToggle(option.value)}
                                className="size-4 shrink-0 cursor-pointer rounded accent-accent"
                            />
                            <span className={cn("flex-1 truncate", checked ? "font-medium text-foreground" : "text-secondary")}>{option.label}</span>
                            <span className="text-xs text-muted tabular-nums">{formatNumber(option.count)}</span>
                        </label>
                    </li>
                );
            })}
        </ul>
    );
}

export function RadioList<T extends string>({options, value, onChange, name}: {
    options: { value: T; label: string }[];
    value: T;
    onChange: (value: T) => void;
    name: string;
}) {
    return (
        <div role="radiogroup" aria-label={name} className="flex flex-col">
            {options.map((option) => (
                <label key={option.value} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-surface-2">
                    <input
                        type="radio"
                        name={name}
                        checked={value === option.value}
                        onChange={() => onChange(option.value)}
                        className="size-4 cursor-pointer accent-accent"
                    />
                    <span className={value === option.value ? "font-medium text-foreground" : "text-secondary"}>{option.label}</span>
                </label>
            ))}
        </div>
    );
}

/** Long facets (skills) get a filter box. */
export function SearchableFacet<T extends string>({options, selected, onToggle, name, initial = 10}: {
    options: FacetOption<T>[];
    selected: T[];
    onToggle: (value: T) => void;
    name: string;
    initial?: number;
}) {
    const [filter, setFilter] = useState("");
    const [expanded, setExpanded] = useState(false);
    const text = filter.trim().toLowerCase();
    const filtered = text ? options.filter((option) => option.label.toLowerCase().includes(text)) : options;
    // Selected options always stay visible, even when they'd fall below the fold.
    const visible = expanded || text ? filtered : [
        ...filtered.slice(0, initial),
        ...filtered.slice(initial).filter((option) => selected.includes(option.value)),
    ];

    return (
        <div>
            <label className="relative mb-1.5 block">
                <span className="sr-only">Filter {name}</span>
                <Search aria-hidden className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-subtle"/>
                <input
                    value={filter}
                    onChange={(event) => setFilter(event.target.value)}
                    placeholder={`Filter ${name.toLowerCase()}…`}
                    className="h-8 w-full rounded-md border border-border bg-surface pr-2 pl-8 text-sm outline-none placeholder:text-subtle focus:border-accent"
                />
            </label>
            <FacetList options={visible} selected={selected} onToggle={onToggle} name={name}/>
            {!text && filtered.length > initial && (
                <button type="button" onClick={() => setExpanded((value) => !value)} className="mt-1 px-2 text-sm font-medium text-accent hover:underline">
                    {expanded ? "Show fewer" : `Show all ${filtered.length}`}
                </button>
            )}
            {text && filtered.length === 0 && <p className="px-2 py-1.5 text-sm text-muted">No matches.</p>}
        </div>
    );
}

/** Filter-bar button that opens a facet in a popover, Indeed/LinkedIn style. */
export function FacetDropdown({label, activeCount, children, onClear}: {
    label: string;
    activeCount: number;
    children: React.ReactNode;
    onClear?: () => void;
}) {
    return (
        <Popover
            label={label}
            align="start"
            className="w-72"
            trigger={(props) => (
                <button
                    type="button"
                    {...props}
                    className={cn(
                        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium whitespace-nowrap transition-colors",
                        activeCount > 0
                            ? "border-accent/40 bg-accent-soft text-accent"
                            : "border-border bg-surface text-secondary hover:border-border-strong hover:text-foreground",
                    )}
                >
                    {label}
                    {activeCount > 0 && (
                        <span className="grid size-5 place-items-center rounded-full bg-accent text-[11px] text-accent-foreground">{activeCount}</span>
                    )}
                    <ChevronDown aria-hidden className="size-4 opacity-70"/>
                </button>
            )}
        >
            {() => (
                <div>
                    <div className="max-h-80 overflow-y-auto p-0.5 scrollbar-thin">{children}</div>
                    {onClear && activeCount > 0 && (
                        <div className="mt-1 border-t border-border pt-1.5">
                            <button type="button" onClick={onClear} className="w-full rounded-lg px-2 py-1.5 text-left text-sm font-medium text-muted hover:bg-surface-2 hover:text-foreground">
                                Clear {label.toLowerCase()}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </Popover>
    );
}
