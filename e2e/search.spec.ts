import {expect, test} from "@playwright/test";
import {waitForResults} from "./helpers";

function resultCount(text: string | null) {
    return Number((text ?? "").match(/^([\d,]+)/)?.[1].replace(/,/g, ""));
}

test("filters update the URL, the results and the chips — and Back undoes them", async ({page}) => {
    await page.goto("jobs/");
    await waitForResults(page);
    const summary = page.getByText(/^\d[\d,]* jobs?/).first();
    const total = resultCount(await summary.textContent());

    await page.getByRole("button", {name: "Work mode"}).click();
    await page.getByRole("checkbox", {name: /Remote/}).check();
    await expect(page).toHaveURL(/mode=remote/);
    await expect(page.getByRole("button", {name: "Remove filter: Remote"})).toBeVisible();
    const remote = resultCount(await summary.textContent());
    expect(remote).toBeGreaterThan(0);
    expect(remote).toBeLessThan(total);

    await page.goBack();
    await expect(page).not.toHaveURL(/mode=remote/);
    await expect.poll(async () => resultCount(await summary.textContent())).toBe(total);
});

test("typing searches as you type and survives a reload", async ({page}) => {
    await page.goto("jobs/");
    await waitForResults(page);
    await page.getByRole("searchbox", {name: /title, skill or company/i}).fill("engineer");
    await expect(page).toHaveURL(/q=engineer/);
    await page.reload();
    await expect(page.getByRole("searchbox", {name: /title, skill or company/i})).toHaveValue("engineer");
    await expect(page.getByText(/jobs? for “engineer”/)).toBeVisible();
});

test("clicking a result previews it beside the list on desktop", async ({page}) => {
    await page.goto("jobs/?sort=newest");
    await waitForResults(page);
    const second = page.locator("article h3 a").nth(1);
    const title = (await second.textContent())!.trim();
    await second.click();
    await expect(page).toHaveURL(/job=\d+/);
    await expect(page.getByRole("complementary", {name: "Job preview"}).getByRole("heading", {level: 2, name: title})).toBeVisible();
});

test("an impossible combination shows the empty state", async ({page}) => {
    await page.goto("jobs/?q=zzzznotarealjob");
    await expect(page.getByText("No jobs match all of that")).toBeVisible();
    await page.getByRole("button", {name: /clear search/i}).click();
    await waitForResults(page);
});

test("command palette opens with ⌘K and jumps to a page", async ({page}) => {
    await page.goto("");
    // The shortcut listener attaches on hydration; the header's auth buttons appear at the same moment.
    await expect(page.getByRole("link", {name: "Get started"})).toBeVisible();
    await page.keyboard.press("ControlOrMeta+k");
    const input = page.getByRole("combobox", {name: "Search commands"});
    await expect(input).toBeFocused();
    await input.fill("companies");
    // Arrow down to the "Companies" page command, then Enter.
    const option = page.getByRole("option", {name: "Companies", exact: true});
    await expect(option).toBeVisible();
    for (let step = 0; step < 30 && await option.getAttribute("aria-selected") !== "true"; step++) {
        await page.keyboard.press("ArrowDown");
    }
    await expect(option).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/companies\/?$/);
});
