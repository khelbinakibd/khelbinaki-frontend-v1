import { Link } from "react-router";
import { TurfCardSkeleton } from "./TurfCardSkeleton";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Calendar, Search, ArrowBigDownDash } from "lucide-react";
import api from "../lib/api";
import type { ApiResponse, Turf } from "../types/api.types";

// Props interface
interface TurfListProps {
  location?: string;
}

const TurfList: React.FC<TurfListProps> = ({ location = "" }) => {
  const [showAll, setShowAll] = useState(false);

  // Fetch all turfs (no filtering from server)
  const { data, isLoading, error } = useQuery({
    queryKey: ["turfs"],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Turf[]>>("/turfs");
      return response.data;
    },
  });

  // Icon mapping for amenities
  const getAmenityIcon = (amenity: string) => {
    const icons: Record<string, string> = {
      WiFi: "📶",
      Wifi: "📶",
      Floodlights: "💡",
      Parking: "🚗",
      "Changing Room": "🚿",
      Gallery: "👥",
      Security: "🛡️",
    };
    return icons[amenity] || "✨";
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50/30">
        <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <TurfCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-red-50/30">
        <div className="text-center p-12 bg-white rounded-3xl shadow-2xl border border-red-100 max-w-md mx-auto">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Oops! Something went wrong
          </h3>
          <p className="text-gray-600 mb-8">
            We couldn't load the turfs. Please try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:scale-105 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // turf data
  const turfs = data?.data || [];

  // 🔍 Frontend filtering logic
  const filteredTurfs = location
    ? turfs.filter((turf) => {
        const city = turf.location?.city?.toLowerCase() || "";
        const address = turf.location?.address?.toLowerCase() || "";
        return (
          city.includes(location.toLowerCase()) ||
          address.includes(location.toLowerCase()) ||
          turf.name.toLowerCase().includes(location.toLowerCase())
        );
      })
    : turfs;

  const visibleTurfs = showAll
    ? filteredTurfs
    : filteredTurfs.slice(0, 6);

  return (
    <div className="">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Search indicator */}
        {location && (
          <div className="mb-6 flex items-center gap-2 text-gray-600">
            <Search className="w-5 h-5" />
            <span>
              Showing results for:{" "}
              <strong className="text-green-600">{location}</strong>
            </span>
          </div>
        )}

        {/* Turf Cards Grid - Centered */}
        <div className="flex flex-wrap justify-center gap-8">
          {visibleTurfs.map((turf) => (
            <div
              key={turf._id}
              className="group relative bg-white rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-green-200 hover:scale-[1.02] flex flex-col w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] max-w-sm"
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={
                    turf.images?.[0] ||
                    "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop"
                  }
                  alt={turf.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                <div className="absolute top-4 right-4 bg-gradient-to-r from-green-600 to-green-800 text-white text-sm px-3 py-1.5 rounded-full font-bold shadow-lg">
                  ৳{turf.defaultPricePerSlot}/hr
                </div>
                <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                  <div className="bg-white/20 rounded-full p-2">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="font-medium">
                    {turf.location.address}, {turf.location.city}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-green-600 transition-colors line-clamp-1">
                    {turf.name}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500 mt-2">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Available Today</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {turf.amenities.slice(0, 3).map((amenity) => (
                      <div
                        key={amenity}
                        className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-100"
                      >
                        <span>{getAmenityIcon(amenity)}</span>
                        <span>{amenity}</span>
                      </div>
                    ))}
                    {turf.amenities.length > 3 && (
                      <div className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        +{turf.amenities.length - 3} more
                      </div>
                    )}
                  </div>
                </div>

                <Link to={`/turfs/${turf.slug}`} className="block mt-4">
                  <button className="w-full bg-gradient-to-r from-green-600 to-green-800 text-white py-2 rounded font-semibold hover:scale-[1.02] transition-all duration-300">
                    View Details & Book →
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTurfs.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              No turfs found
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {location
                ? `We couldn't find any turfs in "${location}". Try searching for a different location.`
                : "We couldn't find any turfs matching your search."}
            </p>
          </div>
        )}

        {/* See More Button */}
        {!showAll && filteredTurfs.length > 6 && (
          <div className="text-center mt-16">
            <button
              onClick={() => setShowAll(true)}
              className="px-8 py-3 bg-white text-green-600 border-2 border-green-600 rounded-2xl font-semibold hover:bg-green-600 hover:text-white transform hover:scale-105 transition-all duration-300 shadow-lg flex justify-center items-center mx-auto gap-x-2"
            >
              See More Turfs <ArrowBigDownDash />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TurfList;