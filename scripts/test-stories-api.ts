async function testStoriesAPI() {
  console.log("🧪 Testing Stories API...\n");

  try {
    const response = await fetch("http://localhost:3000/api/stories");

    if (!response.ok) {
      console.log(`❌ Error: ${response.status} ${response.statusText}`);
      return;
    }

    const data = await response.json();
    console.log(`✅ Response received: ${data.stories.length} stories`);

    if (data.stories.length > 0) {
      console.log("\n📚 Sample stories:");
      data.stories.forEach((story: any, index: number) => {
        console.log(`${index + 1}. ${story.title}`);
        console.log(`   Author: ${story.author.name}`);
        console.log(
          `   Location: ${story.location.city}, ${story.location.country}`,
        );
        console.log(`   Photos: ${story.photos.length}`);
        console.log(`   Excerpt: ${story.excerpt.slice(0, 100)}...`);
        console.log("");
      });
    }
  } catch (error) {
    console.error("❌ Error testing stories API:", error);
  }
}

testStoriesAPI();
