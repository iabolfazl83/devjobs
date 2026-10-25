"use client";

import {ReactNode} from "react";
import {useRequireAuth} from "@/lib/auth/hooks";
import {Container} from "@/components/layout/Section";
import {Skeleton} from "@/components/ui/Skeleton";

/**
 * Wraps signed-in-only pages. Until the session is known (and while redirecting
 * guests to /login) it renders a skeleton, never a flash of the wrong content.
 */
export function ProtectedPage({children}: { children: ReactNode }) {
    const {status} = useRequireAuth();

    if (status !== "authenticated") {
        return (
            <Container className="py-10" >
                <div aria-busy="true" aria-label="Loading your account" className="space-y-6">
                    <Skeleton className="h-9 w-64"/>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {Array.from({length: 4}, (_, index) => <Skeleton key={index} className="h-28 rounded-2xl"/>)}
                    </div>
                    <Skeleton className="h-72 rounded-2xl"/>
                </div>
            </Container>
        );
    }
    return <>{children}</>;
}
