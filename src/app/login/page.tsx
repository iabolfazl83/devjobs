"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const from = searchParams.get('from') || '/jobs';

    async function handleLogin() {
        await fetch("/api/login", { method: "POST" });
        router.push(from);
    }

    return (
        <div className="max-w-sm mx-auto p-6 mt-16">
            <div className="bg-surface border border-border rounded-lg p-6 text-center">
                <h1 className="text-xl font-semibold">Log in</h1>
                <p className="text-text-muted text-sm mt-1">Access your saved jobs.</p>
                <button
                    onClick={handleLogin}
                    className="mt-4 w-full px-4 py-2 rounded-full bg-accent text-background font-medium hover:opacity-90 transition-opacity"
                >
                    Log in as Test User
                </button>
            </div>
        </div>
    );
}