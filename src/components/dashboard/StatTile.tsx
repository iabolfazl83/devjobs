import {LucideIcon} from "lucide-react";

/** label · value · optional detail line. Values use proportional figures (they're standalone, not a column). */
export function StatTile({label, value, detail, icon: Icon}: { label: string; value: string; detail?: string; icon: LucideIcon }) {
    return (
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
            <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-muted">{label}</p>
                <Icon aria-hidden className="size-4 text-subtle"/>
            </div>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
            {detail && <p className="mt-1 text-xs text-muted">{detail}</p>}
        </div>
    );
}
