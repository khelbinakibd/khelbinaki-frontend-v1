import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "../../lib/api";
import Loader from "../../Components/Loader";
import type { AvailabilitySlot, User, Facility } from "../../types/api.types";

const ManualBookingForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [selectedTurf, setSelectedTurf] = useState("");
  const [selectedFacility, setSelectedFacility] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [phone, setPhone] = useState("");
  const [totalPayment, setTotalPayment] = useState<string>("");
  const [advancePayment, setAdvancePayment] = useState<number>(0);
  
  // User search states
  const [searchPhone, setSearchPhone] = useState("");
  const [foundUser, setFoundUser] = useState<User | null>(null);
  const [isSearchingUser, setIsSearchingUser] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [userSearchError, setUserSearchError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  // Fetch turfs for admin
  const { data: turfs, isLoading: turfsLoading } = useQuery({
    queryKey: ["admin-turfs"],
    queryFn: async () => {
      const res = await api.get("/admin/turfs");
      const data = res.data.data;
      // Ensure we always return an array
      return Array.isArray(data) ? data : [];
    },
  });

  // Fetch facilities for selected turf
  const { data: facilities, isLoading: facilitiesLoading } = useQuery({
    queryKey: ["facilities", selectedTurf],
    queryFn: async () => {
      if (!selectedTurf) return [];
      const res = await api.get(`/turfs/${selectedTurf}/facilities`);
      return res.data.data || [];
    },
    enabled: !!selectedTurf,
  });

  // Reset facility when turf changes
  useEffect(() => {
    setSelectedFacility("");
    setDate("");
    setStartTime("");
    setEndTime("");
    setAvailableSlots([]);
  }, [selectedTurf]);

  // Fetch available slots when turf, facility, or date changes
  useEffect(() => {
    if (!selectedTurf || !selectedFacility || !date) return;
    setLoadingSlots(true);
    api
      .get(`/turfs/${selectedTurf}/availability?date=${date}&facility=${selectedFacility}`)
      .then((res) => {
        setAvailableSlots(res.data.data.slots || []);
      })
      .catch(() => {
        setAvailableSlots([]);
      })
      .finally(() => setLoadingSlots(false));
  }, [selectedTurf, selectedFacility, date]);

  // Helper function to validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Function to search user by phone
  const handleSearchUser = async () => {
    if (!searchPhone || searchPhone.length !== 11) {
      toast.error("Please enter a valid 11-digit phone number");
      return;
    }

    setIsSearchingUser(true);
    setUserSearchError(null);
    setFoundUser(null);
    setHasSearched(true);
    // Reset new user fields when searching
    setFirstName("");
    setLastName("");
    setEmail("");

    try {
      const res = await api.get(`/admin/users/search?phone=${searchPhone}`);
      if (res.data.data) {
        setFoundUser(res.data.data);
        setPhone(searchPhone); // Set the phone for booking
        toast.success(`User found: ${res.data.data.name}`);
      } else {
        setFoundUser(null);
        toast.info("No user found. Please provide user details below.");
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setFoundUser(null);
        toast.info("No user found. Please provide user details below.");
      } else {
        setUserSearchError(err.response?.data?.message || "Failed to search user");
        toast.error(err.response?.data?.message || "Failed to search user");
      }
    } finally {
      setIsSearchingUser(false);
    }
  };

  // Check if form is valid for submission
  const isFormValid = (): boolean => {
    // Must have searched and have valid phone
    if (!hasSearched || !searchPhone || searchPhone.length !== 11) {
      return false;
    }

    // If user is found, form is valid (user exists)
    if (foundUser !== null) {
      return true;
    }
    
    // If user not found (searched but not found), check if all new user fields are filled and email is valid
    if (foundUser === null && hasSearched && firstName.trim() && lastName.trim() && email.trim() && validateEmail(email)) {
      return true;
    }
    
    return false;
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTurf || !selectedFacility || !date || !startTime || !endTime) {
      toast.error("Please fill all required booking fields");
      return;
    }
    
    // Validate user exists or new user fields are filled
    if (!foundUser) {
      if (!firstName.trim() || !lastName.trim() || !email.trim()) {
        toast.error("Please search for user or provide first name, last name, and email");
        return;
      }
      if (!validateEmail(email)) {
        toast.error("Please enter a valid email address");
        return;
      }
    }

    // Validate phone number is exactly 11 digits (use searchPhone as source)
    if (!searchPhone || searchPhone.length !== 11) {
      toast.error("Please search for user with a valid 11-digit phone number");
      return;
    }
    
    // Validate paidAmount (advancePayment) is a non-negative number
    if (advancePayment < 0) {
      toast.error("Advance Payment must be a non-negative number");
      return;
    }
    
    try {
      // Convert empty strings or 0 values to null for totalPayment
      const totalPaymentValue = totalPayment === "" || Number(totalPayment) === 0 ? null : Number(totalPayment);
      
      // Prepare booking payload
      const bookingPayload: any = {
        turf: selectedTurf,
        facility: selectedFacility,
        date,
        startTime,
        endTime,
        userPhone: searchPhone,
        totalPayment: totalPaymentValue,
        paidAmount: advancePayment,
      };

      // If user not found, include new user fields
      if (!foundUser) {
        bookingPayload.firstName = firstName.trim();
        bookingPayload.lastName = lastName.trim();
        bookingPayload.email = email.trim().toLowerCase();
      }
      
      await api.post("/admin/bookings", bookingPayload);
      toast.success("Manual booking created successfully");
      
      // Reset all form fields
      setSelectedTurf("");
      setSelectedFacility("");
      setDate("");
      setStartTime("");
      setEndTime("");
      setTotalPayment("");
      setAdvancePayment(0);
      setSearchPhone("");
      setPhone("");
      setFoundUser(null);
      setHasSearched(false);
      setFirstName("");
      setLastName("");
      setEmail("");
      setUserSearchError(null);
      
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

      {/* User Search Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <h3 className="text-sm font-semibold mb-3 text-gray-700">Find User</h3>
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="tel"
              value={searchPhone}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 11);
                setSearchPhone(v);
                // Reset search state when phone changes
                if (foundUser !== null || hasSearched) {
                  setFoundUser(null);
                  setHasSearched(false);
                  setFirstName("");
                  setLastName("");
                  setEmail("");
                }
              }}
              placeholder="Enter 11-digit phone number"
              pattern="[0-9]{11}"
              maxLength={11}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:ring-emerald-100 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={handleSearchUser}
            disabled={isSearchingUser || searchPhone.length !== 11}
            className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
          >
            {isSearchingUser ? "Searching..." : "Find User"}
          </button>
        </div>

        {/* User Found Display */}
        {foundUser && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 font-medium">
              User found: <span className="font-semibold">{foundUser.name}</span>
            </p>
            <p className="text-xs text-green-600 mt-1">{foundUser.email}</p>
          </div>
        )}

        {/* User Not Found - New User Fields */}
        {!foundUser && hasSearched && searchPhone.length === 11 && !isSearchingUser && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">
              No user found. Please provide user details:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter first name"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:ring-emerald-100 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter last name"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:ring-emerald-100 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className={`w-full px-4 py-2 border-2 rounded-xl focus:ring-emerald-100 text-sm ${
                    email && !validateEmail(email)
                      ? "border-red-300 focus:border-red-400"
                      : "border-gray-200 focus:border-emerald-400"
                  }`}
                />
                {email && !validateEmail(email) && (
                  <p className="text-xs text-red-600 mt-1">Please enter a valid email address</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {userSearchError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{userSearchError}</p>
          </div>
        )}
      </div>

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
              {(Array.isArray(turfs) ? turfs : []).map((turf: any) => (
                <option key={turf._id} value={turf._id}>
                  {turf.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Facility Selection */}
        <div>
          <label className="block text-sm font-medium mb-1">Facility</label>
          {facilitiesLoading ? (
            <Loader />
          ) : (
            <select
              value={selectedFacility}
              onChange={(e) => setSelectedFacility(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:ring-emerald-100 text-sm"
              required
              disabled={!selectedTurf}
            >
              <option value="">Select Facility</option>
              {(Array.isArray(facilities) ? facilities : [])
                .filter((facility: Facility) => facility.isActive)
                .map((facility: Facility) => (
                  <option key={facility._id} value={facility._id}>
                    {facility.name}
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

        {/* Total Payment */}
        <div>
          <label className="block text-sm font-medium mb-1">Total Payment</label>
          <input
            type="text"
            value={totalPayment}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, ""); // digits only
              setTotalPayment(v);  // store as string
            }}
            placeholder="Enter total payment"
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:ring-emerald-100 text-sm"
          />
        </div>

        {/* Advance Payment */}
        <div>
          <label className="block text-sm font-medium mb-1">Advance Payment</label>
          <input
            type="number"
            value={advancePayment}
            onChange={(e) => {
              const v = e.target.value;
              // Only allow non-negative integers
              if (v === "") {
                setAdvancePayment(0);
              } else {
                const intValue = parseInt(v, 10);
                if (!isNaN(intValue) && intValue >= 0) {
                  setAdvancePayment(intValue);
                }
              }
            }}
            placeholder="Enter advance payment"
            min="0"
            step="1"
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:ring-emerald-100 text-sm"
            required
          />
        </div>

        {/* Submit Button */}
        <div className="md:col-span-4 mt-4">
          <button
            type="submit"
            disabled={!isFormValid()}
            className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Create Manual Booking
          </button>
          {!isFormValid() && (
            <p className="text-xs text-gray-500 mt-2">
              {!hasSearched
                ? "Please search for user first"
                : !foundUser && (!firstName.trim() || !lastName.trim() || !email.trim() || !validateEmail(email))
                ? "Please fill all user details (first name, last name, and valid email)"
                : ""}
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default ManualBookingForm;
