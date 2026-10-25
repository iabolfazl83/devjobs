import DOMPurify from "isomorphic-dompurify";

/**
 * Upstream descriptions are third-party HTML. They're sanitized once, at build
 * time, with a strict allow-list — so the browser only ever receives markup we
 * have already cleaned, and `dangerouslySetInnerHTML` is safe to use on it.
 */
const ALLOWED_TAGS = ["p", "br", "ul", "ol", "li", "strong", "b", "em", "i", "u", "h2", "h3", "h4", "a", "blockquote", "table", "thead", "tbody", "tr", "th", "td"];

DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName === "A") {
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noopener noreferrer nofollow");
    }
});

export function sanitizeDescription(html: string): string {
    const demoted = html
        // Pages have their own <h1>; demote any in the description.
        .replace(/<(\/?)h1(\s[^>]*)?>/gi, "<$1h2>")
        .replace(/<(\/?)h[56](\s[^>]*)?>/gi, "<$1h4>");

    return DOMPurify.sanitize(demoted, {ALLOWED_TAGS, ALLOWED_ATTR: ["href"]})
        // Drop empty paragraphs that upstream editors leave behind.
        .replace(/<p>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, "")
        .replace(/(?:<br\s*\/?>\s*){3,}/gi, "<br><br>")
        .trim();
}
