import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog";
import { useDebounce } from "../hooks/useDebounce";
import { deleteMeetingRequest, getMeetingsRequest } from "../services/meetingService";
import type { Meeting } from "../types/meeting";
import { formatDate } from "../utils/formatDate";
import { getErrorMessage } from "../utils/getErrorMessage";
import "../styles/auth.css";
import "../styles/meeting.css";
import "../styles/meetings-list.css";

const MAX_VISIBLE_PARTICIPANTS = 3;

function describeError(err: unknown): string {
  if (axios.isAxiosError(err) && err.response?.status === 401) {
    return "Your session has expired. Please sign in again.";
  }
  return getErrorMessage(err);
}

export default function MeetingsPage() {
  const navigate = useNavigate();

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput.trim(), 400);

  const [toDelete, setToDelete] = useState<Meeting | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    getMeetingsRequest(search, controller.signal)
      .then((data) => setMeetings(data))
      .catch((err) => {
        if (axios.isCancel(err)) return; 
        setError(describeError(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [search, reloadKey]);

  const openDelete = (meeting: Meeting) => {
    setDeleteError("");
    setToDelete(meeting);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteMeetingRequest(toDelete.id);
      setMeetings((prev) => prev.filter((m) => m.id !== toDelete.id));
      setToDelete(null);
    } catch (err) {
      setDeleteError(describeError(err));
    } finally {
      setDeleting(false);
    }
  };

  const isSearching = search.length > 0;

  return (
    <div className="meetings-page">
      <div className="list-header">
        <div>
          <h1>Meetings</h1>
          <p>Browse, search and manage your meeting records.</p>
        </div>
        <Link to="/meetings/new" className="btn-primary btn-link">
          + New meeting
        </Link>
      </div>

      <div className="search-bar">
        <input
          type="search"
          className="input"
          placeholder="Search meetings by title..."
          aria-label="Search meetings"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      {error && (
        <div className="auth-alert error-banner" role="alert">
          <span>{error}</span>
          <button
            type="button"
            className="btn-secondary btn-small"
            onClick={() => setReloadKey((k) => k + 1)}
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="meetings-grid" aria-busy="true" aria-label="Loading meetings">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="meeting-item skeleton">
              <div className="sk-line sk-title" />
              <div className="sk-line sk-short" />
              <div className="sk-line" />
              <div className="sk-line sk-short" />
            </div>
          ))}
        </div>
      ) : !error && meetings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon" aria-hidden="true">{isSearching ? "🔍" : "📝"}</div>
          {isSearching ? (
            <>
              <h2>No meetings found</h2>
              <p>Nothing matches "{search}". Try a different search term.</p>
              <button type="button" className="btn-secondary" onClick={() => setSearchInput("")}>
                Clear search
              </button>
            </>
          ) : (
            <>
              <h2>No meetings yet</h2>
              <p>Create your first meeting and paste a transcript to get started.</p>
              <Link to="/meetings/new" className="btn-primary btn-link">
                Create meeting
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="meetings-grid">
          {meetings.map((m) => {
            const visible = m.participants.slice(0, MAX_VISIBLE_PARTICIPANTS);
            const extra = m.participants.length - visible.length;

            return (
              <article key={m.id} className="meeting-item">
                <div className="meeting-item-top">
                  <h2 className="meeting-title" title={m.title}>{m.title}</h2>
                  <span className="type-badge">{m.type}</span>
                </div>

                <p className="meeting-date">{formatDate(m.meetingDate)}</p>

                <div className="participant-list">
                  {m.participants.length === 0 ? (
                    <span className="no-participants">No participants</span>
                  ) : (
                    <>
                      {visible.map((p) => (
                        <span key={p} className="participant-tag">{p}</span>
                      ))}
                      {extra > 0 && <span className="participant-tag more">+{extra} more</span>}
                    </>
                  )}
                </div>

                <div className="meeting-actions">
                  <button
                    type="button"
                    className="btn-secondary btn-small"
                    onClick={() => navigate(`/meetings/${m.id}`)}
                  >
                    View
                  </button>
                  <button
                    type="button"
                    className="btn-secondary btn-small"
                    onClick={() => navigate(`/meetings/${m.id}/edit`)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn-danger-outline btn-small"
                    onClick={() => openDelete(m)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Delete meeting?"
        message={
          toDelete
            ? `"${toDelete.title}" and its action items will be permanently deleted. This cannot be undone.`
            : ""
        }
        loading={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}