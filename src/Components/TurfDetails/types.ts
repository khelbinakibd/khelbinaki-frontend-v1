export type LocalSlot = {
  startTime: string;
  endTime: string;
  pricePerSlot: number;
  isAvailable: boolean;
  isTimePassed: boolean;
  isBooked?: boolean;
};
