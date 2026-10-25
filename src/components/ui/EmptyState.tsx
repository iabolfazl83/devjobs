import {ReactNode} from "react";
import {LucideIcon} from "lucide-react";
import {cn} from "@/lib/cn";

export function EmptyState({icon: Icon, title, description, action, className}: {
    icon: LucideIcon;
    title: string;
    description?: ReactNode;
    action?: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("flex flex-col items-center px-6 py-14 text-center", className)}>
            <div className="mb-4 grid size-12 place-items-center rounded-2xl border border-border bg-surface-2 text-muted">
                <Icon className="size-5" aria-hidden/>
            </div>
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            {description && <p className="mt-1.5 max-w-sm text-sm text-muted">{description}</p>}
            {action && <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div>}
        </div>
    );
}
