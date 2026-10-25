import {describe, expect, it} from "vitest";
import {hashPassword, verifyPassword} from "@/lib/auth/crypto";
import {passwordStrength, safeNextPath, validateEmail, validateName, validatePassword} from "@/lib/auth/validation";

describe("password hashing", () => {
    it("salts every hash and verifies the right password only", async () => {
        const first = await hashPassword("correct horse 1");
        const second = await hashPassword("correct horse 1");
        expect(first.hash).not.toBe(second.hash);
        expect(first.hash).toMatch(/^[0-9a-f]{64}$/);
        expect(await verifyPassword("correct horse 1", first.hash, first.salt)).toBe(true);
        expect(await verifyPassword("correct horse 2", first.hash, first.salt)).toBe(false);
    });
});

describe("validation", () => {
    it("validates names, emails and passwords", () => {
        expect(validateName(" A ")).not.toBeNull();
        expect(validateName("Ada Lovelace")).toBeNull();
        expect(validateEmail("ada@")).not.toBeNull();
        expect(validateEmail(" Ada@Example.com ")).toBeNull();
        expect(validatePassword("short1")).not.toBeNull();
        expect(validatePassword("longenough")).not.toBeNull();
        expect(validatePassword("longenough1")).toBeNull();
    });

    it("scores password strength", () => {
        expect(passwordStrength("abc")).toBe(0);
        expect(passwordStrength("Abcdefgh1!xyz")).toBe(4);
    });
});

describe("safeNextPath (open-redirect guard)", () => {
    it.each([
        ["/tracker", "/tracker"],
        ["/jobs?q=react", "/jobs?q=react"],
        ["https://evil.example", "/dashboard"],
        ["//evil.example", "/dashboard"],
        ["/\\evil.example", "/dashboard"],
        ["javascript:alert(1)", "/dashboard"],
        [null, "/dashboard"],
    ])("%s → %s", (input, expected) => {
        expect(safeNextPath(input)).toBe(expected);
    });
});
