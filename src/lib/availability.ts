import type { AvailabilitySlot, TurfAvailability } from "../types/api.types";

export function availabilityStatusLabel(slot: Pick<AvailabilitySlot, "isAvailable" | "isTimePassed">) {
  return slot.isTimePassed ? "(Time Passed)" : slot.isAvailable ? "" : "(Unavailable)";
}

export function availableSelection(availability: TurfAvailability | null | undefined, selection: { startTime: string; endTime: string }) {
  return availability?.slots.find(slot => slot.startTime === selection.startTime
    && slot.endTime === selection.endTime && slot.isAvailable && !slot.isTimePassed);
}

export function availableInterval(slots: AvailabilitySlot[], startTime: string, endTime: string) {
  if (!startTime || !endTime || endTime <= startTime) return false;
  let next = startTime;
  const visited = new Set<string>();
  while (next !== endTime && !visited.has(next)) {
    visited.add(next);
    const slot = slots.find(item => item.startTime === next && item.isAvailable && !item.isTimePassed);
    if (!slot || slot.endTime <= next || slot.endTime > endTime) return false;
    next = slot.endTime;
  }
  return next === endTime;
}
