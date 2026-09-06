"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";

export default function Navbar() {
    const currentPath = usePathname();
    console.log(currentPath);
    return (
        <nav>
            <ul className="flex justify-center gap-6 px-4 py-3">
                <li>
                    <Link href="/"
                          className={`${currentPath === "/jobs" ? "text-accent" : "text-text-muted"} hover:text-accent transition-colors`}>
                        Jobs
                    </Link>
                </li>
                <li>
                    <Link href="/about"
                          className={`${currentPath === "/about" ? "text-accent" : "text-text-muted"} hover:text-accent transition-colors`}>
                        About
                    </Link>
                </li>
                <li>
                    <Link href="/saved"
                          className={`${currentPath === "/saved" ? "text-accent" : "text-text-muted"} hover:text-accent transition-colors`}>
                        Saved Jobs
                    </Link>
                </li>
            </ul>
        </nav>
    )
}