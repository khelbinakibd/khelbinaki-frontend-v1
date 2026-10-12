// Track customer identity separately from facility/slot selection changes.
export function createCustomerSearchGuard() {
  let version = 0;
  let locked = false;
  return {
    invalidate() { version++; },
    begin() { return ++version; },
    isCurrent(request: number) { return request === version; },
    canEdit() { return !locked; },
    lock() { locked = true; version++; },
    unlock() { locked = false; },
  };
}
