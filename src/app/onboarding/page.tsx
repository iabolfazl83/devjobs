import type {Metadata} from "next";
import {Suspense} from "react";
import {ProtectedPage} from "@/components/auth/ProtectedPage";
import {OnboardingWizard} from "@/components/profile/OnboardingWizard";

export const metadata: Metadata = {title: "Set up your profile", robots: {index: false}};

export default function OnboardingPage() {
    return (
        <ProtectedPage>
            <Suspense>
                <OnboardingWizard/>
            </Suspense>
        </ProtectedPage>
    );
}
