import { useState, useRef, useEffect } from "react";
import { IoMdArrowForward } from "react-icons/io";
import { useNavigate } from "react-router";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useQuery } from "@tanstack/react-query";
import type { ApiResponse, Turf } from "../types/api.types";
import api from "../lib/api";
import { toast } from "sonner";

const BookingShort = () => {
  const [selectedTurf, setSelectedTurf] = useState<Turf | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const bookedDates = [new Date(2025, 7, 28), new Date(2025, 7, 30)];
  const isDateDisabled = (day: Date) =>
    bookedDates.some((d) => d.toDateString() === day.toDateString());

  const handleBooking = () => {
    if (!selectedTurf || !date) {
      toast.error("Please select turf and date!");
      return;
    }

    const formattedDate = date.toLocaleDateString("en-CA");
    navigate(`/turfs/${selectedTurf.slug}?date=${formattedDate}`);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const { data } = useQuery({
    queryKey: ["turfs"],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Turf[]>>("/turfs");
      return response.data;
    },
  });

  return (
    <div className="flex justify-center px-4 md:px-2 md:mt-20 relative w-full">
      <div className="h-auto p-6 md:p-4 bg-white/95 backdrop-blur-sm border w-full md:w-auto border-green-200/50 shadow-2xl rounded-2xl md:rounded-[100px] flex flex-col md:flex-row items-stretch md:items-center justify-center gap-5 md:gap-8 md:absolute -top-40 z-10 md:ps-8">
        
        {/* Turf Select */}
        <div className="relative w-full md:w-52 md:border-r-2 md:pr-4" ref={dropdownRef}>
          <h2 className="text-gray-800 font-bold text-sm mb-2 flex items-center gap-2">
            <span className="text-green-600">📍</span>
            Turf Location
          </h2>
          <div className="relative">
            <button
              className="w-full text-left bg-gray-50 hover:bg-gray-100 transition-all duration-200 rounded-xl px-4 py-3 font-semibold text-gray-700 border-2 border-gray-200 hover:border-green-400 flex items-center justify-between shadow-sm"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className="truncate text-gray-600">
                {selectedTurf ? selectedTurf.name : "Select Turf"}
              </span>
              <svg
                className={`w-5 h-5 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <ul className="absolute mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-20 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                {data?.data?.map((item, index) => (
                  <li key={item.slug}>
                    <button
                      className={`w-full text-left px-4 py-3 hover:bg-green-50 transition-colors duration-150 font-medium text-gray-700 hover:text-green-700 ${
                        index !== 0 ? "border-t border-gray-100" : ""
                      }`}
                      onClick={() => {
                        setSelectedTurf(item);
                        setIsDropdownOpen(false);
                      }}
                    >
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Date Picker */}
        <div className="relative w-full md:w-56">
          <h2 className="text-gray-800 font-bold text-sm mb-2 flex items-center gap-2">
            <span className="text-green-600">📅</span>
            Select Date
          </h2>
          <div className="relative">
            <DatePicker
              selected={date}
              onChange={(d) => setDate(d)}
              minDate={new Date()}
              filterDate={(d) => !isDateDisabled(d)}
              dateFormat="dd MMM yyyy"
              placeholderText="Pick a date"
              className="w-full bg-gray-50 hover:bg-gray-100 transition-all duration-200 rounded-xl px-4 py-3 font-semibold text-gray-600 border-2 border-gray-200 hover:border-green-400 cursor-pointer outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm"
            />
          </div>
        </div>

        {/* Booking Button */}
        <button
          onClick={handleBooking}
          className="bg-gradient-to-r from-green-600 via-green-600 to-green-700 text-white px-8 w-full md:w-auto py-4 md:py-4 rounded-xl md:rounded-full hover:from-green-700 hover:via-green-700 hover:to-green-800 transition-all duration-300 flex justify-center items-center gap-x-2 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] font-bold text-base md:text-lg group"
        >
          Book Now
          <IoMdArrowForward 
            size={22} 
            className="group-hover:translate-x-1 transition-transform duration-200"
          />
        </button>
      </div>
    </div>
  );
};

export default BookingShort;