import type {Metadata} from "next";
import {SettingsPanel} from "@/components/profile/SettingsPanel";

export const metadata: Metadata = {title: "Settings", robots: {index: false}};

export default function SettingsPage() {
    return <SettingsPanel/>;
}
