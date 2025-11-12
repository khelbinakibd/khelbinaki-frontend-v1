import { Clock, Users } from "lucide-react";
import type { Turf } from "../../types/api.types";
import { formatTime } from "./helpers";

interface AboutSectionProps {
  turf: Turf;
}

const AboutSection = ({ turf }: AboutSectionProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
          <span className="text-green-600">ℹ️</span>
        </div>
        About This Turf
      </h2>
      <p className="text-gray-600 leading-relaxed">{turf.description}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-semibold text-gray-800">Operating Hours</p>
              <p className="text-green-700">
                {formatTime(turf.operatingHours.start)} - {formatTime(turf.operatingHours.end)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-semibold text-gray-800">Capacity</p>
              <p className="text-blue-700">Up to 22 players</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
