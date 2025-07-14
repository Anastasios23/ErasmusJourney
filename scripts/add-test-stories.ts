import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function addTestStories() {
  console.log("📚 Adding test story data...");

  try {
    // Create a test user for stories
    const testUser = await prisma.user.upsert({
      where: { email: "storyteller@student.ucy.ac.cy" },
      update: {},
      create: {
        email: "storyteller@student.ucy.ac.cy",
        firstName: "Alexandra",
        lastName: "Petrou",
        password: "hashedpassword",
        nationality: "Cypriot",
        homeCity: "Paphos",
        homeCountry: "Cyprus",
      },
    });

    // Create test stories
    const testStories = [
      {
        userId: testUser.id,
        type: "STORY",
        title: "My Incredible Semester in Barcelona",
        data: {
          storyTitle: "My Incredible Semester in Barcelona",
          overallDescription:
            "Barcelona exceeded all my expectations! From the stunning architecture of Gaudí to the vibrant beach culture, every day was an adventure. I studied business at UPC and made friends from all over the world. The city's perfect blend of history and modernity, combined with the warm Mediterranean climate, made it an ideal place for studying abroad. I explored every neighborhood, tried amazing tapas, learned to appreciate flamenco, and even picked up some Catalan phrases. This experience truly broadened my perspective and gave me confidence to pursue my dreams globally.",
          firstName: "Alexandra",
          lastName: "Petrou",
          hostCity: "Barcelona",
          hostCountry: "Spain",
          hostUniversity: "Universitat Politècnica de Catalunya",
          universityInCyprus: "University of Cyprus",
          year: "2024",
          exchangePeriod: "Spring 2024",
          photos: [
            {
              id: "1",
              image:
                "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=600&fit=crop",
              caption: "The iconic Sagrada Familia - breathtaking architecture",
              location: "Sagrada Familia, Barcelona",
              description:
                "Visiting Gaudí's masterpiece was a highlight of my time in Barcelona.",
            },
            {
              id: "2",
              image:
                "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&h=600&fit=crop",
              caption: "Study session at UPC campus",
              location: "UPC Campus, Barcelona",
              description:
                "The university facilities were modern and inspiring.",
            },
            {
              id: "3",
              image:
                "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
              caption: "Weekend beach time with international friends",
              location: "Barceloneta Beach",
              description: "Nothing beats studying by the Mediterranean Sea!",
            },
          ],
          tags: ["barcelona", "business", "architecture", "beach", "friends"],
          allowPublicUse: true,
        },
        status: "PUBLISHED",
      },

      {
        userId: testUser.id,
        type: "STORY",
        title: "Engineering Studies in Berlin",
        data: {
          storyTitle: "Engineering Studies in Berlin",
          overallDescription:
            "Berlin was the perfect city for my engineering studies! The Technical University had amazing lab facilities and the professors were world-class researchers. Beyond academics, Berlin's rich history fascinated me - from the Brandenburg Gate to the remnants of the Berlin Wall. I loved the city's vibrant nightlife, diverse food scene, and how international it felt. Weekend trips to Prague and Amsterdam were easy and affordable. The German efficiency in everything from public transport to university administration was impressive. I also improved my German skills significantly during my stay.",
          firstName: "Alexandra",
          lastName: "Petrou",
          hostCity: "Berlin",
          hostCountry: "Germany",
          hostUniversity: "Technical University of Berlin",
          universityInCyprus: "University of Cyprus",
          year: "2023",
          exchangePeriod: "Fall 2023",
          photos: [
            {
              id: "1",
              image:
                "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&h=600&fit=crop",
              caption: "Brandenburg Gate at sunset",
              location: "Brandenburg Gate, Berlin",
              description:
                "The symbol of German reunification - so much history in one place.",
            },
            {
              id: "2",
              image:
                "https://images.unsplash.com/photo-1546726747-421c6d69c929?w=800&h=600&fit=crop",
              caption: "Engineering lab at TU Berlin",
              location: "TU Berlin Campus",
              description: "State-of-the-art facilities for hands-on learning.",
            },
          ],
          tags: ["berlin", "engineering", "history", "technology", "travel"],
          allowPublicUse: true,
        },
        status: "PUBLISHED",
      },

      {
        userId: testUser.id,
        type: "STORY",
        title: "Art and Culture in Prague",
        data: {
          storyTitle: "Art and Culture in Prague",
          overallDescription:
            "Prague felt like stepping into a fairy tale! The medieval architecture, cobblestone streets, and the stunning Prague Castle created the perfect backdrop for my art history studies. Charles University has such a rich academic tradition, and studying there felt like being part of centuries of scholarship. The city is incredibly affordable compared to other European capitals, which meant I could fully immerse myself in the cultural scene - opera, classical concerts, art galleries, and traditional Czech cuisine. The locals were warm and welcoming, and I loved learning about Czech history and traditions.",
          firstName: "Alexandra",
          lastName: "Petrou",
          hostCity: "Prague",
          hostCountry: "Czech Republic",
          hostUniversity: "Charles University",
          universityInCyprus: "University of Cyprus",
          year: "2023",
          exchangePeriod: "Spring 2023",
          photos: [
            {
              id: "1",
              image:
                "https://images.unsplash.com/photo-1542324151-ee2b73cb0d95?w=800&h=600&fit=crop",
              caption: "Charles Bridge at golden hour",
              location: "Charles Bridge, Prague",
              description:
                "The most romantic bridge in Europe, perfect for evening walks.",
            },
            {
              id: "2",
              image:
                "https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&h=600&fit=crop",
              caption: "Prague Castle from the river",
              location: "Prague Castle",
              description:
                "The largest ancient castle complex in the world - absolutely magnificent!",
            },
          ],
          tags: ["prague", "art", "history", "culture", "architecture"],
          allowPublicUse: true,
        },
        status: "PUBLISHED",
      },
    ];

    // Create the stories
    for (const story of testStories) {
      await prisma.formSubmission.create({
        data: story,
      });
      console.log(`✅ Created story: ${story.title}`);
    }

    console.log(`🎉 Successfully created ${testStories.length} test stories!`);
  } catch (error) {
    console.error("❌ Error creating test stories:", error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestStories();
