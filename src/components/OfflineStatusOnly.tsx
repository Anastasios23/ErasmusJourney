import { Badge } from "@/components/ui/badge";
import { WifiOff } from "lucide-react";

const OfflineStatusOnly = () => {
  return (
    <div className="fixed bottom-4 right-4 z-40">
      <Badge
        variant="secondary"
        className="flex items-center space-x-2 px-3 py-2 bg-gray-500 text-white"
        title="Backend server not running. Start the backend to enable full functionality."
      >
        <WifiOff className="h-4 w-4" />
        <span className="text-sm font-medium">Offline Mode</span>
      </Badge>
    </div>
  );
};

export default OfflineStatusOnly;
