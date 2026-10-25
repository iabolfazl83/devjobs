"use client";

import {ReactNode, useEffect, useRef} from "react";
import {X} from "lucide-react";
import {cn} from "@/lib/cn";

/**
 * Built on the native <dialog> element: showModal() gives us a focus trap,
 * Escape-to-close, an inert background and top-layer stacking for free —
 * no portal or focus-trap library needed.
 */
export function Dialog({open, onClose, title, description, children, footer, variant = "center", className, hideTitle}: {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: ReactNode;
    children: ReactNode;
    footer?: ReactNode;
    variant?: "center" | "sheet" | "palette";
    className?: string;
    hideTitle?: boolean;
}) {
    const ref = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <dialog
            ref={ref}
            onClose={onClose}
            onCancel={(event) => {
                event.preventDefault();
                onClose();
            }}
            // A click whose target is the <dialog> itself landed on the backdrop.
            onClick={(event) => event.target === ref.current && onClose()}
            aria-label={hideTitle ? title : undefined}
            className={cn(
                "m-0 max-h-none max-w-none bg-transparent p-0 text-foreground backdrop:animate-fade-in open:flex",
                variant === "center" && "h-full w-full items-center justify-center p-4",
                variant === "palette" && "h-full w-full items-start justify-center p-4 pt-[12vh]",
                variant === "sheet" && "ml-auto h-full w-full justify-end",
            )}
        >
            <div
                className={cn(
                    "flex flex-col border border-border bg-surface shadow-raised",
                    variant === "center" && "max-h-[85vh] w-full max-w-lg animate-slide-up rounded-2xl",
                    variant === "palette" && "max-h-[70vh] w-full max-w-xl animate-slide-up overflow-hidden rounded-2xl",
                    variant === "sheet" && "h-full w-full max-w-md animate-slide-in-right rounded-l-2xl",
                    className,
                )}
            >
                {!hideTitle && (
                    <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
                        <div>
                            <h2 className="text-base font-semibold">{title}</h2>
                            {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="-mr-1 grid size-8 place-items-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
                            aria-label="Close"
                        >
                            <X className="size-4"/>
                        </button>
                    </div>
                )}
                <div className={cn("min-h-0 flex-1 overflow-y-auto scrollbar-thin", !hideTitle && "px-5 py-4")}>{children}</div>
                {footer && <div className="flex justify-end gap-2 border-t border-border px-5 py-3">{footer}</div>}
            </div>
        </dialog>
    );
}
