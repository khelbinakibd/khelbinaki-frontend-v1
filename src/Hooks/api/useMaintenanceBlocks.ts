import { infiniteQueryOptions, queryOptions, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import api from "../../lib/api";
import { maintenanceError, retryRead } from "../../lib/maintenanceErrors";
import { authenticatedUserId, authStore } from "../../Store/auth";
import type { CreateMaintenanceBlockData, DataResponse, Facility, MaintenanceBlock, ManageableTurfsResponse } from "../../types/api.types";
import { isValidDateKey } from "../../utils/businessTime";

export const MAINTENANCE_PAGE_SIZE = 50;

export function manageableTurfsOptions(userId: string) {
  return infiniteQueryOptions({
    queryKey: ["maintenance-turfs", userId],
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) => {
      const { data } = await api.get<ManageableTurfsResponse>("/admin/turfs", { params: { page: pageParam, limit: 50 }, signal });
      if (!Array.isArray(data.data)) throw new Error("Invalid manageable turf response");
      return data;
    },
    getNextPageParam: last => last.meta.currentPage < last.meta.totalPage ? last.meta.currentPage + 1 : undefined,
    enabled: !!userId, retry: retryRead, staleTime: 0, refetchOnWindowFocus: true,
  });
}

export function maintenanceFacilitiesOptions(userId: string, turfId: string) {
  return queryOptions({
    queryKey: ["maintenance-facilities", userId, turfId],
    queryFn: async ({ signal }) => {
      // Include inactive facilities so their existing blocks can still be released.
      const { data } = await api.get<DataResponse<Facility[]>>(`/turfs/${turfId}/facilities`, { signal });
      if (!Array.isArray(data.data)) throw new Error("Invalid facility response");
      return data.data;
    },
    enabled: !!userId && !!turfId, retry: retryRead, staleTime: 0, refetchOnWindowFocus: true,
  });
}

export function maintenanceBlocksOptions(userId: string, facilityId: string, date: string) {
  return infiniteQueryOptions({
    queryKey: ["maintenance-blocks", userId, facilityId, date],
    initialPageParam: 0,
    queryFn: async ({ pageParam, signal }) => {
      const { data } = await api.get<DataResponse<MaintenanceBlock[]>>(`/facilities/${facilityId}/maintenance-blocks`, {
        params: { date, includeReleased: "false", limit: MAINTENANCE_PAGE_SIZE, skip: pageParam }, signal,
      });
      if (!Array.isArray(data.data)) throw new Error("Invalid maintenance response");
      return data.data;
    },
    // A full page may need one extra empty request because the API has no total.
    getNextPageParam: (last, _pages, skip) => last.length === MAINTENANCE_PAGE_SIZE ? skip + MAINTENANCE_PAGE_SIZE : undefined,
    enabled: !!userId && !!facilityId && isValidDateKey(date), retry: retryRead, staleTime: 0, refetchOnWindowFocus: true,
  });
}

export async function invalidateMaintenance(client: QueryClient, userId: string, facilityId: string) {
  await Promise.all([
    client.invalidateQueries({ queryKey: ["maintenance-blocks", userId, facilityId] }),
    // Invalidate every date: an overnight operating window can cross date keys.
    client.invalidateQueries({ predicate: query => query.queryKey[0] === "turf-availability" && query.queryKey[2] === facilityId }),
  ]);
}

interface MaintenanceContext { turfId: string; facilityId: string }
export function createMaintenanceOptions(client: QueryClient, userId: string) {
  return {
    retry: false as const,
    mutationFn: async (input: MaintenanceContext & { data: CreateMaintenanceBlockData }) => {
      const response = await api.post<DataResponse<MaintenanceBlock>>(`/facilities/${input.facilityId}/maintenance-blocks`, input.data);
      return response.data;
    },
    onSuccess: (_response: DataResponse<MaintenanceBlock>, input: MaintenanceContext) => invalidateMaintenance(client, userId, input.facilityId),
    onError: async (error: unknown, input: MaintenanceContext) => {
      if (maintenanceError(error).status === 409) await invalidateMaintenance(client, userId, input.facilityId);
      if (maintenanceError(error).status === 403) await Promise.all([
        invalidateMaintenance(client, userId, input.facilityId),
        client.invalidateQueries({ queryKey: ["maintenance-turfs", userId] }),
        client.invalidateQueries({ queryKey: ["maintenance-facilities", userId, input.turfId] }),
      ]);
    },
  };
}

export function releaseMaintenanceOptions(client: QueryClient, userId: string) {
  return {
    retry: false as const,
    mutationFn: async (input: MaintenanceContext & { blockId: string; reason?: string }) => {
      const response = await api.patch<DataResponse<MaintenanceBlock>>(`/facilities/${input.facilityId}/maintenance-blocks/${input.blockId}/release`, {
        ...(input.reason ? { reason: input.reason } : {}),
      });
      return response.data;
    },
    onSuccess: (_response: DataResponse<MaintenanceBlock>, input: MaintenanceContext) => invalidateMaintenance(client, userId, input.facilityId),
    onError: async (error: unknown, input: MaintenanceContext) => {
      if (maintenanceError(error).status === 403) await Promise.all([
        invalidateMaintenance(client, userId, input.facilityId),
        client.invalidateQueries({ queryKey: ["maintenance-turfs", userId] }),
        client.invalidateQueries({ queryKey: ["maintenance-facilities", userId, input.turfId] }),
      ]);
    },
  };
}

export function useMaintenanceTurfs() {
  const userId = authStore(authenticatedUserId);
  return useInfiniteQuery(manageableTurfsOptions(userId));
}
export function useMaintenanceFacilities(turfId: string) {
  const userId = authStore(authenticatedUserId);
  return useQuery(maintenanceFacilitiesOptions(userId, turfId));
}
export function useMaintenanceBlocks(facilityId: string, date: string) {
  const userId = authStore(authenticatedUserId);
  return useInfiniteQuery(maintenanceBlocksOptions(userId, facilityId, date));
}
export function useMaintenanceMutations() {
  const userId = authStore(authenticatedUserId);
  const client = useQueryClient();
  return {
    create: useMutation(createMaintenanceOptions(client, userId)),
    release: useMutation(releaseMaintenanceOptions(client, userId)),
  };
}
