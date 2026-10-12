import axios from "axios";
import type { ApiError } from "../types/api.types";

export function maintenanceError(error: unknown) {
  const response = axios.isAxiosError<ApiError>(error) ? error.response : undefined;
  const status = response?.status;
  const fields: Record<string, string> = {};
  for (const issue of response?.data?.errors ?? []) {
    const path = Array.isArray(issue.path) ? issue.path.join(".") : issue.path;
    fields[path] = issue.message;
  }
  const fallback = status === 403 ? "You are not assigned to this turf."
    : status === 401 ? "Please sign in again."
      : status === 409 ? "This interval conflicts with a booking or another maintenance block."
        : "Unable to complete the request. Please try again.";
  return { status, fields, message: response?.data?.message || fallback };
}

export function retryRead(failureCount: number, error: unknown) {
  const status = maintenanceError(error).status;
  return !(status && status >= 400 && status < 500) && failureCount < 2;
}
