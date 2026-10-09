import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import ActionItemList from "../components/ActionItemList";
import MeetingAiResults from "../components/MeetingAiResults";
import EditableRichText from "../components/EditableRichText";
import {
  analyzeMeetingRequest,
  getMeetingActionsRequest,
  getMeetingRequest,
  updateMeetingNotesRequest,
  updateMeetingSummaryRequest,
} from "../services/meetingService";
import type { ActionItem } from "../types/action";
import type { Meeting } from "../types/meeting";
import { formatDate } from "../utils/formatDate";
import { getErrorMessage } from "../utils/getErrorMessage";
import "../styles/auth.css";
import "../styles/meeting.css";
import "../styles/meetings-list.css";
import "../styles/meeting-detail.css";
import "../styles/editor.css";

function describeError(err: unknown): string {
  if (axios.isAxiosError(err) && err.response?.status === 401) {
    return "Your session has expired. Please sign in again.";
  }

  return getErrorMessage(err);
}

export default function MeetingDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    setLoading(true);
    setLoadError("");

    Promise.all([
      getMeetingRequest(id, controller.signal),
      getMeetingActionsRequest(id, controller.signal),
    ])
      .then(([m, a]) => {
        setMeeting(m);
        setActions(a);
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
        setLoadError(describeError(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [id, reloadKey]);

  const handleAnalyze = async () => {
    if (!id || !meeting || analyzing) return;

    if (
      meeting.aiStatus === "COMPLETED" &&
      !window.confirm(
        "Run the analysis again? The previous AI results and AI-generated action items will be replaced. Manually added items are kept.",
      )
    ) {
      return;
    }

    setAnalyzing(true);
    setAnalyzeError("");

    try {
      const result = await analyzeMeetingRequest(id);

      setMeeting(result.meeting);
      setActions(result.actionItems);
    } catch (err) {
      setAnalyzeError(describeError(err));

      getMeetingRequest(id)
        .then(setMeeting)
        .catch(() => undefined);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveSummary = async (html: string | null) => {
    if (!id) return;

    const updated = await updateMeetingSummaryRequest(id, html ?? "");
    setMeeting(updated);
  };

  const handleSaveNotes = async (html: string | null) => {
    if (!id) return;

    const updated = await updateMeetingNotesRequest(id, html ?? "");
    setMeeting(updated);
  };

  if (loading) {
    return (
      <div className="detail-page">
        <div
          className="detail-card skeleton"
          aria-busy="true"
          aria-label="Loading meeting"
        >
          <div className="sk-line sk-title" />
          <div className="sk-line sk-short" />
          <div className="sk-line" />
        </div>
      </div>
    );
  }

  if (loadError || !meeting) {
    return (
      <div className="detail-page">
        <div className="auth-alert error-banner" role="alert">
          <span>{loadError || "Meeting not found."}</span>

          <button
            type="button"
            className="btn-secondary btn-small"
            onClick={() => setReloadKey((k) => k + 1)}
          >
            Retry
          </button>
        </div>

        <Link to="/meetings" className="back-link">
          ← Back to meetings
        </Link>
      </div>
    );
  }

  const serverBusy = meeting.aiStatus === "PROCESSING" && !analyzing;

  const failureMessage =
    analyzeError ||
    (meeting.aiStatus === "FAILED" ? meeting.aiError : "");

  return (
    <div className="detail-page">
      <Link to="/meetings" className="back-link">
        ← Back to meetings
      </Link>

      <div className="detail-card">
        <div className="detail-top">
          <div className="detail-heading">
            <h1>{meeting.title}</h1>

            <div className="detail-meta">
              <span className="type-badge">{meeting.type}</span>

              <span className="meeting-date">
                {formatDate(meeting.meetingDate)}
              </span>
            </div>

            <div className="participant-list">
              {meeting.participants.length === 0 ? (
                <span className="no-participants">
                  No participants
                </span>
              ) : (
                meeting.participants.map((p) => (
                  <span key={p} className="participant-tag">
                    {p}
                  </span>
                ))
              )}
            </div>
          </div>

          <button
            type="button"
            className="btn-primary btn-analyze"
            disabled={analyzing || serverBusy}
            onClick={handleAnalyze}
          >
            {analyzing || serverBusy ? (
              <>
                <span className="spinner" aria-hidden="true" />
                Analyzing...
              </>
            ) : meeting.aiStatus === "COMPLETED" ? (
              "Re-analyze with AI"
            ) : (
              "Analyze with AI"
            )}
          </button>
        </div>
      </div>

      <h2 className="section-title">AI analysis</h2>

      {failureMessage && !analyzing && !serverBusy && (
        <div className="auth-alert error-banner" role="alert">
          <span>{failureMessage}</span>

          <button
            type="button"
            className="btn-secondary btn-small"
            onClick={handleAnalyze}
          >
            Try again
          </button>
        </div>
      )}

      {analyzing || serverBusy ? (
        <div
          className="processing-panel"
          role="status"
          aria-live="polite"
        >
          <span
            className="spinner spinner-lg"
            aria-hidden="true"
          />

          <div>
            <strong>
              {analyzing
                ? "Analyzing the transcript..."
                : "An analysis is already running for this meeting."}
            </strong>

            <p className="muted">
              {analyzing
                ? "This can take up to a minute. You can keep this page open."
                : "Refresh in a moment to see the results."}
            </p>

            {serverBusy && (
              <button
                type="button"
                className="btn-secondary btn-small"
                onClick={() =>
                  setReloadKey((k) => k + 1)
                }
              >
                Refresh
              </button>
            )}
          </div>
        </div>
      ) : meeting.aiStatus === "COMPLETED" ? (
        <>
          {meeting.aiProcessedAt && (
            <p className="muted analyzed-at">
              Analyzed on{" "}
              {new Date(
                meeting.aiProcessedAt,
              ).toLocaleString()}
            </p>
          )}

          <MeetingAiResults
            meeting={meeting}
            onSaveSummary={handleSaveSummary}
          />
        </>
      ) : (
        !failureMessage && (
          <div className="empty-state">
            <div
              className="empty-icon"
              aria-hidden="true"
            >
              ✨
            </div>

            <h2>No AI analysis yet</h2>

            <p>
              Generate a summary, key decisions, risks and
              action items from the transcript.
            </p>

            <button
              type="button"
              className="btn-primary btn-link"
              onClick={handleAnalyze}
            >
              Analyze with AI
            </button>
          </div>
        )
      )}

      <h2 className="section-title">Action items</h2>

      <ActionItemList actions={actions} />

      <div className="notes-block">
        <EditableRichText
          title="Meeting notes"
          html={meeting.notes}
          emptyText="No notes yet. Add your own notes, context or follow-ups."
          placeholder="Write your notes here..."
          allowEmpty
          onSave={handleSaveNotes}
        />
      </div>

      <h2 className="section-title">Transcript</h2>

      <div className="detail-card">
        <button
          type="button"
          className="btn-secondary btn-small"
          onClick={() =>
            setShowTranscript((s) => !s)
          }
          aria-expanded={showTranscript}
        >
          {showTranscript
            ? "Hide transcript"
            : "Show transcript"}
        </button>

        {showTranscript && (
          <pre className="transcript-view">
            {meeting.transcript}
          </pre>
        )}
      </div>
    </div>
  );
}