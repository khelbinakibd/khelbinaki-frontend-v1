// Offline Indicator Component
import { WifiOff } from "lucide-react";
import { useNetworkStatus } from "../Hooks/useNetworkStatus";

const OfflineIndicator = () => {
  const isOnline = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white py-2 px-4 flex items-center justify-center gap-2 shadow-lg">
      <WifiOff className="w-5 h-5" />
      <span className="font-semibold">No internet connection. Please check your network.</span>
    </div>
  );
};

export default OfflineIndicator;
