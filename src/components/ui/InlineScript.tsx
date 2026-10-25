/**
 * A script that runs while the HTML is parsed (hard navigations only).
 * `text/plain` on the client stops React from warning about — or re-running —
 * the script on soft navigations; suppressHydrationWarning covers the type mismatch.
 * Pattern from the Next.js "Preventing flash before hydration" guide.
 */
export function InlineScript({html}: { html: string }) {
    return (
        <script
            type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
            suppressHydrationWarning
            dangerouslySetInnerHTML={{__html: html}}
        />
    );
}
