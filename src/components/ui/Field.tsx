import {ComponentProps, ReactNode, useId} from "react";
import {cn} from "@/lib/cn";

export const controlClasses =
    "w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground shadow-card transition-colors " +
    "placeholder:text-subtle hover:border-border-strong focus:border-accent focus:outline-none focus:ring-3 focus:ring-accent/20 " +
    "disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-danger aria-invalid:focus:ring-danger/20";

export function Input({className, ...props}: ComponentProps<"input">) {
    return <input className={cn(controlClasses, "h-10", className)} {...props}/>;
}

export function Textarea({className, ...props}: ComponentProps<"textarea">) {
    return <textarea className={cn(controlClasses, "min-h-24 py-2 leading-relaxed", className)} {...props}/>;
}

export function Select({className, ...props}: ComponentProps<"select">) {
    return <select className={cn(controlClasses, "h-10 cursor-pointer pr-8", className)} {...props}/>;
}

/**
 * Label + control + hint/error, wired together with ids so screen readers
 * announce the hint and the error with the input.
 */
export function Field({label, hint, error, children, className}: {
    label: ReactNode;
    hint?: ReactNode;
    error?: string | null;
    children: (props: { id: string; "aria-describedby"?: string; "aria-invalid"?: boolean }) => ReactNode;
    className?: string;
}) {
    const id = useId();
    const hintId = hint ? `${id}-hint` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

    return (
        <div className={cn("flex flex-col gap-1.5", className)}>
            <label htmlFor={id} className="text-sm font-medium text-foreground">{label}</label>
            {children({id, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined})}
            {hint && !error && <p id={hintId} className="text-xs text-muted">{hint}</p>}
            {error && <p id={errorId} className="text-xs font-medium text-danger" role="alert">{error}</p>}
        </div>
    );
}
