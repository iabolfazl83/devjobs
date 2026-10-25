"use client";

import Link from "next/link";
import {ChangeEvent, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import {Check, Download, Monitor, Moon, RotateCcw, Sun, Trash2, Upload} from "lucide-react";
import {ThemePreference, useTheme} from "@/lib/theme";
import {useSession} from "@/lib/auth/hooks";
import {deleteAccount, updateProfile} from "@/lib/auth/service";
import {getUserData, tracker} from "@/lib/tracker/store";
import {parseUserData} from "@/lib/tracker/reducers";
import {EMPTY_USER_DATA} from "@/lib/tracker/types";
import {Container, PageHeader} from "@/components/layout/Section";
import {Card, CardHeader} from "@/components/ui/Card";
import {Button, ButtonLink} from "@/components/ui/Button";
import {Dialog} from "@/components/ui/Dialog";
import {Input} from "@/components/ui/Field";
import {toast} from "@/lib/toast";
import {cn} from "@/lib/cn";

const THEMES: { value: ThemePreference; label: string; description: string; icon: typeof Sun }[] = [
    {value: "light", label: "Light", description: "Bright and crisp", icon: Sun},
    {value: "dark", label: "Dark", description: "Easy on the eyes at night", icon: Moon},
    {value: "system", label: "System", description: "Follows your device", icon: Monitor},
];

/** A tiny fake UI drawn in the theme's own colors, so each option previews itself. */
function ThemePreview({variant}: { variant: "light" | "dark" | "system" }) {
    const pane = (dark: boolean) => (
        <div className={cn("flex h-full flex-1 flex-col gap-1.5 p-2.5", dark ? "bg-[#0a0c11]" : "bg-[#f6f7f9]")}>
            <div className={cn("h-2 w-10 rounded-full", dark ? "bg-[#8b93ff]" : "bg-[#4f46e5]")}/>
            <div className={cn("flex-1 rounded-md border p-1.5", dark ? "border-[#232835] bg-[#11141b]" : "border-[#e3e6ec] bg-white")}>
                <div className={cn("h-1.5 w-3/4 rounded-full", dark ? "bg-[#323949]" : "bg-[#cdd2db]")}/>
                <div className={cn("mt-1 h-1.5 w-1/2 rounded-full", dark ? "bg-[#232835]" : "bg-[#e8ebf0]")}/>
            </div>
        </div>
    );
    return (
        <div aria-hidden className="flex h-24 overflow-hidden rounded-lg border border-border">
            {variant === "light" && pane(false)}
            {variant === "dark" && pane(true)}
            {variant === "system" && <>{pane(false)}{pane(true)}</>}
        </div>
    );
}

function Appearance() {
    const {preference, resolved, setPreference} = useTheme();
    return (
        <Card>
            <CardHeader title="Appearance" description={`Currently showing the ${resolved} theme. Your choice is remembered on this device and synced across tabs.`}/>
            <div role="radiogroup" aria-label="Theme" className="grid gap-3 p-5 sm:grid-cols-3">
                {THEMES.map(({value, label, description, icon: Icon}) => {
                    const selected = preference === value;
                    return (
                        <label
                            key={value}
                            className={cn(
                                "relative cursor-pointer rounded-xl border p-3 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent",
                                selected ? "border-accent ring-3 ring-accent/15" : "border-border hover:border-border-strong",
                            )}
                        >
                            <input type="radio" name="theme" value={value} checked={selected} onChange={() => setPreference(value)} className="sr-only"/>
                            <ThemePreview variant={value}/>
                            <div className="mt-3 flex items-center gap-2">
                                <Icon aria-hidden className="size-4 text-muted"/>
                                <span className="text-sm font-semibold">{label}</span>
                                {selected && <Check aria-hidden className="ml-auto size-4 text-accent"/>}
                            </div>
                            <p className="mt-0.5 text-xs text-muted">{description}</p>
                        </label>
                    );
                })}
            </div>
        </Card>
    );
}

function DataControls() {
    const {user, userId, profile} = useSession();
    const router = useRouter();
    const fileInput = useRef<HTMLInputElement>(null);
    const [confirm, setConfirm] = useState<"reset" | "delete" | null>(null);
    const [typed, setTyped] = useState("");
    if (!user || !userId) return null;
    const uid = userId;

    function exportData() {
        // Credentials are never exported — only the profile and tracker.
        const payload = {format: "devjobs-export", version: 1, exportedAt: new Date().toISOString(), user: {name: user?.name, email: user?.email}, profile, data: getUserData(uid)};
        const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], {type: "application/json"}));
        const link = Object.assign(document.createElement("a"), {href: url, download: `devjobs-export-${new Date().toISOString().slice(0, 10)}.json`});
        link.click();
        URL.revokeObjectURL(url);
        toast({title: "Export downloaded", tone: "success"});
    }

    async function importData(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;
        try {
            const json = JSON.parse(await file.text());
            const data = parseUserData(json?.data);
            if (json?.format !== "devjobs-export" || !data) throw new Error("bad format");
            tracker.replace(uid, data);
            if (json.profile && typeof json.profile === "object") updateProfile(uid, {...profile, ...json.profile});
            toast({title: "Import complete", description: `${Object.keys(data.applications).length} applications restored.`, tone: "success"});
        } catch {
            toast({title: "That file isn't a DevJobs export", tone: "error"});
        }
    }

    return (
        <>
            <Card>
                <CardHeader title="Your data" description="Everything lives in this browser's localStorage. Export it to move devices or keep a backup."/>
                <div className="flex flex-wrap gap-2 p-5">
                    <Button variant="outline" onClick={exportData}><Download/> Export JSON</Button>
                    <Button variant="outline" onClick={() => fileInput.current?.click()}><Upload/> Import JSON</Button>
                    <input ref={fileInput} type="file" accept="application/json,.json" className="sr-only" onChange={importData} tabIndex={-1} aria-hidden/>
                    <Button variant="ghost" onClick={() => setConfirm("reset")}><RotateCcw/> Clear tracker</Button>
                </div>
            </Card>

            <Card className="border-danger/30">
                <CardHeader title="Delete account" description="Removes your account, profile, tracker and saved searches from this browser. This can't be undone."/>
                <div className="p-5">
                    <Button variant="danger" onClick={() => setConfirm("delete")}><Trash2/> Delete account</Button>
                </div>
            </Card>

            <Dialog
                open={confirm !== null}
                onClose={() => {
                    setConfirm(null);
                    setTyped("");
                }}
                title={confirm === "delete" ? "Delete your account?" : "Clear your tracker?"}
                description={confirm === "delete" ? "Type DELETE to confirm." : "All tracked jobs, notes and saved searches will be removed."}
            >
                <div className="flex flex-col gap-4">
                    {confirm === "delete" && (
                        <Input value={typed} onChange={(event) => setTyped(event.target.value)} aria-label="Type DELETE to confirm" autoFocus/>
                    )}
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setConfirm(null)}>Cancel</Button>
                        <Button
                            variant="danger"
                            disabled={confirm === "delete" && typed !== "DELETE"}
                            onClick={async () => {
                                if (confirm === "reset") {
                                    tracker.replace(uid, EMPTY_USER_DATA);
                                    toast({title: "Tracker cleared"});
                                } else {
                                    await deleteAccount(uid);
                                    toast({title: "Account deleted"});
                                    router.push("/");
                                }
                                setConfirm(null);
                                setTyped("");
                            }}
                        >
                            {confirm === "delete" ? "Delete account" : "Clear tracker"}
                        </Button>
                    </div>
                </div>
            </Dialog>
        </>
    );
}

export function SettingsPanel() {
    const {status} = useSession();
    return (
        <>
            <PageHeader title="Settings" description="Appearance, data and account."/>
            <Container className="flex max-w-4xl flex-col gap-6 py-8">
                <Appearance/>
                {status === "authenticated" && <DataControls/>}
                {status === "guest" && (
                    <Card className="p-5 text-sm text-muted">
                        <Link href="/login?next=/settings" className="font-medium text-accent hover:underline">Sign in</Link> to export, import or delete your data.
                        {" "}<ButtonLink href="/signup" variant="ghost" size="sm" className="ml-1">Create account</ButtonLink>
                    </Card>
                )}
            </Container>
        </>
    );
}
