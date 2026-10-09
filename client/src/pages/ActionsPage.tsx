import { useEffect, useMemo, useState } from "react";
import ActionItemsTable from "../components/ActionItemsTable";
import ConfirmDialog from "../components/ConfirmDialog";
import { useDebounce } from "../hooks/useDebounce";
import { deleteActionRequest, getAllActionsRequest, updateActionRequest } from "../services/meetingService";
import { ACTION_PRIORITIES, ACTION_STATUSES, type ActionItem } from "../types/meeting";
import { isOverdue, localDateString } from "../utils/actionUtils";
import { describeError } from "../utils/describeError";
import "../styles/auth.css";
import "../styles/meeting.css";
import "../styles/meetings-list.css";

type DueFilter = "all" | "overdue" | "today" | "week" | "none";

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return localDateString(d);
}

export default function ActionsPage() {
  const [items, setItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput.trim().toLowerCase(), 300);
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [owner, setOwner] = useState("");
  const [due, setDue] = useState<DueFilter>("all");

  const [toDelete, setToDelete] = useState<ActionItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    getAllActionsRequest()
      .then((data) => !cancelled && setItems(data))
      .catch((err) => !cancelled && setError(describeError(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [reloadKey]);

  const owners = useMemo(() => Array.from(new Set(items.map((i) => i.owner))).sort(), [items]);

  const filtered = useMemo(() => {
    const today = localDateString();
    const weekEnd = addDays(7);
    return items.filter((a) => {
      if (status && a.status !== status) return false;
      if (priority && a.priority !== priority) return false;
      if (owner && a.owner !== owner) return false;
      if (search && !`${a.description} ${a.owner} ${a.meetingTitle ?? ""}`.toLowerCase().includes(search)) return false;
      if (due === "overdue" && !isOverdue(a)) return false;
      if (due === "today" && a.dueDate !== today) return false;
      if (due === "week" && !(a.dueDate && a.dueDate >= today && a.dueDate <= weekEnd)) return false;
      if (due === "none" && a.dueDate) return false;
      return true;
    });
  }, [items, search, status, priority, owner, due]);

  const hasFilters = Boolean(searchInput || status || priority || owner || due !== "all");
  const clearFilters = () => {
    setSearchInput(""); setStatus(""); setPriority(""); setOwner(""); setDue("all");
  };

 const handleChange = async (id: string, patch: Partial<ActionItem>) => {
  const previous = items;

  setItems((list) =>
    list.map((a) => (a.id === id ? { ...a, ...patch } : a))
  );

  try {
    await updateActionRequest(id, {
      ...patch,
      owner: patch.owner ?? undefined,
    });
  } catch (err) {
    setItems(previous);
    setError(describeError(err));
  }
};

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteActionRequest(toDelete.id);
      setItems((l) => l.filter((a) => a.id !== toDelete.id));
      setToDelete(null);
    } catch (err) {
      setDeleteError(describeError(err));
    } finally {
      setDeleting(false);
    }
  };

  const overdueCount = items.filter(isOverdue).length;

  return (
    <div className="meetings-page">
      <div className="list-header">
        <div>
          <h1>Action Tracker</h1>
          <p>
            All action items across your meetings.
            {overdueCount > 0 && <strong className="badge-overdue"> {overdueCount} overdue</strong>}
          </p>
        </div>
      </div>

      <div className="filters">
        <input
          type="search"
          className="input"
          placeholder="Search tasks, owners, meetings..."
          aria-label="Search action items"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <select className="input" aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {ACTION_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className="input" aria-label="Filter by priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">All priorities</option>
          {ACTION_PRIORITIES.map((p) => <option key={p}>{p}</option>)}
        </select>
        <select className="input" aria-label="Filter by owner" value={owner} onChange={(e) => setOwner(e.target.value)}>
          <option value="">All owners</option>
          {owners.map((o) => <option key={o}>{o}</option>)}
        </select>
        <select className="input" aria-label="Filter by due date" value={due} onChange={(e) => setDue(e.target.value as DueFilter)}>
          <option value="all">Any due date</option>
          <option value="overdue">Overdue</option>
          <option value="today">Due today</option>
          <option value="week">Due in 7 days</option>
          <option value="none">No due date</option>
        </select>
        {hasFilters && (
          <button type="button" className="btn-secondary btn-small" onClick={clearFilters}>Clear</button>
        )}
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
        <div className="meeting-item skeleton" aria-busy="true" aria-label="Loading action items">
          <div className="sk-line sk-title" />
          <div className="sk-line" />
          <div className="sk-line" />
          <div className="sk-line sk-short" />
        </div>
      ) : !error && items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon" aria-hidden="true">✅</div>
          <h2>No action items yet</h2>
          <p>Run AI analysis on a meeting, or add action items manually from a meeting's page.</p>
        </div>
      ) : !error && filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon" aria-hidden="true">🔍</div>
          <h2>No matching action items</h2>
          <p>Try changing or clearing your filters.</p>
          <button type="button" className="btn-secondary" onClick={clearFilters}>Clear filters</button>
        </div>
      ) : (
        <div className="meeting-card tracker-card">
          <ActionItemsTable items={filtered} showMeeting onChange={handleChange} onDelete={(a) => { setDeleteError(""); setToDelete(a); }} />
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Delete action item?"
        message="This action item will be permanently deleted."
        loading={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}