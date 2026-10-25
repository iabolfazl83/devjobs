import type {Metadata} from "next";
import {ProtectedPage} from "@/components/auth/ProtectedPage";
import {ProfileEditor} from "@/components/profile/ProfileEditor";

export const metadata: Metadata = {title: "Profile & preferences", robots: {index: false}};

export default function ProfilePage() {
    return (
        <ProtectedPage>
            <ProfileEditor/>
        </ProtectedPage>
    );
}
