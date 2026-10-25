"use client";

import Link from "next/link";
import {FormEvent, useState} from "react";
import {Field, Input} from "@/components/ui/Field";
import {Button} from "@/components/ui/Button";
import {Spinner} from "@/components/ui/Skeleton";
import {PasswordInput} from "@/components/auth/PasswordInput";
import {useAuthRedirect} from "@/components/auth/useAuthRedirect";
import {signUp} from "@/lib/auth/service";
import {passwordStrength, validateEmail, validateName, validatePassword} from "@/lib/auth/validation";
import {cn} from "@/lib/cn";

type Errors = Partial<Record<"name" | "email" | "password", string>>;

const STRENGTH = [
    {label: "Too weak", className: "bg-danger"},
    {label: "Weak", className: "bg-danger"},
    {label: "Fair", className: "bg-warning"},
    {label: "Good", className: "bg-success"},
    {label: "Strong", className: "bg-success"},
];

export function SignupForm() {
    const {next, markSubmitted, complete} = useAuthRedirect();
    const [errors, setErrors] = useState<Errors>({});
    const [password, setPassword] = useState("");
    const [pending, setPending] = useState(false);
    const strength = passwordStrength(password);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const input = {name: String(data.get("name")), email: String(data.get("email")), password};

        // Validate everything at once on the client so all errors show together;
        // the service validates again, as a real API would.
        const found: Errors = {
            name: validateName(input.name) ?? undefined,
            email: validateEmail(input.email) ?? undefined,
            password: validatePassword(input.password) ?? undefined,
        };
        if (found.name || found.email || found.password) {
            setErrors(found);
            return;
        }

        setPending(true);
        setErrors({});
        markSubmitted();
        const result = await signUp(input);
        if (result.ok) {
            await complete(result.user, {isNew: true});
        } else {
            setErrors({[result.field ?? "email"]: result.error});
            setPending(false);
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
                <Field label="Full name" error={errors.name}>
                    {(props) => <Input {...props} name="name" autoComplete="name" autoFocus/>}
                </Field>
                <Field label="Email" error={errors.email}>
                    {(props) => <Input {...props} name="email" type="email" autoComplete="email"/>}
                </Field>
                <Field label="Password" error={errors.password} hint="At least 8 characters, with a letter and a number.">
                    {(props) => (
                        <div>
                            <PasswordInput {...props} name="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)}/>
                            {password && (
                                <div className="mt-2 flex items-center gap-2" aria-live="polite">
                                    <div className="flex flex-1 gap-1" aria-hidden>
                                        {[0, 1, 2, 3].map((index) => (
                                            <span key={index} className={cn("h-1 flex-1 rounded-full", index < strength ? STRENGTH[strength].className : "bg-surface-3")}/>
                                        ))}
                                    </div>
                                    <span className="w-16 text-right text-xs text-muted">{STRENGTH[strength].label}</span>
                                </div>
                            )}
                        </div>
                    )}
                </Field>
                <Button type="submit" size="lg" disabled={pending} className="mt-1 w-full">
                    {pending && <Spinner/>}
                    Create account
                </Button>
                <p className="text-xs leading-relaxed text-muted">
                    Demo project: your account is stored only in this browser. Don&apos;t reuse a real password.
                </p>
            </form>
            <p className="text-center text-sm text-muted">
                Already have an account?{" "}
                <Link href={`/login?${new URLSearchParams({next})}`} className="font-medium text-accent hover:underline">Sign in</Link>
            </p>
        </div>
    );
}
