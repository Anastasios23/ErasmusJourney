import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestDestination() {
  const [destinationId, setDestinationId] = useState("");
  const [destinationData, setDestinationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchDestination = async () => {
    if (!destinationId) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/destinations/${destinationId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setDestinationData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Test Destination API</h1>

      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Enter destination ID (e.g., berlin-germany)"
          value={destinationId}
          onChange={(e) => setDestinationId(e.target.value)}
          className="flex-1"
        />
        <Button onClick={fetchDestination} disabled={loading}>
          {loading ? "Loading..." : "Fetch Destination"}
        </Button>
      </div>

      {error && (
        <Card className="mb-6 border-red-200">
          <CardContent className="p-4">
            <p className="text-red-600">Error: {error}</p>
          </CardContent>
        </Card>
      )}

      {destinationData && (
        <Card>
          <CardHeader>
            <CardTitle>Destination Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(destinationData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
