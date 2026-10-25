import {expect, test} from "@playwright/test";
import {signInAsDemo} from "./helpers";

test("the demo account arrives with a populated board", async ({page}) => {
    await signInAsDemo(page, "tracker/");
    for (const column of ["Saved", "Applied", "Interviewing", "Offer", "Closed"]) {
        await expect(page.getByRole("region", {name: column}).locator("article").first()).toBeVisible();
    }
});

test("moving a card with the keyboard-accessible menu persists across reloads", async ({page}) => {
    await signInAsDemo(page, "tracker/");
    const saved = page.getByRole("region", {name: "Saved"});
    const card = saved.locator("article").first();
    const title = (await card.locator("h3").textContent())!.trim();

    await card.getByRole("button", {name: `Actions for ${title}`}).click();
    await page.getByRole("button", {name: "Offer"}).click();

    const offer = page.getByRole("region", {name: "Offer"});
    await expect(offer.getByText(title)).toBeVisible();
    await page.reload();
    await expect(page.getByRole("region", {name: "Offer"}).getByText(title)).toBeVisible();
});

test("drag and drop moves a card between columns", async ({page}) => {
    await signInAsDemo(page, "tracker/");
    const card = page.getByRole("region", {name: "Saved"}).locator("article").first();
    const title = (await card.locator("h3").textContent())!.trim();
    await card.dragTo(page.getByRole("region", {name: "Interviewing"}));
    await expect(page.getByRole("region", {name: "Interviewing"}).getByText(title)).toBeVisible();
});

test("notes autosave and removal can be undone", async ({page}) => {
    await signInAsDemo(page, "tracker/");
    const card = page.getByRole("region", {name: "Applied"}).locator("article").first();
    const title = (await card.locator("h3").textContent())!.trim();
    await card.locator("h3 button").click();

    const drawer = page.getByRole("dialog");
    await drawer.getByLabel("Notes").fill("Recruiter: Sam. Follow up Friday.");
    await expect(drawer.getByText("Saved", {exact: true})).toBeVisible();

    await drawer.getByRole("button", {name: "Remove from tracker"}).click();
    await expect(page.getByRole("region", {name: "Applied"}).getByText(title)).toHaveCount(0);
    await page.getByRole("button", {name: "Undo"}).click();
    await expect(page.getByRole("region", {name: "Applied"}).getByText(title)).toBeVisible();

    await page.getByRole("region", {name: "Applied"}).getByText(title).click();
    await expect(page.getByRole("dialog").getByLabel("Notes")).toHaveValue("Recruiter: Sam. Follow up Friday.");
});
