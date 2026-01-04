import type { Turf } from "../../types/api.types";

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
    </div>
  );
};

export default AboutSection;
