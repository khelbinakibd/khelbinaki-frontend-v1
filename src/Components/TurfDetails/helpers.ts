export const formatTime = (time: string) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${minutes} ${ampm}`;
};

export const getAmenityIcon = (amenity: string) => {
  const icons: Record<string, string> = {
    Floodlights: "\uD83D\uDCA1",
    Parking: "\uD83D\uDE97",
    "Changing Room": "\uD83D\uDEBF",
    Gallery: "\uD83D\uDC65",
    Wifi: "\uD83D\uDCF6",
    WiFi: "\uD83D\uDCF6",
    Security: "\uD83D\uDEE1\uFE0F",
  };
  return icons[amenity] ?? "\u2705";
};

export const formatDateForApi = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const normalizeDateForPayload = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
};
