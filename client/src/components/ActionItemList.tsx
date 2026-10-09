import type { ActionItem } from "../types/action";
import { formatDate } from "../utils/formatDate";

export default function ActionItemList({ actions }: { actions: ActionItem[] }) {
  if (actions.length === 0) {
    return (
      <div className="empty-inline">
        No action items yet. Run the AI analysis to extract them from the transcript.
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="action-table">
        <thead>
          <tr>
            <th>Task</th>
            <th>Owner</th>
            <th>Due date</th>
            <th>Priority</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {actions.map((a) => (
            <tr key={a.id}>
              <td data-label="Task" className="task-cell">
                {a.description}
                {a.aiGenerated && <span className="ai-tag">AI</span>}
              </td>
              <td data-label="Owner">
                {a.owner ?? <span className="muted">Unassigned</span>}
              </td>
              <td data-label="Due date">
                <span>
                  {a.dueDate ? formatDate(a.dueDate) : <span className="muted">Not specified</span>}
                  {a.overdue && <span className="pill pill-overdue">Overdue</span>}
                </span>
              </td>
              <td data-label="Priority">
                <span className={`pill pill-${a.priority.toLowerCase()}`}>{a.priority}</span>
              </td>
              <td data-label="Status">
                <span className={`pill status-${a.status.toLowerCase().replace(" ", "-")}`}>
                  {a.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}