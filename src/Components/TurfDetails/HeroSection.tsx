import { MapPin } from "lucide-react";
import type { Turf } from "../../types/api.types";

interface HeroSectionProps {
  turf: Turf;
}

const HeroSection = ({ turf }: HeroSectionProps) => {
  return (
    <div className="relative mb-12">
      <div className="relative h-96 rounded-3xl overflow-hidden shadow-2xl">
        <img
          src={turf.images?.[0] || "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1200&h=600&fit=crop"}
          alt={turf.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute bottom-8 left-8 right-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white drop-shadow-lg mb-3">{turf.name}</h1>
              <div className="flex items-center gap-4 text-white/90">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span className="text-lg">
                    {turf.location.address}, {turf.location.city}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="text-center">
                <p className="text-white/80 text-sm mb-1">Starting from</p>
                <p className="text-3xl font-bold text-white">৳ {turf.defaultPricePerSlot}</p>
                <p className="text-white/80 text-sm">per hour</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
