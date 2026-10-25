import {describe, expect, it} from "vitest";
import {cleanCompanyName, countryOf, decodeEntities, excerpt, htmlToText, normalizeLocation, slugify} from "@/lib/catalog/text";

describe("htmlToText", () => {
    it("strips tags, keeps block breaks and decodes entities", () => {
        expect(htmlToText("<p>Hello&nbsp;<b>world</b></p><ul><li>A &amp; B</li></ul>")).toBe("Hello world\nA & B");
    });

    it("drops script and style contents", () => {
        expect(htmlToText("<style>.x{}</style><p>Hi</p><script>alert(1)</script>")).toBe("Hi");
    });
});

describe("decodeEntities", () => {
    it("handles numeric, hex and named entities", () => {
        expect(decodeEntities("&#39;&#x2014;&rsquo;&unknown;")).toBe("'—’&unknown;");
    });
});

describe("excerpt", () => {
    it("cuts on a word boundary and adds an ellipsis", () => {
        const text = "word ".repeat(60);
        const result = excerpt(text, 50);
        expect(result.length).toBeLessThanOrEqual(51);
        expect(result.endsWith("word…")).toBe(true);
    });

    it("leaves short text alone", () => {
        expect(excerpt("Short.", 50)).toBe("Short.");
    });
});

describe("company + location helpers", () => {
    it("removes review-site suffixes from company names", () => {
        expect(cleanCompanyName("SimVentions, Inc - Glassdoor ✪ 4.6")).toBe("SimVentions, Inc");
    });

    it("slugifies", () => {
        expect(slugify("Équipe Café & Co.")).toBe("equipe-cafe-co");
    });

    it("normalises remote and derives countries", () => {
        expect(normalizeLocation("Flexible / Remote")).toBe("Remote");
        expect(countryOf("Austin, TX")).toBe("United States");
        expect(countryOf("London, United Kingdom")).toBe("United Kingdom");
        expect(countryOf("Remote")).toBeNull();
    });
});
