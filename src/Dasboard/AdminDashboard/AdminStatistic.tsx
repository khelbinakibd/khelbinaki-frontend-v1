/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/api";
import { XCircle, Calendar, Users, Mail, MapPin, FileText, ShieldCheck, Hourglass } from "lucide-react";
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area } from "recharts";

const TurfAdminStatistics = () => {
  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["turf-admin-statistics"],
    queryFn: async () => {
      const res = await api.get("/admin/dashboard");
      return res.data;
    },
  });

  const StatisticsSkeleton = () => (
    <div className="p-6 min-h-screen bg-gradient-to-br from-white to-gray-50/30">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-12 w-12 bg-gray-200 rounded-xl animate-pulse"></div>
              </div>
              <div className="h-10 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (isLoading) return <StatisticsSkeleton />;

  if (isError) {
    return (
      <div className="p-6 min-h-screen bg-gradient-to-br from-white to-gray-50/30 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Failed to Load Statistics</h3>
          <p className="text-gray-600">Please try refreshing the page or contact support.</p>
        </div>
      </div>
    );
  }

  const stats = response?.data || {};

  
  const { 
    totalBookings = 0, 
    totalRevenue = 0, 
    totalTurfs = 0, 
    monthlyBookings = [], 
    recentBookings = []
  } = stats;

  // Count bookings by status from recentBookings
  const confirmedBookings = recentBookings.filter((b: any) => b.status === 'confirmed').length;
  const pendingBookings = recentBookings.filter((b: any) => b.status === 'pending').length;
  const cancelledBookings = recentBookings.filter((b: any) => b.status === 'cancelled').length;




  const bookingData = monthlyBookings.map((b: any) => ({
    day: b._id.day,
    revenue: b.revenue,
    bookings: b.bookings,
  }));

  const monthlyTotalRevenue = bookingData.reduce((sum: number, day: any) => sum + day.revenue, 0);
  const monthlyTotalBookings = bookingData.reduce((sum: number, day: any) => sum + day.bookings, 0);
  const averageDailyRevenue = bookingData.length ? monthlyTotalRevenue / bookingData.length : 0;
  const averageDailyBookings = bookingData.length ? monthlyTotalBookings / bookingData.length : 0;

  // Calculate rates
  const confirmationRate = totalBookings > 0 ? ((confirmedBookings / totalBookings) * 100).toFixed(1) : "0";
  const cancellationRate = totalBookings > 0 ? ((cancelledBookings / totalBookings) * 100).toFixed(1) : "0";

  const handleStatusCardClick = (status: string) => {
    console.log(`Clicked ${status} bookings`);
    // You can add navigation or filtering logic here
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", minimumFractionDigits: 0 }).format(amount);
  const formatNumber = (num: any) => new Intl.NumberFormat("en-US").format(num);

  const statisticsCards = [
    {
      title: "Total Bookings",
      value: formatNumber(totalBookings),
      subtitle: "All time bookings",
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      borderColor: "border-blue-200",
    },
    {
      title: "Booking Revenue",
      value: formatCurrency(totalRevenue),
      subtitle: "Total earnings",
      icon: (
        <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: "from-emerald-500 to-emerald-600",
      bgGradient: "from-emerald-50 to-emerald-100",
      borderColor: "border-emerald-200",
    },
    {
      title: "Active Turfs",
      value: formatNumber(totalTurfs),
      subtitle: "Available venues",
      icon: (
        <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      gradient: "from-amber-500 to-amber-600",
      bgGradient: "from-amber-50 to-amber-100",
      borderColor: "border-amber-200",
    },
  ];

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-white to-gray-50/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="my-10">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
            Turf Admin Dashboard
          </h1>
          <p className="text-gray-600 text-sm">Manage your turf bookings and track performance metrics</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statisticsCards.map((card, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl shadow-sm border ${card.borderColor} p-6 hover:shadow-md transform hover:scale-105 transition-all duration-300 group`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">{card.title}</h3>
                <div className={`p-3 bg-gradient-to-br ${card.bgGradient} rounded-xl group-hover:scale-110 transition-transform duration-200`}>
                  {card.icon}
                </div>
              </div>
              <div className="mb-2">
                <span className={`text-3xl font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                  {card.value}
                </span>
              </div>
              <p className="text-sm text-gray-600 font-medium">{card.subtitle}</p>
              <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${card.gradient} rounded-full transform translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-1000 ease-in`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Monthly Bookings Chart with Status Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Last Month Bookings</h3>
                  <p className="text-sm text-gray-600">Daily booking revenue and count for the past month</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(monthlyTotalRevenue)}</p>
                <p className="text-sm text-gray-500">{formatNumber(monthlyTotalBookings)} Bookings</p>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bookingData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="bookingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: number) => `৳${(value / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                    formatter={(value, name) => [name === "revenue" ? `৳${formatNumber(value)}` : `${value} bookings`, name === "revenue" ? "Revenue" : "Bookings"]}
                    labelFormatter={(label) => `Day ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={3}
                    fill="url(#bookingGradient)"
                    dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2, fill: "white" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Chart Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(averageDailyRevenue)}</p>
                <p className="text-sm text-gray-600 mt-1">Avg Daily Revenue</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{Math.round(averageDailyBookings)}</p>
                <p className="text-sm text-gray-600 mt-1">Avg Daily Bookings</p>
              </div>
              <div className="text-center">
                
               <p className="text-2xl font-bold text-purple-600">
  {bookingData.length ? (() => {
    const revenues = bookingData
      .map((d: any) => Number(d.revenue))
      .filter((n: number) => !isNaN(n) && n > 0);
    if (revenues.length === 0) return "0%";

    const min = Math.min(...revenues);
    const max = Math.max(...revenues);
    if (min === max) return "0%";
    const percentDiff = ((max - min) / min) * 100;
    if (!isFinite(percentDiff)) return "0%";
    return `+${Math.round(percentDiff)}%`;
  })() : "0%"}
</p>

                <p className="text-sm text-gray-600 mt-1">Peak vs Low</p>
              </div>
            </div>
          </div>

          {/* Booking Status Cards */}
          <div className="space-y-4">
            <div onClick={() => handleStatusCardClick('confirmed')} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-md border border-green-200 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 font-medium">Confirmed</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{formatNumber(confirmedBookings)}</p>
                  <p className="text-xs text-green-700 font-medium mt-1">{confirmationRate}% success rate</p>
                </div>
              </div>
            </div>
            
            <div onClick={() => handleStatusCardClick('pending')} className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl shadow-md border border-amber-200 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                  <Hourglass className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 font-medium">Pending</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">{formatNumber(pendingBookings)}</p>
                  <p className="text-xs text-amber-700 font-medium mt-1">Awaiting action</p>
                </div>
              </div>
            </div>
            
            <div onClick={() => handleStatusCardClick('cancelled')} className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl shadow-md border border-red-200 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                  <XCircle className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 font-medium">Cancelled</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">{formatNumber(cancelledBookings)}</p>
                  <p className="text-xs text-red-700 font-medium mt-1">{cancellationRate}% cancellation rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Bookings</h3>
          {recentBookings.length === 0 ? (
            <p className="text-gray-500">No recent bookings found.</p>
          ) : (
            <div className="space-y-4">
              {recentBookings.map((booking: any) => (
                <div key={booking._id} className="bg-gray-50 rounded-xl border p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-800">{booking.turf?.name || "Unknown Turf"}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin size={12} /> {booking.date ? new Date(booking.date).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full border 
                        ${
                          booking.status === "confirmed"
                            ? "bg-green-100 text-green-700 border-green-200"
                            : booking.status === "pending"
                            ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                            : booking.status === "cancelled"
                            ? "bg-red-100 text-red-700 border-red-200"
                            : "bg-gray-100 text-gray-700 border-gray-200"
                        }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                  <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="flex items-center gap-2 text-gray-600">
                        <Users size={14} /> {booking.user?.name || "Deleted User"}
                      </p>
                      <p className="flex items-center gap-2 text-gray-600 mt-2">
                        <Mail size={14} /> {booking.user?.email || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="flex items-center gap-2 text-gray-600">
                        <Calendar size={14} /> {booking.startTime} - {booking.endTime}
                      </p>
                      <p className="flex items-center gap-2 text-gray-600 mt-2">
                        <FileText size={14} /> {formatCurrency(booking.totalPrice)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TurfAdminStatistics;