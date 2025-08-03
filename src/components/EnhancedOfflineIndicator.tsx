import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, RefreshCw } from "lucide-react";

interface EnhancedOfflineIndicatorProps {
  showDraftStatus?: boolean;
  className?: string;
}

const EnhancedOfflineIndicator: React.FC<EnhancedOfflineIndicatorProps> = ({
  showDraftStatus = true,
  className = "",
}) => {
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  // Listen for localStorage changes to track draft saves
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith("erasmus_")) {
        setLastSaveTime(new Date());
      }
    };

    // Check for existing drafts on component mount
    const checkExistingDrafts = () => {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("erasmus_")) {
          const item = localStorage.getItem(key);
          if (item) {
            try {
              const data = JSON.parse(item);
              if (data.timestamp) {
                setLastSaveTime(new Date(data.timestamp));
              }
            } catch (error) {
              // Silent fail for invalid JSON
            }
          }
          break; // Just need to know if drafts exist
        }
      }
    };

    checkExistingDrafts();
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Draft status indicator (only shows when there are local drafts)
  const DraftStatusIndicator = () => {
    if (!showDraftStatus || !lastSaveTime || isDismissed) return null;

    return (
      <div className={`fixed top-20 right-4 z-40 ${className}`}>
        <Badge
          variant="secondary"
          className="flex items-center space-x-2 px-3 py-2 shadow-lg bg-blue-50 text-blue-700 border-blue-200"
        >
          <Save className="h-3 w-3" />
          <span className="text-xs font-medium">
            Draft saved at{" "}
            {lastSaveTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <button
            onClick={() => setIsDismissed(true)}
            className="ml-1 text-blue-500 hover:text-blue-700 text-xs"
          >
            ×
          </button>
        </Badge>
      </div>
    );
  };

  return <DraftStatusIndicator />;
};

export default EnhancedOfflineIndicator;
