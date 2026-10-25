import {describe, expect, it} from "vitest";
import {formatDate, hueFor, initials, pluralize, timeAgo} from "@/lib/format";
import {pageWindow} from "@/components/search/Pagination";

const NOW = new Date("2026-10-25T12:00:00Z").getTime();
const ago = (ms: number) => new Date(NOW - ms).toISOString();

describe("timeAgo", () => {
    it.each([
        [30_000, "just now"],
        [5 * 60_000, "5m ago"],
        [3 * 3_600_000, "3h ago"],
        [2 * 86_400_000, "2d ago"],
        [14 * 86_400_000, "2w ago"],
        [90 * 86_400_000, "3mo ago"],
        [400 * 86_400_000, "1y ago"],
    ])("%i ms → %s", (ms, expected) => {
        expect(timeAgo(ago(ms), NOW)).toBe(expected);
    });

    it("never goes negative for future dates", () => {
        expect(timeAgo(new Date(NOW + 60_000).toISOString(), NOW)).toBe("just now");
    });
});

describe("formatting", () => {
    it("formats dates in UTC so server and client agree", () => {
        expect(formatDate("2026-01-01T03:00:00Z")).toBe("Jan 1, 2026");
    });

    it("builds initials and stable hues", () => {
        expect(initials("Bank of America")).toBe("BO");
        expect(initials("Uber")).toBe("UB");
        expect(initials("")).toBe("?");
        expect(hueFor("Acme")).toBe(hueFor("Acme"));
    });

    it("pluralizes", () => {
        expect(pluralize(1, "job")).toBe("1 job");
        expect(pluralize(1200, "company", "companies")).toBe("1,200 companies");
    });
});

describe("pageWindow", () => {
    it("shows every page when there are few", () => {
        expect(pageWindow(2, 5)).toEqual([1, 2, 3, 4, 5]);
    });

    it("collapses the middle with gaps", () => {
        expect(pageWindow(6, 20)).toEqual([1, "gap", 5, 6, 7, "gap", 20]);
        expect(pageWindow(1, 20)).toEqual([1, 2, "gap", 20]);
    });
});
