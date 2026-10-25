"use client";

import {FormEvent, useState} from "react";
import {useSession} from "@/lib/auth/hooks";
import {changePassword, updateAccount, updateProfile} from "@/lib/auth/service";
import {Profile} from "@/lib/auth/types";
import {Container} from "@/components/layout/Section";
import {Card, CardHeader} from "@/components/ui/Card";
import {Field, Input} from "@/components/ui/Field";
import {Button} from "@/components/ui/Button";
import {Avatar} from "@/components/ui/Avatar";
import {Badge} from "@/components/ui/Badge";
import {PasswordInput} from "@/components/auth/PasswordInput";
import {LevelPicker, ModePicker, profileCompleteness, RolePicker, SkillPicker} from "@/components/profile/PreferencePickers";
import {toast} from "@/lib/toast";
import {formatDate} from "@/lib/format";

function AccountForm() {
    const {user} = useSession();
    const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
    const [pending, setPending] = useState(false);
    if (!user) return null;

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!user) return;
        const data = new FormData(event.currentTarget);
        setPending(true);
        const result = await updateAccount(user.id, {name: String(data.get("name")), email: String(data.get("email") ?? user.email)});
        setPending(false);
        if (result.ok) {
            setErrors({});
            toast({title: "Account updated", tone: "success"});
        } else {
            setErrors({[result.field ?? "name"]: result.error});
        }
    }

    return (
        <Card>
            <CardHeader title="Account" description={user.isDemo ? "The demo account's email can't be changed." : "How you sign in."}/>
            <form onSubmit={submit} className="grid gap-4 p-5 sm:grid-cols-2" noValidate>
                <Field label="Name" error={errors.name}>
                    {(props) => <Input {...props} name="name" defaultValue={user.name} autoComplete="name"/>}
                </Field>
                <Field label="Email" error={errors.email}>
                    {(props) => <Input {...props} name="email" type="email" defaultValue={user.email} disabled={user.isDemo} autoComplete="email"/>}
                </Field>
                <div className="sm:col-span-2">
                    <Button type="submit" variant="outline" disabled={pending}>Save account</Button>
                </div>
            </form>
        </Card>
    );
}

function PasswordForm() {
    const {user} = useSession();
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);
    if (!user || user.isDemo) return null;

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!user) return;
        const form = event.currentTarget;
        const data = new FormData(form);
        setPending(true);
        const result = await changePassword(user.id, String(data.get("current")), String(data.get("next")));
        setPending(false);
        if (result.ok) {
            setError(null);
            form.reset();
            toast({title: "Password changed", tone: "success"});
        } else {
            setError(result.error);
        }
    }

    return (
        <Card>
            <CardHeader title="Password"/>
            <form onSubmit={submit} className="grid gap-4 p-5 sm:grid-cols-2" noValidate>
                <Field label="Current password">
                    {(props) => <PasswordInput {...props} name="current" autoComplete="current-password"/>}
                </Field>
                <Field label="New password" error={error} hint="At least 8 characters, with a letter and a number.">
                    {(props) => <PasswordInput {...props} name="next" autoComplete="new-password"/>}
                </Field>
                <div className="sm:col-span-2">
                    <Button type="submit" variant="outline" disabled={pending}>Change password</Button>
                </div>
            </form>
        </Card>
    );
}

export function ProfileEditor() {
    const {user, userId, profile} = useSession();
    const [draft, setDraft] = useState<Profile>(profile);
    const set = (patch: Partial<Profile>) => setDraft((current) => ({...current, ...patch}));
    const dirty = JSON.stringify(draft) !== JSON.stringify(profile);
    const completeness = profileCompleteness(draft);

    if (!user || !userId) return null;

    function save() {
        if (!userId) return;
        updateProfile(userId, draft);
        toast({title: "Preferences saved", description: "Match scores and recommendations are updated.", tone: "success"});
    }

    return (
        <Container className="max-w-4xl py-8 sm:py-10">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <Avatar name={user.name} size="lg"/>
                <div className="min-w-0 flex-1">
                    <h1 className="text-2xl font-semibold tracking-tight">{user.name}</h1>
                    <p className="text-sm text-muted">{draft.headline || "Add a headline below"} · Member since {formatDate(user.createdAt)}</p>
                    {user.isDemo && <Badge tone="accent" className="mt-2">Demo account</Badge>}
                </div>
                <div className="w-full sm:w-56">
                    <div className="flex justify-between text-xs text-muted"><span>Profile strength</span><span className="font-semibold text-foreground">{completeness}%</span></div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-3" role="img" aria-label={`Profile ${completeness}% complete`}>
                        <div className="h-full rounded-full bg-accent transition-[width]" style={{width: `${completeness}%`}}/>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex flex-col gap-6">
                <Card>
                    <CardHeader title="About you" description="Shown on your dashboard."/>
                    <div className="grid gap-4 p-5 sm:grid-cols-2">
                        <Field label="Headline">
                            {(props) => <Input {...props} value={draft.headline} onChange={(event) => set({headline: event.target.value})} placeholder="e.g. Frontend engineer · React & TypeScript" maxLength={80}/>}
                        </Field>
                        <Field label="Location">
                            {(props) => <Input {...props} value={draft.location} onChange={(event) => set({location: event.target.value})} placeholder="City or Remote" maxLength={60}/>}
                        </Field>
                    </div>
                </Card>

                <Card>
                    <CardHeader title="Roles you want" description="Used for recommendations and the role part of your match score."/>
                    <div className="p-5"><RolePicker value={draft.roles} onChange={(roles) => set({roles})}/></div>
                </Card>

                <Card>
                    <CardHeader title="Skills" description={`${draft.skills.length} selected — the biggest factor in your match score.`}/>
                    <div className="p-5"><SkillPicker value={draft.skills} onChange={(skills) => set({skills})}/></div>
                </Card>

                <Card>
                    <CardHeader title="Seniority & work style"/>
                    <div className="flex flex-col gap-5 p-5">
                        <div>
                            <p className="mb-2 text-sm font-medium">Experience level</p>
                            <LevelPicker value={draft.seniority} onChange={(seniority) => set({seniority})}/>
                        </div>
                        <div>
                            <p className="mb-2 text-sm font-medium">Work mode</p>
                            <ModePicker value={draft.workModes} onChange={(workModes) => set({workModes})}/>
                        </div>
                    </div>
                </Card>

                <AccountForm/>
                <PasswordForm/>
            </div>

            {/* Sticky save bar appears only when there are unsaved changes. */}
            {dirty && (
                <div className="sticky bottom-4 z-30 mt-6 flex animate-slide-up items-center justify-between gap-3 rounded-2xl border border-border bg-surface/95 p-3 pl-5 shadow-raised backdrop-blur">
                    <p className="text-sm font-medium">You have unsaved changes</p>
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => setDraft(profile)}>Discard</Button>
                        <Button onClick={save}>Save preferences</Button>
                    </div>
                </div>
            )}
        </Container>
    );
}
