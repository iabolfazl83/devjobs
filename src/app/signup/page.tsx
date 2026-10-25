import type {Metadata} from "next";
import {Suspense} from "react";
import {AuthShell} from "@/components/auth/AuthShell";
import {SignupForm} from "@/components/auth/SignupForm";
import {Skeleton} from "@/components/ui/Skeleton";

export const metadata: Metadata = {title: "Create your account", robots: {index: false}};

export default function SignupPage() {
    return (
        <AuthShell title="Create your account" description="Free, takes ten seconds, and unlocks match scores and the tracker.">
            <Suspense fallback={<Skeleton className="h-96 rounded-2xl"/>}>
                <SignupForm/>
            </Suspense>
        </AuthShell>
    );
}
