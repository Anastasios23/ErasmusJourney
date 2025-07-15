import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function addAccommodationExperiences() {
  console.log("Adding sample accommodation experiences...");

  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      console.error("No user found. Please create a user first.");
      return;
    }

    const sampleExperiences = [
      {
        title: "Accommodation Experience - Maria S.",
        data: {
          accommodationType: "Private Apartment",
          accommodationAddress: "Carrer de Mallorca, 123, Barcelona",
          neighborhood: "Eixample",
          city: "Barcelona",
          country: "Spain",
          monthlyRent: 850,
          billsIncluded: false,
          utilityCosts: 80,
          depositAmount: 1700,

          accommodationRating: 5,
          wouldRecommend: true,
          findingDifficulty: 3,

          accommodationPros: [
            "Amazing location in city center",
            "Close to metro stations",
            "Beautiful modern apartment",
            "Friendly landlord",
            "Safe neighborhood",
          ],
          accommodationCons: [
            "Can be noisy at night",
            "Expensive utilities",
            "Small kitchen",
          ],
          accommodationTips:
            "Start looking early! Good apartments in Barcelona go very fast. Use Idealista and contact landlords directly. Be prepared to pay deposit upfront.",

          facilities: [
            "Wifi",
            "Kitchen",
            "Washing Machine",
            "Air Conditioning",
            "Balcony",
          ],
          transportLinks:
            "Metro L2 - 5 min walk, Bus 24 - 2 min walk. Direct to UPC in 15 minutes.",
          nearbyAmenities: [
            "Supermarket",
            "Restaurants",
            "Pharmacy",
            "ATM",
            "Gym",
          ],

          universityInCyprus: "University of Cyprus",
          hostUniversity: "Universitat Politècnica de Catalunya",
          additionalNotes:
            "Barcelona is amazing for students. The apartment was perfect for my exchange semester. Highly recommend this area!",
        },
      },
      {
        title: "Accommodation Experience - Andreas M.",
        data: {
          accommodationType: "Student Residence",
          accommodationAddress: "Wenceslas Square 15, Prague",
          neighborhood: "New Town",
          city: "Prague",
          country: "Czech Republic",
          monthlyRent: 450,
          billsIncluded: true,
          utilityCosts: 0,
          depositAmount: 450,

          accommodationRating: 4,
          wouldRecommend: true,
          findingDifficulty: 2,

          accommodationPros: [
            "Very affordable",
            "All bills included",
            "International community",
            "24/7 security",
            "Great facilities",
          ],
          accommodationCons: [
            "Shared bathroom",
            "Can be noisy with students",
            "Small room size",
          ],
          accommodationTips:
            "Apply early for student residences in Prague. They fill up quickly but offer great value for money and you'll meet lots of international students.",

          facilities: [
            "Wifi",
            "Shared Kitchen",
            "Gym",
            "Study Room",
            "Laundry",
            "Common Room",
          ],
          transportLinks:
            "Tram 22 - direct to university (15 min), Metro A line - 10 min walk",
          nearbyAmenities: [
            "University",
            "Shopping Center",
            "Restaurants",
            "Banks",
          ],

          universityInCyprus: "Cyprus University of Technology",
          hostUniversity: "Charles University",
          additionalNotes:
            "Great choice for first-time exchange students. The community is very helpful and there are always events to meet people.",
        },
      },
      {
        title: "Accommodation Experience - Sofia P.",
        data: {
          accommodationType: "Shared Apartment",
          accommodationAddress: "Via dei Cappuccini 12, Milan",
          neighborhood: "Brera",
          city: "Milan",
          country: "Italy",
          monthlyRent: 650,
          billsIncluded: false,
          utilityCosts: 120,
          depositAmount: 1300,

          accommodationRating: 5,
          wouldRecommend: true,
          findingDifficulty: 4,

          accommodationPros: [
            "Perfect location in Brera",
            "Beautiful historic building",
            "Great roommates",
            "Close to university",
            "Amazing restaurants nearby",
          ],
          accommodationCons: [
            "Very expensive",
            "Old building - some issues",
            "Competition is fierce",
          ],
          accommodationTips:
            "For Milan, be prepared to compete with many students. Have all documents ready, deposit money available immediately. Consider areas like Porta Romana or Navigli for cheaper options.",

          facilities: ["Wifi", "Kitchen", "Washing Machine", "Balcony"],
          transportLinks:
            "Metro M2 Lanza - 3 min walk, Tram 1 to Bocconi - 20 min",
          nearbyAmenities: [
            "Duomo",
            "Art galleries",
            "Fashion district",
            "Restaurants",
            "Cafes",
          ],

          universityInCyprus: "University of Cyprus",
          hostUniversity: "Bocconi University",
          additionalNotes:
            "Milan is expensive but amazing for business students. Brera is the best area if you can afford it - culture, nightlife, everything is walkable.",
        },
      },
    ];

    for (const experience of sampleExperiences) {
      try {
        await prisma.formSubmission.create({
          data: {
            title: experience.title,
            type: "ACCOMMODATION",
            status: "PUBLISHED",
            userId: user.id,
            data: experience.data,
          },
        });
        console.log(
          `✓ Added accommodation experience: ${experience.data.city}`,
        );
      } catch (error) {
        console.error(
          `✗ Error adding experience for ${experience.data.city}:`,
          error,
        );
      }
    }

    console.log("Finished adding accommodation experiences.");
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

addAccommodationExperiences()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
