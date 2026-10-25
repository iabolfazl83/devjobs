import type {Metadata, Viewport} from "next";
import {GeistSans} from "geist/font/sans";
import {GeistMono} from "geist/font/mono";
import "./globals.css";
import Providers from "@/app/providers";
import {SiteHeader} from "@/components/layout/SiteHeader";
import {SiteFooter} from "@/components/layout/SiteFooter";
import {THEME_INIT_SCRIPT} from "@/lib/theme-script";
import {SITE} from "@/lib/site";

export const metadata: Metadata = {
    metadataBase: new URL(`${SITE.url}/`),
    title: {
        default: `${SITE.name} — tech jobs, tracked`,
        template: `%s · ${SITE.name}`,
    },
    description: SITE.description,
    applicationName: SITE.name,
    openGraph: {
        type: "website",
        siteName: SITE.name,
        title: `${SITE.name} — tech jobs, tracked`,
        description: SITE.description,
    },
    twitter: {card: "summary_large_image"},
};

export const viewport: Viewport = {
    themeColor: [
        {media: "(prefers-color-scheme: light)", color: "#f6f7f9"},
        {media: "(prefers-color-scheme: dark)", color: "#0a0c11"},
    ],
};

export default function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {
    return (
        // The inline theme script sets data-theme before React hydrates, so <html>'s attributes intentionally differ.
        <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
        <head>
            <script dangerouslySetInnerHTML={{__html: THEME_INIT_SCRIPT}}/>
        </head>
        <body className="flex min-h-dvh flex-col font-sans antialiased">
        <a
            href="#main"
            className="sr-only z-50 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
            Skip to content
        </a>
        <Providers>
            <SiteHeader/>
            <main id="main" className="flex-1">{children}</main>
            <SiteFooter/>
        </Providers>
        </body>
        </html>
    );
}
