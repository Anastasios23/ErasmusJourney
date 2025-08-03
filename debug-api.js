// Simple test to check the API endpoint structure
const testAPI = async () => {
  try {
    console.log("Testing API endpoint...");

    const response = await fetch(
      "http://localhost:3000/api/destinations/city-aggregated?all=true",
    );
    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries()),
    );

    if (response.ok) {
      const data = await response.json();
      console.log("API Response structure:", {
        keys: Object.keys(data),
        hasData: "data" in data,
        hasCities: "cities" in data,
        dataType: Array.isArray(data.data) ? "array" : typeof data.data,
        citiesType: Array.isArray(data.cities) ? "array" : typeof data.cities,
        dataLength: Array.isArray(data.data) ? data.data.length : "not array",
        citiesLength: Array.isArray(data.cities)
          ? data.cities.length
          : "not array",
      });

      if (data.cities && Array.isArray(data.cities) && data.cities.length > 0) {
        console.log("Sample city data:", data.cities[0]);
      }

      if (data.data && Array.isArray(data.data) && data.data.length > 0) {
        console.log("Sample data:", data.data[0]);
      }
    } else {
      const errorText = await response.text();
      console.error("API Error:", errorText);
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
};

// Call this function in your browser console to test
console.log("Run testAPI() in your browser console to test the endpoint");
window.testAPI = testAPI;
