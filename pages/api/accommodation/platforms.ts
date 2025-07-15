import { NextApiRequest, NextApiResponse } from "next";

export interface AccommodationPlatform {
  id: string;
  name: string;
  description: string;
  url: string;
  logo: string;
  category: "booking" | "housing" | "classifieds" | "specialized";
  features: string[];
  countries: string[];
  averagePrice: "low" | "medium" | "high";
  trustScore: number;
}

const platforms: AccommodationPlatform[] = [
  {
    id: "booking",
    name: "Booking.com",
    description: "Hotels, apartments, and vacation rentals worldwide",
    url: "https://booking.com",
    logo: "https://logos-world.net/wp-content/uploads/2021/08/Booking-Logo.png",
    category: "booking",
    features: [
      "Free cancellation",
      "No booking fees",
      "24/7 support",
      "Reviews",
    ],
    countries: ["All"],
    averagePrice: "medium",
    trustScore: 4.5,
  },
  {
    id: "airbnb",
    name: "Airbnb",
    description: "Unique stays and experiences hosted by locals",
    url: "https://airbnb.com",
    logo: "https://logos-world.net/wp-content/uploads/2020/12/Airbnb-Logo.png",
    category: "booking",
    features: [
      "Local hosts",
      "Kitchen access",
      "Monthly discounts",
      "Host communication",
    ],
    countries: ["All"],
    averagePrice: "medium",
    trustScore: 4.3,
  },
  {
    id: "uniplaces",
    name: "Uniplaces",
    description: "Student accommodation platform for international students",
    url: "https://uniplaces.com",
    logo: "/images/uniplaces-logo.png",
    category: "specialized",
    features: [
      "Student verified",
      "No deposit needed",
      "All bills included options",
      "Support team",
    ],
    countries: [
      "Spain",
      "Portugal",
      "Italy",
      "France",
      "Germany",
      "UK",
      "Poland",
    ],
    averagePrice: "medium",
    trustScore: 4.4,
  },
  {
    id: "spotahome",
    name: "Spotahome",
    description: "Mid to long-term rentals with 360° virtual tours",
    url: "https://spotahome.com",
    logo: "/images/spotahome-logo.png",
    category: "specialized",
    features: [
      "Virtual tours",
      "No viewings needed",
      "Checked properties",
      "Move-in ready",
    ],
    countries: ["Spain", "Italy", "France", "Belgium", "Germany", "Ireland"],
    averagePrice: "medium",
    trustScore: 4.2,
  },
  {
    id: "nestpick",
    name: "Nestpick",
    description: "Furnished apartments for digital nomads and professionals",
    url: "https://nestpick.com",
    logo: "/images/nestpick-logo.png",
    category: "specialized",
    features: [
      "Furnished",
      "Flexible contracts",
      "Professional photos",
      "Quality checked",
    ],
    countries: [
      "Germany",
      "Spain",
      "Italy",
      "France",
      "Netherlands",
      "Czech Republic",
    ],
    averagePrice: "high",
    trustScore: 4.3,
  },
  {
    id: "housinganywhere",
    name: "HousingAnywhere",
    description:
      "International housing platform for students and young professionals",
    url: "https://housinganywhere.com",
    logo: "/images/housinganywhere-logo.png",
    category: "specialized",
    features: [
      "Student friendly",
      "Secure booking",
      "No deposit",
      "Multi-language support",
    ],
    countries: [
      "Netherlands",
      "Germany",
      "UK",
      "Spain",
      "Belgium",
      "France",
      "Italy",
    ],
    averagePrice: "medium",
    trustScore: 4.1,
  },
  {
    id: "erasmusu",
    name: "Erasmusu",
    description: "Erasmus student community with accommodation listings",
    url: "https://erasmusu.com",
    logo: "/images/erasmusu-logo.png",
    category: "specialized",
    features: [
      "Erasmus students",
      "Community reviews",
      "Local insights",
      "Free platform",
    ],
    countries: ["All Erasmus countries"],
    averagePrice: "low",
    trustScore: 4.0,
  },
  {
    id: "facebook",
    name: "Facebook Groups",
    description: "City-specific student housing groups and communities",
    url: "https://facebook.com",
    logo: "https://logos-world.net/wp-content/uploads/2020/04/Facebook-Logo.png",
    category: "classifieds",
    features: [
      "Direct contact",
      "Local communities",
      "Real students",
      "Free to use",
    ],
    countries: ["All"],
    averagePrice: "low",
    trustScore: 3.8,
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { country, category } = req.query;

    let filteredPlatforms = platforms;

    if (country && country !== "all") {
      filteredPlatforms = platforms.filter(
        (platform) =>
          platform.countries.includes("All") ||
          platform.countries.some((c) =>
            c.toLowerCase().includes(country.toString().toLowerCase()),
          ),
      );
    }

    if (category && category !== "all") {
      filteredPlatforms = filteredPlatforms.filter(
        (platform) => platform.category === category,
      );
    }

    res.status(200).json({
      platforms: filteredPlatforms,
      total: filteredPlatforms.length,
    });
  } catch (error) {
    console.error("Error fetching platforms:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
