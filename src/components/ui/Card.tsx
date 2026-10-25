import {ComponentProps} from "react";
import {cn} from "@/lib/cn";

export function Card({className, ...props}: ComponentProps<"div">) {
    return <div className={cn("rounded-2xl border border-border bg-surface shadow-card", className)} {...props}/>;
}

export function CardHeader({title, description, action, className}: {
    title: React.ReactNode;
    description?: React.ReactNode;
    action?: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("flex items-start justify-between gap-4 px-5 pt-5", className)}>
            <div className="min-w-0">
                <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>
                {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
            </div>
            {action}
        </div>
    );
}
