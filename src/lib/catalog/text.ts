const NAMED_ENTITIES: Record<string, string> = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: "\"",
    apos: "'",
    nbsp: " ",
    ndash: "–",
    mdash: "—",
    rsquo: "’",
    lsquo: "‘",
    rdquo: "”",
    ldquo: "“",
    hellip: "…",
    bull: "•",
    middot: "·",
    trade: "™",
    reg: "®",
    copy: "©",
    euro: "€",
    pound: "£",
};

export function decodeEntities(input: string): string {
    return input.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
        if (entity[0] === "#") {
            const code = entity[1].toLowerCase() === "x" ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
            return Number.isFinite(code) ? String.fromCodePoint(code) : match;
        }
        return NAMED_ENTITIES[entity.toLowerCase()] ?? match;
    });
}

/** Cheap, dependency-free HTML → text for search + excerpts. Not a sanitizer. */
export function htmlToText(html: string): string {
    return decodeEntities(
        html
            .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
            .replace(/<br\s*\/?>/gi, "\n")
            .replace(/<\/(p|div|li|h[1-6]|tr|ul|ol)>/gi, "\n")
            .replace(/<[^>]+>/g, " "),
    )
        .replace(/[ \t ]+/g, " ")
        .replace(/\s*\n\s*/g, "\n")
        .trim();
}

export function excerpt(text: string, maxLength = 180): string {
    const flat = text.replace(/\s+/g, " ").trim();
    if (flat.length <= maxLength) return flat;
    const cut = flat.slice(0, maxLength);
    const lastSpace = cut.lastIndexOf(" ");
    return `${cut.slice(0, lastSpace > maxLength * 0.6 ? lastSpace : maxLength).replace(/[,.;:\-–—\s]+$/, "")}…`;
}

/** "SimVentions, Inc - Glassdoor ✪ 4.6" → "SimVentions, Inc" */
export function cleanCompanyName(name: string): string {
    return name
        .replace(/\s*[-–|]\s*Glassdoor.*$/i, "")
        .replace(/\s+/g, " ")
        .trim();
}

export function slugify(input: string): string {
    return input
        .normalize("NFKD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

const US_STATES = new Set([
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME",
    "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA",
    "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC", "PR",
]);

export const REMOTE_LOCATION = "Remote";

/** Normalises an upstream location string for display and faceting. */
export function normalizeLocation(raw: string): string {
    const trimmed = raw.replace(/\s+/g, " ").trim();
    if (/flexible\s*\/\s*remote|^remote$/i.test(trimmed)) return REMOTE_LOCATION;
    return trimmed;
}

/** "Austin, TX" → "United States", "London, United Kingdom" → "United Kingdom". */
export function countryOf(location: string): string | null {
    if (location === REMOTE_LOCATION) return null;
    const parts = location.split(",").map((part) => part.trim());
    const last = parts[parts.length - 1];
    if (parts.length > 1 && US_STATES.has(last)) return "United States";
    return parts.length > 1 ? last : null;
}
