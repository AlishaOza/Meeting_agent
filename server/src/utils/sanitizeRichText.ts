import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  "p", "br", "h2", "h3", "strong", "em", "s",
  "ul", "ol", "li", "a", "blockquote", "code", "pre", "hr",
];

/** Keeps only the formatting the editor can produce. Everything else is removed. */
export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: { a: ["href", "target", "rel"] },
    allowedSchemes: ["http", "https", "mailto"],
    allowProtocolRelative: false,
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        target: "_blank",
        rel: "noopener noreferrer nofollow",
      }),
    },
  }).trim();
}

/** True if the HTML contains real text (not just empty paragraphs). */
export function hasVisibleText(html: string): boolean {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim().length > 0;
}