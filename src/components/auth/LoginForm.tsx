"use client";

import Link from "next/link";
import {FormEvent, useState} from "react";
import {CircleAlert} from "lucide-react";
import {Field, Input} from "@/components/ui/Field";
import {Button} from "@/components/ui/Button";
import {Spinner} from "@/components/ui/Skeleton";
import {PasswordInput} from "@/components/auth/PasswordInput";
import {DemoButton} from "@/components/auth/DemoButton";
import {useAuthRedirect} from "@/components/auth/useAuthRedirect";
import {signIn} from "@/lib/auth/service";

export function LoginForm() {
    const {next, markSubmitted, complete} = useAuthRedirect();
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setPending(true);
        setError(null);
        markSubmitted();
        const result = await signIn({email: String(data.get("email")), password: String(data.get("password"))});
        if (result.ok) {
            await complete(result.user);
        } else {
            setError(result.error);
            setPending(false);
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <DemoButton variant="soft" size="lg" className="w-full" onStart={markSubmitted} onSignedIn={(user) => complete(user)}>
                Continue with the demo account
            </DemoButton>

            <div className="flex items-center gap-3 text-xs text-muted">
                <span className="h-px flex-1 bg-border"/>or sign in with email<span className="h-px flex-1 bg-border"/>
            </div>

            <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
                {error && (
                    <div role="alert" className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger-soft px-3 py-2.5 text-sm text-danger">
                        <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0"/>
                        {error}
                    </div>
                )}
                <Field label="Email">
                    {(props) => <Input {...props} name="email" type="email" autoComplete="email" required autoFocus/>}
                </Field>
                <Field label="Password">
                    {(props) => <PasswordInput {...props} name="password" autoComplete="current-password" required/>}
                </Field>
                <Button type="submit" size="lg" disabled={pending} className="mt-1 w-full">
                    {pending && <Spinner/>}
                    Sign in
                </Button>
            </form>

            <p className="text-center text-sm text-muted">
                New here?{" "}
                <Link href={`/signup?${new URLSearchParams({next})}`} className="font-medium text-accent hover:underline">Create an account</Link>
            </p>
        </div>
    );
}
