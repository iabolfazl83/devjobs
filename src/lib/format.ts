const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** "just now", "5m ago", "3h ago", "2d ago", "3w ago", "4mo ago", "1y ago" */
export function timeAgo(iso: string, now: number = Date.now()): string {
    const diff = Math.max(0, now - new Date(iso).getTime());
    if (diff < MINUTE) return "just now";
    if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m ago`;
    if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`;
    if (diff < 7 * DAY) return `${Math.floor(diff / DAY)}d ago`;
    if (diff < 30 * DAY) return `${Math.floor(diff / (7 * DAY))}w ago`;
    if (diff < 365 * DAY) return `${Math.floor(diff / (30 * DAY))}mo ago`;
    return `${Math.floor(diff / (365 * DAY))}y ago`;
}

/** Fixed locale + UTC, so server-rendered and client-rendered output always match. */
const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {month: "short", day: "numeric", year: "numeric", timeZone: "UTC"});
const SHORT_DATE_FORMAT = new Intl.DateTimeFormat("en-US", {month: "short", day: "numeric", timeZone: "UTC"});

export function formatDate(iso: string): string {
    return DATE_FORMAT.format(new Date(iso));
}

export function formatShortDate(iso: string): string {
    return SHORT_DATE_FORMAT.format(new Date(iso));
}

export function daysSince(iso: string, now: number = Date.now()): number {
    return Math.floor((now - new Date(iso).getTime()) / DAY);
}

const NUMBER_FORMAT = new Intl.NumberFormat("en-US");

export function formatNumber(value: number): string {
    return NUMBER_FORMAT.format(value);
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
    return `${formatNumber(count)} ${count === 1 ? singular : plural}`;
}

export function percent(value: number): string {
    return `${Math.round(value * 100)}%`;
}

export function initials(name: string): string {
    const words = name.replace(/[^\p{L}\p{N}\s]/gu, " ").trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return "?";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
}

/** Stable hue per string, for avatar/logo fallbacks. */
export function hueFor(text: string): number {
    let hash = 0;
    for (let index = 0; index < text.length; index++) hash = (hash * 31 + text.charCodeAt(index)) | 0;
    return Math.abs(hash) % 360;
}
