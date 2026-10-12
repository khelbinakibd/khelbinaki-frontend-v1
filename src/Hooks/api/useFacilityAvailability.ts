import { queryOptions, useQuery } from "@tanstack/react-query";
import api from "../../lib/api";
import { retryRead } from "../../lib/maintenanceErrors";
import type { DataResponse, TurfAvailability } from "../../types/api.types";
import { isValidDateKey } from "../../utils/businessTime";

export function facilityAvailabilityOptions(turfId: string, facilityId: string, date: string) {
  return queryOptions({
    queryKey: ["turf-availability", turfId, facilityId, date],
    queryFn: async ({ signal }) => {
      const response = await api.get<DataResponse<TurfAvailability>>(`/turfs/${turfId}/availability`, { params: { date, facility: facilityId }, signal });
      if (!Array.isArray(response.data.data?.slots)) throw new Error("Availability could not be loaded");
      return response.data.data;
    },
    enabled: !!turfId && !!facilityId && isValidDateKey(date),
    retry: retryRead, staleTime: 0, gcTime: 0, refetchOnWindowFocus: true,
  });
}

export function useFacilityAvailability(turfId: string, facilityId: string, date: string) {
  return useQuery(facilityAvailabilityOptions(turfId, facilityId, date));
}
