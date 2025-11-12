/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import api from "../../lib/api";
import { Link } from "react-router";

const ManageTurfs = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch turfs
  const { data: turfsResponse, isError, isLoading } = useQuery({
    queryKey: ["admin-turfs"],
    queryFn: async () => {
      const res = await api.get("/turfs");
      return res.data;
    },
  });

  const turfs = turfsResponse?.data || [];

//  // Mutation: Update turf (active/inactive)
// const updateTurfMutation = useMutation({
//   mutationFn: async ({ turfId, isActive }: { turfId: string; isActive: boolean }) => {
//     const res = await api.patch(`/turfs/${turfId}`, { isActive });
//     return res.data;
//   },
//   onSuccess: (data) => {
//     queryClient.invalidateQueries({ queryKey: ["admin-turfs"] });
//     toast.success(data?.message || "Turf status updated successfully");
//   },
//   onError: (error: any) => {
//     toast.error(error?.response?.data?.message || "Failed to update turf");
//   },
// });

// Handler (Activate / Deactivate)
// const handleTurfAction = (turfId: string, isActive: boolean) => {
//   if (window.confirm(`Are you sure you want to ${isActive ? "activate" : "deactivate"} this turf?`)) {
//     updateTurfMutation.mutate({ turfId, isActive });
//   }
// };


  // Mutation: Delete turf
  const deleteTurfMutation = useMutation({
    mutationFn: async (turfId: string) => {
      const res = await api.delete(`/turfs/${turfId}`);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["turfs"] });
      toast.success(data?.message || "Turf deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete turf");
    },
  });


  const handleDeleteTurf = (turfId: string) => {
    if (window.confirm("Are you sure you want to delete this turf?")) {
      deleteTurfMutation.mutate(turfId);
    }
  };

  // Filter turfs
  const filteredTurfs = turfs.filter((turf: any) => {
    const matchesSearch =
      turf?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      turf?.location[1]?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && turf?.isActive) ||
      (filterStatus === "inactive" && !turf?.isActive);
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTurfs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTurfs = filteredTurfs.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleFilterChange = (value: string) => {
    setCurrentPage(1);
    setFilterStatus(value);
  };

  const handleSearchChange = (value: string) => {
    setCurrentPage(1);
    setSearchTerm(value);
  };

  // Loading Skeleton
  const TurfsSkeleton = () => (
    <div className="p-6 min-h-screen bg-gradient-to-br from-white to-gray-50/30">
      <div className="max-w-7xl mx-auto">
        <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
        <div className="h-4 w-96 bg-gray-200 rounded animate-pulse mb-8"></div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 border-b border-gray-100"
            >
              <div className="h-16 w-28 bg-gray-200 rounded-xl animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-60 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (isLoading) return <TurfsSkeleton />;

  if (isError) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01M6 18h12M6 6h12"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Failed to Load Turfs
          </h3>
          <p className="text-gray-600">
            Please refresh or try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-white to-gray-50/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="my-10">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
            Manage Turfs
          </h1>
          <p className="text-gray-600 text-sm">
            Manage turf details, availability, and status
          </p>
        </div>

        {/* Search + Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search turfs by name or location..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full sm:flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none text-sm"
            />
            <select
              value={filterStatus}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 text-sm bg-white"
            >
              <option value="all">All Turfs</option>
              <option value="active">Active Turfs</option>
              <option value="inactive">Inactive Turfs</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {filteredTurfs?.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-12 h-12 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586l-2.414 2.414a1 1 0 01-.707.293h-3.172l-2.414-2.414H6.586"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                No Turfs Found
              </h3>
              <p className="text-gray-600">
                Try adjusting search or filters.
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                    Turf
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {paginatedTurfs?.map((turf: any) => (
                  <tr key={turf?._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">
                        {turf?.name || "Unnamed Turf"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Default Price: {turf?.defaultPricePerSlot || "N/A"}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {turf?.location.city}, {turf?.location.address || "No location"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${turf?.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                          }`}
                      >
                        {turf?.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      {/* {turf?.isActive ? (
                        <button
                          onClick={() =>
                            handleTurfAction(turf?._id, false)
                          }
                          disabled={updateTurfMutation.isPending}
                          className="px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 disabled:opacity-50"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleTurfAction(turf?._id, true)}
                          disabled={updateTurfMutation.isPending}
                          className="px-3 py-1.5 bg-green-100 text-green-700 text-sm rounded-lg hover:bg-green-200 disabled:opacity-50"
                        >
                          Activate
                        </button>
                      )}
                      */}
                     <button
                        onClick={() => handleDeleteTurf(turf?._id)}
                        disabled={deleteTurfMutation.isPending}
                              className="px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                            >
                              Deactivate
                            </button>
                       <Link to={`/dashboard/manager/update-turf/${turf?._id}`}                      
                        className="px-3 py-1.5 bg-green-100 text-green-600 text-sm rounded-lg hover:bg-gray-200 disabled:opacity-50 "
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination Controls */}
          {paginatedTurfs.length > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 px-4 pb-3">
              <p className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredTurfs.length)} of {filteredTurfs.length} turfs
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm font-medium text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageTurfs;
