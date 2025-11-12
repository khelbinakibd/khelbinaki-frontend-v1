import { Clock } from "lucide-react";
import type { Turf } from "../../types/api.types";
import { formatTime } from "./helpers";

interface PricingSectionProps {
  turf: Turf;
}

const formatDayTypeLabel = (dayType: string) => {
  if (dayType === "friday-saturday") return "Friday to Saturday";
  if (dayType === "sunday-thursday") return "Sunday to Thursday";
  if (dayType === "all-days") return "All Days";
  return dayType;
};

const PricingSection = ({ turf }: PricingSectionProps) => {
  if (!turf.pricingRules?.length) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
          <span className="text-green-600">💰</span>
        </div>
        Pricing Structure
      </h3>
      <div className="space-y-6">
        {turf.pricingRules.map((rule, idx) => (
          <div key={`${rule.dayType}-${idx}`} className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
              <h4 className="font-bold text-white capitalize sm:text-lg text-base">{formatDayTypeLabel(rule.dayType)}</h4>
            </div>
            <div className="p-6">
              <div className="grid gap-4">
                {rule.timeSlots.map((slot, slotIdx) => (
                  <div
                    key={`${slot.startTime}-${slotIdx}`}
                    className="flex items-center justify-between p-4 bg-gray-50 sm:text-lg text-xs rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-gray-500" />
                      <span className="font-medium  text-gray-800">
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </span>
                    </div>
                    <span className="md:text-2xl text-xs font-bold text-green-600">৳{slot.pricePerSlot} /hour</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingSection;
