import React from "react";

export default function Loader() {
  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="flex flex-col items-center gap-4">
        {/* Animated spinner */}
        <div className="w-16 h-16 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>

        {/* Text with smooth fade animation */}
        <p className="text-green-700 text-lg font-semibold animate-pulse tracking-wide">
          Loading, please wait...
        </p>
      </div>
    </div>
  );
}
