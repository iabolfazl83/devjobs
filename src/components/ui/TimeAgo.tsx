"use client";

import {useId} from "react";
import {formatDate, timeAgo} from "@/lib/format";
import {InlineScript} from "@/components/ui/InlineScript";

/**
 * "3d ago" is relative to *now*, which a static page built yesterday can't know.
 * Static HTML carries the absolute date; an inline script swaps in the relative
 * time before first paint, and client renders compute it directly.
 */
export function TimeAgo({iso, className}: { iso: string; className?: string }) {
    const id = useId();
    const script = `(function(){var e=document.getElementById(${JSON.stringify(id)});if(!e)return;var d=Math.max(0,Date.now()-new Date(${JSON.stringify(iso)}).getTime()),m=6e4,h=36e5,D=864e5,t;t=d<m?"just now":d<h?Math.floor(d/m)+"m ago":d<D?Math.floor(d/h)+"h ago":d<7*D?Math.floor(d/D)+"d ago":d<30*D?Math.floor(d/(7*D))+"w ago":d<365*D?Math.floor(d/(30*D))+"mo ago":Math.floor(d/(365*D))+"y ago";e.textContent=t})()`;

    return (
        <>
            <time id={id} dateTime={iso} title={formatDate(iso)} className={className} suppressHydrationWarning>
                {typeof window === "undefined" ? formatDate(iso) : timeAgo(iso)}
            </time>
            <InlineScript html={script}/>
        </>
    );
}
