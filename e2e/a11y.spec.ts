import AxeBuilder from "@axe-core/playwright";
import {expect, test} from "@playwright/test";
import {signInAsDemo, waitForResults} from "./helpers";

/**
 * Automated WCAG 2.1 A/AA checks with axe-core, in both themes. Automated tools
 * catch roughly a third of issues, so this is a floor, not a certificate.
 */
const PUBLIC_PAGES = ["", "jobs/", "companies/", "about/", "login/", "signup/", "settings/"];

async function audit(page: import("@playwright/test").Page) {
    const results = await new AxeBuilder({page}).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    const serious = results.violations.filter((violation) => violation.impact === "serious" || violation.impact === "critical");
    expect(serious.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(" ")).slice(0, 3).join(" | ")}`)).toEqual([]);
}

for (const colorScheme of ["light", "dark"] as const) {
    test.describe(`${colorScheme} theme`, () => {
        test.use({colorScheme});

        for (const path of PUBLIC_PAGES) {
            test(`/${path} has no serious accessibility violations`, async ({page}) => {
                await page.goto(path);
                if (path === "jobs/") await waitForResults(page);
                await audit(page);
            });
        }

        test("signed-in pages have no serious accessibility violations", async ({page}) => {
            await signInAsDemo(page);
            await audit(page);
            await page.goto("tracker/");
            await expect(page.getByRole("heading", {name: "Application tracker"})).toBeVisible();
            await audit(page);
            await page.goto("profile/");
            await expect(page.getByRole("heading", {name: "Alex Morgan"})).toBeVisible();
            await audit(page);
        });
    });
}
