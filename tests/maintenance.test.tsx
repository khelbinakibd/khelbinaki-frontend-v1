import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { AxiosError } from "axios";
import type { AxiosAdapter, InternalAxiosRequestConfig } from "axios";
import { InfiniteQueryObserver, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { createCustomerSearchGuard } from "../src/lib/customerSearchGuard";
import { customerBookingMutationOptions } from "../src/lib/customerBookingMutation";
import ManualBookingForm from "../src/Dasboard/AdminDashboard/ManualBookingForm";
import ManageTurfs from "../src/Dasboard/ManagerDashboard/ManageTurfs";
import { renderToStaticMarkup } from "react-dom/server";
import api from "../src/lib/api";
import { authenticatedUserId, authStore } from "../src/Store/auth";
import { maintenanceBlockSchema } from "../src/lib/validation";
import { maintenanceError, retryRead } from "../src/lib/maintenanceErrors";
import { availableInterval, availableSelection, availabilityStatusLabel } from "../src/lib/availability";
import { getDhakaDateKey, formatMaintenanceDate } from "../src/utils/businessTime";
import {
  createMaintenanceOptions, releaseMaintenanceOptions, maintenanceBlocksOptions,
  maintenanceFacilitiesOptions, manageableTurfsOptions, invalidateMaintenance,
} from "../src/Hooks/api/useMaintenanceBlocks";
import { facilityAvailabilityOptions } from "../src/Hooks/api/useFacilityAvailability";
import TimeDropdown from "../src/Dasboard/AdminDashboard/TimeDropdown";
import { HALF_HOUR_TIMES } from "../src/Dasboard/AdminDashboard/timeOptions";
import FacilityDropdown from "../src/Dasboard/AdminDashboard/FacilityDropdown";
import MaintenanceBlocksPanel from "../src/Dasboard/AdminDashboard/MaintenanceBlocksPanel";
import type { AvailabilitySlot, User } from "../src/types/api.types";

const userId = "444444444444444444444444";
const facilityId = "111111111111111111111111";
const turfId = "222222222222222222222222";
const block = {
  _id: "333333333333333333333333", facility: facilityId, turf: turfId, date: "2099-05-31T18:00:00.000Z",
  startTime: "10:00", endTime: "11:00", reason: "Surface work", createdBy: userId,
  createdAt: "2099-05-30T08:00:00.000Z", updatedAt: "2099-05-30T08:00:00.000Z",
};
let client: QueryClient;
let requests: InternalAxiosRequestConfig[];
const originalAdapter = api.defaults.adapter;

beforeEach(() => {
  requests = [];
  client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: 1, retryDelay: 0 } } });
  const user: User = { _id: userId, name: "Test manager", email: "test@example.invalid", role: "manager", isActive: true, isVerified: true, createdAt: "", updatedAt: "" };
  authStore.setState({ user, isAuthenticated: true, accessToken: "synthetic-test-token" });
  // Refuse every request unless a test explicitly installs a fake adapter.
  api.defaults.adapter = async () => { throw new Error("Unexpected API request in offline test"); };
});
afterEach(() => { client.clear(); api.defaults.adapter = originalAdapter; authStore.setState({ user: null, isAuthenticated: false, accessToken: null }); });

function respond(data: unknown): AxiosAdapter {
  return async config => {
    requests.push(config);
    return { data, status: 200, statusText: "OK", headers: {}, config };
  };
}
function fail(status: number, data: unknown): AxiosAdapter {
  return async config => {
    requests.push(config);
    throw new AxiosError("Test failure", "ERR_BAD_RESPONSE", config, undefined, { data, status, statusText: "Failure", headers: {}, config });
  };
}
function slot(startTime = "10:00", endTime = "11:00"): AvailabilitySlot {
  return { startTime, endTime, isAvailable: true, isTimePassed: false, pricePerSlot: 100, dayTypeLabel: "SUN-THU" };
}

test("form keeps Dhaka date strings, trims reasons and rejects equal/overnight/invalid intervals", () => {
  const data = { date: "2099-06-01", startTime: "10:00", endTime: "11:00", reason: "  Surface work  " };
  assert.deepEqual(maintenanceBlockSchema.parse(data), { ...data, reason: "Surface work" });
  for (const changed of [
    { endTime: "10:00" }, { startTime: "23:00", endTime: "01:00" },
    { date: "2099-02-30" }, { startTime: "24:00" }, { reason: "x".repeat(501) },
  ]) assert.equal(maintenanceBlockSchema.safeParse({ ...data, ...changed }).success, false);
});

test("Dhaka defaults and UTC midnight serialization survive browser timezone differences", () => {
  assert.equal(getDhakaDateKey(new Date("2026-10-11T17:59:59Z")), "2026-10-11");
  assert.equal(getDhakaDateKey(new Date("2026-10-11T18:00:00Z")), "2026-10-12");
  assert.equal(formatMaintenanceDate(block.date), "2099-06-01");
});

test("string error paths are parsed; authorization/conflict/network reads have bounded retry", () => {
  const config = {} as InternalAxiosRequestConfig;
  const error = new AxiosError("invalid", "ERR_BAD_RESPONSE", config, undefined, {
    status: 400, statusText: "Invalid", headers: {}, config,
    data: { message: "Validation failed", errors: [{ path: "endTime", message: "End must be later" }] },
  });
  assert.deepEqual(maintenanceError(error).fields, { endTime: "End must be later" });
  assert.equal(retryRead(0, error), false);
  assert.equal(retryRead(0, new Error("offline")), true);
  assert.equal(retryRead(2, new Error("offline")), false);
});

test("manageable turf queries use /admin/turfs, user-specific keys and backend pagination", async () => {
  const response = { message: "Turfs retrieved successfully.", data: [], meta: { totalItems: 75, totalPage: 2, currentPage: 1, itemsPerPage: 50 } };
  api.defaults.adapter = respond(response);
  const options = manageableTurfsOptions(userId);
  await client.fetchInfiniteQuery(options);
  assert.equal(requests[0].url, "/admin/turfs");
  assert.deepEqual(requests[0].params, { page: 1, limit: 50 });
  assert.notDeepEqual(options.queryKey, manageableTurfsOptions("different-account").queryKey);
  assert.equal(options.getNextPageParam!(response, [response], 1, [1]), 2);
});

test("facility queries include inactive facilities and never set activeOnly", async () => {
  api.defaults.adapter = respond({ message: "Facilities retrieved successfully", data: [{ _id: facilityId, isActive: false }] });
  const facilities = await client.fetchQuery(maintenanceFacilitiesOptions(userId, turfId));
  assert.equal(facilities[0].isActive, false);
  assert.equal(requests[0].url, `/turfs/${turfId}/facilities`);
  assert.equal(requests[0].params, undefined);
});

test("block listing uses arrays without metadata and supports an extra empty page", async () => {
  const page = Array.from({ length: 50 }, (_, i) => ({ ...block, _id: `block-${i}` }));
  api.defaults.adapter = respond({ message: "Maintenance blocks retrieved successfully.", data: page });
  const options = maintenanceBlocksOptions(userId, facilityId, "2099-06-01");
  const result = await client.fetchInfiniteQuery(options);
  assert.equal(result.pages[0].length, 50);
  assert.deepEqual(requests[0].params, { date: "2099-06-01", includeReleased: "false", limit: 50, skip: 0 });
  assert.equal(options.getNextPageParam!(page, [page], 0, [0]), 50);
  assert.equal(options.getNextPageParam!([], [page, []], 50, [0, 50]), undefined);
});

test("creation uses existing authenticated client and the message/data contract", async () => {
  api.defaults.adapter = respond({ message: "Maintenance block created successfully.", data: block });
  const options = createMaintenanceOptions(client, userId);
  const mutation = client.getMutationCache().build(client, options);
  const data = { date: "2099-06-01", startTime: "10:00", endTime: "11:00", reason: "Surface work" };
  const result = await mutation.execute({ turfId, facilityId, data });
  assert.equal(options.retry, false);
  assert.equal(result.data._id, block._id);
  assert.equal(requests[0].url, `/facilities/${facilityId}/maintenance-blocks`);
  assert.equal(requests[0].method, "post");
  assert.deepEqual(JSON.parse(requests[0].data), data);
  assert.equal(requests[0].withCredentials, true);
  assert.equal(requests[0].headers.Authorization, "Bearer synthetic-test-token");
});

test("release sends PATCH with an empty optional body and never retries", async () => {
  api.defaults.adapter = respond({ message: "Maintenance block released successfully.", data: { ...block, releasedAt: "2099-06-01T05:00:00Z" } });
  const options = releaseMaintenanceOptions(client, userId);
  await client.getMutationCache().build(client, options).execute({ turfId, facilityId, blockId: block._id });
  assert.equal(options.retry, false);
  assert.equal(requests[0].url, `/facilities/${facilityId}/maintenance-blocks/${block._id}/release`);
  assert.equal(requests[0].method, "patch");
  assert.deepEqual(JSON.parse(requests[0].data), {});
});

test("successful mutations invalidate blocks and availability on every date for that facility", async () => {
  const keys = [
    ["maintenance-blocks", userId, facilityId, "2099-06-01"],
    ["turf-availability", turfId, facilityId, "2099-05-31"],
    ["turf-availability", turfId, facilityId, "2099-06-01"],
    ["turf-availability", turfId, "other-facility", "2099-06-01"],
    ["maintenance-blocks", "other-user", facilityId, "2099-06-01"],
  ];
  keys.forEach(key => client.setQueryData(key, {}));
  await invalidateMaintenance(client, userId, facilityId);
  assert.deepEqual(keys.map(key => client.getQueryState(key)?.isInvalidated), [true, true, true, false, false]);
});

test("conflicts refresh occupancy without duplicating POST despite the global mutation retry", async () => {
  api.defaults.adapter = fail(409, { message: "This time slot is unavailable due to maintenance" });
  const key = ["turf-availability", turfId, facilityId, "2099-06-01"];
  client.setQueryData(key, {});
  await assert.rejects(client.getMutationCache().build(client, createMaintenanceOptions(client, userId))
    .execute({ turfId, facilityId, data: { date: "2099-06-01", startTime: "10:00", endTime: "11:00" } }));
  assert.equal(requests.length, 1);
  assert.equal(client.getQueryState(key)?.isInvalidated, true);
});

test("authorization failures refresh manageable turfs and do not retry release", async () => {
  api.defaults.adapter = fail(403, { message: "Forbidden: you do not manage this turf" });
  const key = ["maintenance-turfs", userId];
  client.setQueryData(key, {});
  const blocksKey = ["maintenance-blocks", userId, facilityId, "2099-06-01"];
  const facilitiesKey = ["maintenance-facilities", userId, turfId];
  client.setQueryData(blocksKey, {});
  client.setQueryData(facilitiesKey, {});
  await assert.rejects(client.getMutationCache().build(client, releaseMaintenanceOptions(client, userId))
    .execute({ turfId, facilityId, blockId: block._id }));
  assert.equal(requests.length, 1);
  assert.equal(client.getQueryState(key)?.isInvalidated, true);
  assert.equal(client.getQueryState(blocksKey)?.isInvalidated, true);
  assert.equal(client.getQueryState(facilitiesKey)?.isInvalidated, true);
});

test("availability query shares the customer's key and never fabricates successful data", async () => {
  api.defaults.adapter = respond({ message: "ok", data: { date: "2099-06-01", dayType: "sunday-thursday", slots: [slot()] } });
  const options = facilityAvailabilityOptions(turfId, facilityId, "2099-06-01");
  assert.deepEqual(options.queryKey, ["turf-availability", turfId, facilityId, "2099-06-01"]);
  assert.equal((await client.fetchQuery(options)).slots.length, 1);
  api.defaults.adapter = respond({ message: "ok" });
  await assert.rejects(client.fetchQuery({ ...options, retry: false }), /Availability could not be loaded/);
});

test("stale selections fail for blocked, passed, missing, or interrupted intervals", () => {
  const selected = slot();
  const availability = { date: "2099-06-01", dayType: "sunday-thursday", slots: [selected] };
  assert.equal(availableSelection(undefined, selected), undefined);
  assert.ok(availableSelection(availability, selected));
  assert.equal(availableSelection({ ...availability, slots: [{ ...selected, isAvailable: false }] }, selected), undefined);
  assert.equal(availableSelection({ ...availability, slots: [{ ...selected, isTimePassed: true }] }, selected), undefined);
  assert.equal(availableInterval([slot(), slot("11:00", "12:00")], "10:00", "12:00"), true);
  assert.equal(availableInterval([slot(), { ...slot("11:00", "12:00"), isAvailable: false }], "10:00", "12:00"), false);
  assert.equal(availableInterval([slot()], "10:00", "10:00"), false);
});

test("unavailable customer slots are generic, with passed slots separately labelled", () => {
  assert.equal(availabilityStatusLabel({ isAvailable: false, isTimePassed: false }), "(Unavailable)");
  assert.equal(availabilityStatusLabel({ isAvailable: false, isTimePassed: true }), "(Time Passed)");
  assert.equal(availabilityStatusLabel({ isAvailable: true, isTimePassed: false }), "");
});

test("a manager role alone does not render maintenance actions without backend eligibility", () => {
  // Zustand's bound hook retains its original API for SSR. Temporarily supply
  // synthetic authentication in that snapshot and restore it immediately.
  const snapshot = authStore.getInitialState();
  const original = { ...snapshot };
  Object.assign(snapshot, authStore.getState());
  client.setQueryData(manageableTurfsOptions(userId).queryKey, {
    pages: [{ message: "ok", data: [], meta: { currentPage: 1, totalPage: 0, totalItems: 0, itemsPerPage: 50 } }], pageParams: [1],
  });
  try {
    const html = renderToStaticMarkup(<QueryClientProvider client={client}><MaintenanceBlocksPanel /></QueryClientProvider>);
    assert.match(html, /No manageable turfs are assigned/);
    assert.doesNotMatch(html, /Block Interval<|>Release</);
  } finally {
    Object.assign(snapshot, original);
  }
});


test("login id enables the manageable-turfs observer and resolves its first page", async () => {
  // Match the backend login response rather than the profile-shaped _id fixture.
  const loginUser = { id: userId, name: "Test manager", email: "test@example.invalid", role: "manager" };
  authStore.setState({ user: loginUser as User, isAuthenticated: true });
  const identity = authenticatedUserId(authStore.getState());
  assert.equal(identity, userId);
  assert.equal(authenticatedUserId({ isAuthenticated: false, user: loginUser }), "");
  assert.equal(authenticatedUserId({ isAuthenticated: true, user: null }), "");
  api.defaults.adapter = respond({ message: "ok", data: [{ _id: turfId }], meta: { currentPage: 1, totalPage: 1 } });
  const observer = new InfiniteQueryObserver(client, manageableTurfsOptions(identity));
  let unsubscribe = () => {};
  try {
    await new Promise<void>((resolve, reject) => {
      unsubscribe = observer.subscribe(result => {
        if (result.isError) reject(result.error);
        if (result.isSuccess) resolve();
      });
    });
    assert.equal(requests.length, 1);
    assert.equal(requests[0].url, "/admin/turfs");
    assert.equal(requests[0].params.page, 1);
    assert.equal(observer.getCurrentResult().isPending, false);
    assert.equal(observer.getCurrentResult().hasNextPage, false);
    assert.deepEqual(observer.getCurrentResult().data?.pages[0].data, [{ _id: turfId }]);
  } finally { unsubscribe(); }
});

test("missing account identity reports sign-in recovery rather than indefinite loading", () => {
  const snapshot = authStore.getInitialState();
  const original = { ...snapshot };
  Object.assign(snapshot, authStore.getState(), { user: null });
  try {
    const html = renderToStaticMarkup(<QueryClientProvider client={client}><MaintenanceBlocksPanel /></QueryClientProvider>);
    assert.match(html, /Please sign in again/);
    assert.doesNotMatch(html, /Loading manageable turfs/);
    assert.equal(requests.length, 0);
  } finally { Object.assign(snapshot, original); }
});


test("inline maintenance pins the clicked turf and retains facility/date controls and close action", () => {
  const snapshot = authStore.getInitialState();
  const original = { ...snapshot };
  Object.assign(snapshot, authStore.getState());
  client.setQueryData(manageableTurfsOptions(userId).queryKey, {
    pages: [{ message: "ok", data: [{ _id: turfId, name: "Test Turf", slug: "test-turf",
      location: { coordinates: [0, 0], address: "Test address", city: "Dhaka" }, description: "",
      images: [], amenities: [], operatingHours: { start: "08:00", end: "22:00" }, isActive: true,
      admins: [], createdAt: "", updateAt: "" }], meta: { currentPage: 1, totalPage: 1, totalItems: 1, itemsPerPage: 50 } }], pageParams: [1],
  });
  try {
    const html = renderToStaticMarkup(<QueryClientProvider client={client}><MaintenanceBlocksPanel selectedTurfId={turfId} onClose={() => {}} /></QueryClientProvider>);
    assert.match(html, /Maintenance · Test Turf/);
    assert.match(html, /Close maintenance panel/);
    assert.match(html, /id="maintenance-facility"/);
    assert.match(html, /id="maintenance-date"/);
    assert.doesNotMatch(html, /id="maintenance-turf"/);
    const denied = renderToStaticMarkup(<QueryClientProvider client={client}><MaintenanceBlocksPanel selectedTurfId="unassigned-turf" /></QueryClientProvider>);
    assert.match(denied, /You do not have maintenance access to this turf/);
    assert.doesNotMatch(denied, /Block Interval<|>Release</);
  } finally { Object.assign(snapshot, original); }
});


test("styled facility selector labels inactive selections and exposes accessible loading/empty states", () => {
  const facility = { _id: facilityId, turf: turfId, name: "Indoor court", isActive: false, pricingRules: [], createdAt: "", updatedAt: "" };
  const html = renderToStaticMarkup(<FacilityDropdown facilities={[facility]} value={facilityId} onChange={() => {}} disabled={false} loading={false} />);
  assert.match(html, /role="combobox"/);
  assert.match(html, /aria-labelledby="maintenance-facility-label"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /Indoor court \(Inactive\)/);
  assert.doesNotMatch(html, /<select/);
  const loading = renderToStaticMarkup(<FacilityDropdown facilities={[]} value="" onChange={() => {}} disabled loading />);
  assert.match(loading, /Loading facilities/);
  assert.match(loading, /aria-busy="true"/);
  assert.match(loading, /disabled=""/);
  const empty = renderToStaticMarkup(<FacilityDropdown facilities={[]} value="" onChange={() => {}} disabled={false} loading={false} />);
  assert.match(empty, /No facilities available/);
  assert.match(empty, /disabled=""/);
});


test("time selectors offer half-hour suggestions while preserving minute precision and validation", () => {
  assert.equal(HALF_HOUR_TIMES.length, 48);
  assert.deepEqual(HALF_HOUR_TIMES.slice(0, 3), ["00:00", "00:30", "01:00"]);
  assert.equal(HALF_HOUR_TIMES.at(-1), "23:30");
  const data = { date: "2099-06-01", startTime: "10:17", endTime: "11:43" };
  assert.deepEqual(maintenanceBlockSchema.parse(data), data);
  for (const endTime of ["10:17", "09:59", "24:00", "11:60"])
    assert.equal(maintenanceBlockSchema.safeParse({ ...data, endTime }).success, false);
  const html = renderToStaticMarkup(<TimeDropdown id="maintenance-start" value="10:17" onChange={() => {}} disabled={false} invalid />);
  assert.match(html, /value="10:17"/);
  assert.match(html, /type="text"/);
  assert.match(html, /role="combobox"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /aria-describedby="maintenance-start-error"/);
  assert.doesNotMatch(html, /type="time"/);
  const disabled = renderToStaticMarkup(<TimeDropdown id="maintenance-end" value="" onChange={() => {}} disabled invalid={false} />);
  assert.match(disabled, /disabled=""/);
});


test("table maintenance buttons require account-scoped backend eligibility, including later pages", () => {
  const snapshot = authStore.getInitialState();
  const original = { ...snapshot };
  const publicTurfs = [
    { _id: turfId, name: "Assigned Turf", location: { city: "Dhaka", address: "Test" }, isActive: true },
    { _id: "unassigned", name: "Other Turf", location: { city: "Dhaka", address: "Test" }, isActive: true },
  ];
  client.setQueryData(["turfs-management"], { data: publicTurfs });
  const render = () => renderToStaticMarkup(<MemoryRouter><QueryClientProvider client={client}><ManageTurfs /></QueryClientProvider></MemoryRouter>);
  const permissions = (ids: string[]) => ({
    pages: ids.map((id, index) => ({ message: "ok", data: [{ ...publicTurfs[0], _id: id }],
      meta: { currentPage: index + 1, totalPage: ids.length, totalItems: ids.length, itemsPerPage: 1 } })),
    pageParams: ids.map((_, index) => index + 1),
  });
  try {
    Object.assign(snapshot, authStore.getState());
    assert.doesNotMatch(render(), /maintenance-toggle-/); // A manager role alone is insufficient.
    client.setQueryData(["maintenance-turfs", userId], permissions(["another-assigned", turfId]));
    assert.match(render(), new RegExp(`maintenance-toggle-${turfId}`));
    assert.doesNotMatch(render(), /maintenance-toggle-unassigned/);
    Object.assign(snapshot, { user: { ...snapshot.user, role: "user" } });
    assert.match(render(), new RegExp(`maintenance-toggle-${turfId}`));
    client.setQueryData(["maintenance-turfs", userId], { pages: [{ message: "ok", data: [], meta: { currentPage: 1, totalPage: 0 } }], pageParams: [1] });
    assert.doesNotMatch(render(), /maintenance-toggle-/); // Revoked assignment.
    client.setQueryData(["maintenance-turfs", userId], permissions([turfId]));
    Object.assign(snapshot, { user: { ...snapshot.user, _id: "different-account" } });
    assert.doesNotMatch(render(), /maintenance-toggle-/); // Previous account cache grants nothing.
    Object.assign(snapshot, { isAuthenticated: false });
    assert.doesNotMatch(render(), /maintenance-toggle-/);
  } finally { Object.assign(snapshot, original); }
});


test("manual booking shows all loaded permission pages and isolates account permission data", () => {
  const snapshot = authStore.getInitialState();
  const original = { ...snapshot };
  Object.assign(snapshot, authStore.getState());
  const render = () => renderToStaticMarkup(<QueryClientProvider client={client}><ManualBookingForm /></QueryClientProvider>);
  const page = (id: string, name: string, currentPage: number) => ({ message: "ok", data: [{ _id: id, name }], meta: { currentPage, totalPage: 2 } });
  client.setQueryData(["maintenance-turfs", userId], { pages: [page(turfId, "First assigned turf", 1), page("later", "Later assigned turf", 2)], pageParams: [1, 2] });
  try {
    assert.match(render(), /First assigned turf/);
    assert.match(render(), /Later assigned turf/);
    Object.assign(snapshot, { user: { ...snapshot.user, _id: "new-account" } });
    assert.doesNotMatch(render(), /Later assigned turf/);
    Object.assign(snapshot, { user: null, isAuthenticated: false });
    assert.match(render(), /Please sign in/);
  } finally { Object.assign(snapshot, original); }
});

test("manual booking permission revocation renders no previously authorized turf", () => {
  const snapshot = authStore.getInitialState();
  const original = { ...snapshot };
  Object.assign(snapshot, authStore.getState());
  client.setQueryData(["maintenance-turfs", userId], { pages: [{ message: "ok", data: [], meta: { currentPage: 1, totalPage: 0 } }], pageParams: [1] });
  try {
    const html = renderToStaticMarkup(<QueryClientProvider client={client}><ManualBookingForm /></QueryClientProvider>);
    assert.match(html, /No manageable turfs are assigned/);
    assert.doesNotMatch(html, /Later assigned turf/);
  } finally { Object.assign(snapshot, original); }
});

test("manual interval validation matches the current backend same-day booking restriction", () => {
  assert.equal(availableInterval([slot("23:00", "00:00")], "23:00", "00:00"), false);
  assert.equal(availableInterval([slot("22:00", "23:00")], "22:00", "23:00"), true);
});


test("customer booking POST failures never retry despite the global mutation default", async () => {
  let attempts = 0;
  const mutation = client.getMutationCache().build(client, {
    ...customerBookingMutationOptions,
    mutationFn: async () => { attempts++; throw new Error("Ambiguous POST failure"); },
  });
  await assert.rejects(mutation.execute(undefined), /Ambiguous POST failure/);
  assert.equal(attempts, 1);
});


test("phone edits invalidate pending customer responses without discarding the new search", async () => {
  const guard = createCustomerSearchGuard();
  let resolveOld!: (value: string) => void;
  const oldResponse = new Promise<string>(resolve => { resolveOld = resolve; });
  let customer = "";
  let searching = true;
  const oldRequest = guard.begin();
  const pending = oldResponse.then(value => {
    if (guard.isCurrent(oldRequest)) customer = value;
  }).finally(() => { if (guard.isCurrent(oldRequest)) searching = false; });
  guard.invalidate(); // phone A -> phone B
  const newRequest = guard.begin();
  resolveOld("Customer for phone A");
  await pending;
  assert.equal(customer, "");
  assert.equal(searching, true);
  assert.equal(guard.isCurrent(newRequest), true);
  if (guard.isCurrent(newRequest)) customer = "Customer for phone B";
  assert.equal(customer, "Customer for phone B");
});

test("submission locks customer edits and invalidates searches until it finishes", () => {
  const guard = createCustomerSearchGuard();
  const pendingSearch = guard.begin();
  let phone = "01700000000";
  let name = "Current customer";
  const submitted = { phone, name };
  guard.lock();
  if (guard.canEdit()) { phone = "01800000000"; name = "Different customer"; }
  assert.deepEqual({ phone, name }, submitted);
  assert.equal(guard.isCurrent(pendingSearch), false);
  assert.equal(guard.canEdit(), false);
  guard.unlock();
  assert.equal(guard.canEdit(), true);
  guard.invalidate(); // account unmount or assignment revocation
  assert.equal(guard.isCurrent(pendingSearch), false);
});
