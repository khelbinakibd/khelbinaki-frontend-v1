/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import type {
  ApiResponse,
  Turf,
  ApiError,
  CreateBookingData,
  Booking,
  TurfAvailability,
  AvailabilitySlot,
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
import { formatDateForApi } from "./TurfDetails/helpers";

const TurfDetails = () => {
  const { slug } = useParams();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<null | LocalSlot>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const queryParams = new URLSearchParams(location.search);
  const dateFromQuery = queryParams.get("date");

  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (dateFromQuery) {
      const parsed = new Date(dateFromQuery);
      if (!isNaN(parsed.getTime())) {
        // Return normalized date at noon to avoid timezone issues
        return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 12, 0, 0, 0);
      }
    }
    // Default to today at noon
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0, 0);
  });

  const getCurrentDayType = (date: Date) => {
    const day = new Date(date).getDay();
    return day === 5 || day === 6 ? "friday-saturday" : "sunday-thursday";
  };

  const isTimeSlotPassed = (startTime: string, dateToCheck: Date) => {
    const today = new Date();
    const checkDateNormalized = new Date(dateToCheck.getFullYear(), dateToCheck.getMonth(), dateToCheck.getDate());
    const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // If it's not today, the slot hasn't passed
    if (checkDateNormalized.getTime() !== todayNormalized.getTime()) {
      return false;
    }

    // Compare times for today
    const currentHour = today.getHours();
    const currentMinutes = today.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinutes;

    const [slotHour, slotMinutes] = startTime.split(":").map(Number);
    const slotTotalMinutes = slotHour * 60 + slotMinutes;

    return slotTotalMinutes <= currentTotalMinutes;
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["turfDetails", slug],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Turf>>(`/turfs/${slug}`);
      return response.data;
    },
    enabled: !!slug,
  });

  const {
    data: availability,
    isLoading: isAvailabilityLoading,
    refetch: refetchAvailability,
  } = useQuery<TurfAvailability | null>({
    queryKey: ["turf-availability", data?.data?._id, selectedDate?.toDateString()],
    queryFn: async (): Promise<TurfAvailability | null> => {
      if (!selectedDate || !data?.data?._id) return null;
      const dateStr = formatDateForApi(selectedDate);
      const response = await api.get<ApiResponse<TurfAvailability>>(`/turfs/${data.data._id}/availability`, {
        params: { date: dateStr },
      });
      return response.data.data ?? null;
    },
    enabled: !!selectedDate && !!data?.data?._id,
    refetchOnWindowFocus: true,
    staleTime: 0,
    gcTime: 0,
  });

  useEffect(() => {
    if (selectedDate && data?.data?._id) {
      refetchAvailability();
    }
  }, [selectedDate, data?.data?._id, refetchAvailability]);

  const bookingMutation = useMutation({
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
        queryKey: ["turf-availability", data?.data?._id, selectedDate?.toDateString()],
      });
      refetchAvailability();
    },
    onError: (error: AxiosError<ApiError>) => {
      console.error("Booking mutation error:", error);
      const errorMessage = error.response?.data?.message || "Failed to create booking.";
      toast.error(errorMessage);
    },
  });

  const getPriceForTime = useCallback(
    (time: string, dateForPrice: Date) => {
      if (!data?.data?.pricingRules) return data?.data?.defaultPricePerSlot || 2000;

      const dayType = getCurrentDayType(dateForPrice);
      const rule = data.data.pricingRules.find((r) => r.dayType === dayType);

      if (!rule) return data?.data?.defaultPricePerSlot || 2000;

      const timeHour = parseInt(time.split(":")[0], 10);

      for (const slot of rule.timeSlots) {
        const startHour = parseInt(slot.startTime.split(":")[0], 10);
        const endHour = parseInt(slot.endTime.split(":")[0], 10);

        if (timeHour >= startHour && timeHour < endHour) {
          return slot.pricePerSlot;
        }
      }

      return data?.data?.defaultPricePerSlot || 2000;
    },
    [data?.data?.pricingRules, data?.data?.defaultPricePerSlot]
  );

  const generateTimeSlots = useCallback(
    (dateForSlots: Date): LocalSlot[] => {
      if (!data?.data) return [];

      const { start, end } = data.data.operatingHours;
      const slots: LocalSlot[] = [];

      const startHour = parseInt(start.split(":")[0], 10);
      const endHour = parseInt(end.split(":")[0], 10);

      for (let hour = startHour; hour < endHour; hour++) {
        const startTime = `${String(hour).padStart(2, "0")}:00`;
        const endTime = `${String(hour + 1).padStart(2, "0")}:00`;

        const hasPassedTime = isTimeSlotPassed(startTime, dateForSlots);
        const priceForSlot = getPriceForTime(startTime, dateForSlots);

        slots.push({
          startTime,
          endTime,
          pricePerSlot: priceForSlot,
          isAvailable: !hasPassedTime,
          isTimePassed: hasPassedTime,
        });
      }

      return slots;
    },
    [data?.data, getPriceForTime]
  );

  const getAvailableTimeSlots = useCallback((): LocalSlot[] => {
    const allSlots: LocalSlot[] = generateTimeSlots(selectedDate);

    if (!availability?.slots) {
      return allSlots;
    }

    return allSlots.map((slot) => {
      const backendSlot = availability.slots.find(
        (availSlot: AvailabilitySlot) => availSlot.startTime === slot.startTime
      );

      const isBackendAvailable = backendSlot?.isAvailable ?? true;
      const finalAvailability = !slot.isTimePassed && isBackendAvailable;

      return {
        ...slot,
        isAvailable: finalAvailability,
        pricePerSlot: backendSlot?.pricePerSlot ?? slot.pricePerSlot,
        isBooked: backendSlot ? !backendSlot.isAvailable : false,
      };
    });
  }, [generateTimeSlots, selectedDate, availability?.slots]);

  const handleBookingInitiate = () => {
    if (!selectedTimeSlot || !data?.data) return;

    if (isTimeSlotPassed(selectedTimeSlot.startTime, selectedDate)) {
      toast.error("This time slot has already passed. Please select a future time.");
      setSelectedTimeSlot(null);
      return;
    }

    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (paymentData: {
    transactionId: string;
    amount: number;
    paymentType: "full" | "advance";
    lastFourDigits: string;
  }) => {
    if (!selectedTimeSlot || !data?.data) return;

    try {
      // Normalize the date to avoid timezone issues
      const normalizedDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        12,
        0,
        0,
        0
      );

      const bookingData: any = {
        turf: data.data._id,
        date: normalizedDate,
        startTime: selectedTimeSlot.startTime,
        endTime: selectedTimeSlot.endTime,
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
    setSelectedDate(normalized);
  };

  const isFormLoading = bookingMutation.isPending || isAvailabilityLoading;
  const availableSlots: LocalSlot[] = getAvailableTimeSlots();

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
            <div className="sticky top-8">
              <BookingPanel
                isAuthenticated={isAuthenticated}
                selectedDate={selectedDate}
                selectedTimeSlot={selectedTimeSlot}
                availableSlots={availableSlots}
                isAvailabilityLoading={isAvailabilityLoading}
                isFormLoading={isFormLoading}
                onDateChange={handleDateChange}
                onTimeSlotSelect={setSelectedTimeSlot}
                onBookingInitiate={handleBookingInitiate}
              />
            </div>
          </div>

          {/* Details Column */}
          <div className="lg:col-span-2 space-y-8">
            <AboutSection turf={turf} />
            <AmenitiesSection turf={turf} />
            <PricingSection turf={turf} />
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
        isLoading={bookingMutation.isPending}
      />

      {/* Fullscreen Image Modal */}
      {fullscreenImage && <FullscreenImageModal image={fullscreenImage} onClose={() => setFullscreenImage(null)} />}
    </div>
  );
};

export default TurfDetails;
