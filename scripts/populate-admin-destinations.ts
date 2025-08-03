import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const sampleDestinations = [
  {
    name: "Barcelona, Spain",
    city: "Barcelona",
    country: "Spain",
    description:
      "Barcelona is a vibrant Mediterranean city known for its stunning architecture, rich culture, and world-class universities. Students enjoy a perfect blend of historical charm and modern innovation, with excellent academic opportunities and an unforgettable cultural experience.",
    imageUrl:
      "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=600&fit=crop",
    climate:
      "Mediterranean climate with warm, dry summers and mild winters. Average temperature ranges from 10°C (50°F) in winter to 25°C (77°F) in summer.",
    highlights: [
      "Home to world-renowned architect Antoni Gaudí's masterpieces",
      "Rich Catalan culture and cuisine",
      "Beautiful beaches within the city",
      "Vibrant nightlife and student community",
      "Excellent public transportation system",
      "Close proximity to other European destinations",
    ],
    officialUniversities: [
      {
        name: "University of Barcelona",
        website: "https://www.ub.edu/",
        programs: [
          "Business Administration",
          "Engineering",
          "Arts & Humanities",
          "Medicine",
          "Social Sciences",
        ],
      },
      {
        name: "Pompeu Fabra University",
        website: "https://www.upf.edu/",
        programs: [
          "Economics",
          "Political Science",
          "Communication",
          "Translation Studies",
        ],
      },
      {
        name: "Polytechnic University of Catalonia",
        website: "https://www.upc.edu/",
        programs: [
          "Engineering",
          "Architecture",
          "Computer Science",
          "Mathematics",
        ],
      },
    ],
    generalInfo: {
      language: "Spanish, Catalan",
      currency: "Euro (EUR)",
      timeZone: "Central European Time (CET)",
      publicTransport:
        "Extensive metro, bus, and tram network. TMB provides excellent connectivity throughout the city.",
    },
    featured: true,
    createdBy: "admin",
  },
  {
    name: "Berlin, Germany",
    city: "Berlin",
    country: "Germany",
    description:
      "Berlin offers an exceptional study abroad experience with its rich history, cutting-edge research institutions, and dynamic cultural scene. The city provides excellent academic opportunities while immersing students in European history and contemporary innovation.",
    imageUrl:
      "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&h=600&fit=crop",
    climate:
      "Temperate oceanic climate with warm summers and cold winters. Average temperature ranges from 0°C (32°F) in winter to 20°C (68°F) in summer.",
    highlights: [
      "World-class universities and research institutions",
      "Rich historical significance and museums",
      "Vibrant arts and cultural scene",
      "Affordable student life",
      "Central location in Europe",
      "Strong engineering and technology programs",
    ],
    officialUniversities: [
      {
        name: "Humboldt University of Berlin",
        website: "https://www.hu-berlin.de/",
        programs: [
          "Philosophy",
          "History",
          "Psychology",
          "Natural Sciences",
          "Medicine",
        ],
      },
      {
        name: "Technical University of Berlin",
        website: "https://www.tu-berlin.de/",
        programs: [
          "Engineering",
          "Computer Science",
          "Mathematics",
          "Architecture",
          "Planning",
        ],
      },
      {
        name: "Free University of Berlin",
        website: "https://www.fu-berlin.de/",
        programs: [
          "Social Sciences",
          "Humanities",
          "Natural Sciences",
          "Medicine",
          "Veterinary Medicine",
        ],
      },
    ],
    generalInfo: {
      language: "German",
      currency: "Euro (EUR)",
      timeZone: "Central European Time (CET)",
      publicTransport:
        "Comprehensive S-Bahn, U-Bahn, bus, and tram system covering all areas of the city.",
    },
    featured: true,
    createdBy: "admin",
  },
  {
    name: "Amsterdam, Netherlands",
    city: "Amsterdam",
    country: "Netherlands",
    description:
      "Amsterdam combines historic charm with modern innovation, offering students an excellent academic environment in one of Europe's most livable cities. Known for its progressive culture, excellent universities, and high quality of life.",
    imageUrl:
      "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&h=600&fit=crop",
    climate:
      "Oceanic climate with mild summers and cool winters. Average temperature ranges from 5°C (41°F) in winter to 17°C (63°F) in summer.",
    highlights: [
      "High-quality English-taught programs",
      "Bicycle-friendly city with excellent infrastructure",
      "Multicultural and international student community",
      "Rich artistic and cultural heritage",
      "Central location for exploring Europe",
      "Progressive and tolerant social environment",
    ],
    officialUniversities: [
      {
        name: "University of Amsterdam",
        website: "https://www.uva.nl/",
        programs: [
          "Business",
          "Social Sciences",
          "Humanities",
          "Science",
          "Medicine",
          "Law",
        ],
      },
      {
        name: "VU Amsterdam",
        website: "https://vu.nl/",
        programs: [
          "Business",
          "Social Sciences",
          "Science",
          "Humanities",
          "Medicine",
          "Theology",
        ],
      },
      {
        name: "Amsterdam University of Applied Sciences",
        website: "https://www.hva.nl/",
        programs: [
          "Applied Sciences",
          "Business",
          "Technology",
          "Health",
          "Education",
          "Sports",
        ],
      },
    ],
    generalInfo: {
      language: "Dutch, English widely spoken",
      currency: "Euro (EUR)",
      timeZone: "Central European Time (CET)",
      publicTransport:
        "Efficient metro, tram, bus, and ferry system. GVB operates comprehensive public transport.",
    },
    featured: true,
    createdBy: "admin",
  },
  {
    name: "Prague, Czech Republic",
    city: "Prague",
    country: "Czech Republic",
    description:
      "Prague offers an affordable yet high-quality study abroad experience in one of Europe's most beautiful historic cities. Students enjoy excellent academic programs while exploring stunning architecture and rich cultural traditions.",
    imageUrl:
      "https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&h=600&fit=crop",
    climate:
      "Continental climate with warm summers and cold winters. Average temperature ranges from -1°C (30°F) in winter to 19°C (66°F) in summer.",
    highlights: [
      "Extremely affordable cost of living",
      "Stunning medieval and baroque architecture",
      "Rich history and cultural heritage",
      "Central location in Europe",
      "Growing international student community",
      "Excellent beer culture and cuisine",
    ],
    officialUniversities: [
      {
        name: "Charles University",
        website: "https://cuni.cz/",
        programs: [
          "Medicine",
          "Law",
          "Philosophy",
          "Natural Sciences",
          "Social Sciences",
        ],
      },
      {
        name: "Czech Technical University",
        website: "https://www.cvut.cz/",
        programs: [
          "Engineering",
          "Architecture",
          "Information Technology",
          "Biomedical Engineering",
        ],
      },
      {
        name: "University of Economics, Prague",
        website: "https://www.vse.cz/",
        programs: [
          "Economics",
          "Business Administration",
          "Statistics",
          "International Relations",
        ],
      },
    ],
    generalInfo: {
      language: "Czech, English in international programs",
      currency: "Czech Koruna (CZK)",
      timeZone: "Central European Time (CET)",
      publicTransport:
        "Integrated system with metro, tram, and bus. DPP operates efficient city-wide transport.",
    },
    featured: false,
    createdBy: "admin",
  },
  {
    name: "Copenhagen, Denmark",
    city: "Copenhagen",
    country: "Denmark",
    description:
      "Copenhagen provides an exceptional Nordic study experience with world-class universities, innovative design culture, and high quality of life. Students enjoy a progressive academic environment in one of the world's most livable cities.",
    imageUrl:
      "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=800&h=600&fit=crop",
    climate:
      "Oceanic climate with mild summers and cool winters. Average temperature ranges from 2°C (36°F) in winter to 16°C (61°F) in summer.",
    highlights: [
      "High quality of life and safety",
      "Innovative design and architecture culture",
      "Sustainable and green city initiatives",
      "Strong English-speaking environment",
      "Excellent work-life balance culture",
      "Rich Viking and maritime heritage",
    ],
    officialUniversities: [
      {
        name: "University of Copenhagen",
        website: "https://www.ku.dk/",
        programs: [
          "Medicine",
          "Law",
          "Natural Sciences",
          "Humanities",
          "Social Sciences",
          "Theology",
        ],
      },
      {
        name: "Technical University of Denmark",
        website: "https://www.dtu.dk/",
        programs: [
          "Engineering",
          "Technology",
          "Natural Sciences",
          "Mathematics",
        ],
      },
      {
        name: "Copenhagen Business School",
        website: "https://www.cbs.dk/",
        programs: ["Business", "Economics", "Political Science", "Psychology"],
      },
    ],
    generalInfo: {
      language: "Danish, English widely spoken",
      currency: "Danish Krone (DKK)",
      timeZone: "Central European Time (CET)",
      publicTransport:
        "Integrated metro, S-train, bus, and bicycle infrastructure. DSB and Metro Service provide comprehensive coverage.",
    },
    featured: false,
    createdBy: "admin",
  },
];

async function populateAdminDestinations() {
  console.log("Starting to populate admin destinations...");

  try {
    // First, let's clear any existing admin destinations
    console.log("Clearing existing admin destinations...");
    await prisma.adminDestination.deleteMany({});

    console.log("Creating sample destinations...");

    for (const destination of sampleDestinations) {
      console.log(`Creating destination: ${destination.name}`);

      await prisma.adminDestination.create({
        data: {
          name: destination.name,
          city: destination.city,
          country: destination.country,
          description: destination.description,
          imageUrl: destination.imageUrl,
          climate: destination.climate,
          highlights: destination.highlights,
          officialUniversities: destination.officialUniversities,
          generalInfo: destination.generalInfo,
          featured: destination.featured,
          active: true,
          createdBy: destination.createdBy,
        },
      });
    }

    console.log(
      `✅ Successfully created ${sampleDestinations.length} admin destinations!`,
    );

    // Verify the data was created
    const count = await prisma.adminDestination.count();
    console.log(`📊 Total admin destinations in database: ${count}`);

    // List all created destinations
    const destinations = await prisma.adminDestination.findMany({
      select: {
        id: true,
        name: true,
        city: true,
        country: true,
        featured: true,
        active: true,
      },
    });

    console.log("\n📍 Created destinations:");
    destinations.forEach((dest, index) => {
      console.log(
        `${index + 1}. ${dest.name} (ID: ${dest.id.slice(0, 8)}...) - Featured: ${dest.featured}`,
      );
    });
  } catch (error) {
    console.error("❌ Error populating admin destinations:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
populateAdminDestinations()
  .then(() => {
    console.log("\n🎉 Admin destinations population completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Script failed:", error);
    process.exit(1);
  });

export { populateAdminDestinations };
