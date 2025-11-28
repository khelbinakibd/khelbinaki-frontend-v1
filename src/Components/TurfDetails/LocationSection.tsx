import { MapPin } from "lucide-react";
import type { Turf } from "../../types/api.types";

interface LocationSectionProps {
  turf: Turf & { googleMap?: string };
}

const LocationSection = ({ turf }: LocationSectionProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
          <MapPin className="w-5 h-5 text-red-600" />
        </div>
        Location &amp; Directions
      </h3>
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="font-medium text-gray-800 mb-1">Address</p>
          <p className="text-gray-600">
            {turf.location.address}, {turf.location.city}
          </p>
        </div>

        {turf.googleMap ? (
          <div className="w-full h-64 rounded-xl overflow-hidden shadow-sm">
            <iframe
              width="100%"
              height="100%"
              src={turf.googleMap}
              title="Turf Location"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        ) : (
          <div className="w-full h-32 rounded-xl border border-dashed border-gray-200 flex items-center justify-center text-gray-500">
            Map embed is not available for this turf.
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationSection;
