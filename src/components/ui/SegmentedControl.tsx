"use client";

import {ReactNode, useId} from "react";
import {cn} from "@/lib/cn";

/** A radio group styled as a segmented control — arrow keys work because it *is* radios. */
export function SegmentedControl<T extends string>({value, onChange, options, label, size = "md", className}: {
    value: T;
    onChange: (value: T) => void;
    options: { value: T; label: ReactNode; icon?: ReactNode }[];
    label: string;
    size?: "sm" | "md";
    className?: string;
}) {
    const name = useId();
    return (
        <div role="radiogroup" aria-label={label} className={cn("inline-flex rounded-lg border border-border bg-surface-2 p-0.5", className)}>
            {options.map((option) => (
                <label
                    key={option.value}
                    className={cn(
                        "relative flex cursor-pointer items-center gap-1.5 rounded-md font-medium transition-colors [&_svg]:size-4",
                        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent",
                        size === "sm" ? "h-7 px-2.5 text-xs" : "h-8 px-3 text-sm",
                        value === option.value ? "bg-surface text-foreground shadow-card" : "text-muted hover:text-foreground",
                    )}
                >
                    <input
                        type="radio"
                        className="sr-only"
                        name={name}
                        value={option.value}
                        checked={value === option.value}
                        onChange={() => onChange(option.value)}
                    />
                    {option.icon}
                    {option.label}
                </label>
            ))}
        </div>
    );
}
