/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import api from "../../lib/api";
import { ShieldCheck, Hourglass, XCircle, Users, Building, FileText, DollarSign, TrendingUp, Activity, Calendar, Mail, MapPin, Clock } from "lucide-react";
import { useState, type MouseEvent } from "react";

interface Booking {
  _id: string;
  user: {
    name: string;
    email: string;
    phone?: string;
  } | null;
  turf: {
    name: string;
    location: {
      address: string,
      city: string,
    }
  } | null;
  date: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  totalPrice: number;
}

const ManagerStatistics = () => {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [showBookingsModal, setShowBookingsModal] = useState(false);

  const { data: response, isError, isLoading } = useQuery({
    queryKey: ["manager-statistics"],
    queryFn: async () => {
      const res = await api.get("/admin/dashboard");
      return res?.data;
    },
  });

  const StatisticsSkeleton = () => (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 animate-pulse">
      <div className="max-w-7xl mx-auto">
        <div className="my-10">
          <div className="h-8 w-64 bg-gray-200 rounded-lg mb-2"></div>
          <div className="h-4 w-96 bg-gray-200 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)]?.map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 w-32 bg-gray-200 rounded"></div>
                <div className="h-12 w-12 bg-gray-200 rounded-xl"></div>
              </div>
              <div className="h-10 w-24 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-40 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="h-80 w-full bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );

  if (isLoading) return <StatisticsSkeleton />;

  if (isError) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-red-100">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Failed to Load Statistics</h3>
          <p className="text-gray-600">Please try refreshing the page or contact support.</p>
        </div>
      </div>
    );
  }

  const stats = response?.data || {};
  const {
    totalUsers = 0,
    totalTurfs = 0,
    totalRevenue = 0,
    totalBookings = 0,
    confirmedBookings = 0,
    pendingBookings = 0,
    cancelledBookings = 0,
  } = stats;

  const confirmationRate = totalBookings > 0 ? ((confirmedBookings / totalBookings) * 100).toFixed(1) : 0;
  const cancellationRate = totalBookings > 0 ? ((cancelledBookings / totalBookings) * 100).toFixed(1) : 0;

  const bookingStatusData = [
    { name: 'Confirmed', value: confirmedBookings, fill: '#10B981', status: 'confirmed' },
    { name: 'Pending', value: pendingBookings, fill: '#F59E0B', status: 'pending' },
    { name: 'Cancelled', value: cancelledBookings, fill: '#EF4444', status: 'cancelled' },
  ];

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0 }).format(amount);
  const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);

  const handleBarClick = (data: any) => {
    if (data && data?.status) {
      setSelectedStatus(data?.status);
      setShowBookingsModal(true);
    }
  };

  const handleStatusCardClick = (status: string) => {
    setSelectedStatus(status);
    setShowBookingsModal(true);
  };

  const handleViewAllBookings = () => {
    setSelectedStatus(null);
    setShowBookingsModal(true);
  };

  const statisticsCards = [
    { title: "Total Revenue", value: formatCurrency(totalRevenue), subtitle: "All-time earnings", icon: <DollarSign className="w-7 h-7" />, iconBg: "bg-gradient-to-br from-emerald-500 to-green-600", iconColor: "text-white", valueGradient: "from-emerald-600 to-green-600", bgColor: "bg-gradient-to-br from-emerald-50 to-green-50", borderColor: "border-emerald-200", hoverShadow: "hover:shadow-emerald-200/50" },
    { title: "Total Bookings", value: formatNumber(totalBookings), subtitle: "Across all turfs", icon: <FileText className="w-7 h-7" />, iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600", iconColor: "text-white", valueGradient: "from-blue-600 to-indigo-600", bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50", borderColor: "border-blue-200", hoverShadow: "hover:shadow-blue-200/50", clickable: true, onClick: handleViewAllBookings },
    { title: "Total Users", value: formatNumber(totalUsers), subtitle: "Registered players", icon: <Users className="w-7 h-7" />, iconBg: "bg-gradient-to-br from-violet-500 to-purple-600", iconColor: "text-white", valueGradient: "from-violet-600 to-purple-600", bgColor: "bg-gradient-to-br from-violet-50 to-purple-50", borderColor: "border-violet-200", hoverShadow: "hover:shadow-violet-200/50" },
    { title: "Total Turfs", value: formatNumber(totalTurfs), subtitle: "Active venues", icon: <Building className="w-7 h-7" />, iconBg: "bg-gradient-to-br from-orange-500 to-amber-600", iconColor: "text-white", valueGradient: "from-orange-600 to-amber-600", bgColor: "bg-gradient-to-br from-orange-50 to-amber-50", borderColor: "border-orange-200", hoverShadow: "hover:shadow-orange-200/50" }
  ];

  const BookingsModal = () => {
    const { data: bookingsResponse, isLoading: isLoadingBookings } = useQuery({
      queryKey: ["all-manager-bookings"],
      queryFn: async () => {
        const res = await api?.get("/admin/bookings?limit=100");
        return res?.data;
      },
      enabled: showBookingsModal,
    });

    const allBookings: Booking[] = bookingsResponse?.data || [];
    const filteredBookings = selectedStatus
      ? allBookings?.filter(b => b?.status === selectedStatus)
      : allBookings;

    const statusTitle = selectedStatus ? selectedStatus.charAt(0)?.toUpperCase() + selectedStatus.slice(1) : 'All';
    const getStatusBadgeColor = (status: string) => {
      switch (status?.toLowerCase()) {
        case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
        case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
        case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
      }
    };

    return (
      // **THE FIX: Added onClick to the backdrop div**
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => setShowBookingsModal(false)}
      >
        {/* **THE FIX: Added onClick with stopPropagation to the modal content div** */}
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
          onClick={(e: MouseEvent) => e.stopPropagation()}
        >
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{statusTitle} Bookings</h2>
                <p className="text-gray-500 text-sm mt-1">{isLoadingBookings ? 'Loading...' : `${filteredBookings.length} booking(s) found`}</p>
              </div>
              <button onClick={() => setShowBookingsModal(false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"><XCircle className="w-6 h-6" /></button>
            </div>
          </div>
          <div className="overflow-y-auto p-6">
            {isLoadingBookings ? (
              <div className="text-center py-10">Loading Bookings...</div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-16"><FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" /><h3 className="text-lg font-semibold text-gray-600">No {selectedStatus} bookings found.</h3></div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <div key={booking._id} className="bg-gray-50 rounded-xl border p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-800">{booking.turf?.name || 'Unknown Turf'}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><MapPin size={12} /> {booking.turf?.location?.city || 'Unknown Location'}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">BDT {booking?.totalPrice}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeColor(booking.status)}`}>{booking.status}</span>
                    </div>
                    <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="flex items-center gap-2 text-gray-600"><Users size={14} /> {booking.user?.name || 'Deleted User'}</p>
                        <p className="flex items-center gap-2 text-gray-600 mt-2"><Mail size={14} /> {booking.user?.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="flex items-center gap-2 text-gray-600"><Calendar size={14} /> {new Date(booking.date).toLocaleDateString()}</p>
                        <p className="flex items-center gap-2 text-gray-600 mt-2"><Clock size={14} /> {booking.startTime} - {booking.endTime}</p>
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

  return (
    <div className="p-6  min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/20">
      <div className="max-w-7xl mx-auto ">
        <div className="my-10"><div className="flex items-center gap-3 mb-2"><Activity className="w-8 h-8 text-emerald-600" /><h1 className="text-4xl font-bold text-green-700 ">Manager Dashboard</h1></div><p className="text-gray-600 text-base ml-11">Platform-wide key metrics and performance overview</p></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statisticsCards.map((card, index) => (
            <div key={index} onClick={card.clickable ? card.onClick : undefined} className={`${card.bgColor} rounded-2xl shadow-md border ${card.borderColor} p-6 hover:shadow-xl ${card.hoverShadow} transform hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden ${card.clickable ? 'cursor-pointer' : ''}`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div><h3 className="text-base font-semibold text-gray-800">{card.title}</h3><p className="text-xs text-gray-600 font-medium mt-1">{card.subtitle}</p></div>
                  <div className={`p-3 ${card.iconBg} ${card.iconColor} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>{card.icon}</div>
                </div>
                <p className={`text-3xl lg:text-4xl font-bold bg-gradient-to-r ${card.valueGradient} bg-clip-text text-transparent`}>{card.value}</p>
                {card.clickable && <p className="text-xs text-blue-600 font-medium mt-2 group-hover:underline">Click to view details →</p>}
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6"><div><h3 className="text-xl font-semibold text-gray-800">Booking Status Distribution</h3><p className="text-sm text-gray-500 mt-1">Click on any bar to view bookings</p></div><TrendingUp className="w-6 h-6 text-gray-400" /></div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={bookingStatusData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={13}
                    fontWeight={500}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={({ active, payload }) =>
                      active && payload && payload.length ? (
                        <div className="bg-white border rounded-xl shadow-lg p-4">
                          <p className="text-sm font-semibold text-gray-800 mb-1">
                            {payload[0].payload.name}
                          </p>
                          <p
                            className="text-lg font-bold"
                            style={{ color: payload[0].payload.fill }}
                          >
                            {formatNumber(payload[0].value as number)} bookings
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {totalBookings > 0
                              ? ((payload[0].value as number / totalBookings) * 100).toFixed(1)
                              : 0}
                            % of total
                          </p>
                          <p className="text-xs text-blue-600 font-medium mt-2">
                            Click to view details
                          </p>
                        </div>
                      ) : null
                    }
                    cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
                  />
                  <Bar
                    dataKey="value"
                    name="Bookings"
                    radius={[12, 12, 0, 0]}
                    maxBarSize={80}
                    className="cursor-pointer"
                    onClick={(_data, index) => {
                      // Defensive: check index and data
                      if (
                        typeof index === 'number' &&
                        bookingStatusData[index]
                      ) {
                        handleBarClick(bookingStatusData[index]);
                      }
                    }}
                  >
                    {bookingStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry?.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="space-y-4">
            <div onClick={() => handleStatusCardClick('confirmed')} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-md border border-green-200 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group">
              <div className="flex items-center gap-4"><div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform"><ShieldCheck className="w-7 h-7 text-white" /></div><div className="flex-1"><p className="text-sm text-gray-700 font-medium">Confirmed</p><p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{formatNumber(confirmedBookings)}</p><p className="text-xs text-green-700 font-medium mt-1">{confirmationRate}% success rate</p></div></div>
            </div>
            <div onClick={() => handleStatusCardClick('pending')} className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl shadow-md border border-amber-200 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group">
              <div className="flex items-center gap-4"><div className="p-3 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform"><Hourglass className="w-7 h-7 text-white" /></div><div className="flex-1"><p className="text-sm text-gray-700 font-medium">Pending</p><p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">{formatNumber(pendingBookings)}</p><p className="text-xs text-amber-700 font-medium mt-1">Awaiting action</p></div></div>
            </div>
            <div onClick={() => handleStatusCardClick('cancelled')} className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl shadow-md border border-red-200 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group">
              <div className="flex items-center gap-4"><div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform"><XCircle className="w-7 h-7 text-white" /></div><div className="flex-1"><p className="text-sm text-gray-700 font-medium">Cancelled</p><p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">{formatNumber(cancelledBookings)}</p><p className="text-xs text-red-700 font-medium mt-1">{cancellationRate}% cancellation rate</p></div></div>
            </div>
          </div>
        </div>
      </div>
      {showBookingsModal && <BookingsModal />}
    </div>
  );
};

export default ManagerStatistics;
