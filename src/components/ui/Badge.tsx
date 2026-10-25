import {ComponentProps} from "react";
import {cn} from "@/lib/cn";

export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger" | "info" | "outline";

const TONES: Record<BadgeTone, string> = {
    neutral: "bg-surface-2 text-secondary",
    accent: "bg-accent-soft text-accent",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
    danger: "bg-danger-soft text-danger",
    info: "bg-info-soft text-info",
    outline: "border border-border text-secondary",
};

export function Badge({tone = "neutral", size = "md", className, ...props}: ComponentProps<"span"> & {
    tone?: BadgeTone;
    size?: "sm" | "md";
}) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap [&_svg]:shrink-0",
                size === "sm" ? "px-2 py-0.5 text-[11px] [&_svg]:size-3" : "px-2.5 py-1 text-xs [&_svg]:size-3.5",
                TONES[tone],
                className,
            )}
            {...props}
        />
    );
}
