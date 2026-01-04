/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "../../lib/api";
import Loader from "../../Components/Loader";
import ManualBookingForm from "./ManualBookingForm";

// Types
interface User {
  _id: string;
  name: string;
  email: string;
}

interface Turf {
  _id: string;
  name: string;
}

interface Booking {
  _id: string;
  user: User;
  turf: Turf;
  facility: string | { _id: string; name: string };
  facilityName?: string;
  date: string;
  startTime: string;
  transactionId: string;
  lastDigit: number;
  endTime: string;
  totalPrice: number;
  paidAmount:number,
  status: "pending" | "confirmed" | "cancelled";
  paymentStatus: "pending_approval" | "paid" | "refunded";
  createdAt: string;
}

interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  upcomingBookings: number;
  bookingStatusCounts: {
    pending: number;
    confirmed: number;
    cancelled: number;
    expired: number;
  };
}

const AdminBookingManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch dashboard stats
  const { isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await api.get("/admin/dashboard");
      return res.data.data;
    },
  });

  // Fetch bookings with server-side pagination
  const {
    data: bookingsResponse,
    isLoading: bookingsLoading,
    isError: bookingsError,
    refetch,
  } = useQuery<{ data: Booking[]; meta: { totalItems: number; totalPage: number; currentPage: number; itemsPerPage: number } }>({
    queryKey: ["bookings", currentPage],
    queryFn: async () => {
      const res = await api.get(`/admin/bookings?page=${currentPage}&limit=${itemsPerPage}`);
      return { data: res.data.data, meta: res.data.meta };
    },
  });

  // Handlers
  const handleBookingStatusUpdate = async (
    bookingId: string,
  
  ) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await api.patch(`/admin/bookings/${bookingId}/cancel`);
      toast.success("Booking cancelled successfully");
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to cancel booking");
    }
  };

  const handleApprovePayment = async (bookingId: string) => {
    try {
      await api.patch(`/admin/bookings/${bookingId}/approve-payment`);
      toast.success("Payment approved successfully");
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to approve payment");
    }
  };

  const bookings = bookingsResponse?.data || [];
  const totalItems = bookingsResponse?.meta?.totalItems || 0;
  const totalPages = bookingsResponse?.meta?.totalPage || 1;

  // Client-side filter for the current page data
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.turf?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBookingStatus =
      filterStatus === "all" || booking.status === filterStatus;

    const matchesPaymentStatus =
      filterPayment === "all" || booking.paymentStatus === filterPayment;

    return matchesSearch && matchesBookingStatus && matchesPaymentStatus;
  });

  // Sort newest first
  const sortedBookings = [...filteredBookings].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Reset to page 1 when filters change
  const handleFilterChange = (filterType: string, value: string) => {
    setCurrentPage(1);
    if (filterType === "status") setFilterStatus(value);
    if (filterType === "payment") setFilterPayment(value);
  };

  const handleSearchChange = (value: string) => {
    setCurrentPage(1);
    setSearchTerm(value);
  };

  // Helpers
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount || 0);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatTo12Hour = (timeString: string) => {
    if (!timeString) return "N/A";
    const [hours, minutes] = timeString.split(":");
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const formattedHour = h % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  if (statsLoading || bookingsLoading) {
    return <Loader />;
  }

  if (bookingsError) {
    return (
      <div className="p-6 text-3xl font-bold text-red-500 text-center my-60">
        Error loading bookings. Please try again.
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="my-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-3 tracking-tight">
            Booking Management
          </h1>
          <p className="text-gray-600 text-base">
            Monitor and manage all turf bookings, payments, and statuses.
          </p>
        </div>

        {/* Manual Booking Form */}
        <ManualBookingForm onSuccess={refetch} />

        {/* Search + Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search by ID, email, or turf..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-4 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none text-sm"
            />
            <select
              value={filterStatus}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 text-sm bg-white"
            >
              <option value="all">All Booking Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={filterPayment}
              onChange={(e) => handleFilterChange("payment", e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Payment Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending_approval">Unpaid</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50 border-b-2 border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Booking Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    User & Turf
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Facility
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Total Payment
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Advance Payment
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedBookings.map((booking) => (
                  <tr
                    key={booking._id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-5">
                      <p className="font-semibold text-sm text-gray-800 mb-1 truncate">
                        {booking._id}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(booking.createdAt)}
                      </p>
                      <p className="text-xs text-gray-500 my-1">
                        TXID: {booking?.transactionId}
                      </p>
                      <p className="text-xs text-gray-500">
                        Last Digit: {booking?.lastDigit}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-medium text-gray-800 mb-1">
                        {booking.user?.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        {booking.turf?.name}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-medium text-gray-800">
                        {typeof booking.facility === 'object' 
                          ? booking.facility?.name 
                          : booking.facilityName || "N/A"}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-medium text-gray-800 mb-1">
                        {formatDate(booking.date)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTo12Hour(booking.startTime)} -{" "}
                        {formatTo12Hour(booking.endTime)}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-gray-800 mb-2">
                        {formatCurrency(booking.totalPrice)}
                      </p>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                          booking.paymentStatus === "paid"
                            ? "bg-green-100 text-green-800"
                            : booking.paymentStatus === "refunded"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            booking.paymentStatus === "paid"
                              ? "bg-green-500"
                              : booking.paymentStatus === "refunded"
                              ? "bg-orange-500"
                              : "bg-yellow-500"
                          }`}
                        ></span>
                        {booking.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                     <p className="text-sm font-bold text-gray-800 mb-2">
                        {formatCurrency(booking?.paidAmount)}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                          booking.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            booking.status === "confirmed"
                              ? "bg-green-500"
                              : booking.status === "pending"
                              ? "bg-yellow-500 animate-pulse"
                              : "bg-red-500"
                          }`}
                        ></span>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        {/* Cancel Booking - Only show if not already cancelled */}
                        {booking.status !== "cancelled" && new Date(booking.date) >= new Date() && (
                          <button
                            onClick={() =>
                              handleBookingStatusUpdate(booking._id)
                            }
                            className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-medium rounded-lg hover:bg-red-200"
                          >
                            Cancel
                          </button>
                        )}

                        {/* Approve Payment */}
                        {booking.paymentStatus === "pending_approval" && booking.status === "pending" && (
                          <button
                            onClick={() => handleApprovePayment(booking._id)}
                            className="px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-200"
                          >
                            Approve Payment
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls - Always show info bar */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} bookings
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors border border-gray-200"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === page
                              ? "bg-emerald-600 text-white"
                              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="px-2 text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors border border-gray-200"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBookingManagement;
