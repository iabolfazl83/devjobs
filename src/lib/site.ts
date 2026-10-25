export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * next/link and the router add the basePath automatically; plain `fetch()` and
 * raw asset URLs don't, so they go through this.
 */
export function withBasePath(path: string): string {
    return `${BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;
}

export const SITE = {
    name: "DevJobs",
    tagline: "Find your next tech role — and keep every application on track.",
    description:
        "A fast, static-first job board for developers, designers and data people: faceted search across real listings, skill matching, and a Kanban application tracker.",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://iabolfazl83.github.io/devjobs",
    repo: "https://github.com/iabolfazl83/devjobs",
    dataSource: {name: "The Muse", url: "https://www.themuse.com/developers/api/v2"},
} as const;
