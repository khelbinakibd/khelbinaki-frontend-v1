/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "../../lib/api";
import { usePayment } from "../../Hooks/api/usePayment";
import { toast } from "sonner";
import Loader from "../../Components/Loader";

// Define a type for the booking object for better type safety
interface Booking {
  _id: string;
  turf: {
    name: string;
    location: {
      address: string;
      city: string;
    };
  };
  date: string;
  dayType: string;
  paidAmount:string,
  startTime: string;
  endTime: string;
  totalPrice: number;
  paymentStatus: 'unpaid' | 'paid';
  status: 'pending' | 'confirmed' | 'cancelled';
}

const MyBookings = () => {
  const queryClient = useQueryClient();
  const { initPayment } = usePayment();

  // FIX 1: State to track which specific booking is being processed
  const [processingBookingId, setProcessingBookingId] = useState<string | null>(null);

  const { data: bookings = [], isLoading, isError } = useQuery<Booking[]>({
    queryKey: ["my-bookings"],
    queryFn: async () => {
      const res = await api.get("/bookings/my-bookings");
      return res.data?.data;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (bookingId: string) => {
      // This now correctly points to the new user-facing endpoint
      return api.patch(`/bookings/${bookingId}/cancel`);
    },
    onSuccess: () => {
      toast.success("Booking cancelled successfully!");
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Failed to cancel booking.";
      toast.error(errorMessage);
    },
  });

  const handleRetryPayment = async (bookingId: string) => {
    // FIX 1: Set the ID of the booking being processed
    setProcessingBookingId(bookingId);
    try {
      // The usePayment hook will handle the API call
      await initPayment(bookingId);
    } catch (error) {
      console.error("Payment initiation failed", error);
      // If the payment hook doesn't handle the error toast, you can add one here
    } finally {
      // FIX 1: Clear the processing ID when done.
      // The page will redirect on success, so this primarily helps on failure.
      setProcessingBookingId(null);
    }
  };

  const handleCancelBooking = (bookingId: string) => {
cancelMutation.mutate(bookingId);
  };

  const getStatusBadge = (status: string) => (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status === "confirmed"
          ? "bg-emerald-100 text-emerald-800"
          : status === "pending"
            ? "bg-yellow-100 text-yellow-800"
            : "bg-red-100 text-red-800"
        }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === "confirmed"
            ? "bg-emerald-400"
            : status === "pending"
              ? "bg-yellow-400"
              : "bg-red-400"
          }`}
      ></span>
      {status}
    </span>
  );

  if (isLoading) {
    return <Loader/>
  }

  if (isError) {
    return <p className="text-center text-red-500 py-10">Failed to load bookings</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="my-10">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            My Bookings
          </h1>
          <p className="text-gray-600">Track and manage your turf reservations</p>
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
            <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
            {bookings?.length} Total Bookings
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white">
                  <th className="px-6 py-4 text-left text-sm font-semibold">Turf</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Date & Time</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Total Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Advance Payment</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Payment Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings?.map((booking) => {
                  const isCurrentlyProcessing = processingBookingId === booking._id;
                  return (
                    <tr key={booking._id} className="hover:bg-emerald-50/50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">{booking?.turf?.name}</h3>
                          <p className="text-sm text-gray-500">
                            {booking?.turf?.location?.address}, {booking?.turf?.location?.city}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">
                          {new Date(booking?.date).toLocaleDateString()} ({booking?.dayType})
                        </p>
                        <p className="text-xs text-gray-500">
                          {booking?.startTime} - {booking?.endTime}
                        </p>
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-600">
                        ৳{booking.totalPrice}
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-600">
                        ৳{booking.paidAmount}
                      </td>

                  <td>
                     <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
              booking.paymentStatus === 'paid' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {booking.paymentStatus.toUpperCase()}
            </span>
                    </td>   
                      <td className="px-6 py-4">
                        {getStatusBadge(booking?.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {booking.status === "pending" && booking.paymentStatus === "unpaid" && (
                            <button
                              onClick={() => handleRetryPayment(booking._id)}
                              disabled={isCurrentlyProcessing || (processingBookingId !== null && !isCurrentlyProcessing)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                              {isCurrentlyProcessing ? "Processing..." : "Pay Now"}
                            </button>
                          )}
                          {/* FIX 2: Only show cancel button for pending bookings */}
                          {booking.status === "pending" && (
                            <button
                              onClick={() => handleCancelBooking(booking._id)}
                              disabled={cancelMutation.isPending}
                              className="px-3 py-2 bg-red-100 text-red-700 text-xs font-medium rounded-lg hover:bg-red-200"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
    <div className="lg:hidden space-y-3 px-1">
  {bookings.map((booking: any) => {
    const isCurrentlyProcessing = processingBookingId === booking._id;
    return (
      <div
        key={booking._id}
        className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md border border-gray-200 overflow-hidden"
      >
        {/* Header Section */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-bold text-white text-lg mb-1">
                {booking?.turf?.name}
              </h3>
              <p className="text-emerald-50 text-xs flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {booking?.turf?.location?.address}, {booking?.turf?.location?.city}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(booking.status)}
              
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-3">
          {/* Date & Time Card */}
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 rounded-lg p-2 text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs text-blue-600 font-medium">Date & Time</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(booking.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {booking.startTime} - {booking.endTime} • {booking.dayType}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
              <p className="text-xs text-purple-600 font-medium mb-1">Total Price</p>
              <p className="text-lg font-bold text-purple-700">৳{booking.totalPrice}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
              <p className="text-xs text-orange-600 font-medium mb-1">Advance Paid</p>
              <p className="text-lg font-bold text-orange-700">৳{booking.paidAmount}</p>
            </div>
          </div>

          {/* Payment Status */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
            <span className="text-xs text-gray-600 font-medium">Payment Status</span>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
              booking.paymentStatus === 'paid' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {booking.paymentStatus.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 pb-4 flex gap-2">
          {booking.status === "pending" && booking.paymentStatus === "unpaid" && (
            <button
              onClick={() => handleRetryPayment(booking._id)}
              disabled={isCurrentlyProcessing || (processingBookingId !== null && !isCurrentlyProcessing)}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all transform active:scale-95 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
            >
              {isCurrentlyProcessing ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Pay Now
                </>
              )}
            </button>
          )}
          {booking.status === "pending" && (
            <button
              onClick={() => handleCancelBooking(booking._id)}
              disabled={cancelMutation.isPending}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-50 to-red-100 text-red-700 rounded-lg font-semibold hover:from-red-100 hover:to-red-200 transition-all transform active:scale-95 border border-red-200 shadow-sm flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </button>
          )}
        </div>
      </div>
    );
  })}
</div>

        {/* Empty State */}
        {bookings.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-600">Your turf reservations will appear here once you book.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
