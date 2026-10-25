import {expect, Page} from "@playwright/test";

export async function signInAsDemo(page: Page, next = "dashboard/") {
    await page.goto(`login/?next=/${next.replace(/\/$/, "")}`);
    await page.getByRole("button", {name: /demo account/i}).click();
    await page.waitForURL(`**/${next}**`);
}

/** The jobs page renders its results on the client; wait until they're in. */
export async function waitForResults(page: Page) {
    await expect(page.getByText(/^\d[\d,]* jobs?/).first()).toBeVisible();
}
