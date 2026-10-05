import axios from "axios";
import type { BookingLookupResponse } from "../types/api.types";

// No auth interceptors, credentials, refresh attempts, redirects, or request logging.
const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  withCredentials: false,
  headers: { "Content-Type": "application/json" },
});

export function normalizeLookupPhone(phone: string): string | null {
  if (phone.length > 64) return null;
  let compact = phone.replace(/[ \t\r\n()-]/g, "");
  if (/^\+?8801[0-9]{9}$/.test(compact)) compact = `0${compact.replace(/^\+?880/, "")}`;
  return /^01[0-9]{9}$/.test(compact) ? compact : null;
}

export async function lookupBookings(phone: string, page: number, signal: AbortSignal) {
  const response = await publicApi.post<BookingLookupResponse>(
    "/bookings/lookup", { phone }, { params: { page, limit: 10 }, signal },
  );
  return response.data;
}

export function lookupErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 400) return "Please enter a valid Bangladesh phone number.";
    if (error.response?.status === 429) return "Too many lookup attempts. Please wait 15 minutes before trying again.";
    if (error.code === "ECONNABORTED") return "The lookup timed out. Please try again.";
    if (!error.response) return "Unable to connect. Check your connection and try again.";
  }
  return "Unable to retrieve bookings right now. Please try again later.";
}
