// Test the city aggregation API endpoint
async function testCityAggregationAPI() {
  console.log("Testing City Aggregation API...\n");

  try {
    // Test 1: Get all cities data
    console.log("🔍 Testing: GET /api/destinations/city-aggregated?all=true");
    const allCitiesResponse = await fetch(
      "http://localhost:3000/api/destinations/city-aggregated?all=true",
    );
    const allCitiesResult = await allCitiesResponse.json();

    if (allCitiesResponse.ok) {
      console.log("✅ All cities endpoint successful");
      console.log(
        `   Found ${allCitiesResult.data?.length || 0} cities with data`,
      );
      if (allCitiesResult.data?.length > 0) {
        console.log(
          `   Sample: ${allCitiesResult.data[0].city}, ${allCitiesResult.data[0].country}`,
        );
      }
    } else {
      console.log("❌ All cities endpoint failed:", allCitiesResult.error);
    }

    console.log("\n---\n");

    // Test 2: Get specific city data (if we have data)
    if (allCitiesResult.data?.length > 0) {
      const sampleCity = allCitiesResult.data[0];
      console.log(
        `🔍 Testing: GET /api/destinations/city-aggregated?city=${sampleCity.city}&country=${sampleCity.country}`,
      );

      const cityResponse = await fetch(
        `http://localhost:3000/api/destinations/city-aggregated?city=${encodeURIComponent(sampleCity.city)}&country=${encodeURIComponent(sampleCity.country)}`,
      );
      const cityResult = await cityResponse.json();

      if (cityResponse.ok) {
        console.log("✅ Specific city endpoint successful");
        console.log(
          `   City: ${cityResult.data.city}, ${cityResult.data.country}`,
        );
        console.log(
          `   Total submissions: ${cityResult.data.totalSubmissions}`,
        );
        console.log(
          `   Average monthly total cost: €${cityResult.data.livingCosts.avgTotalMonthly}`,
        );
        console.log(
          `   Overall rating: ${cityResult.data.ratings.avgOverallRating}/5`,
        );
        console.log(
          `   Recommendation rate: ${cityResult.data.recommendations.recommendationPercentage}%`,
        );
      } else {
        console.log("❌ Specific city endpoint failed:", cityResult.error);
      }
    } else {
      console.log(
        "🔍 Testing: GET /api/destinations/city-aggregated?city=TestCity&country=TestCountry",
      );
      const testResponse = await fetch(
        "http://localhost:3000/api/destinations/city-aggregated?city=TestCity&country=TestCountry",
      );
      const testResult = await testResponse.json();

      if (testResponse.status === 404) {
        console.log("✅ No data endpoint correctly returns 404");
        console.log(
          "   This is expected when no published submissions exist for a city",
        );
      } else {
        console.log(
          "❌ Unexpected response for non-existent city:",
          testResult,
        );
      }
    }
  } catch (error) {
    console.error("❌ API test failed:", error.message);
    console.log(
      "\n💡 Make sure the development server is running with: npm run dev",
    );
  }
}

// Run if this file is executed directly
if (typeof window === "undefined") {
  testCityAggregationAPI();
}

export default testCityAggregationAPI;
