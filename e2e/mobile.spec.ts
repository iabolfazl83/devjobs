import {expect, test} from "@playwright/test";
import {waitForResults} from "./helpers";

test("mobile menu opens as a sheet and navigates", async ({page}) => {
    await page.goto("");
    await page.getByRole("button", {name: "Open menu"}).click();
    const sheet = page.getByRole("dialog");
    await sheet.getByRole("link", {name: "Companies"}).click();
    await expect(page).toHaveURL(/\/companies/);
});

test("on mobile, tapping a result opens the full job page (no preview pane)", async ({page}) => {
    await page.goto("jobs/");
    await waitForResults(page);
    await page.locator("article h3 a").first().click();
    await expect(page).toHaveURL(/\/jobs\/\d+\/?$/);
    await expect(page.getByRole("heading", {level: 1})).toBeVisible();
});

test("filters open in a full sheet on mobile", async ({page}) => {
    await page.goto("jobs/");
    await waitForResults(page);
    await page.getByRole("button", {name: /All filters/}).click();
    const sheet = page.getByRole("dialog");
    await sheet.getByRole("checkbox", {name: /Senior/}).check();
    await sheet.getByRole("button", {name: /^Show \d[\d,]* jobs?$/}).click();
    await expect(page).toHaveURL(/level=senior/);
});

test("no horizontal scrolling on key pages", async ({page}) => {
    for (const path of ["", "jobs/", "companies/", "about/"]) {
        await page.goto(path);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow, `/${path} overflows by ${overflow}px`).toBeLessThanOrEqual(0);
    }
});
