import { useState } from "react";
import Head from "next/head";
import { Button } from "../src/components/ui/button";
import { Input } from "../src/components/ui/input";
import { Label } from "../src/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import { Badge } from "../src/components/ui/badge";
import Header from "../components/Header";

export default function TestCityAggregation() {
  const [city, setCity] = useState("Barcelona");
  const [country, setCountry] = useState("Spain");
  const [testDataCount, setTestDataCount] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [aggregationData, setAggregationData] = useState<any>(null);

  const generateTestData = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/test/generate-city-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city,
          country,
          count: testDataCount,
        }),
      });

      const data = await response.json();
      setResults(data);
      
      if (data.aggregatedData) {
        setAggregationData(data.aggregatedData);
      }
    } catch (error) {
      console.error("Error generating test data:", error);
      setResults({ error: "Failed to generate test data" });
    } finally {
      setIsGenerating(false);
    }
  };

  const testAggregation = async () => {
    setIsTesting(true);
    try {
      const response = await fetch(
        `/api/destinations/city-aggregated?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`
      );
      const data = await response.json();
      setAggregationData(data.success ? data.data : data);
    } catch (error) {
      console.error("Error testing aggregation:", error);
      setAggregationData({ error: "Failed to test aggregation" });
    } finally {
      setIsTesting(false);
    }
  };

  const getAllCities = async () => {
    setIsTesting(true);
    try {
      const response = await fetch("/api/destinations/city-aggregated?all=true");
      const data = await response.json();
      setAggregationData(data);
    } catch (error) {
      console.error("Error getting all cities:", error);
      setAggregationData({ error: "Failed to get all cities" });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <>
      <Head>
        <title>City Aggregation Test - Development</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="pt-20 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                City Aggregation Test
              </h1>
              <Badge variant="secondary">Development Only</Badge>
              <p className="text-gray-600 mt-2">
                Test the city data aggregation system with sample data
              </p>
            </div>

            {/* Test Data Generation */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Generate Test Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Barcelona"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Spain"
                    />
                  </div>
                  <div>
                    <Label htmlFor="count">Number of Students</Label>
                    <Input
                      id="count"
                      type="number"
                      value={testDataCount}
                      onChange={(e) => setTestDataCount(parseInt(e.target.value))}
                      min="1"
                      max="10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Button
                    onClick={generateTestData}
                    disabled={isGenerating}
                    className="flex-1"
                  >
                    {isGenerating ? "Generating..." : "Generate Test Data"}
                  </Button>
                  <Button
                    onClick={testAggregation}
                    disabled={isTesting}
                    variant="outline"
                  >
                    {isTesting ? "Testing..." : "Test Aggregation"}
                  </Button>
                  <Button
                    onClick={getAllCities}
                    disabled={isTesting}
                    variant="outline"
                  >
                    Get All Cities
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            {results && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Generation Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                    {JSON.stringify(results, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}

            {/* Aggregation Data */}
            {aggregationData && (
              <Card>
                <CardHeader>
                  <CardTitle>Aggregation Data</CardTitle>
                </CardHeader>
                <CardContent>
                  {aggregationData.error ? (
                    <div className="text-red-600">
                      Error: {aggregationData.error}
                    </div>
                  ) : aggregationData.cities ? (
                    <div>
                      <h3 className="font-semibold mb-2">All Cities ({aggregationData.totalCities})</h3>
                      <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                        {JSON.stringify(aggregationData, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div>
                      {aggregationData.city && (
                        <div className="mb-4">
                          <h3 className="font-semibold mb-2">
                            {aggregationData.city}, {aggregationData.country}
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {aggregationData.totalSubmissions}
                              </div>
                              <div className="text-sm text-gray-600">Students</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">
                                {aggregationData.recommendations?.recommendationPercentage || 0}%
                              </div>
                              <div className="text-sm text-gray-600">Recommend</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600">
                                {aggregationData.ratings?.avgOverallRating?.toFixed(1) || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-600">Rating</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-orange-600">
                                €{Math.round(aggregationData.livingCosts?.avgTotalMonthly || 0)}
                              </div>
                              <div className="text-sm text-gray-600">Monthly</div>
                            </div>
                          </div>
                        </div>
                      )}
                      <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                        {JSON.stringify(aggregationData, null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
