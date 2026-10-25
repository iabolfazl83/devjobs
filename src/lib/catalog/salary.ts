import {Currency, Salary} from "@/lib/catalog/types";

const SYMBOL_TO_CURRENCY: Record<string, Currency> = {"$": "USD", "£": "GBP", "€": "EUR"};
const CURRENCY_SYMBOL: Record<Currency, string> = {USD: "$", GBP: "£", EUR: "€"};

const AMOUNT = String.raw`(\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?|\d+(?:\.\d+)?\s?[kK]?)`;
const SEPARATOR = String.raw`\s*(?:USD|GBP|EUR)?\s*(?:-|–|—|to|and)\s*`;

// "$120,000 - $150,000", "$120k–$150k", "£45,000 to £55,000", "$25.00 - $32.50 per hour"
const RANGE = new RegExp(String.raw`([$£€])\s?${AMOUNT}${SEPARATOR}[$£€]?\s?${AMOUNT}`, "g");
const HOURLY_CONTEXT = /^\s*(?:USD|GBP|EUR)?\s*(?:\/\s*(?:hr|hour)|per hour|an hour|hourly|ph\b)/i;

function parseAmount(raw: string): number {
    const value = parseFloat(raw.replace(/,/g, "").replace(/\s?[kK]$/, ""));
    return /[kK]$/.test(raw.trim()) ? value * 1000 : value;
}

/**
 * Pulls the first plausible salary range out of a job description.
 * Ranges only (single figures are too often bonuses or unrelated numbers), and
 * every candidate is sanity-checked before it's trusted.
 */
export function extractSalary(text: string): Salary | null {
    for (const match of text.matchAll(RANGE)) {
        const [whole, symbol, rawMin, rawMax] = match;
        const currency = SYMBOL_TO_CURRENCY[symbol];
        const min = parseAmount(rawMin);
        const max = parseAmount(rawMax);
        if (!currency || !Number.isFinite(min) || !Number.isFinite(max) || min <= 0 || max < min) continue;

        const after = text.slice((match.index ?? 0) + whole.length, (match.index ?? 0) + whole.length + 24);
        const hourly = HOURLY_CONTEXT.test(after) || (max < 300 && /\.\d{2}/.test(whole));

        if (hourly) {
            if (min >= 7 && max <= 500 && max <= min * 3) {
                return {min, max, currency, period: "hour"};
            }
            continue;
        }

        if (min >= 15_000 && max <= 2_000_000 && max <= min * 4) {
            return {min: Math.round(min), max: Math.round(max), currency, period: "year"};
        }
    }
    return null;
}

function compact(value: number): string {
    if (value >= 1000) {
        const thousands = value / 1000;
        return `${Number.isInteger(thousands) ? thousands : thousands.toFixed(1).replace(/\.0$/, "")}k`;
    }
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

export function formatSalary(salary: Salary): string {
    const symbol = CURRENCY_SYMBOL[salary.currency];
    const range = salary.min === salary.max
        ? `${symbol}${compact(salary.min)}`
        : `${symbol}${compact(salary.min)} – ${symbol}${compact(salary.max)}`;
    return `${range} ${salary.period === "year" ? "/ yr" : "/ hr"}`;
}

/** Annualised midpoint in the salary's own currency — used for sorting and min-salary filters. */
export function annualMidpoint(salary: Salary): number {
    const mid = (salary.min + salary.max) / 2;
    return salary.period === "hour" ? mid * 2080 : mid;
}
