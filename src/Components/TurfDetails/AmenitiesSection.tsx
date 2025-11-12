import type { Turf } from "../../types/api.types";
import { getAmenityIcon } from "./helpers";

interface AmenitiesSectionProps {
  turf: Turf;
}

const AmenitiesSection = ({ turf }: AmenitiesSectionProps) => {
  if (!turf.amenities?.length) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-8 ">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <span className="text-blue-600">⚡</span>
        </div>
        Amenities &amp; Features
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {turf.amenities.map((amenity, idx) => (
          <div
            key={`${amenity}-${idx}`}
            className="bg-gray-50 rounded-xl p-4 text-center hover:bg-gray-100 transition-colors"
          >
            <span className="text-2xl block mb-2">{getAmenityIcon(amenity)}</span>
            <span className="text-sm font-medium text-gray-700">{amenity}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AmenitiesSection;
