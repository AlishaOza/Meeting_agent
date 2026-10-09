import { useState, type KeyboardEvent } from "react";

interface Props {
  id: string;
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  hasError?: boolean;
}

const MAX_PARTICIPANTS = 30;
const MAX_NAME_LENGTH = 50;

export default function ParticipantsInput({ id, value, onChange, disabled, hasError }: Props) {
  const [draft, setDraft] = useState("");

  const addDraft = () => {
    const name = draft.trim().replace(/,+$/, "").trim();
    setDraft("");
    if (!name || name.length > MAX_NAME_LENGTH) return;
    if (value.length >= MAX_PARTICIPANTS) return;
    if (value.some((p) => p.toLowerCase() === name.toLowerCase())) return;
    onChange([...value, name]);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addDraft();
    } else if (e.key === "Backspace" && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className={`chips-box ${hasError ? "chips-box-error" : ""} ${disabled ? "chips-box-disabled" : ""}`}>
      {value.map((name) => (
        <span key={name} className="chip">
          {name}
          <button
            type="button"
            className="chip-remove"
            aria-label={`Remove ${name}`}
            disabled={disabled}
            onClick={() => onChange(value.filter((p) => p !== name))}
          >
            ×
          </button>
        </span>
      ))}
      <input
        id={id}
        type="text"
        className="chips-input"
        placeholder={value.length === 0 ? "Type a name, press Enter" : "Add another..."}
        value={draft}
        disabled={disabled}
        maxLength={MAX_NAME_LENGTH}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addDraft}
      />
    </div>
  );
}