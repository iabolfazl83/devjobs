import {expect, test} from "@playwright/test";
import {signInAsDemo} from "./helpers";

test("protected pages redirect guests to sign-in and come back afterwards", async ({page}) => {
    await page.goto("tracker/");
    await expect(page).toHaveURL(/\/login\/?\?next=%2Ftracker/);
    await page.getByRole("button", {name: /demo account/i}).click();
    await expect(page).toHaveURL(/\/tracker\/?$/);
    await expect(page.getByRole("heading", {name: "Application tracker"})).toBeVisible();
});

test("sign up → onboarding → dashboard, and the session survives a reload", async ({page}) => {
    await page.goto("signup/");
    await page.getByLabel("Full name").fill("Grace Hopper");
    await page.getByLabel("Email").fill(`grace+${Date.now()}@example.com`);
    await page.getByLabel("Password", {exact: true}).fill("short");
    await page.getByRole("button", {name: "Create account"}).click();
    await expect(page.getByText("Use at least 8 characters.")).toBeVisible();

    await page.getByLabel("Password", {exact: true}).fill("cobol4ever!");
    await page.getByRole("button", {name: "Create account"}).click();
    await expect(page).toHaveURL(/\/onboarding/);

    await page.getByRole("button", {name: /Backend/}).click();
    await page.getByRole("button", {name: "Continue"}).click();
    await page.getByRole("button", {name: "Python"}).click();
    await page.getByRole("button", {name: "Continue"}).click();
    await page.getByRole("button", {name: "Finish"}).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("heading", {name: "Grace Hopper"})).toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", {name: "Grace Hopper"})).toBeVisible();
});

test("wrong credentials get a generic error", async ({page}) => {
    await page.goto("login/");
    await page.getByLabel("Email").fill("nobody@example.com");
    await page.getByLabel("Password", {exact: true}).fill("whatever123");
    await page.getByRole("button", {name: "Sign in", exact: true}).click();
    // Filter: Next.js's route announcer is also role="alert".
    await expect(page.getByRole("alert").filter({hasText: "don't match an account"})).toBeVisible();
});

test("a guest's save survives the trip through sign-in", async ({page}) => {
    await page.goto("jobs/?sort=newest");
    const card = page.locator("article").first();
    const title = (await card.locator("h3").textContent())!.trim();
    await card.getByRole("button", {name: /^Save /}).click();

    await expect(page).toHaveURL(/\/login\/?\?next=.*save=\d+/);
    await page.getByRole("button", {name: /demo account/i}).click();
    await expect(page).toHaveURL(/\/jobs/);

    await page.goto("tracker/");
    await expect(page.getByRole("region", {name: "Saved"}).getByText(title)).toBeVisible();
});

test("signing out from the account menu", async ({page}) => {
    await signInAsDemo(page);
    await page.getByRole("button", {name: /account menu/}).click();
    await page.getByRole("button", {name: "Sign out"}).click();
    await expect(page.getByRole("link", {name: "Get started"})).toBeVisible();
});
