// Booking POSTs must not replay after an ambiguous network failure.
export const customerBookingMutationOptions = { retry: false as const };
