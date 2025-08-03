import { prisma } from "../lib/prisma";
import DestinationDataService from "../src/services/destinationDataService";

async function createSampleDestinations() {
  console.log("Creating sample admin destinations...");

  const sampleDestinations = [
    {
      name: "Barcelona, Spain",
      city: "Barcelona",
      country: "Spain",
      description:
        "Barcelona is a vibrant Mediterranean city known for its stunning architecture, including Gaudí's masterpieces, beautiful beaches, and rich cultural scene. It's an ideal destination for students looking to combine academic excellence with an unforgettable European experience.",
      imageUrl:
        "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      climate: "Mediterranean",
      highlights: [
        "Beautiful beaches",
        "Gaudí architecture",
        "Vibrant nightlife",
        "Rich culture",
        "Great food scene",
      ],
      officialUniversities: [
        {
          name: "University of Barcelona",
          website: "https://www.ub.edu",
          programs: ["Business", "Engineering", "Arts", "Sciences"],
        },
        {
          name: "Pompeu Fabra University",
          website: "https://www.upf.edu",
          programs: ["Economics", "Political Science", "Communication"],
        },
      ],
      generalInfo: {
        language: "Spanish, Catalan",
        currency: "EUR",
        timeZone: "CET",
        publicTransport: "Excellent metro, bus, and bike systems",
      },
      featured: true,
      createdBy: "admin",
    },
    {
      name: "Amsterdam, Netherlands",
      city: "Amsterdam",
      country: "Netherlands",
      description:
        "Amsterdam offers a unique blend of historic charm and modern innovation. With its famous canals, world-class museums, and bike-friendly culture, it's perfect for students seeking a progressive and international study environment.",
      imageUrl:
        "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      climate: "Temperate oceanic",
      highlights: [
        "Historic canals",
        "Bike culture",
        "World-class museums",
        "International atmosphere",
        "English-friendly",
      ],
      officialUniversities: [
        {
          name: "University of Amsterdam",
          website: "https://www.uva.nl",
          programs: [
            "Liberal Arts",
            "Sciences",
            "Social Sciences",
            "Economics",
          ],
        },
        {
          name: "VU Amsterdam",
          website: "https://vu.nl",
          programs: ["Business", "Psychology", "Medicine", "Law"],
        },
      ],
      generalInfo: {
        language: "Dutch, English widely spoken",
        currency: "EUR",
        timeZone: "CET",
        publicTransport: "Excellent tram, metro, and bike infrastructure",
      },
      featured: true,
      createdBy: "admin",
    },
    {
      name: "Prague, Czech Republic",
      city: "Prague",
      country: "Czech Republic",
      description:
        "Prague, the 'City of a Hundred Spires,' offers affordable living costs, stunning medieval architecture, and a growing tech scene. It's an excellent choice for budget-conscious students who don't want to compromise on quality of life.",
      imageUrl:
        "https://images.unsplash.com/photo-1541849546-216549ae216d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      climate: "Continental",
      highlights: [
        "Affordable living",
        "Medieval architecture",
        "Growing tech scene",
        "Central European location",
        "Rich history",
      ],
      officialUniversities: [
        {
          name: "Charles University",
          website: "https://cuni.cz",
          programs: ["Medicine", "Sciences", "Humanities", "Social Sciences"],
        },
        {
          name: "Czech Technical University",
          website: "https://www.cvut.cz",
          programs: ["Engineering", "Computer Science", "Architecture"],
        },
      ],
      generalInfo: {
        language: "Czech, English in universities",
        currency: "CZK",
        timeZone: "CET",
        publicTransport: "Extensive tram, metro, and bus network",
      },
      featured: false,
      createdBy: "admin",
    },
    {
      name: "Stockholm, Sweden",
      city: "Stockholm",
      country: "Sweden",
      description:
        "Stockholm combines Scandinavian design, innovation, and sustainability with a high quality of life. Known for its tech startups and progressive social policies, it's ideal for students interested in entrepreneurship and social sciences.",
      imageUrl:
        "https://images.unsplash.com/photo-1508189860359-777d945909ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      climate: "Humid continental",
      highlights: [
        "Innovation hub",
        "Sustainable living",
        "Beautiful archipelago",
        "High quality of life",
        "English proficiency",
      ],
      officialUniversities: [
        {
          name: "Stockholm University",
          website: "https://www.su.se",
          programs: ["Sciences", "Social Sciences", "Humanities"],
        },
        {
          name: "KTH Royal Institute of Technology",
          website: "https://www.kth.se",
          programs: ["Engineering", "Technology", "Architecture"],
        },
      ],
      generalInfo: {
        language: "Swedish, English widely spoken",
        currency: "SEK",
        timeZone: "CET",
        publicTransport: "Efficient metro, bus, and ferry systems",
      },
      featured: false,
      createdBy: "admin",
    },
  ];

  try {
    for (const destination of sampleDestinations) {
      console.log(`Creating destination: ${destination.name}`);

      await DestinationDataService.createDestination(destination);

      console.log(`✅ Created ${destination.name}`);
    }

    console.log("\n🎉 Sample destinations created successfully!");
    console.log("You can now view them at:");
    console.log(
      "- Enhanced Destinations: http://localhost:3000/enhanced-destinations",
    );
    console.log(
      "- Admin Management: http://localhost:3000/admin-destination-management",
    );
  } catch (error) {
    console.error("Error creating sample destinations:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createSampleDestinations();

export default createSampleDestinations;
