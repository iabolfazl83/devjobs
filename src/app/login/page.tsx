"use client";

import {useRouter, useSearchParams} from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const from = searchParams.get('from') || '/jobs';

    async function handleLogin() {
        await fetch("/api/login", {method: "POST"});
        router.push(from);
    }

    return (
        <div>
            <h1>Login</h1>
            <button onClick={handleLogin} className="bg-white px-4 py-2 text-black rounded-full hover:cursor-pointer">
                Log in as Test User
            </button>
        </div>
    );
}