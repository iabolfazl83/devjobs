import {defineConfig, devices} from "@playwright/test";

/**
 * End-to-end tests run against the real static export (out/), served under the
 * same base path GitHub Pages uses — so they test what actually ships.
 * Build first: `NEXT_PUBLIC_BASE_PATH=/devjobs npm run build`.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/devjobs";
const port = Number(process.env.E2E_PORT ?? 4173);

export default defineConfig({
    testDir: "e2e",
    fullyParallel: true,
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI ? [["github"], ["html", {open: "never"}]] : "list",
    use: {
        baseURL: `http://localhost:${port}${basePath}/`,
        trace: "retain-on-failure",
    },
    projects: [
        {name: "desktop", use: {...devices["Desktop Chrome"], viewport: {width: 1440, height: 900}}, testIgnore: /mobile\.spec\.ts/},
        {name: "mobile", use: {...devices["Pixel 7"]}, testMatch: /mobile\.spec\.ts/},
    ],
    webServer: {
        command: "node scripts/serve-static.mjs",
        env: {NEXT_PUBLIC_BASE_PATH: basePath, PORT: String(port)},
        url: `http://localhost:${port}${basePath}/`,
        reuseExistingServer: !process.env.CI,
    },
});
