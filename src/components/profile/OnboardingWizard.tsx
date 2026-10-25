"use client";

import {useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {ArrowLeft, ArrowRight, Check} from "lucide-react";
import {safeNextPath, useSession} from "@/lib/auth/hooks";
import {updateProfile} from "@/lib/auth/service";
import {Profile} from "@/lib/auth/types";
import {Button} from "@/components/ui/Button";
import {Field, Input} from "@/components/ui/Field";
import {LevelPicker, ModePicker, RolePicker, SkillPicker} from "@/components/profile/PreferencePickers";
import {toast} from "@/lib/toast";
import {cn} from "@/lib/cn";

const STEPS = [
    {title: "What kind of roles are you after?", description: "Pick as many as you like — this drives your recommendations."},
    {title: "What's in your toolkit?", description: "We compare these with each job's stack to score your fit."},
    {title: "A few last details", description: "Seniority and work style tune the ranking."},
];

export function OnboardingWizard() {
    const {user, userId, profile} = useSession();
    const router = useRouter();
    const next = safeNextPath(useSearchParams().get("next"));
    const [step, setStep] = useState(0);
    const [draft, setDraft] = useState<Profile>(profile);
    const set = (patch: Partial<Profile>) => setDraft((current) => ({...current, ...patch}));

    function finish(skipped = false) {
        if (!userId) return;
        updateProfile(userId, {...draft, onboarded: true});
        if (!skipped) toast({title: "You're all set", description: "Recommendations are tuned to your profile.", tone: "success"});
        router.replace(next);
    }

    const canContinue = step === 0 ? draft.roles.length > 0 : step === 1 ? draft.skills.length > 0 : true;

    return (
        <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:py-14">
            <p className="text-sm font-medium text-accent">Welcome{user ? `, ${user.name.split(" ")[0]}` : ""} 👋</p>
            <ol className="mt-4 flex gap-2" aria-label="Progress">
                {STEPS.map((item, index) => (
                    <li key={item.title} className="flex-1">
                        <span className={cn("block h-1.5 rounded-full transition-colors", index <= step ? "bg-accent" : "bg-surface-3")}/>
                        <span className="sr-only">Step {index + 1}{index < step ? " (done)" : index === step ? " (current)" : ""}</span>
                    </li>
                ))}
            </ol>

            <div className="mt-8 rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
                <p className="text-xs font-medium text-muted">Step {step + 1} of {STEPS.length}</p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight">{STEPS[step].title}</h1>
                <p className="mt-1.5 text-sm text-muted">{STEPS[step].description}</p>

                <div className="mt-6">
                    {step === 0 && <RolePicker value={draft.roles} onChange={(roles) => set({roles})}/>}
                    {step === 1 && <SkillPicker value={draft.skills} onChange={(skills) => set({skills})}/>}
                    {step === 2 && (
                        <div className="flex flex-col gap-6">
                            <div>
                                <p className="mb-2 text-sm font-medium">Experience level</p>
                                <LevelPicker value={draft.seniority} onChange={(seniority) => set({seniority})}/>
                            </div>
                            <div>
                                <p className="mb-2 text-sm font-medium">Work mode</p>
                                <ModePicker value={draft.workModes} onChange={(workModes) => set({workModes})}/>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field label="Headline" hint="e.g. Backend engineer · Go & Kubernetes">
                                    {(props) => <Input {...props} value={draft.headline} onChange={(event) => set({headline: event.target.value})} maxLength={80}/>}
                                </Field>
                                <Field label="Location">
                                    {(props) => <Input {...props} value={draft.location} onChange={(event) => set({location: event.target.value})} placeholder="City or Remote" maxLength={60}/>}
                                </Field>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-5">
                    {step > 0 ? (
                        <Button variant="ghost" onClick={() => setStep(step - 1)}><ArrowLeft/> Back</Button>
                    ) : (
                        <Button variant="ghost" onClick={() => finish(true)}>Skip for now</Button>
                    )}
                    {step < STEPS.length - 1 ? (
                        <Button onClick={() => setStep(step + 1)} disabled={!canContinue}>Continue <ArrowRight/></Button>
                    ) : (
                        <Button onClick={() => finish()}><Check/> Finish</Button>
                    )}
                </div>
            </div>
        </div>
    );
}
