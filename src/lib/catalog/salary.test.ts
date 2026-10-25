import {describe, expect, it} from "vitest";
import {annualMidpoint, extractSalary, formatSalary} from "@/lib/catalog/salary";

describe("extractSalary", () => {
    it("parses annual ranges with thousands separators", () => {
        expect(extractSalary("The base pay range is $120,000 - $150,000 per year.")).toEqual({
            min: 120000, max: 150000, currency: "USD", period: "year",
        });
    });

    it("parses k-suffixed and 'to' ranges", () => {
        expect(extractSalary("Salary: $95k to $130k")).toMatchObject({min: 95000, max: 130000});
        expect(extractSalary("£45,000–£55,000")).toMatchObject({min: 45000, max: 55000, currency: "GBP"});
    });

    it("parses hourly ranges", () => {
        expect(extractSalary("Pay: $25.00 - $32.50 per hour")).toEqual({min: 25, max: 32.5, currency: "USD", period: "hour"});
        expect(extractSalary("$40-$55/hr")).toMatchObject({period: "hour"});
    });

    it("skips implausible ranges and keeps looking", () => {
        // A $1-$5 match isn't a salary; the real one follows.
        expect(extractSalary("Raise $1 - $5 for charity. Range: $110,000 - $140,000")).toMatchObject({min: 110000});
        expect(extractSalary("$10,000 - $900,000")).toBeNull();
    });

    it("returns null when there is no range", () => {
        expect(extractSalary("Competitive salary and 401(k) match")).toBeNull();
    });
});

describe("formatSalary", () => {
    it("formats compactly", () => {
        expect(formatSalary({min: 120000, max: 150000, currency: "USD", period: "year"})).toBe("$120k – $150k / yr");
        expect(formatSalary({min: 92500, max: 92500, currency: "EUR", period: "year"})).toBe("€92.5k / yr");
        expect(formatSalary({min: 25, max: 32.5, currency: "USD", period: "hour"})).toBe("$25 – $32.50 / hr");
    });
});

describe("annualMidpoint", () => {
    it("annualises hourly pay", () => {
        expect(annualMidpoint({min: 100000, max: 140000, currency: "USD", period: "year"})).toBe(120000);
        expect(annualMidpoint({min: 50, max: 50, currency: "USD", period: "hour"})).toBe(104000);
    });
});
