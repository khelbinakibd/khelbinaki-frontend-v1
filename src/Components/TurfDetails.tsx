/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import type {
  ApiResponse,
  Turf,
  ApiError,
  CreateBookingData,
  Booking,
  Facility,
} from "../types/api.types";
import api from "../lib/api";
import { useAuth } from "../Hooks/useAuth";
import Loader from "./Loader";
import HeroSection from "./TurfDetails/HeroSection";
import BookingPanel from "./TurfDetails/BookingPanel";
import AboutSection from "./TurfDetails/AboutSection";
import AmenitiesSection from "./TurfDetails/AmenitiesSection";
import PricingSection from "./TurfDetails/PricingSection";
import GallerySection from "./TurfDetails/GallerySection";
import LocationSection from "./TurfDetails/LocationSection";
import BkashPaymentModal from "./TurfDetails/BkashPaymentModal";
import FullscreenImageModal from "./TurfDetails/FullscreenImageModal";
import type { LocalSlot } from "./TurfDetails/types";
import { formatDateForApi, parseDateKeyForCalendar } from "./TurfDetails/helpers";

import { useFacilityAvailability } from "../Hooks/api/useFacilityAvailability";
import { customerBookingMutationOptions } from "../lib/customerBookingMutation";
import { availableSelection } from "../lib/availability";
import { getDhakaDateKey } from "../utils/businessTime";

const TurfDetails = () => {
  const selectionVersion = useRef(0);
  const { slug } = useParams();
  const [selectedFacility, setSelectedFacility] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<null | LocalSlot>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const queryParams = new URLSearchParams(location.search);
  const dateFromQuery = queryParams.get("date");

  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (dateFromQuery) {
      const parsed = parseDateKeyForCalendar(dateFromQuery);
      if (parsed) return parsed;
    }
    return parseDateKeyForCalendar(getDhakaDateKey())!;
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["turfDetails", slug],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Turf>>(`/turfs/${slug}`);
      return response.data;
    },
    enabled: !!slug,
  });

  // Fetch facilities for the turf
  const { data: facilitiesData } = useQuery<ApiResponse<Facility[]>>({
    queryKey: ["public-facilities", data?.data?._id],
    queryFn: async () => {
      if (!data?.data?._id) throw new Error("Turf ID not available");
      const response = await api.get<ApiResponse<Facility[]>>(`/turfs/${data.data._id}/facilities`);
      return response.data;
    },
    enabled: !!data?.data?._id,
  });

  const facilities = facilitiesData?.data || [];

  // Fetch selected facility details (with pricing)
  const { data: facilityDetailsData } = useQuery<ApiResponse<Facility>>({
    queryKey: ["facility", selectedFacility],
    queryFn: async () => {
      if (!selectedFacility) throw new Error("No facility selected");
      const response = await api.get<ApiResponse<Facility>>(`/facilities/${selectedFacility}`);
      return response.data;
    },
    enabled: !!selectedFacility,
  });

  const selectedFacilityData = facilityDetailsData?.data ?? null;
  const availabilityQuery = useFacilityAvailability(data?.data?._id ?? "", selectedFacility, formatDateForApi(selectedDate));
  const availability = availabilityQuery.isError ? undefined : availabilityQuery.data;
  const isAvailabilityLoading = availabilityQuery.isFetching;
  const refetchAvailability = availabilityQuery.refetch;

  useEffect(() => {
    if (!selectedTimeSlot || availabilityQuery.isFetching) return;
    const fresh = availableSelection(availability, selectedTimeSlot);
    if (!fresh || fresh.pricePerSlot !== selectedTimeSlot.pricePerSlot) {
      setSelectedTimeSlot(null);
      setShowPaymentModal(false);
    }
  }, [availability, availabilityQuery.isFetching, selectedTimeSlot]);

  const bookingMutation = useMutation({
    ...customerBookingMutationOptions,
    mutationFn: async (
      bookingData: CreateBookingData & {
        paymentDetails: {
          transactionId: string;
          amount: number;
          paymentType: "full" | "advance";
          lastDigit: string;
        };
      }
    ): Promise<Booking> => {
      console.log("Making booking API call with:", bookingData);
      const response = await api.post<ApiResponse<Booking>>("/bookings", bookingData);
      console.log("Booking API response:", response.data);
      return response.data.data!;
    },
    onSuccess: () => {
      toast.success("Booking submitted successfully! Waiting for admin confirmation.");
      setShowPaymentModal(false);
      setSelectedTimeSlot(null);
      refetch();

      queryClient.invalidateQueries({
        queryKey: ["turfDetails", slug],
      });
      queryClient.invalidateQueries({
        queryKey: ["turf-availability", data?.data?._id, selectedFacility, formatDateForApi(selectedDate)],
      });
      refetchAvailability();
    },
    onError: (error: AxiosError<ApiError>) => {
      console.error("Booking mutation error:", error);
      if (error.response?.status === 409) {
        selectionVersion.current++;
        setSelectedTimeSlot(null);
        setShowPaymentModal(false);
        void queryClient.invalidateQueries({ queryKey: ["turf-availability", data?.data?._id, selectedFacility] });
      }
      const errorMessage = error.response?.data?.message || "Failed to create booking.";
      toast.error(errorMessage);
    },
  });

  // Display only authoritative backend slots; never fabricate selectable slots.
  const availableSlots: LocalSlot[] = (availability?.slots ?? []).map(slot => ({
    ...slot, isAvailable: !isAvailabilityLoading && slot.isAvailable && !slot.isTimePassed,
  }));

  async function validateCurrentSelection() {
    if (!selectedTimeSlot || !selectedFacility || !data?.data) return null;
    const version = selectionVersion.current;
    const result = await refetchAvailability();
    if (version !== selectionVersion.current) return null;
    const fresh = result.isError ? undefined : availableSelection(result.data, selectedTimeSlot);
    if (!fresh || fresh.pricePerSlot !== selectedTimeSlot.pricePerSlot) {
      setSelectedTimeSlot(null);
      setShowPaymentModal(false);
      toast.error(result.isError ? "Unable to verify availability. Please retry." : "Availability or price has changed. Please select a slot again.");
      return null;
    }
    return fresh;
  }

  const handleBookingInitiate = async () => {
    if (await validateCurrentSelection()) setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (paymentData: {
    transactionId: string;
    amount: number;
    paymentType: "full" | "advance";
    lastFourDigits: string;
  }) => {
    if (!selectedTimeSlot || !data?.data) return;
    const fresh = await validateCurrentSelection();
    if (!fresh) return;

    try {
      const bookingData: any = {
        turf: data.data._id,
        facility: selectedFacility,
        date: formatDateForApi(selectedDate),
        startTime: fresh.startTime,
        endTime: fresh.endTime,
        transactionId: paymentData.transactionId,
        paidAmount: paymentData.amount,
        lastDigit: paymentData.lastFourDigits,
      };

      await bookingMutation.mutateAsync(bookingData);
    } catch (error) {
      console.error("Booking failed:", error);
    }
  };

  const handleDateChange = (date: Date) => {
    // Normalize to noon to avoid timezone shifts
    const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
    selectionVersion.current++;
    setSelectedDate(normalized);
    setSelectedTimeSlot(null);
    setShowPaymentModal(false);
  };

  const isFormLoading = bookingMutation.isPending || isAvailabilityLoading;

  if (isLoading) return <Loader/>;

  if (error || !data?.data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center p-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Turf not found</h1>
          <p className="text-gray-600">The requested turf could not be found.</p>
        </div>
      </div>
    );
  }

  const turf = data.data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50/30">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <HeroSection turf={turf} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-4">
              {/* Facility Selection */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold mb-4 text-gray-800">Select Facility</h3>
                {facilities.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">No facilities available for this turf.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {facilities
                      .filter((facility) => facility.isActive)
                      .map((facility) => (
                        <button
                          key={facility._id}
                          onClick={() => {
                            selectionVersion.current++;
                            setSelectedFacility(facility._id);
                            setSelectedTimeSlot(null);
                            setShowPaymentModal(false);
                            setSelectedDate(parseDateKeyForCalendar(getDhakaDateKey())!);
                          }}
                          className={`px-4 py-3 rounded-xl border-2 text-left transition-all ${
                            selectedFacility === facility._id
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold"
                              : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-gray-700"
                          }`}
                        >
                          <span className="text-sm">{facility.name}</span>
                        </button>
                      ))}
                  </div>
                )}
              </div>

              {/* Booking Panel - Only show when facility is selected */}
              {selectedFacility && (
                <BookingPanel
                  isAuthenticated={isAuthenticated}
                  selectedDate={selectedDate}
                  selectedTimeSlot={selectedTimeSlot}
                  availableSlots={availableSlots}
                  isAvailabilityLoading={isAvailabilityLoading}
                  isFormLoading={isFormLoading}
                  onDateChange={handleDateChange}
                  onTimeSlotSelect={slot => { selectionVersion.current++; setSelectedTimeSlot(slot); }}
                  availabilityError={availabilityQuery.isError}
                  onAvailabilityRetry={() => { void refetchAvailability(); }}
                  onBookingInitiate={handleBookingInitiate}
                />
              )}
            </div>
          </div>

          {/* Details Column */}
          <div className="lg:col-span-2 space-y-8">
            <AboutSection turf={turf} />
            <AmenitiesSection turf={turf} />
            {selectedFacilityData && <PricingSection turf={turf} facility={selectedFacilityData} />}
            <GallerySection images={turf.images || []} onSelectImage={setFullscreenImage} />
            <LocationSection turf={turf as any} />
          </div>
        </div>
      </div>

      {/* bKash Payment Modal */}
      <BkashPaymentModal
        bkashNumber={(turf as any)?.bkashNumber || "018*******"}
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        totalAmount={selectedTimeSlot?.pricePerSlot || 0}
        onSubmit={handlePaymentSubmit}
        isLoading={bookingMutation.isPending || isAvailabilityLoading}
      />

      {/* Fullscreen Image Modal */}
      {fullscreenImage && <FullscreenImageModal image={fullscreenImage} onClose={() => setFullscreenImage(null)} />}
    </div>
  );
};

export default TurfDetails;
