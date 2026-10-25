"use client";

import {FormEvent, useState} from "react";
import {useRouter} from "next/navigation";
import {Bell, BellRing} from "lucide-react";
import {Button} from "@/components/ui/Button";
import {Dialog} from "@/components/ui/Dialog";
import {Field, Input} from "@/components/ui/Field";
import {currentPath, loginHref, useSession} from "@/lib/auth/hooks";
import {useUserData} from "@/lib/tracker/hooks";
import {tracker} from "@/lib/tracker/store";
import {SearchState, searchKey} from "@/lib/search/params";
import {ROLE_BY_ID, WORK_MODE_LABEL} from "@/lib/catalog/taxonomy";
import {skillLabel} from "@/lib/catalog/skills";
import {toast} from "@/lib/toast";

/** "Remote · Frontend · react" — a sensible default name for a search. */
export function describeSearch(state: SearchState): string {
    const parts = [
        ...state.modes.map((mode) => WORK_MODE_LABEL[mode]),
        ...state.roles.map((role) => ROLE_BY_ID[role].label),
        ...state.skills.map(skillLabel),
        state.q && `“${state.q}”`,
        state.loc && `near ${state.loc}`,
    ].filter(Boolean);
    return parts.length ? parts.slice(0, 4).join(" · ") : "All jobs";
}

export function SaveSearchButton({state}: { state: SearchState }) {
    const {userId} = useSession();
    const {savedSearches} = useUserData();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const key = searchKey(state);
    const existing = savedSearches.find((search) => search.query === key);

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!userId) return;
        const name = String(new FormData(event.currentTarget).get("name") ?? "").trim() || describeSearch(state);
        tracker.saveSearch(userId, name, key);
        setOpen(false);
        toast({
            title: "Search saved",
            description: "New matches will show up on your dashboard.",
            tone: "success",
            action: {label: "Dashboard", onClick: () => router.push("/dashboard")},
        });
    }

    if (existing) {
        return (
            <Button
                variant="soft"
                size="sm"
                onClick={() => {
                    if (!userId) return;
                    tracker.removeSearch(userId, existing.id);
                    toast({title: "Saved search removed", description: existing.name});
                }}
                title="Click to stop tracking this search"
            >
                <BellRing/> Saved search
            </Button>
        );
    }

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                onClick={() => (userId ? setOpen(true) : router.push(loginHref(currentPath())))}
            >
                <Bell/> Save search
            </Button>
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                title="Save this search"
                description="We'll count new matches each time a fresh snapshot lands."
            >
                <form id="save-search" onSubmit={submit} className="flex flex-col gap-4">
                    <Field label="Name">
                        {(props) => <Input {...props} name="name" defaultValue={describeSearch(state)} autoFocus maxLength={60}/>}
                    </Field>
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit">Save search</Button>
                    </div>
                </form>
            </Dialog>
        </>
    );
}
