import Link from "next/link";
import {cn} from "@/lib/cn";

export function LogoMark({className}: { className?: string }) {
    return (
        <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8", className)}>
            <defs>
                <linearGradient id="devjobs-mark" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#6366f1"/>
                    <stop offset="1" stopColor="#8b5cf6"/>
                </linearGradient>
            </defs>
            <rect width="32" height="32" rx="9" fill="url(#devjobs-mark)"/>
            <path d="M12.5 11 8 16l4.5 5M19.5 11 24 16l-4.5 5M17.5 9.5l-3 13" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}

export function Logo({className}: { className?: string }) {
    return (
        <Link href="/" className={cn("flex items-center gap-2.5 rounded-lg", className)} aria-label="DevJobs home">
            <LogoMark/>
            <span className="text-[17px] font-semibold tracking-tight text-foreground">
                Dev<span className="text-accent">Jobs</span>
            </span>
        </Link>
    );
}

export function GithubIcon({className}: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" aria-hidden className={cn("size-4", className)} fill="currentColor">
            <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"/>
        </svg>
    );
}
