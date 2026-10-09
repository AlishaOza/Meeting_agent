import axios from "axios";

const FALLBACK = "Something went wrong. Please try again.";

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED") {
      return "The request took too long. Please try again.";
    }
    if (!error.response) {
      return "Unable to reach the server. Please check your connection and try again.";
    }
    const { status, data } = error.response;
    if (status === 401) return "Invalid email or password.";
    if (status === 429) return "Too many attempts. Please wait a moment and try again.";
    if (status === 500) return FALLBACK;
    if (data && typeof data.message === "string") return data.message;
  }
  return FALLBACK;
}