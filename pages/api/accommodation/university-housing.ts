import { NextApiRequest, NextApiResponse } from "next";

export interface UniversityHousing {
  id: string;
  universityName: string;
  country: string;
  city: string;
  housingOfficeName: string;
  email: string;
  phone?: string;
  website: string;
  applicationDeadline?: string;
  averageRent: {
    min: number;
    max: number;
    currency: string;
  };
  features: string[];
  applicationProcess: string[];
  requirements: string[];
}

const universityHousings: UniversityHousing[] = [
  {
    id: "upc-barcelona",
    universityName: "Universitat Politècnica de Catalunya (UPC)",
    country: "Spain",
    city: "Barcelona",
    housingOfficeName: "UPC Housing Office",
    email: "housing@upc.edu",
    phone: "+34 93 401 6200",
    website: "https://www.upc.edu/en/students/housing",
    applicationDeadline: "July 15",
    averageRent: { min: 350, max: 600, currency: "EUR" },
    features: [
      "WiFi included",
      "Study rooms",
      "Common areas",
      "Security",
      "Laundry",
    ],
    applicationProcess: [
      "Register on housing portal",
      "Submit application form",
      "Upload required documents",
      "Pay application fee",
      "Wait for assignment",
    ],
    requirements: [
      "Valid student ID",
      "Proof of enrollment",
      "Health insurance",
    ],
  },
  {
    id: "charles-prague",
    universityName: "Charles University",
    country: "Czech Republic",
    city: "Prague",
    housingOfficeName: "Charles University Accommodation Office",
    email: "accommodation@cuni.cz",
    phone: "+420 224 491 850",
    website: "https://cuni.cz/UKEN-145.html",
    applicationDeadline: "June 30",
    averageRent: { min: 180, max: 350, currency: "EUR" },
    features: [
      "Central heating",
      "Internet access",
      "Kitchen facilities",
      "Student support",
    ],
    applicationProcess: [
      "Online application",
      "Document submission",
      "Interview (if required)",
      "Payment confirmation",
      "Room assignment",
    ],
    requirements: ["Acceptance letter", "Passport copy", "Medical certificate"],
  },
  {
    id: "bocconi-milan",
    universityName: "Bocconi University",
    country: "Italy",
    city: "Milan",
    housingOfficeName: "Bocconi Housing Services",
    email: "housing@unibocconi.it",
    phone: "+39 02 5836 2058",
    website: "https://www.unibocconi.eu/en/services-facilities/housing",
    applicationDeadline: "August 1",
    averageRent: { min: 500, max: 900, currency: "EUR" },
    features: [
      "Modern facilities",
      "Gym access",
      "Study areas",
      "Social events",
      "Meal plans",
    ],
    applicationProcess: [
      "Complete online form",
      "Submit financial documents",
      "Preference selection",
      "Deposit payment",
      "Check-in appointment",
    ],
    requirements: [
      "Enrollment confirmation",
      "Financial guarantee",
      "Insurance proof",
    ],
  },
  {
    id: "sorbonne-paris",
    universityName: "Sorbonne Université",
    country: "France",
    city: "Paris",
    housingOfficeName: "CROUS Paris",
    email: "logement@crous-paris.fr",
    phone: "+33 1 40 51 37 13",
    website: "https://www.crous-paris.fr/logements/",
    applicationDeadline: "May 31",
    averageRent: { min: 200, max: 500, currency: "EUR" },
    features: [
      "Subsidized rent",
      "CAF eligible",
      "Multiple locations",
      "Student community",
    ],
    applicationProcess: [
      "DSE application",
      "Housing preference form",
      "Document verification",
      "Priority ranking",
      "Assignment notification",
    ],
    requirements: [
      "Student status",
      "Financial aid application",
      "Residence permit",
    ],
  },
  {
    id: "tu-berlin",
    universityName: "Technical University of Berlin",
    country: "Germany",
    city: "Berlin",
    housingOfficeName: "Studentenwerk Berlin",
    email: "wohnen@studentenwerk-berlin.de",
    phone: "+49 30 93939-8610",
    website: "https://www.studentenwerk-berlin.de/en/accommodation/",
    applicationDeadline: "June 15",
    averageRent: { min: 250, max: 450, currency: "EUR" },
    features: [
      "Affordable housing",
      "Various room types",
      "International community",
      "Support services",
    ],
    applicationProcess: [
      "Online registration",
      "Application submission",
      "Waiting list placement",
      "Offer acceptance",
      "Contract signing",
    ],
    requirements: [
      "University enrollment",
      "Semester fees payment",
      "Insurance coverage",
    ],
  },
  {
    id: "ku-leuven",
    universityName: "KU Leuven",
    country: "Belgium",
    city: "Leuven",
    housingOfficeName: "KU Leuven Housing Office",
    email: "housing@kuleuven.be",
    phone: "+32 16 32 40 61",
    website: "https://www.kuleuven.be/english/studentlife/accommodation",
    applicationDeadline: "July 1",
    averageRent: { min: 300, max: 550, currency: "EUR" },
    features: [
      "University residences",
      "Bike storage",
      "Study facilities",
      "Cultural activities",
    ],
    applicationProcess: [
      "Housing application portal",
      "Preference indication",
      "Document upload",
      "Payment arrangement",
      "Key collection",
    ],
    requirements: ["KU Leuven enrollment", "Valid ID", "Proof of address"],
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { country, city, university } = req.query;

    let filteredHousings = universityHousings;

    if (country && country !== "all") {
      filteredHousings = filteredHousings.filter(
        (housing) =>
          housing.country.toLowerCase() === country.toString().toLowerCase(),
      );
    }

    if (city && city !== "all") {
      filteredHousings = filteredHousings.filter(
        (housing) =>
          housing.city.toLowerCase() === city.toString().toLowerCase(),
      );
    }

    if (university && university !== "all") {
      filteredHousings = filteredHousings.filter((housing) =>
        housing.universityName
          .toLowerCase()
          .includes(university.toString().toLowerCase()),
      );
    }

    // Get unique countries and cities for filtering
    const countries = [
      ...new Set(universityHousings.map((h) => h.country)),
    ].sort();
    const cities = [...new Set(universityHousings.map((h) => h.city))].sort();

    res.status(200).json({
      housings: filteredHousings,
      total: filteredHousings.length,
      filters: {
        countries,
        cities,
      },
    });
  } catch (error) {
    console.error("Error fetching university housing:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
