"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {useQueryClient} from "@tanstack/react-query";
import {Sparkles} from "lucide-react";
import {Button, ButtonSize, ButtonVariant} from "@/components/ui/Button";
import {Spinner} from "@/components/ui/Skeleton";
import {signInAsDemo} from "@/lib/auth/service";
import {jobsIndexQuery} from "@/lib/data/queries";
import {toast} from "@/lib/toast";
import {User} from "@/lib/auth/types";

/** One click into a fully populated account — the fastest way for a reviewer to see everything. */
export function DemoButton({next = "/dashboard", variant = "outline", size = "md", className, children, onStart, onSignedIn}: {
    next?: string;
    variant?: ButtonVariant;
    size?: ButtonSize;
    className?: string;
    children?: React.ReactNode;
    onStart?: () => void;
    /** Overrides the default "go to `next`" behaviour. */
    onSignedIn?: (user: User) => void;
}) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [pending, setPending] = useState(false);

    async function start() {
        setPending(true);
        onStart?.();
        try {
            // The demo tracker is seeded from real listings, so it needs the index.
            const index = await queryClient.fetchQuery(jobsIndexQuery);
            const result = await signInAsDemo(index.jobs);
            if (result.ok) {
                toast({title: `Welcome, ${result.user.name.split(" ")[0]}`, description: "You're exploring the demo account.", tone: "success"});
                if (onSignedIn) onSignedIn(result.user);
                else router.push(next);
            }
        } catch {
            toast({title: "Couldn't start the demo", description: "Check your connection and try again.", tone: "error"});
        } finally {
            setPending(false);
        }
    }

    return (
        <Button variant={variant} size={size} onClick={start} disabled={pending} className={className}>
            {pending ? <Spinner/> : <Sparkles/>}
            {children ?? "Try the demo account"}
        </Button>
    );
}
