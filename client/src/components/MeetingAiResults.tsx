import type { Meeting } from "../types/meeting";
import EditableRichText from "./EditableRichText";

function ListCard({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <section className="result-card">
      <h3>{title}</h3>
      {items.length === 0 ? (
        <p className="muted">{empty}</p>
      ) : (
        <ul>
          {items.map((text, i) => (
            <li key={i}>{text}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

interface Props {
  meeting: Meeting;
  onSaveSummary: (html: string | null) => Promise<void>;
}

export default function MeetingAiResults({ meeting, onSaveSummary }: Props) {
  return (
    <div className="results-grid">
     <div className="result-wide">
  <div className="summary-heading">
    <span className="summary-icon">✦</span>
    <h2>Meeting Summary</h2>
  </div>

  <EditableRichText
    title=""
    html={meeting.summary}
    emptyText="No summary available."
    placeholder="Write the meeting summary..."
    onSave={onSaveSummary}
  />
</div>

      {meeting.purpose && (
        <section className="result-card result-wide">
          <h3>Purpose</h3>
          <p>{meeting.purpose}</p>
        </section>
      )}

      <ListCard title="Key discussion points" items={meeting.keyPoints} empty="No key points were identified." />
      <ListCard title="Major outcomes" items={meeting.outcomes} empty="No clear outcomes were identified." />
      <ListCard title="Key decisions" items={meeting.decisions} empty="No clear decisions were made in this meeting." />
      <ListCard title="Concerns and risks" items={meeting.risks} empty="No concerns were raised." />
      <ListCard title="Next steps" items={meeting.nextSteps} empty="No next steps were identified." />
      <ListCard title="Open questions" items={meeting.openQuestions} empty="No unanswered questions." />
    </div>
  );
}