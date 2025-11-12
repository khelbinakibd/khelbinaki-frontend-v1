import { useMemo, useState } from "react";
import { Calendar as CalendarIcon, ChevronDown, Clock } from "lucide-react";
import { Link } from "react-router";
import Calendar from "./Calendar";
import type { LocalSlot } from "./types";
import { formatTime } from "./helpers";

interface BookingPanelProps {
  isAuthenticated: boolean;
  selectedDate: Date;
  selectedTimeSlot: LocalSlot | null;
  availableSlots: LocalSlot[];
  isAvailabilityLoading: boolean;
  isFormLoading: boolean;
  onDateChange: (date: Date) => void;
  onTimeSlotSelect: (slot: LocalSlot | null) => void;
  onBookingInitiate: () => void;
}

const BookingPanel = ({
  isAuthenticated,
  selectedDate,
  selectedTimeSlot,
  availableSlots,
  isAvailabilityLoading,
  isFormLoading,
  onDateChange,
  onTimeSlotSelect,
  onBookingInitiate,
}: BookingPanelProps) => {
  const [showTimeSlots, setShowTimeSlots] = useState(false);

  const today = useMemo(() => new Date(new Date().setHours(0, 0, 0, 0)), []);

  const handleDateSelect = (date: Date) => {
    onDateChange(date);
    onTimeSlotSelect(null);
    setShowTimeSlots(false);
  };

  const advanceAmount = selectedTimeSlot
    ? Math.ceil(selectedTimeSlot.pricePerSlot * 0.2)
    : 0;

  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 sm:p-8 p-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <CalendarIcon className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Ready to Book?</h3>
          <p className="text-gray-600 mb-6">You must be logged in to make a booking.</p>
          <Link
            to="/auth/login"
            className="inline-block w-full bg-gradient-to-r from-green-600 via-green-700 to-green-800 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:via-green-800 hover:to-green-900 transform hover:scale-105 hover:shadow-xl transition-all duration-300 text-center"
          >
            Log In to Book
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Book Your Slot</h3>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Select Date
        </label>
        <Calendar
          selected={selectedDate}
          onSelect={handleDateSelect}
          className="w-full"
          disabled={(date) => date < today}
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Select Time Slot
          {isAvailabilityLoading && <span className="ml-2 text-xs text-gray-500">(Loading...)</span>}
        </label>
        <div className="relative">
          <button
            onClick={() => setShowTimeSlots((prev) => !prev)}
            className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-green-600 focus:border-green-600 focus:ring-4 focus:ring-green-100 transition-all outline-none"
            disabled={isFormLoading}
            type="button"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700">
                {selectedTimeSlot
                  ? `${formatTime(selectedTimeSlot.startTime)} - ${formatTime(selectedTimeSlot.endTime)}`
                  : "Choose time slot"}
              </span>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform ${showTimeSlots ? "rotate-180" : ""}`}
            />
          </button>

          {showTimeSlots && (
            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {isAvailabilityLoading ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                    Loading availability...
                  </div>
                </div>
              ) : availableSlots.length > 0 ? (
                availableSlots.map((slot) => {
                  let statusText = "";
                  let statusClass = "";

                  if (slot.isTimePassed) {
                    statusText = "(Time Passed)";
                    statusClass = "text-red-500";
                  } else if (slot.isBooked) {
                    statusText = "(Booked)";
                    statusClass = "text-orange-500";
                  } else if (!slot.isAvailable) {
                    statusText = "(Unavailable)";
                    statusClass = "text-gray-500";
                  }

                  return (
                    <button
                      key={`${slot.startTime}-${slot.isAvailable}-${slot.isTimePassed}`}
                      onClick={() => {
                        if (slot.isAvailable) {
                          onTimeSlotSelect(slot);
                          setShowTimeSlots(false);
                        }
                      }}
                      className={`w-full text-left px-4 py-3 border-b border-gray-100 last:border-b-0 transition-colors ${
                        slot.isAvailable ? "hover:bg-green-50 cursor-pointer" : "bg-gray-50 text-gray-400 cursor-not-allowed"
                      }`}
                      disabled={!slot.isAvailable || isFormLoading}
                      type="button"
                    >
                      <div className="flex justify-between items-center">
                        <span className={`font-medium ${slot.isAvailable ? "text-gray-800" : "text-gray-400"}`}>
                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                          {statusText && (
                            <span className={`ml-2 text-xs font-normal ${statusClass}`}>{statusText}</span>
                          )}
                        </span>
                        <span className={`font-bold ${slot.isAvailable ? "text-green-600" : "text-gray-400"}`}>
                          ৳{slot.pricePerSlot}
                        </span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-4 text-center text-gray-500">No slots available for selected date</div>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedTimeSlot && (
        <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200">
          <div className="flex justify-between items-center mb-3">
            <span className="font-medium text-gray-700">Total Amount:</span>
            <span className="text-2xl font-bold text-green-600">৳{selectedTimeSlot.pricePerSlot}</span>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            {formatTime(selectedTimeSlot.startTime)} - {formatTime(selectedTimeSlot.endTime)}
            <span className="ml-2 text-green-600">({selectedDate.toLocaleDateString()})</span>
          </p>
          <div className="pt-3 border-t border-green-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Advance Payment (20%):</span>
              <span className="font-bold text-green-700">৳{advanceAmount}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-600">Full Payment:</span>
              <span className="font-bold text-green-700">৳{selectedTimeSlot.pricePerSlot}</span>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={onBookingInitiate}
        disabled={!selectedTimeSlot || isFormLoading}
        className="w-full bg-gradient-to-r from-green-600 via-green-700 to-green-800 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:via-green-800 hover:to-green-900 transform hover:scale-105 hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none"
        type="button"
      >
        {isFormLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing...
          </div>
        ) : selectedTimeSlot ? (
          "Proceed to Payment"
        ) : (
          "Select Time Slot"
        )}
      </button>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600 text-center mb-3">Need help? Contact us</p>
        <div className="flex justify-center gap-4">
          <button className="p-3 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors" type="button">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
          </button>
          <button className="p-3 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors" type="button">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingPanel;
