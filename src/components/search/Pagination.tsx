"use client";

import {ChevronLeft, ChevronRight} from "lucide-react";
import {cn} from "@/lib/cn";

/** 1 … 4 5 [6] 7 8 … 20 */
export function pageWindow(page: number, pageCount: number): (number | "gap")[] {
    if (pageCount <= 7) return Array.from({length: pageCount}, (_, index) => index + 1);
    const pages = new Set([1, pageCount, page - 1, page, page + 1].filter((value) => value >= 1 && value <= pageCount));
    const sorted = [...pages].sort((a, b) => a - b);
    const result: (number | "gap")[] = [];
    sorted.forEach((value, index) => {
        if (index > 0 && value - sorted[index - 1] > 1) result.push("gap");
        result.push(value);
    });
    return result;
}

export function Pagination({page, pageCount, onPage}: { page: number; pageCount: number; onPage: (page: number) => void }) {
    if (pageCount <= 1) return null;
    const buttonClass = "grid h-9 min-w-9 place-items-center rounded-lg px-2 text-sm font-medium transition-colors";

    return (
        <nav aria-label="Pagination" className="flex items-center justify-center gap-1 pt-2">
            <button
                type="button"
                onClick={() => onPage(page - 1)}
                disabled={page <= 1}
                className={cn(buttonClass, "text-secondary hover:bg-surface-2 disabled:opacity-40 disabled:hover:bg-transparent")}
                aria-label="Previous page"
            >
                <ChevronLeft className="size-4"/>
            </button>
            {pageWindow(page, pageCount).map((value, index) => value === "gap" ? (
                <span key={`gap-${index}`} className="px-1 text-subtle" aria-hidden>…</span>
            ) : (
                <button
                    key={value}
                    type="button"
                    onClick={() => onPage(value)}
                    aria-current={value === page ? "page" : undefined}
                    aria-label={`Page ${value}`}
                    className={cn(buttonClass, value === page ? "bg-accent text-accent-foreground" : "text-secondary hover:bg-surface-2")}
                >
                    {value}
                </button>
            ))}
            <button
                type="button"
                onClick={() => onPage(page + 1)}
                disabled={page >= pageCount}
                className={cn(buttonClass, "text-secondary hover:bg-surface-2 disabled:opacity-40 disabled:hover:bg-transparent")}
                aria-label="Next page"
            >
                <ChevronRight className="size-4"/>
            </button>
        </nav>
    );
}
