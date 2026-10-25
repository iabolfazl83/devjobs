import {expect, test} from "@playwright/test";

test("landing page is server-rendered with real catalog stats", async ({page}) => {
    await page.goto("");
    await expect(page.getByRole("heading", {level: 1})).toContainText("fits your stack");
    // Stats are baked in at build time — present in the HTML, no client fetch needed.
    const html = await (await page.request.get("")).text();
    expect(html).toContain("Open roles");
    await expect(page.getByRole("heading", {name: "Latest openings"})).toBeVisible();
});

test("hero search goes to /jobs with the query in the URL", async ({page}) => {
    await page.goto("");
    await page.getByPlaceholder("Job title, skill or company").fill("python");
    await page.getByRole("button", {name: "Search jobs"}).click();
    await expect(page).toHaveURL(/\/jobs\/?\?q=python/);
    await expect(page.getByText(/jobs? for “python”/)).toBeVisible();
});

test("job detail pages are static, with structured data", async ({page}) => {
    await page.goto("jobs/?sort=newest");
    const firstJob = page.locator("article h3 a").first();
    const href = await firstJob.getAttribute("href");
    expect(href).toMatch(/\/jobs\/\d+\/?$/);

    const response = await page.request.get(href!);
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toContain('"@type":"JobPosting"');

    await page.goto(href!);
    await expect(page.getByRole("heading", {level: 1})).toBeVisible();
    await expect(page.getByRole("link", {name: /apply on company site/i})).toHaveAttribute("target", "_blank");
    await expect(page.getByRole("heading", {name: "Similar jobs"})).toBeVisible();
});

test("unknown pages render the 404 page", async ({page}) => {
    const response = await page.goto("jobs/1/");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", {name: /doesn't exist/})).toBeVisible();
});
