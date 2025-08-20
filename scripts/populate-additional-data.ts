import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Adding universities and destinations...");

  // Create sample universities
  const universities = await createSampleUniversities();
  console.log(`✅ Created ${universities.length} universities`);

  // Create sample destinations
  const destinations = await createSampleDestinations();
  console.log(`✅ Created ${destinations.length} destinations`);

  console.log("\n🎉 Additional data population completed!");
}

async function createSampleUniversities() {
  const universityData = [
    {
      code: "CUNI",
      name: "Charles University",
      shortName: "Charles University Prague",
      type: "Public",
      country: "Czech Republic",
      city: "Prague",
      website: "https://cuni.cz/UKEN-1.html",
      description:
        "Founded in 1348, Charles University is one of the oldest universities in the world and the oldest in Central Europe. It's a prestigious institution known for its excellent academic programs and beautiful historic buildings.",
      imageUrl:
        "https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&h=600&fit=crop",
    },
    {
      code: "UPC",
      name: "Universitat Politècnica de Catalunya",
      shortName: "UPC Barcelona",
      type: "Public",
      country: "Spain",
      city: "Barcelona",
      website: "https://www.upc.edu/en",
      description:
        "UPC is a public university specialized in architecture, engineering, and applied sciences. Located in Barcelona, it offers excellent programs with strong industry connections and innovative research opportunities.",
      imageUrl:
        "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=600&fit=crop",
    },
    {
      code: "TUB",
      name: "Technical University of Berlin",
      shortName: "TU Berlin",
      type: "Public",
      country: "Germany",
      city: "Berlin",
      website: "https://www.tu.berlin/en/",
      description:
        "TU Berlin is one of Germany's leading technical universities, known for its engineering, technology, and natural sciences programs. It has strong industry partnerships and cutting-edge research facilities.",
      imageUrl:
        "https://images.unsplash.com/photo-1587330979470-3010b06cccd4?w=800&h=600&fit=crop",
    },
    {
      code: "UNIVIE",
      name: "University of Vienna",
      shortName: "University of Vienna",
      type: "Public",
      country: "Austria",
      city: "Vienna",
      website: "https://www.univie.ac.at/en/",
      description:
        "Founded in 1365, the University of Vienna is the oldest university in the German-speaking world. It's renowned for its humanities, social sciences, and natural sciences programs.",
      imageUrl:
        "https://images.unsplash.com/photo-1539650116574-75c0c6d73a10?w=800&h=600&fit=crop",
    },
    {
      code: "SORBONNE",
      name: "Sorbonne University",
      shortName: "Sorbonne Paris",
      type: "Public",
      country: "France",
      city: "Paris",
      website: "https://www.sorbonne-universite.fr/en",
      description:
        "Sorbonne University is a world-renowned institution in the heart of Paris, offering excellence in arts, literature, languages, humanities, medicine, and science.",
      imageUrl:
        "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&h=600&fit=crop",
    },
    {
      code: "UNIBO",
      name: "University of Bologna",
      shortName: "University of Bologna",
      type: "Public",
      country: "Italy",
      city: "Bologna",
      website: "https://www.unibo.it/en",
      description:
        "Founded in 1088, the University of Bologna is the oldest university in the Western world. It's known for its law, medicine, and humanities programs in the beautiful historic city of Bologna.",
      imageUrl:
        "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&h=600&fit=crop",
    },
  ];

  const universities = [];
  for (const university of universityData) {
    try {
      const existing = await prisma.university.findUnique({
        where: { code: university.code },
      });

      if (!existing) {
        const created = await prisma.university.create({ data: university });
        universities.push(created);
      } else {
        universities.push(existing);
      }
    } catch (error) {
      console.log(
        `University ${university.code} might already exist, skipping...`,
      );
    }
  }

  return universities;
}

async function createSampleDestinations() {
  const destinationData = [
    {
      name: "Prague",
      city: "Prague",
      country: "Czech Republic",
      description:
        "Prague, the 'City of a Hundred Spires,' is a magical destination for students. With its stunning Gothic and Baroque architecture, rich history, and vibrant cultural scene, Prague offers an unforgettable study abroad experience. The city is known for its affordable cost of living, excellent beer culture, and central location that makes exploring Europe easy.",
      imageUrl:
        "https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&h=600&fit=crop",
      featured: true,
      climate: "Continental climate with warm summers and cold winters",
      costOfLiving: {
        accommodation: "€250-400/month",
        food: "€200-300/month",
        transportation: "€25/month",
        overall: "Low to Medium",
      },
      highlights:
        "Prague Castle, Charles Bridge, Old Town Square, excellent beer culture, central European location",
    },
    {
      name: "Barcelona",
      city: "Barcelona",
      country: "Spain",
      description:
        "Barcelona combines Mediterranean beach culture with world-class architecture and vibrant nightlife. As a major European cultural and economic center, it offers students incredible opportunities in art, design, business, and technology. The city's perfect weather, delicious cuisine, and welcoming atmosphere make it a top choice for international students.",
      imageUrl:
        "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=600&fit=crop",
      featured: true,
      climate: "Mediterranean climate with mild winters and warm summers",
      costOfLiving: {
        accommodation: "€400-600/month",
        food: "€300-400/month",
        transportation: "€40/month",
        overall: "Medium",
      },
      highlights:
        "Sagrada Família, Park Güell, beaches, Gaudí architecture, tapas culture, vibrant nightlife",
    },
    {
      name: "Berlin",
      city: "Berlin",
      country: "Germany",
      description:
        "Berlin is a dynamic capital city that perfectly blends history with cutting-edge innovation. Known for its world-class universities, thriving startup ecosystem, and rich cultural scene, Berlin offers students incredible opportunities in technology, arts, and politics. The city's affordable living costs and diverse international community make it ideal for students.",
      imageUrl:
        "https://images.unsplash.com/photo-1587330979470-3010b06cccd4?w=800&h=600&fit=crop",
      featured: true,
      climate: "Continental climate with mild summers and cold winters",
      costOfLiving: {
        accommodation: "€350-500/month",
        food: "€250-350/month",
        transportation: "€80/month",
        overall: "Medium",
      },
      highlights:
        "Brandenburg Gate, Museum Island, Berlin Wall, vibrant nightlife, startup ecosystem, excellent public transport",
    },
    {
      name: "Vienna",
      city: "Vienna",
      country: "Austria",
      description:
        "Vienna consistently ranks as one of the world's most livable cities. With its imperial architecture, world-class museums, and famous coffeehouse culture, Vienna offers students a unique blend of history and modernity. The city is renowned for its high quality of life, excellent public services, and rich cultural heritage.",
      imageUrl:
        "https://images.unsplash.com/photo-1539650116574-75c0c6d73a10?w=800&h=600&fit=crop",
      featured: true,
      climate: "Continental climate with warm summers and cold winters",
      costOfLiving: {
        accommodation: "€400-600/month",
        food: "€300-450/month",
        transportation: "€50/month",
        overall: "Medium to High",
      },
      highlights:
        "Schönbrunn Palace, St. Stephen's Cathedral, coffeehouse culture, classical music, imperial architecture",
    },
    {
      name: "Paris",
      city: "Paris",
      country: "France",
      description:
        "Paris, the City of Light, is one of the world's greatest cultural and educational centers. With its prestigious universities, world-renowned museums, and iconic landmarks, Paris offers students an unparalleled academic and cultural experience. The city's intellectual atmosphere and artistic heritage make it perfect for students in humanities, arts, and social sciences.",
      imageUrl:
        "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&h=600&fit=crop",
      featured: true,
      climate: "Oceanic climate with mild temperatures year-round",
      costOfLiving: {
        accommodation: "€500-800/month",
        food: "€350-500/month",
        transportation: "€70/month",
        overall: "High",
      },
      highlights:
        "Eiffel Tower, Louvre Museum, Sorbonne, café culture, Seine River, artistic heritage",
    },
    {
      name: "Bologna",
      city: "Bologna",
      country: "Italy",
      description:
        "Bologna is home to the world's oldest university and is known as 'La Dotta' (The Learned) for its academic excellence. This charming medieval city offers students an authentic Italian experience with incredible food culture, beautiful architecture, and a vibrant student community. Its central location makes it perfect for exploring Italy and Europe.",
      imageUrl:
        "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&h=600&fit=crop",
      featured: false,
      climate: "Continental climate with hot summers and mild winters",
      costOfLiving: {
        accommodation: "€300-500/month",
        food: "€250-400/month",
        transportation: "€30/month",
        overall: "Medium",
      },
      highlights:
        "Two Towers, Piazza Maggiore, incredible food scene, medieval architecture, academic tradition",
    },
  ];

  const destinations = [];
  for (const destination of destinationData) {
    try {
      const existing = await prisma.destination.findFirst({
        where: {
          name: destination.name,
          country: destination.country,
        },
      });

      if (!existing) {
        const created = await prisma.destination.create({ data: destination });
        destinations.push(created);
      } else {
        destinations.push(existing);
      }
    } catch (error) {
      console.log(
        `Destination ${destination.name} might already exist, skipping...`,
      );
    }
  }

  return destinations;
}

main()
  .catch((e) => {
    console.error("Error in additional data creation:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
