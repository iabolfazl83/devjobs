import {cn} from "@/lib/cn";

export function Skeleton({className}: { className?: string }) {
    return <div aria-hidden className={cn("animate-shimmer rounded-md bg-surface-3", className)}/>;
}

export function Spinner({className}: { className?: string }) {
    return (
        <span
            role="status"
            aria-label="Loading"
            className={cn("inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent", className)}
        />
    );
}
