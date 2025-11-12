/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { toast } from "sonner";
import api from "../../lib/api";

const ManageUsers = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;


  // Fetch users data with pagination
  const { data: usersResponse, isError, isLoading } = useQuery({
    queryKey: ["admin-users", currentPage],
    queryFn: async () => {
      const res = await api.get(`/admin/users?page=${currentPage}&limit=${itemsPerPage}`);
      console.log(res?.data);
      return res.data;
    }
  });

  // Mutation for updating user status
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const res = await api.patch(`/admin/users/${userId}`, { isActive });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(data.message || "User updated successfully");
    },

    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update user");
    }
  });



  const users = usersResponse?.data || [];
  const meta = usersResponse?.meta || { totalItems: 0, totalPage: 1, currentPage: 1, itemsPerPage: 10 };

  // Filter users based on search and status (client-side filtering)
  const filteredUsers = users.filter((user: { name: string; email: string; isActive: any; }) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" ||
      (filterStatus === "active" && user.isActive) ||
      (filterStatus === "inactive" && !user.isActive);
    return matchesSearch && matchesStatus;
  });

  // Use backend pagination data
  const totalPages = meta.totalPage;
  const totalItems = meta.totalItems;
  const startIndex = (meta.currentPage - 1) * meta.itemsPerPage;
  const endIndex = startIndex + users.length;

  // Reset to page 1 when filters change
  const handleFilterChange = (value: string) => {
    setCurrentPage(1);
    setFilterStatus(value);
  };

  const handleSearchChange = (value: string) => {
    setCurrentPage(1);
    setSearchTerm(value);
  };

  const handleUserAction = (userId: string, isActive: boolean) => {
    updateUserMutation.mutate({ userId, isActive });
  };


  // Loading skeleton component
  const UsersSkeleton = () => (
    <div className="p-6 min-h-screen bg-gradient-to-br from-white to-gray-50/30">
      <div className="max-w-7xl mx-auto">
        <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
        <div className="h-4 w-96 bg-gray-200 rounded animate-pulse mb-8"></div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex gap-4 mb-6">
            <div className="h-10 w-64 bg-gray-200 rounded-xl animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>

          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-100">
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-60 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (isLoading) return <UsersSkeleton />;

  if (isError) {
    return (
      <div className="p-6 min-h-screen bg-gradient-to-br from-white to-gray-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Failed to Load Users</h3>
          <p className="text-gray-600">Please try refreshing the page or contact support if the problem persists.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-white to-gray-50/30">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="my-10">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
            Manage Users
          </h1>
          <p className="text-gray-600 text-sm">Manage user accounts, permissions, and status</p>
        </div>

         {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Total Users</h3>
                <p className="text-2xl font-bold text-blue-600">{users.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Active Users</h3>
                <p className="text-2xl font-bold text-green-600">{users.filter((u: { isActive: any; }) => u.isActive).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-red-50 to-red-100 rounded-xl">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Inactive Users</h3>
                <p className="text-2xl font-bold text-red-600">{users.filter((u: { isActive: any; }) => !u.isActive).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Table Header with Search and Filters */}
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <div className="relative flex-1 max-w-md">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 outline-none text-sm"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 outline-none text-sm bg-white"
                >
                  <option value="all">All Users</option>
                  <option value="active">Active Users</option>
                  <option value="inactive">Inactive Users</option>
                </select>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 mt-4 text-sm">
              <span className="text-gray-600">
                Total: <span className="font-semibold text-gray-800">{totalItems}</span>
              </span>
              <span className="text-gray-600">
                Active: <span className="font-semibold text-green-600">{users.filter((u: { isActive: any; }) => u.isActive).length}</span>
              </span>
              <span className="text-gray-600">
                Inactive: <span className="font-semibold text-red-600">{users.filter((u: { isActive: any; }) => !u.isActive).length}</span>
              </span>
              <span className="text-gray-600">
                Showing: <span className="font-semibold text-blue-600">{filteredUsers.length}</span>
              </span>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No Users Found</h3>
                <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Id</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredUsers.map((user: { _id: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; id: any; photo: string | undefined; name: string | undefined; role: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; email: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; phone: any; address: any; isActive: any; createdAt: string | number | Date; }) => (
                    <tr key={user._id || user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.photo ? (
                            <img
                              src={user.photo}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold text-sm">
                              {user.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{user.name || 'N/A'}  <span className="text-xs text-green-500 font-bold"> {user?.role}</span></p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-gray-900">{user.phone || 'N/A'}</p>
                          <p className="text-gray-600 truncate max-w-xs">{user.address || 'No address'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                          }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : 'N/A'}
                      </td>
                      <td>
                        {user?._id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {user.isActive ? (
                            <button
                              onClick={() => handleUserAction(user._id || user.id, false)}
                              disabled={updateUserMutation.isPending}
                              className="px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUserAction(user._id || user.id, true)}
                              disabled={updateUserMutation.isPending}
                              className="px-3 py-1.5 bg-green-100 text-green-700 text-sm rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                            >
                              Activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Controls */}
          {filteredUsers.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {endIndex} of {totalItems} users
              </div>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
