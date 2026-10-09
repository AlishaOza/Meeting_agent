import { useEffect, useState } from "react";
import RichTextEditor from "./RichTextEditor";

interface Props {
  title: string;
  html: string | null | undefined;
  emptyText?: string;
  placeholder?: string;
  allowEmpty?: boolean;
  onSave: (html: string | null) => Promise<void>;
}

export default function EditableRichText({
  title,
  html,
  emptyText = "No content yet.",
  placeholder = "Write something...",
  allowEmpty = false,
  onSave,
}: Props) {
  const [draft, setDraft] = useState<string>(html ?? "");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editing) {
      setDraft(html ?? "");
    }
  }, [html, editing]);

  const handleStartEdit = () => {
    setError("");
    setDraft(html ?? "");
    setEditing(true);
  };

  const handleCancel = () => {
    setDraft(html ?? "");
    setError("");
    setEditing(false);
  };

  const handleSave = async () => {
    const value = draft.trim();

    if (!allowEmpty && !value) {
      setError("This field cannot be empty.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await onSave(value || null);
      setEditing(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save changes.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (value: string): void => {
    setDraft(value);
    setError("");
  };

  return (
    <section className="editable-rich-text">
      <div className="editable-header">
        <h3>{title}</h3>

        {!editing && (
          <button
            type="button"
            className="btn-secondary btn-small"
            onClick={handleStartEdit}
          >
            Edit
          </button>
        )}
      </div>

      {!editing ? (
        <div className="editable-content">
          {html && html.trim() ? (
            <div
              className="rich-text-content"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <p className="muted">{emptyText}</p>
          )}
        </div>
      ) : (
        <div className="editable-editor">
          <RichTextEditor
            initialContent={draft}
            placeholder={placeholder}
            ariaLabel={title}
            disabled={saving}
            onChange={handleChange}
          />

          {error && (
            <div className="auth-alert error-banner" role="alert">
              {error}
            </div>
          )}

          <div className="editable-actions">
            <button
              type="button"
              className="btn-secondary"
              disabled={saving}
              onClick={handleCancel}
            >
              Cancel
            </button>

            <button
              type="button"
              className="btn-primary"
              disabled={saving}
              onClick={handleSave}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}