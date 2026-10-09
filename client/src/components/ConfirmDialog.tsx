import { useEffect } from "react";

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  error?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  loading = false,
  error,
  onConfirm,
  onCancel,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={() => !loading && onCancel()}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-title" className="modal-title">{title}</h2>
        <p className="modal-message">{message}</p>

        {error && (
          <div className="auth-alert" role="alert">
            {error}
          </div>
        )}

        <div className="modal-actions">
          <button type="button" className="btn-secondary" disabled={loading} onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn-danger" disabled={loading} onClick={onConfirm}>
            {loading ? (
              <>
                <span className="spinner" aria-hidden="true" />
                Deleting...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}