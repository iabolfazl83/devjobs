"use client";

import {ReactNode, useEffect, useId, useRef, useState} from "react";
import {cn} from "@/lib/cn";

/**
 * Disclosure-style popover (button + panel). Closes on outside click, Escape,
 * and after a choice is made; returns focus to the trigger on Escape.
 */
export function Popover({trigger, children, align = "end", className, label}: {
    trigger: (props: { onClick: () => void; "aria-expanded": boolean; "aria-controls": string; "aria-haspopup": true }) => ReactNode;
    children: (close: () => void) => ReactNode;
    align?: "start" | "end";
    className?: string;
    label?: string;
}) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const panelId = useId();

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (event: PointerEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setOpen(false);
                rootRef.current?.querySelector<HTMLElement>("[aria-haspopup]")?.focus();
            }
        };
        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    return (
        <div ref={rootRef} className="relative">
            {trigger({onClick: () => setOpen((value) => !value), "aria-expanded": open, "aria-controls": panelId, "aria-haspopup": true})}
            {open && (
                <div
                    id={panelId}
                    role="group"
                    aria-label={label}
                    className={cn(
                        "absolute top-full z-50 mt-2 min-w-48 animate-slide-up rounded-xl border border-border bg-surface p-1.5 shadow-raised",
                        align === "end" ? "right-0" : "left-0",
                        className,
                    )}
                >
                    {children(() => setOpen(false))}
                </div>
            )}
        </div>
    );
}

export function PopoverItem({className, active, ...props}: React.ComponentProps<"button"> & { active?: boolean }) {
    return (
        <button
            type="button"
            className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors [&_svg]:size-4 [&_svg]:shrink-0",
                active ? "bg-accent-soft text-accent" : "text-secondary hover:bg-surface-2 hover:text-foreground",
                className,
            )}
            {...props}
        />
    );
}
