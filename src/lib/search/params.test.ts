import {describe, expect, it} from "vitest";
import {activeFilterCount, DEFAULT_SEARCH, parseSearch, searchKey, serializeSearch, toggleValue} from "@/lib/search/params";

const parse = (query: string) => parseSearch(new URLSearchParams(query));

describe("parseSearch", () => {
    it("reads every field", () => {
        expect(parse("q=react&loc=berlin&role=frontend,fullstack&level=senior&mode=remote&skill=typescript&company=acme&posted=7&salary=1&sort=salary&page=3")).toEqual({
            q: "react",
            loc: "berlin",
            roles: ["frontend", "fullstack"],
            levels: ["senior"],
            modes: ["remote"],
            skills: ["typescript"],
            company: "acme",
            posted: "7",
            salary: true,
            sort: "salary",
            page: 3,
        });
    });

    it("drops unknown values instead of failing", () => {
        expect(parse("role=frontend,astronaut&mode=moon&skill=not-a-skill&posted=2&sort=random&page=-4")).toEqual({
            ...DEFAULT_SEARCH,
            roles: ["frontend"],
        });
    });

    it("dedupes repeated list values", () => {
        expect(parse("mode=remote,remote").modes).toEqual(["remote"]);
    });
});

describe("serializeSearch", () => {
    it("omits defaults entirely", () => {
        expect(serializeSearch(DEFAULT_SEARCH)).toBe("");
    });

    it("is canonical: same search, same URL, readable commas", () => {
        const a = serializeSearch({...DEFAULT_SEARCH, roles: ["fullstack", "frontend"], modes: ["remote"]});
        const b = serializeSearch({...DEFAULT_SEARCH, modes: ["remote"], roles: ["frontend", "fullstack"]});
        expect(a).toBe(b);
        expect(a).toBe("role=frontend,fullstack&mode=remote");
    });

    it("round-trips canonical URLs and is idempotent", () => {
        const canonical = "q=go&role=backend&level=lead,senior&salary=1&sort=newest&page=2";
        expect(serializeSearch(parse(canonical))).toBe(canonical);
        const messy = serializeSearch(parse("level=senior,lead&role=backend"));
        expect(serializeSearch(parse(messy))).toBe(messy);
    });
});

describe("helpers", () => {
    it("counts active filters (not the keyword or sort)", () => {
        expect(activeFilterCount(parse("q=react&sort=salary"))).toBe(0);
        expect(activeFilterCount(parse("role=frontend,backend&mode=remote&salary=1&loc=nyc"))).toBe(5);
    });

    it("toggles values", () => {
        expect(toggleValue(["a"], "b")).toEqual(["a", "b"]);
        expect(toggleValue(["a", "b"], "a")).toEqual(["b"]);
    });

    it("keys saved searches by what they match, ignoring page and sort", () => {
        expect(searchKey(parse("role=frontend&page=4&sort=newest"))).toBe("role=frontend");
    });
});
