import { useMemo } from "react";
import { sanitizeHtml, toEditorHtml } from "../utils/richText";

export default function RichTextContent({ html }: { html: string | null }) {
  const safe = useMemo(() => sanitizeHtml(toEditorHtml(html)), [html]);
  return <div className="rich-content" dangerouslySetInnerHTML={{ __html: safe }} />;
}