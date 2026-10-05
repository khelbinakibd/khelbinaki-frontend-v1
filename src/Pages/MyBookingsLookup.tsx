import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { CalendarDays, LoaderCircle, MapPin, Search } from "lucide-react";
import Container from "../Components/Container";
import { formatTime, parseDateKeyForCalendar } from "../Components/TurfDetails/helpers";
import { lookupBookings, lookupErrorMessage, normalizeLookupPhone } from "../lib/bookingLookup";
import type { BookingLookupResponse, PublicBooking } from "../types/api.types";

const statusStyles: Record<PublicBooking["status"], string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};
const paymentLabels: Record<PublicBooking["paymentStatus"], string> = {
  unpaid: "Unpaid", pending: "Pending verification", paid: "Paid", refunded: "Refunded",
};

export default function MyBookingsLookup() {
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<BookingLookupResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const request = useRef<AbortController | null>(null);

  useEffect(() => () => request.current?.abort(), []);

  function changePhone(value: string) {
    request.current?.abort();
    request.current = null;
    setPhone(value);
    setResult(null);
    setError("");
    setLoading(false);
  }

  async function lookup(page = 1) {
    const normalized = normalizeLookupPhone(phone);
    if (!normalized) {
      setResult(null);
      setError("Enter an 11-digit Bangladesh number starting with 01, or its 880 / +880 equivalent.");
      return;
    }
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setError("");
    setLoading(true);
    try {
      const response = await lookupBookings(normalized, page, controller.signal);
      if (request.current === controller) setResult(response);
    } catch (cause) {
      if (!controller.signal.aborted && request.current === controller) setError(lookupErrorMessage(cause));
    } finally {
      if (request.current === controller) setLoading(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);
    void lookup();
  }

  return (
    <main className="min-h-[65vh] bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-12 px-4">
      <Container>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-emerald-700">My Bookings</h1>
          <p className="mt-3 text-gray-600">Enter the phone number used for your booking. No login or account is required.</p>
          <form onSubmit={submit} className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
            <label htmlFor="booking-phone" className="block font-medium text-gray-800">Phone number</label>
            <p id="phone-help" className="mt-1 text-sm text-gray-500">Use 01…, 8801… or +8801…. Spaces, hyphens and parentheses are accepted.</p>
            <div className="mt-3 flex flex-col sm:flex-row gap-3">
              <input id="booking-phone" type="tel" autoComplete="off" maxLength={64}
                value={phone} onChange={event => changePhone(event.target.value)}
                aria-describedby={error ? "phone-help lookup-error" : "phone-help"}
                required placeholder="Enter your booking phone number"
                className="flex-1 min-w-0 rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <button type="submit" disabled={loading} className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? <LoaderCircle size={18} className="animate-spin" /> : <Search size={18} />}
                {loading ? "Looking up…" : "Find bookings"}
              </button>
            </div>
            {error && <p id="lookup-error" role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
          </form>
          <section aria-label="Booking results" aria-busy={loading} className="mt-6">
            <div role="status" aria-live="polite" className="text-gray-600">
              {loading ? "Retrieving your bookings…" : result && (result.meta.totalItems === 0 ? "No bookings found for this phone number. Check the number used when booking." : `${result.meta.totalItems} booking${result.meta.totalItems === 1 ? "" : "s"} found.`)}
            </div>
            <div className="mt-4 space-y-4">
              {result?.bookings.map(booking => {
                const date = parseDateKeyForCalendar(booking.date);
                const location = [booking.venueLocation?.address, booking.venueLocation?.city].filter(Boolean).join(", ");
                return (
                  <article key={booking.bookingId} className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm">
                    <div className="flex flex-wrap justify-between gap-3">
                      <div><h2 className="text-xl font-semibold text-gray-900">{booking.turfName || "Venue unavailable"}</h2>
                        <p className="mt-1 text-gray-600">{booking.facilityName || "Facility unavailable"}</p></div>
                      <span className={`self-start rounded-full px-3 py-1 text-sm font-semibold capitalize ${statusStyles[booking.status]}`}>{booking.status}</span>
                    </div>
                    {location && <p className="mt-3 flex items-start gap-2 text-sm text-gray-600"><MapPin size={17} className="shrink-0" />{location}</p>}
                    <p className="mt-4 flex items-center gap-2 text-gray-800"><CalendarDays size={18} className="shrink-0 text-emerald-600" />
                      {date ? date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : booking.date}
                    </p>
                    <p className="mt-1 text-gray-600">{formatTime(booking.startTime)} – {formatTime(booking.endTime)} <span className="text-sm">(Bangladesh time)</span></p>
                    <p className="mt-4 border-t border-gray-100 pt-3 text-sm text-gray-700">Payment: <span className="font-semibold">{paymentLabels[booking.paymentStatus]}</span></p>
                  </article>
                );
              })}
            </div>
            {result && result.meta.totalPage > 1 && <nav aria-label="Booking pagination" className="mt-6 flex items-center justify-between gap-3">
              <button type="button" disabled={loading || result.meta.currentPage <= 1} onClick={() => void lookup(result.meta.currentPage - 1)} className="rounded-lg border border-emerald-200 bg-white px-4 py-2 text-emerald-700 disabled:opacity-40">Previous</button>
              <span className="text-sm text-gray-600">Page {result.meta.currentPage} of {result.meta.totalPage}</span>
              <button type="button" disabled={loading || result.meta.currentPage >= Math.min(result.meta.totalPage, 1000)} onClick={() => void lookup(result.meta.currentPage + 1)} className="rounded-lg border border-emerald-200 bg-white px-4 py-2 text-emerald-700 disabled:opacity-40">Next</button>
            </nav>}
          </section>
        </div>
      </Container>
    </main>
  );
}
