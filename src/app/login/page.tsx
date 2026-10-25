import type {Metadata} from "next";
import {Suspense} from "react";
import {AuthShell} from "@/components/auth/AuthShell";
import {LoginForm} from "@/components/auth/LoginForm";
import {Skeleton} from "@/components/ui/Skeleton";

export const metadata: Metadata = {title: "Sign in", robots: {index: false}};

export default function LoginPage() {
    return (
        <AuthShell title="Welcome back" description="Sign in to see your tracker, saved searches and matches.">
            <Suspense fallback={<Skeleton className="h-80 rounded-2xl"/>}>
                <LoginForm/>
            </Suspense>
        </AuthShell>
    );
}
