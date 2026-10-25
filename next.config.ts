import type {NextConfig} from "next";

/**
 * GitHub Pages serves this repo from https://<user>.github.io/devjobs/, so the
 * deploy workflow sets NEXT_PUBLIC_BASE_PATH=/devjobs. Locally it's empty and the
 * app runs at the root. NEXT_PUBLIC_* is inlined into client bundles, which is
 * how `withBasePath()` knows the prefix for plain `fetch` calls.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
    // Static HTML export — no Node server at runtime, so it can live on any static host.
    output: "export",
    basePath: basePath || undefined,
    // Emit /jobs/123/index.html instead of /jobs/123.html: works on every static host without rewrites.
    trailingSlash: true,
    // The default image optimizer needs a server; logos are tiny and served from the source CDN.
    images: {unoptimized: true},
    reactCompiler: true,
};

export default nextConfig;
