import TimeDropdown from "./TimeDropdown";
import FacilityDropdown from "./FacilityDropdown";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { toast } from "sonner";
import { useMaintenanceBlocks, useMaintenanceFacilities, useMaintenanceMutations, useMaintenanceTurfs } from "../../Hooks/api/useMaintenanceBlocks";
import { authenticatedUserId, authStore } from "../../Store/auth";
import { maintenanceError } from "../../lib/maintenanceErrors";
import { maintenanceBlockSchema } from "../../lib/validation";
import type { MaintenanceBlock } from "../../types/api.types";
import { formatMaintenanceDate, getDhakaDateKey, isValidDateKey } from "../../utils/businessTime";

const inputClass = "w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none text-sm bg-white disabled:opacity-50";
const buttonClass = "px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed";

function RequestError({ error, retry }: { error: unknown; retry: () => void }) {
  const parsed = maintenanceError(error);
  return <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
    <p>{parsed.message}</p>
    {parsed.status === 403 && <p>You must be explicitly assigned to this turf to manage its maintenance.</p>}
    <button type="button" onClick={retry} className="mt-2 underline font-medium">Retry</button>
  </div>;
}

export default function MaintenanceBlocksPanel({ selectedTurfId, onClose }: { selectedTurfId?: string; onClose?: () => void } = {}) {
  const [turfId, setTurfId] = useState(selectedTurfId ?? "");
  const [facilityId, setFacilityId] = useState("");
  const [date, setDate] = useState(getDhakaDateKey);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const userId = authStore(authenticatedUserId);
  const turfsQuery = useMaintenanceTurfs();
  const turfs = turfsQuery.isError ? [] : turfsQuery.data?.pages.flatMap(page => page.data) ?? [];
  // Eligibility comes exclusively from /admin/turfs, never from a role name.
  const selectedTurf = turfs.find(turf => turf._id === turfId);
  // A clicked turf may belong to a later permission page. Resolve eligibility
  // through the authenticated list before fetching any of its facilities.
  const { hasNextPage, isFetching, isError, fetchNextPage } = turfsQuery;
  useEffect(() => {
    if (selectedTurfId && !selectedTurf && hasNextPage && !isFetching && !isError) {
      void fetchNextPage();
    }
  }, [selectedTurfId, selectedTurf, hasNextPage, isFetching, isError, fetchNextPage]);
  const facilitiesQuery = useMaintenanceFacilities(selectedTurf?._id ?? "");
  const selectedFacility = facilitiesQuery.isError ? undefined : facilitiesQuery.data?.find(facility => facility._id === facilityId);
  const blocksQuery = useMaintenanceBlocks(selectedFacility?._id ?? "", date);
  const { create, release } = useMaintenanceMutations();
  const blocks = blocksQuery.isError && maintenanceError(blocksQuery.error).status === 403 ? []
    : [...new Map((blocksQuery.data?.pages.flat() ?? []).map(block => [block._id, block])).values()];
  const pending = create.isPending || release.isPending;
  const canMutate = !!selectedTurf && !!selectedFacility && isValidDateKey(date)
    && !turfsQuery.isFetching && !facilitiesQuery.isFetching && !blocksQuery.isFetching && !blocksQuery.isError && !pending;

  function resetErrors() {
    setFields({});
    create.reset();
    release.reset();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetErrors();
    const result = maintenanceBlockSchema.safeParse({ date, startTime, endTime, reason });
    if (!result.success) {
      setFields(Object.fromEntries(result.error.issues.map(issue => [issue.path.join("."), issue.message])));
      return;
    }
    if (!canMutate || !selectedFacility?.isActive) return;
    try {
      const response = await create.mutateAsync({ turfId, facilityId, data: {
        ...result.data, reason: result.data.reason || undefined,
      } });
      toast.success(response.message);
      setStartTime(""); setEndTime(""); setReason("");
    } catch (error) {
      setFields(maintenanceError(error).fields);
    }
  }

  async function releaseBlock(block: MaintenanceBlock) {
    if (!canMutate || !window.confirm(`Release maintenance on ${formatMaintenanceDate(block.date)}, ${block.startTime}–${block.endTime}?`)) return;
    resetErrors();
    try {
      const response = await release.mutateAsync({ turfId, facilityId, blockId: block._id });
      toast.success(response.message);
    } catch {
      // The mutation error remains visible below; no automatic mutation retry.
    }
  }

  return <section aria-labelledby="maintenance-title" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
    <div className="flex items-start justify-between gap-3">
      <h2 id="maintenance-title" className="text-lg font-semibold text-emerald-700">Maintenance{selectedTurf ? ` · ${selectedTurf.name}` : " Slot Blocking"}</h2>
      {onClose && <button type="button" onClick={onClose} className={buttonClass} aria-label="Close maintenance panel">Close</button>}
    </div>
    <p className="text-sm text-gray-600 mt-1 mb-3">Manage maintenance intervals for your facilities. All dates and times are Asia/Dhaka.</p>

    {!userId && <p role="alert" className="text-sm text-red-700">Your account identity is unavailable. Please sign in again.</p>}
    {turfsQuery.isLoading && <p role="status" className="text-sm text-gray-500">Loading manageable turfs…</p>}
    {turfsQuery.isError && <RequestError error={turfsQuery.error} retry={() => { void turfsQuery.refetch(); }} />}
    {turfsQuery.isSuccess && turfs.length === 0 && <p className="text-sm text-gray-600">No manageable turfs are assigned to your account.</p>}

    {selectedTurfId && turfsQuery.isSuccess && !selectedTurf && !turfsQuery.hasNextPage && <p role="alert" className="text-sm text-red-700">You do not have maintenance access to this turf.</p>}
    <div className={`grid grid-cols-1 ${selectedTurfId ? "sm:grid-cols-2" : "md:grid-cols-3"} gap-4 my-4`}>
      {!selectedTurfId && <div>
        <label htmlFor="maintenance-turf" className="block text-sm font-medium mb-1">Turf</label>
        <select id="maintenance-turf" value={selectedTurf?._id ?? ""} disabled={pending || turfsQuery.isPending || turfsQuery.isError} className={inputClass}
          onChange={event => { setTurfId(event.target.value); setFacilityId(""); setStartTime(""); setEndTime(""); resetErrors(); }}>
          <option value="">Select a manageable turf</option>
          {turfs.map(turf => <option key={turf._id} value={turf._id}>{turf.name}</option>)}
        </select>
        {turfsQuery.hasNextPage && <button type="button" className="text-sm text-emerald-700 underline mt-2" disabled={pending || turfsQuery.isFetchingNextPage}
          onClick={() => { void turfsQuery.fetchNextPage(); }}>{turfsQuery.isFetchingNextPage ? "Loading…" : "Load more turfs"}</button>}
      </div>}
      <div>
        <label id="maintenance-facility-label" htmlFor="maintenance-facility" className="block text-sm font-medium mb-1">Facility</label>
        <FacilityDropdown facilities={facilitiesQuery.data ?? []} value={selectedFacility?._id ?? ""}
          disabled={pending || !selectedTurf || facilitiesQuery.isPending || facilitiesQuery.isError}
          loading={!!selectedTurf && facilitiesQuery.isPending}
          onChange={id => { setFacilityId(id); setStartTime(""); setEndTime(""); resetErrors(); }} />
        {selectedTurf && facilitiesQuery.isSuccess && facilitiesQuery.data.length === 0 && <p className="text-sm text-gray-500 mt-2">No facilities found for this turf.</p>}
      </div>
      <div>
        <label htmlFor="maintenance-date" className="block text-sm font-medium mb-1">Date (Asia/Dhaka)</label>
        <input id="maintenance-date" type="date" value={date} disabled={pending} className={inputClass}
          onChange={event => { setDate(event.target.value); setStartTime(""); setEndTime(""); resetErrors(); }} />
        {fields.date && <p role="alert" className="text-sm text-red-600 mt-1">{fields.date}</p>}
      </div>
    </div>

    {selectedTurf && facilitiesQuery.isError && <RequestError error={facilitiesQuery.error} retry={() => { void facilitiesQuery.refetch(); }} />}
    {selectedFacility && <>
      {!selectedFacility.isActive && <p className="text-sm text-amber-800 bg-amber-50 rounded-xl p-3 mb-4">This facility is inactive. You can view and release blocks, but cannot create new ones.</p>}
      <div className="mb-6">
        <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
          <h3 className="font-semibold text-gray-800">Active Maintenance Blocks</h3>
          <button type="button" className={buttonClass} disabled={pending || blocksQuery.isFetching || !isValidDateKey(date)} onClick={() => { void blocksQuery.refetch(); }}>Refresh</button>
        </div>
        {!isValidDateKey(date) ? <p className="text-sm text-gray-500">Choose a valid date to view blocks.</p>
          : blocksQuery.isPending ? <p role="status" className="text-sm text-gray-500">Loading maintenance blocks…</p>
            : <>
              {blocksQuery.isError && <RequestError error={blocksQuery.error} retry={() => { void blocksQuery.refetch(); }} />}
              {!blocksQuery.isError && blocks.length === 0 && <p className="text-sm text-gray-500">No active maintenance blocks for this date.</p>}
              <ul className="space-y-3">
                {blocks.map(block => <li key={block._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-gray-200 rounded-xl p-4">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800"><time dateTime={block.date}>{formatMaintenanceDate(block.date)}</time> · {block.startTime}–{block.endTime}</p>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap break-words mt-1">{block.reason || "No reason provided"}</p>
                  </div>
                  <button type="button" className={`${buttonClass} shrink-0 text-emerald-700`} disabled={!canMutate} onClick={() => { void releaseBlock(block); }}>
                    {release.isPending && release.variables?.blockId === block._id ? "Releasing…" : "Release"}
                  </button>
                </li>)}
              </ul>
              {blocksQuery.hasNextPage && <button type="button" className={`${buttonClass} mt-3`} disabled={pending || blocksQuery.isFetching} onClick={() => { void blocksQuery.fetchNextPage(); }}>
                {blocksQuery.isFetchingNextPage ? "Loading…" : "Load more blocks"}
              </button>}
            </>}
      </div>

      <form onSubmit={submit} noValidate className="border-t border-gray-100 pt-5">
        <h3 className="font-semibold text-gray-800 mb-3">Block a Time Interval</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="maintenance-start" className="block text-sm font-medium mb-1">Start Time (HH:mm)</label>
            <TimeDropdown id="maintenance-start" value={startTime} disabled={pending || !selectedFacility.isActive} invalid={!!fields.startTime}
              onChange={value => { setStartTime(value); resetErrors(); }} />
            {fields.startTime && <p id="maintenance-start-error" role="alert" className="text-sm text-red-600 mt-1">{fields.startTime}</p>}
          </div>
          <div>
            <label htmlFor="maintenance-end" className="block text-sm font-medium mb-1">End Time (HH:mm)</label>
            <TimeDropdown id="maintenance-end" value={endTime} disabled={pending || !selectedFacility.isActive} invalid={!!fields.endTime}
              onChange={value => { setEndTime(value); resetErrors(); }} />
            {fields.endTime && <p id="maintenance-end-error" role="alert" className="text-sm text-red-600 mt-1">{fields.endTime}</p>}
          </div>
        </div>
        <label htmlFor="maintenance-reason" className="block text-sm font-medium mt-4 mb-1">Reason (optional)</label>
        <textarea id="maintenance-reason" value={reason} maxLength={500} rows={2} disabled={pending || !selectedFacility.isActive} className={inputClass}
          onChange={event => { setReason(event.target.value); resetErrors(); }} />
        <p className="text-xs text-gray-500 mt-1">{reason.length}/500 characters · Same-day intervals only.</p>
        {fields.reason && <p role="alert" className="text-sm text-red-600 mt-1">{fields.reason}</p>}
        <button type="submit" disabled={!canMutate || !selectedFacility.isActive} className="mt-4 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed">
          {create.isPending ? "Blocking…" : "Block Interval"}
        </button>
      </form>
    </>}
    {create.isError && <div role="alert" className="text-sm text-red-700 bg-red-50 p-3 rounded-xl mt-3">{maintenanceError(create.error).message} {maintenanceError(create.error).status === 409 && "Refresh the block list and choose another interval."}</div>}
    {release.isError && <div role="alert" className="mt-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm">{maintenanceError(release.error).message} You can try Release again after refreshing.</div>}
  </section>;
}
