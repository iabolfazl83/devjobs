import {ReactNode} from "react";
import {cn} from "@/lib/cn";

export function Container({className, children}: { className?: string; children: ReactNode }) {
    return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6", className)}>{children}</div>;
}

export function SectionHeading({eyebrow, title, description, action, className}: {
    eyebrow?: string;
    title: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
            <div className="max-w-2xl">
                {eyebrow && <p className="text-sm font-semibold text-accent">{eyebrow}</p>}
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h2>
                {description && <p className="mt-2 text-[15px] leading-relaxed text-muted">{description}</p>}
            </div>
            {action}
        </div>
    );
}

export function PageHeader({title, description, actions, className, children}: {
    title: ReactNode;
    description?: ReactNode;
    actions?: ReactNode;
    className?: string;
    children?: ReactNode;
}) {
    return (
        <div className={cn("border-b border-border bg-surface", className)}>
            <Container className="py-8 sm:py-10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="min-w-0">
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h1>
                        {description && <p className="mt-1.5 max-w-2xl text-[15px] text-muted">{description}</p>}
                    </div>
                    {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
                </div>
                {children}
            </Container>
        </div>
    );
}
