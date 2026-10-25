import {describe, expect, it} from "vitest";
import {classifyRole, classifySeniority, detectWorkMode, refineRole} from "@/lib/catalog/classify";

describe("classifyRole", () => {
    it.each([
        ["Senior Frontend Engineer", "frontend"],
        ["Full Stack Developer (React/Node)", "fullstack"],
        ["Senior Software Engineer- Backend", "backend"],
        ["Staff Machine Learning Engineer - Applied AI", "ml"],
        ["Data Engineer II", "data"],
        ["Senior Site Reliability Engineer", "devops"],
        ["Senior Android Engineer", "mobile"],
        ["Lead UX Designer", "design"],
        ["Cloud Security Architect", "security"],
        ["QA Automation Engineer", "qa"],
        ["Embedded Software Engineer, Satellite Antenna", "embedded"],
        ["IT Support Technician", "it"],
        ["Software Engineer III", "software"],
    ])("classifies %s as %s", (title, role) => {
        expect(classifyRole(title, 3)).toBe(role);
    });

    it("prefers specific roles over generic ones", () => {
        // "Full Stack" must win over "Software Engineer".
        expect(classifyRole("Software Engineer - Full Stack Development", 3)).toBe("fullstack");
    });

    it.each([
        "Retail Associate",
        "Produce Associate",
        "(USA) Tire and Battery Service Advisor",
        "Civil Engineer, Land Development",
        "Mechanical WET CSU Engineer",
        "Prepared Meals and Rotisserie Chicken Associate",
        "Account Manager - Cybersecurity",
        "Product Marketing Manager",
        "CNC Programmer, NX CAM",
    ])("drops non-tech title %s", (title) => {
        expect(classifyRole(title, 5)).toBeNull();
    });

    it("doesn't let hardware titles into software roles", () => {
        expect(classifyRole("Sr. RF Front-End Module Design Engineer", 4)).toBeNull();
        expect(classifyRole("Software Engineer, Electrical Systems", 4)).toBe("software");
    });

    it("needs description evidence for ambiguous titles", () => {
        expect(classifyRole("Research Scientist", 0)).toBeNull();
        expect(classifyRole("Research Scientist", 3)).toBe("ml");
        expect(classifyRole("Product Manager II", 0)).toBeNull();
        expect(classifyRole("Product Manager II", 1)).toBe("product");
        expect(classifyRole("Systems Operations Engineer", 1)).toBeNull();
        expect(classifyRole("Systems Operations Engineer", 4)).toBe("software");
    });
});

describe("refineRole", () => {
    it("infers a specialism from the stack for generic titles", () => {
        expect(refineRole("software", ["react", "typescript", "html-css"])).toBe("frontend");
        expect(refineRole("software", ["java", "spring", "kafka", "postgres"])).toBe("backend");
        expect(refineRole("software", ["react", "nodejs", "postgres", "redux"])).toBe("fullstack");
        expect(refineRole("software", ["swift", "ios", "python"])).toBe("mobile");
        expect(refineRole("software", ["python", "aws"])).toBe("software");
    });

    it("never overrides a specific title", () => {
        expect(refineRole("ml", ["react", "redux", "html-css"])).toBe("ml");
    });
});

describe("classifySeniority", () => {
    it.each([
        ["Software Engineering Intern", "intern"],
        ["Junior Developer", "entry"],
        ["Software Engineer I", "entry"],
        ["Software Engineer II", "mid"],
        ["Sr. Software Engineer", "senior"],
        ["Software Engineer III", "senior"],
        ["Staff Engineer", "lead"],
        ["Principal Product Designer", "lead"],
        ["Director of Engineering", "manager"],
    ] as const)("%s → %s", (title, level) => {
        expect(classifySeniority(title, [], "software")).toBe(level);
    });

    it("doesn't treat product managers as people managers", () => {
        expect(classifySeniority("Senior Product Manager", [], "product")).toBe("senior");
        expect(classifySeniority("IT Manager", [], "it")).toBe("manager");
    });

    it("falls back to the upstream level", () => {
        expect(classifySeniority("Software Engineer", ["Entry Level"], "software")).toBe("entry");
        expect(classifySeniority("Software Engineer", [], "software")).toBe("mid");
    });
});

describe("detectWorkMode", () => {
    it("detects remote from location or title", () => {
        expect(detectWorkMode("Engineer", ["Remote"], "")).toBe("remote");
        expect(detectWorkMode("Engineer (Remote UK)", ["London, United Kingdom"], "")).toBe("remote");
    });

    it("detects hybrid from the description", () => {
        expect(detectWorkMode("Engineer", ["Austin, TX"], "This is a hybrid role, 3 days in office.")).toBe("hybrid");
        expect(detectWorkMode("Engineer", ["Austin, TX"], "Five days on site.")).toBe("onsite");
    });
});
