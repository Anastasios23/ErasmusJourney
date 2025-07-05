import { useState } from "react";
import { useRouter } from "next/router";
import BackButton from "../components/BackButton";
import { Button } from "../src/components/ui/button";

export default function TestBackPage() {
  const router = useRouter();
  const [clickCount, setClickCount] = useState(0);

  const handleTestClick = () => {
    setClickCount((prev) => prev + 1);
    console.log("Test button clicked!", clickCount + 1);
  };

  const handleManualBack = () => {
    console.log("Manual back clicked");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Back Button Test Page</h1>

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">
              BackButton Component:
            </h2>
            <BackButton fallbackUrl="/" variant="outline" />
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Test Click Counter:</h2>
            <Button onClick={handleTestClick} variant="default">
              Test Click ({clickCount})
            </Button>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Manual Back Button:</h2>
            <Button onClick={handleManualBack} variant="secondary">
              Manual Back to Home
            </Button>
          </div>

          <div className="text-sm text-gray-600">
            <p>
              History length:{" "}
              {typeof window !== "undefined"
                ? window.history.length
                : "loading..."}
            </p>
            <p>
              Referrer:{" "}
              {typeof document !== "undefined"
                ? document.referrer || "none"
                : "loading..."}
            </p>
            <p>Current path: {router.pathname}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
