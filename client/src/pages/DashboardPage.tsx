import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllActionsRequest, getMeetingsRequest } from "../services/meetingService";
import type { ActionItem, Meeting } from "../types/meeting";
import { isOverdue } from "../utils/actionUtils";
import { describeError } from "../utils/describeError";
import { formatDate } from "../utils/formatDate";
import "../styles/auth.css";
import "../styles/meeting.css";
import "../styles/meetings-list.css";

export default function DashboardPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    Promise.all([getMeetingsRequest(), getAllActionsRequest()])
      .then(([m, a]) => {
        if (cancelled) return;
        setMeetings(m);
        setActions(a);
      })
      .catch((err) => !cancelled && setError(describeError(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [reloadKey]);

  const stats = [
    { label: "Total meetings", value: meetings.length, to: "/meetings" },
    { label: "Total action items", value: actions.length, to: "/actions" },
    { label: "Open action items", value: actions.filter((a) => a.status !== "Completed").length, to: "/actions" },
    { label: "Completed", value: actions.filter((a) => a.status === "Completed").length, to: "/actions" },
    { label: "Overdue", value: actions.filter(isOverdue).length, to: "/actions", danger: true },
  ];

  const recent = [...meetings]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  return (
    <div className="meetings-page">
      <div className="list-header">
        <div>
          <h1>Dashboard</h1>
          <p>Your meetings and action items at a glance.</p>
        </div>
        <Link to="/meetings/new" className="btn-primary btn-link">+ New meeting</Link>
      </div>

      {error && (
        <div className="auth-alert error-banner" role="alert">
          <span>{error}</span>
          <button type="button" className="btn-secondary btn-small" onClick={() => setReloadKey((k) => k + 1)}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="stat-grid" aria-busy="true" aria-label="Loading dashboard">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="stat-card skeleton">
              <div className="sk-line sk-title" />
              <div className="sk-line sk-short" />
            </div>
          ))}
        </div>
      ) : (
        !error && (
          <>
            <div className="stat-grid">
              {stats.map((s) => (
                <Link
                  key={s.label}
                  to={s.to}
                  className={`stat-card ${s.danger && s.value > 0 ? "stat-danger" : ""}`}
                >
                  <span className="stat-value">{s.value}</span>
                  <span className="stat-label">{s.label}</span>
                </Link>
              ))}
            </div>

            <section className="meeting-card detail-section">
              <h2>Recent meetings</h2>
              {recent.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon" aria-hidden="true">📝</div>
                  <h2>No meetings yet</h2>
                  <p>Create your first meeting and paste a transcript to get started.</p>
                  <Link to="/meetings/new" className="btn-primary btn-link">Create meeting</Link>
                </div>
              ) : (
                <ul className="recent-list">
                  {recent.map((m) => (
                    <li key={m.id}>
                      <Link to={`/meetings/${m.id}`}>{m.title}</Link>
                      <span className="muted">{formatDate(m.meetingDate)} · {m.type}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )
      )}
    </div>
  );
}