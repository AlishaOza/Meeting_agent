import DOMPurify from "dompurify";

const ALLOWED_TAGS = [
  "p", "br", "h2", "h3", "strong", "em", "s",
  "ul", "ol", "li", "a", "blockquote", "code", "pre", "hr",
];

DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A") {
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener noreferrer nofollow");
  }
});

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR: ["href", "target", "rel"] });
}

const HTML_TAG = /<\/?(p|h[1-6]|ul|ol|li|br|strong|em|a|blockquote)\b/i;

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");


export function toEditorHtml(value: string | null): string {
  if (!value) return "";
  if (HTML_TAG.test(value)) return value;
  return value
    .split(/\n{2,}/)
    .map((para) => `<p>${escapeHtml(para.trim()).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export function isEmptyHtml(html: string): boolean {
  const text = html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
  return text.length === 0;
}