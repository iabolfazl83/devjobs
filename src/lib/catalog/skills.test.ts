import {describe, expect, it} from "vitest";
import {extractSkills, skillLabel} from "@/lib/catalog/skills";

describe("extractSkills", () => {
    it("finds common skills and orders them by mentions", () => {
        const {skills} = extractSkills("We use TypeScript and React. TypeScript everywhere, plus AWS and Docker.");
        expect(skills[0]).toBe("typescript");
        expect(skills).toEqual(expect.arrayContaining(["react", "aws", "docker"]));
    });

    it("tells Java from JavaScript and React from React Native", () => {
        expect(extractSkills("JavaScript only").skills).toEqual(["javascript"]);
        expect(extractSkills("React Native apps").skills).toEqual(["react-native"]);
    });

    it("avoids English-word false positives", () => {
        const {skills} = extractSkills("Go to market quickly. We react fast, rust never sleeps, and spring is lovely.");
        expect(skills).toEqual([]);
    });

    it("recognises Go in a language list", () => {
        expect(extractSkills("Experience with Java, Go, or Python").skills).toContain("go");
        expect(extractSkills("Golang microservices").skills).toContain("go");
    });

    it("ignores EEO accessibility boilerplate but keeps real a11y work", () => {
        expect(extractSkills("We provide accessibility accommodations on request.").skills).not.toContain("accessibility");
        expect(extractSkills("Build to WCAG 2.2 AA.").skills).toContain("accessibility");
    });

    it("does not list the employer's own product as a skill", () => {
        expect(extractSkills("Salesforce admins welcome", "Salesforce").skills).not.toContain("salesforce");
        expect(extractSkills("Salesforce admins welcome", "Acme").skills).toContain("salesforce");
    });

    it("counts hard skills as tech evidence but not soft ones", () => {
        expect(extractSkills("Agile, Scrum and SAP").techEvidence).toBe(0);
        expect(extractSkills("Python, SQL and Kubernetes").techEvidence).toBe(3);
    });

    it("respects the limit", () => {
        const text = "Python Java Kotlin Rust C++ C# Ruby PHP Scala SQL TypeScript JavaScript";
        expect(extractSkills(text, "", 5).skills).toHaveLength(5);
    });
});

describe("skillLabel", () => {
    it("maps ids to labels and passes unknown ids through", () => {
        expect(skillLabel("cpp")).toBe("C++");
        expect(skillLabel("not-a-skill")).toBe("not-a-skill");
    });
});
