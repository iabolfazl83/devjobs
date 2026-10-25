"use client";

import {CircleCheck, CircleX, Info, X} from "lucide-react";
import {dismissToast, useToastStore} from "@/lib/toast";
import {cn} from "@/lib/cn";

export function Toaster() {
    const toasts = useToastStore((state) => state.toasts);

    return (
        <div
            aria-live="polite"
            aria-atomic="false"
            className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6"
        >
            {toasts.map((toast) => {
                const Icon = toast.tone === "success" ? CircleCheck : toast.tone === "error" ? CircleX : Info;
                return (
                    <div
                        key={toast.id}
                        role="status"
                        className="pointer-events-auto flex w-full max-w-sm animate-slide-up items-start gap-3 rounded-xl border border-border bg-surface p-3.5 shadow-raised"
                    >
                        <Icon
                            aria-hidden
                            className={cn(
                                "mt-0.5 size-[18px] shrink-0",
                                toast.tone === "success" ? "text-success" : toast.tone === "error" ? "text-danger" : "text-accent",
                            )}
                        />
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground">{toast.title}</p>
                            {toast.description && <p className="mt-0.5 truncate text-sm text-muted">{toast.description}</p>}
                        </div>
                        {toast.action && (
                            <button
                                type="button"
                                onClick={() => {
                                    toast.action?.onClick();
                                    dismissToast(toast.id);
                                }}
                                className="shrink-0 rounded-md px-2 py-1 text-sm font-semibold text-accent hover:bg-accent-soft"
                            >
                                {toast.action.label}
                            </button>
                        )}
                        <button
                            type="button"
                            aria-label="Dismiss"
                            onClick={() => dismissToast(toast.id)}
                            className="-m-1 grid size-7 shrink-0 place-items-center rounded-md text-subtle hover:bg-surface-2 hover:text-foreground"
                        >
                            <X className="size-4"/>
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
