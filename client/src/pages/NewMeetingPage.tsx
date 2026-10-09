
import {
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  useEffect,
} from "react";

import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

import ParticipantsInput from "../components/ParticipantsInput";

import {
  createMeetingRequest,
  getMeetingRequest,
  updateMeetingRequest,
  createMeetingWithFileRequest,
} from "../services/meetingService";

import { MEETING_TYPES, type MeetingType } from "../types/meeting";
import { getErrorMessage } from "../utils/getErrorMessage";

import "../styles/auth.css";
import "../styles/meeting.css";

interface FormValues {
  title: string;
  meetingDate: string;
  type: MeetingType;
  participants: string[];
  transcript: string;
}

type FieldErrors = Partial<Record<keyof FormValues, string>>;

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_TITLE_LENGTH = 150;

const ALLOWED_EXTENSIONS = [".txt", ".pdf", ".docx"];

function today(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${d.getFullYear()}-${month}-${day}`;
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const d = new Date(value);

  return (
    !Number.isNaN(d.getTime()) &&
    d.toISOString().slice(0, 10) === value
  );
}

function validate(
  values: FormValues,
  selectedFile: File | null,
): FieldErrors {
  const errors: FieldErrors = {};
  const title = values.title.trim();

  if (!title) {
    errors.title = "Meeting title is required.";
  } else if (title.length > MAX_TITLE_LENGTH) {
    errors.title = `Title must be ${MAX_TITLE_LENGTH} characters or fewer.`;
  }

  if (!values.meetingDate) {
    errors.meetingDate = "Meeting date is required.";
  } else if (!isValidDate(values.meetingDate)) {
    errors.meetingDate = "Enter a valid date.";
  }

  if (!MEETING_TYPES.includes(values.type)) {
    errors.type = "Select a meeting type.";
  }

  if (!values.transcript.trim() && !selectedFile) {
    errors.transcript =
      "Please enter a transcript or upload a meeting file.";
  }

  if (selectedFile) {
    const extension = selectedFile.name
      .substring(selectedFile.name.lastIndexOf("."))
      .toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      errors.transcript =
        "Only TXT, PDF, and DOCX files are supported.";
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      errors.transcript =
        "File is too large. Maximum size is 10 MB.";
    }
  }

  return errors;
}

export default function NewMeetingPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const isEditMode = Boolean(id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [values, setValues] = useState<FormValues>({
    title: "",
    meetingDate: today(),
    type: "Project Meeting",
    participants: [],
    transcript: "",
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const setField = <K extends keyof FormValues>(
    field: K,
    value: FormValues[K],
  ) => {
    setValues((previous) => ({
      ...previous,
      [field]: value,
    }));

    setFieldErrors((previous) => ({
      ...previous,
      [field]: undefined,
    }));
  };

  useEffect(() => {
    if (!id) return;

    const loadMeeting = async () => {
      setLoading(true);

      try {
        const meeting = await getMeetingRequest(id);

        setValues({
          title: meeting.title,
          meetingDate: meeting.meetingDate,
          type: meeting.type,
          participants: meeting.participants ?? [],
          transcript: meeting.transcript ?? "",
        });
      } catch (error) {
        setFormError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    void loadMeeting();
  }, [id]);

  const handleFileChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    const extension = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setSelectedFile(null);
      setFieldErrors((previous) => ({
        ...previous,
        transcript: "Only TXT, PDF, and DOCX files are supported.",
      }));
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      setFieldErrors((previous) => ({
        ...previous,
        transcript: "File is too large. Maximum size is 10 MB.",
      }));
      return;
    }

    if (file.size === 0) {
      setSelectedFile(null);
      setFieldErrors((previous) => ({
        ...previous,
        transcript: "The selected file is empty.",
      }));
      return;
    }

    setSelectedFile(file);
    setFieldErrors((previous) => ({
      ...previous,
      transcript: undefined,
    }));
    setFormError("");

    if (extension === ".txt") {
      try {
        const text = await file.text();

        if (!text.trim()) {
          setSelectedFile(null);
          setFieldErrors((previous) => ({
            ...previous,
            transcript: "The selected file contains no readable text.",
          }));
          return;
        }

        setField("transcript", text);
      } catch {
        setSelectedFile(null);
        setFieldErrors((previous) => ({
          ...previous,
          transcript: "Could not read the TXT file. Please try again.",
        }));
      }
    }
  };

  const clearFile = () => {
    setSelectedFile(null);

    setFieldErrors((previous) => ({
      ...previous,
      transcript: undefined,
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setFormError("");

    const errors = validate(values, selectedFile);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) return;

    setLoading(true);

    try {
      const meetingPayload = {
        title: values.title.trim(),
        meetingDate: values.meetingDate,
        type: values.type,
        participants: values.participants,
        transcript: values.transcript.trim(),
      };

      let meeting;

      if (isEditMode) {
        meeting = await updateMeetingRequest(id!, meetingPayload);
      } else if (selectedFile) {
       

        meeting = await createMeetingWithFileRequest(
          meetingPayload,
          selectedFile,
        );
      } else {
        meeting = await createMeetingRequest(meetingPayload);
      }

      navigate(`/meetings/${meeting.id}`, {
        replace: true,
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setFormError("Your session has expired. Please sign in again.");
      } else {
        setFormError(getErrorMessage(error));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="meeting-page">
      <div className="page-header">
        <h1>{isEditMode ? "Edit meeting" : "New meeting"}</h1>
        <p>
          {isEditMode
            ? "Update meeting details and transcript."
            : "Add the meeting details and transcript. AI analysis comes after saving."}
        </p>
      </div>

      <div className="meeting-card">
        {formError && (
          <div className="auth-alert" role="alert">
            {formError}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          noValidate
          className="auth-form"
        >
          <div className="form-group">
            <label htmlFor="title">Meeting title</label>

            <input
              id="title"
              type="text"
              placeholder="e.g. Sprint planning - Q3 roadmap"
              value={values.title}
              disabled={loading}
              maxLength={MAX_TITLE_LENGTH}
              className={fieldErrors.title ? "input input-error" : "input"}
              aria-invalid={!!fieldErrors.title}
              onChange={(event) => setField("title", event.target.value)}
            />

            {fieldErrors.title && (
              <p className="field-error">{fieldErrors.title}</p>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="meetingDate">Meeting date</label>

              <input
                id="meetingDate"
                type="date"
                value={values.meetingDate}
                disabled={loading}
                className={
                  fieldErrors.meetingDate
                    ? "input input-error"
                    : "input"
                }
                aria-invalid={!!fieldErrors.meetingDate}
                onChange={(event) =>
                  setField("meetingDate", event.target.value)
                }
              />

              {fieldErrors.meetingDate && (
                <p className="field-error">
                  {fieldErrors.meetingDate}
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="type">Meeting type</label>

              <select
                id="type"
                value={values.type}
                disabled={loading}
                className={fieldErrors.type ? "input input-error" : "input"}
                aria-invalid={!!fieldErrors.type}
                onChange={(event) =>
                  setField("type", event.target.value as MeetingType)
                }
              >
                {MEETING_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              {fieldErrors.type && (
                <p className="field-error">{fieldErrors.type}</p>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="participants">
              Participants <span className="optional">(optional)</span>
            </label>

            <ParticipantsInput
              id="participants"
              value={values.participants}
              disabled={loading}
              onChange={(next) => setField("participants", next)}
            />

            <p className="field-hint">
              Press Enter or comma after each name.
            </p>
          </div>

          <div className="form-group">
            <div className="label-row">
              <label htmlFor="transcript">Transcript</label>

              <div className="upload-controls">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.pdf,.docx"
                  hidden
                  disabled={loading}
                  onChange={handleFileChange}
                />

                <button
                  type="button"
                  className="btn-secondary btn-small"
                  disabled={loading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload Transcript File
                </button>
              </div>
            </div>

            {selectedFile && (
              <div className="file-badge">
                <span className="file-name" title={selectedFile.name}>
                  Selected file: <strong>{selectedFile.name}</strong>
                </span>

                <button
                  type="button"
                  className="chip-remove"
                  aria-label="Remove uploaded file"
                  disabled={loading}
                  onClick={clearFile}
                >
                  ×
                </button>
              </div>
            )}

            <textarea
              id="transcript"
              rows={12}
              placeholder="Paste the meeting transcript here, or upload a PDF, DOCX, or TXT file."
              value={values.transcript}
              disabled={loading}
              className={
                fieldErrors.transcript
                  ? "input textarea input-error"
                  : "input textarea"
              }
              aria-invalid={!!fieldErrors.transcript}
              onChange={(event) => {
                setField("transcript", event.target.value);
              }}
            />

            {fieldErrors.transcript && (
              <p className="field-error">
                {fieldErrors.transcript}
              </p>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              disabled={loading}
              onClick={() => navigate("/meetings")}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                  ? "Update meeting"
                  : "Create meeting"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
