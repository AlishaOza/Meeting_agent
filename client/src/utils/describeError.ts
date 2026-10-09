import axios from "axios";
import { getErrorMessage } from "./getErrorMessage";

export function describeError(err: unknown): string {
  if (axios.isAxiosError(err) && err.response?.status === 401) {
    return "Your session has expired. Please sign in again.";
  }
  return getErrorMessage(err);
}