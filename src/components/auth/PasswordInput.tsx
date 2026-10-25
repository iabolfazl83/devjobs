"use client";

import {ComponentProps, useState} from "react";
import {Eye, EyeOff} from "lucide-react";
import {Input} from "@/components/ui/Field";

export function PasswordInput(props: Omit<ComponentProps<"input">, "type">) {
    const [visible, setVisible] = useState(false);
    return (
        <div className="relative">
            <Input {...props} type={visible ? "text" : "password"} className="pr-10"/>
            <button
                type="button"
                onClick={() => setVisible((value) => !value)}
                className="absolute top-1/2 right-1.5 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-foreground"
                aria-label={visible ? "Hide password" : "Show password"}
                aria-pressed={visible}
            >
                {visible ? <EyeOff className="size-4"/> : <Eye className="size-4"/>}
            </button>
        </div>
    );
}
