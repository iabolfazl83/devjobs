import {expect, test} from "@playwright/test";

test("system theme follows the OS preference", async ({browser}) => {
    for (const colorScheme of ["light", "dark"] as const) {
        const page = await (await browser.newContext({colorScheme})).newPage();
        await page.goto("");
        await expect(page.locator("html")).toHaveAttribute("data-theme", colorScheme);
        await page.close();
    }
});

test("a chosen theme persists, and is applied before first paint", async ({page}) => {
    await page.goto("");
    await page.getByRole("button", {name: /^Theme:/}).click();
    await page.getByRole("button", {name: "Dark"}).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    // Capture the attribute at DOMContentLoaded — before React hydrates — to prove there's no flash.
    await page.addInitScript(() => {
        document.addEventListener("DOMContentLoaded", () => {
            (window as unknown as { themeAtLoad: string | null }).themeAtLoad = document.documentElement.getAttribute("data-theme");
        });
    });
    await page.reload();
    expect(await page.evaluate(() => (window as unknown as { themeAtLoad: string | null }).themeAtLoad)).toBe("dark");
});

test("theme can be picked on the settings page", async ({page}) => {
    await page.goto("settings/");
    await page.getByRole("radio", {name: /Light/}).check({force: true});
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.getByRole("radio", {name: /Dark/}).check({force: true});
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
