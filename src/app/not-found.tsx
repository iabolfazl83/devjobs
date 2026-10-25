import {SearchX} from "lucide-react";
import {Container} from "@/components/layout/Section";
import {EmptyState} from "@/components/ui/EmptyState";
import {ButtonLink} from "@/components/ui/Button";

export default function NotFound() {
    return (
        <Container className="py-16">
            <EmptyState
                icon={SearchX}
                title="This page doesn't exist"
                description="If you followed a link to a job, it has probably closed and dropped out of the latest snapshot."
                action={
                    <>
                        <ButtonLink href="/jobs">Browse open jobs</ButtonLink>
                        <ButtonLink href="/" variant="outline">Go home</ButtonLink>
                    </>
                }
            />
        </Container>
    );
}
