import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import Link from "next/link";

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
        <header>
            <nav>
                <ul className="flex justify-center gap-6 px-4 py-2">
                    <li className="hover:opacity-50 duration-200">
                        <Link href="/">Home</Link>
                    </li>
                    <li className="hover:opacity-50 duration-200">
                        <Link href="/about">About</Link>
                    </li>
                </ul>
            </nav>
        </header>
        {children}
        </body>
        </html>
    );
}
