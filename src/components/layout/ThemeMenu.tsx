"use client";

import {Check, Monitor, Moon, Sun} from "lucide-react";
import {ThemePreference, useTheme} from "@/lib/theme";
import {Popover, PopoverItem} from "@/components/ui/Popover";
import {Button} from "@/components/ui/Button";
import {SegmentedControl} from "@/components/ui/SegmentedControl";

export const THEME_OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
    {value: "light", label: "Light", icon: Sun},
    {value: "dark", label: "Dark", icon: Moon},
    {value: "system", label: "System", icon: Monitor},
];

export function ThemeMenu() {
    const {preference, resolved, setPreference} = useTheme();
    const CurrentIcon = resolved === "dark" ? Moon : Sun;

    return (
        <Popover
            label="Theme"
            className="w-44"
            trigger={(props) => (
                <Button variant="ghost" size="icon" aria-label={`Theme: ${preference}`} title="Change theme" {...props}>
                    <CurrentIcon/>
                </Button>
            )}
        >
            {(close) => THEME_OPTIONS.map(({value, label, icon: Icon}) => (
                <PopoverItem
                    key={value}
                    active={preference === value}
                    aria-pressed={preference === value}
                    onClick={() => {
                        setPreference(value);
                        close();
                    }}
                >
                    <Icon/>
                    <span className="flex-1">{label}</span>
                    {preference === value && <Check/>}
                </PopoverItem>
            ))}
        </Popover>
    );
}

export function ThemeSegmented({className}: { className?: string }) {
    const {preference, setPreference} = useTheme();
    return (
        <SegmentedControl
            label="Theme"
            value={preference}
            onChange={setPreference}
            className={className}
            options={THEME_OPTIONS.map(({value, label, icon: Icon}) => ({value, label, icon: <Icon/>}))}
        />
    );
}
