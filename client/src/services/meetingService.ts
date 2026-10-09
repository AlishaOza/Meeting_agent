import api from "./api";

import type {
  CreateMeetingPayload,
  Meeting,
  MeetingDetail,
} from "../types/meeting";

import type {
  ActionItem,
  NewActionPayload,
} from "../types/action";

export interface AnalyzeResponse {
  meeting: Meeting;
  actionItems: ActionItem[];
}

/* ---------- meetings ---------- */

export async function createMeetingRequest(
  payload: CreateMeetingPayload,
): Promise<Meeting> {
  const { data } = await api.post<Meeting>("/meetings", payload);
  return data;
}


export async function createMeetingWithFileRequest(
  payload: {
    title: string;
    meetingDate: string;
    type: string;
    participants: string[];
    transcript: string;
  },
  file: File,
) {
  const formData = new FormData();

  formData.append("title", payload.title);
  formData.append("meetingDate", payload.meetingDate);
  formData.append("type", payload.type);
  formData.append("participants", JSON.stringify(payload.participants));
  formData.append("transcript", payload.transcript);
  formData.append("file", file, file.name);

  const response = await api.post("/meetings", formData);

  return response.data.meeting ?? response.data;
}


export async function getMeetingsRequest(
  search?: string,
  signal?: AbortSignal,
): Promise<Meeting[]> {
  const { data } = await api.get<Meeting[]>("/meetings", {
    params: search ? { search } : undefined,
    signal,
  });

  return data;
}

export async function getMeetingRequest(
  id: string,
  signal?: AbortSignal,
): Promise<MeetingDetail> {
  const { data } = await api.get<MeetingDetail>(
    `/meetings/${id}`,
    { signal },
  );

  return data;
}

export async function updateMeetingRequest(
  id: string,
  payload: CreateMeetingPayload,
): Promise<Meeting> {
  const { data } = await api.put<Meeting>(
    `/meetings/${id}`,
    payload,
  );

  return data;
}

export async function deleteMeetingRequest(
  id: string,
): Promise<void> {
  await api.delete(`/meetings/${id}`);
}

/* ---------- AI ---------- */

export async function analyzeMeetingRequest(
  id: string,
): Promise<AnalyzeResponse> {
  const { data } = await api.post<AnalyzeResponse>(
    `/meetings/${id}/analyze`,
    undefined,
    {
      timeout: 150_000,
    },
  );

  return data;
}

/* ---------- notes / summary ---------- */

export async function updateMeetingNotesRequest(
  id: string,
  notes: string | null,
): Promise<Meeting> {
  const { data } = await api.put<Meeting>(
    `/meetings/${id}/notes`,
    { notes },
  );

  return data;
}

export async function updateMeetingSummaryRequest(
  id: string,
  summary: string,
): Promise<Meeting> {
  const { data } = await api.put<Meeting>(
    `/meetings/${id}/summary`,
    { summary },
  );

  return data;
}

/* ---------- action items ---------- */

export async function getAllActionsRequest(): Promise<ActionItem[]> {
  const { data } = await api.get<ActionItem[]>("/actions");

  return data;
}

export async function getMeetingActionsRequest(
  meetingId: string,
  signal?: AbortSignal,
): Promise<ActionItem[]> {
  const { data } = await api.get<ActionItem[]>(
    `/meetings/${meetingId}/actions`,
    { signal },
  );

  return data;
}

export async function createActionRequest(
  meetingId: string,
  payload: NewActionPayload,
): Promise<ActionItem> {
  const { data } = await api.post<ActionItem>(
    `/meetings/${meetingId}/actions`,
    payload,
  );

  return data;
}

export async function updateActionRequest(
  id: string,
  patch: Partial<NewActionPayload>,
): Promise<ActionItem> {
  const { data } = await api.patch<ActionItem>(
    `/actions/${id}`,
    patch,
  );

  return data;
}

export async function deleteActionRequest(
  id: string,
): Promise<void> {
  await api.delete(`/actions/${id}`);
}