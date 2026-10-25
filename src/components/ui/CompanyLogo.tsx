"use client";

import {useState} from "react";
import {cn} from "@/lib/cn";
import {hueFor, initials} from "@/lib/format";

const SIZES = {
    sm: "size-8 rounded-lg text-[11px]",
    md: "size-11 rounded-xl text-sm",
    lg: "size-14 rounded-2xl text-base",
    xl: "size-20 rounded-3xl text-xl",
};

/** Upstream logo when there is one; a stable, colored monogram when there isn't (or it 404s). */
export function CompanyLogo({name, src, size = "md", className}: {
    name: string;
    src: string | null;
    size?: keyof typeof SIZES;
    className?: string;
}) {
    const [failed, setFailed] = useState(false);
    const hue = hueFor(name);

    if (src && !failed) {
        return (
            <span className={cn("grid shrink-0 place-items-center overflow-hidden border border-border bg-white", SIZES[size], className)}>
                {/* Plain <img>: logos come from a third-party CDN and the Next optimizer needs a server. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="size-full object-contain p-[12%]"
                    onError={() => setFailed(true)}
                />
            </span>
        );
    }

    return (
        <span
            aria-hidden
            className={cn("monogram grid shrink-0 place-items-center border font-semibold", SIZES[size], className)}
            style={{"--monogram-hue": hue} as React.CSSProperties}
        >
            {initials(name)}
        </span>
    );
}
