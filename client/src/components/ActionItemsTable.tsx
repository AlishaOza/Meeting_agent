import {
  ACTION_PRIORITIES,
  ACTION_STATUSES,
  type ActionItem,
} from "../types/meeting";

import { isOverdue } from "../utils/actionUtils";

interface Props {
  items: ActionItem[];
  showMeeting?: boolean;
  onChange: (id: string, patch: Partial<ActionItem>) => void;
  onDelete: (item: ActionItem) => void;
}

export default function ActionItemsTable({ items, showMeeting, onChange, onDelete }: Props) {
  return (
    <div className="table-wrap">
      <table className="action-table">
        <thead>
          <tr>
            <th>Task</th>
            {showMeeting && <th>Meeting</th>}
            <th>Owner</th>
            <th>Due date</th>
            <th>Priority</th>
            <th>Status</th>
            <th><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {items.map((a) => (
            <tr key={a.id} className={isOverdue(a) ? "row-overdue" : ""}>
              <td data-label="Task">
                <input
                  className="input"
                  defaultValue={a.description}
                  aria-label="Task description"
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (!v) { e.target.value = a.description; return; }
                    if (v !== a.description) onChange(a.id, { description: v });
                  }}
                />
                {isOverdue(a) && <span className="badge-overdue">Overdue</span>}
              </td>
              {showMeeting && <td data-label="Meeting">{a.meetingTitle ?? "—"}</td>}
              <td data-label="Owner">
                <input
                  className="input"
                  defaultValue={a.owner ?? ""}
                  aria-label="Owner"
                  onBlur={(e) => {
                    const v = e.target.value.trim() || "Unassigned";
                    if (v !== a.owner) onChange(a.id, { owner: v });
                  }}
                />
              </td>
              <td data-label="Due date">
                <input
                  type="date"
                  className="input"
                  value={String(a.dueDate ?? "")}
                  aria-label="Due date"
                  onChange={(e) => onChange(a.id, { dueDate: e.target.value || null })}
                />
                {!a.dueDate && <span className="field-hint">Not specified</span>}
              </td>
              <td data-label="Priority">
                <select
                  className="input"
                  value={a.priority}
                  aria-label="Priority"
                  onChange={(e) => onChange(a.id, { priority: e.target.value as ActionItem["priority"] })}
                >
                  {ACTION_PRIORITIES.map((p) => <option key={p}>{p}</option>)}
                </select>
              </td>
              <td data-label="Status">
                <select
                  className="input"
                  value={a.status}
                  aria-label="Status"
                  onChange={(e) => onChange(a.id, { status: e.target.value as ActionItem["status"] })}
                >
                  {ACTION_STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </td>
              <td>
                <button type="button" className="btn-danger-outline btn-small" onClick={() => onDelete(a)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}