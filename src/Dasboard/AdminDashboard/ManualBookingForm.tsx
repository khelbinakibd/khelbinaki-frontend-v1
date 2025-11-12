/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "../../lib/api";
import Loader from "../../Components/Loader";

const ManualBookingForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [selectedTurf, setSelectedTurf] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Fetch turfs for admin
  const { data: turfs, isLoading: turfsLoading } = useQuery({
    queryKey: ["admin-turfs"],
    queryFn: async () => {
      const res = await api.get("/admin/turfs");
      return res.data.data;
    },
  });

  // Fetch available slots when turf or date changes
  useEffect(() => {
    if (!selectedTurf || !date) return;
    setLoadingSlots(true);
    api
      .get(`/turfs/${selectedTurf}/availability?date=${date}`)
      .then((res) => {
        setAvailableSlots(res.data.data.slots || []);
      })
      .catch(() => {
        setAvailableSlots([]);
      })
      .finally(() => setLoadingSlots(false));
  }, [selectedTurf, date]);

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTurf || !date || !startTime || !endTime) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      await api.post("/admin/bookings", {
        turf: selectedTurf,
        date,
        startTime,
        endTime,
      });
      toast.success("Manual booking created successfully");
      setSelectedTurf("");
      setDate("");
      setStartTime("");
      setEndTime("");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create booking");
    }
  };

  // Helper to get all valid end times based on consecutive availability
  const getAvailableEndTimes = (start: string): string[] => {
    const endTimes: string[] = [];

    const slotMap = new Map(
      availableSlots
        .filter((slot) => slot.isAvailable)
        .map((slot) => [slot.startTime, slot.endTime])
    );

    let currentStart = start;

    while (slotMap.has(currentStart)) {
      const nextEnd = slotMap.get(currentStart);
      if (!nextEnd) break;

      endTimes.push(nextEnd);
      currentStart = nextEnd;
    }

    return endTimes;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8 p-6">
      <h2 className="text-xl font-bold mb-4 text-emerald-700">
        Manual Booking (Offline/Phone)
      </h2>
      <form
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
        onSubmit={handleSubmit}
      >
        {/* Turf Selection */}
        <div>
          <label className="block text-sm font-medium mb-1">Turf</label>
          {turfsLoading ? (
            <Loader />
          ) : (
            <select
              value={selectedTurf}
              onChange={(e) => setSelectedTurf(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:ring-emerald-100 text-sm"
              required
            >
              <option value="">Select Turf</option>
              {turfs?.map((turf: any) => (
                <option key={turf._id} value={turf._id}>
                  {turf.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:ring-emerald-100 text-sm"
            required
          />
        </div>

        {/* Start Time */}
        <div>
          <label className="block text-sm font-medium mb-1">Start Time</label>
          {loadingSlots ? (
            <Loader />
          ) : (
            <select
              value={startTime}
              onChange={(e) => {
                setStartTime(e.target.value);
                setEndTime(""); // reset end time when start time changes
              }}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:ring-emerald-100 text-sm"
              required
            >
              <option value="">Select Start Time</option>
              {availableSlots
                .filter((slot) => slot.isAvailable)
                .map((slot) => (
                  <option key={slot.startTime} value={slot.startTime}>
                    {slot.startTime}
                  </option>
                ))}
            </select>
          )}
        </div>

        {/* End Time */}
        <div>
          <label className="block text-sm font-medium mb-1">End Time</label>
          <select
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:ring-emerald-100 text-sm"
            required
          >
            <option value="">Select End Time</option>
            {startTime &&
              getAvailableEndTimes(startTime).map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
          </select>
        </div>

        {/* Submit Button */}
        <div className="md:col-span-4 mt-4">
          <button
            type="submit"
            className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700"
          >
            Create Manual Booking
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManualBookingForm;
