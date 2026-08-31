import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Providers from "@/app/providers";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "jobs",
    description: "practicing nextjs with jobs api",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        >
        <body className="min-h-full flex flex-col">
        <header className="border-b border-border">
            <nav>
                <ul className="flex justify-center gap-6 px-4 py-3">
                    <li>
                        <Link href="/" className="text-text-muted hover:text-accent transition-colors">
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link href="/about" className="text-text-muted hover:text-accent transition-colors">
                            About
                        </Link>
                    </li>
                    <li>
                        <Link href="/jobs" className="text-text-muted hover:text-accent transition-colors">
                            Jobs
                        </Link>
                    </li>
                    <li>
                        <Link href="/saved" className="text-text-muted hover:text-accent transition-colors">
                            Saved Jobs
                        </Link>
                    </li>
                </ul>
            </nav>
        </header>
        <Providers>{children}</Providers>
        </body>
        </html>
    );
}
