import { getAllTestimonials } from "@/data/destinations";

export interface AccommodationListing {
  id: string;
  studentName: string;
  studentAvatar: string;
  homeUniversity: string;
  city: string;
  country: string;
  accommodationType: string;
  monthlyRent: number;
  address: string;
  neighborhood: string;
  roomSize?: number;
  rating: number;
  review: string;
  landlordEmail?: string;
  bookingWebsite?: string;
  platformUsed: string;
  billsIncluded: boolean;
  additionalCosts?: number;
  amenities: string[];
  nearbyAmenities: string[];
  transportLinks: string;
  wouldRecommend: boolean;
  semester: string;
  year: number;
  contactAllowed: boolean;
  tips: string;
  images?: string[];
}

export const generateAccommodationListings = (): AccommodationListing[] => {
  const testimonials = getAllTestimonials();

  const bookingWebsites = [
    "WG-Gesucht.de",
    "Studenten-WG.de",
    "Airbnb",
    "Spotahome",
    "HousingAnywhere",
    "Erasmusu",
    "Uniplaces",
    "Student.com",
    "University Housing Portal",
    "Facebook Housing Groups",
    "Local Real Estate Agency",
    "Direct Contact",
  ];

  const platforms = [
    "WG-Gesucht",
    "Studenten-WG",
    "University Portal",
    "Facebook Groups",
    "Spotahome",
    "HousingAnywhere",
    "Airbnb",
    "Direct Contact",
  ];

  const getNeighborhood = (city: string): string => {
    const neighborhoods: { [key: string]: string } = {
      Berlin: "Friedrichshain",
      Barcelona: "Gràcia",
      Amsterdam: "Zuid",
      Vienna: "3rd District",
      Prague: "Vinohrady",
      Stockholm: "Södermalm",
      Toulouse: "Centre",
      Dublin: "Rathmines",
    };
    return neighborhoods[city] || "City Center";
  };

  const getRandomAmenities = (): string[] => {
    const allAmenities = [
      "Wifi",
      "Kitchen Access",
      "Laundry",
      "Furnished",
      "Heating",
      "Air Conditioning",
      "Parking",
      "Garden/Balcony",
      "Gym Access",
      "Study Room",
    ];
    const count = 3 + Math.floor(Math.random() * 4);
    return allAmenities.sort(() => 0.5 - Math.random()).slice(0, count);
  };

  const getNearbyAmenities = (city: string): string[] => {
    const baseAmenities = ["Supermarket", "Public Transport", "Restaurants"];
    const citySpecific: { [key: string]: string[] } = {
      Berlin: ["Museums", "Nightlife", "Parks", "University"],
      Barcelona: ["Beach", "Architecture", "Tapas Bars", "University"],
      Amsterdam: ["Canals", "Bike Paths", "Coffee Shops", "University"],
      Vienna: [
        "Classical Music",
        "Coffee Houses",
        "Imperial Sites",
        "University",
      ],
      Prague: ["Historic Center", "Beer Gardens", "Castle", "University"],
      Stockholm: ["Archipelago", "Design Shops", "Cafes", "University"],
      Toulouse: [
        "Aerospace Industry",
        "Pink Architecture",
        "River",
        "University",
      ],
      Dublin: ["Pubs", "Temple Bar", "River Liffey", "University"],
    };
    return [...baseAmenities, ...(citySpecific[city] || ["University"])];
  };

  const getTipsForCity = (city: string): string => {
    const tips: { [key: string]: string } = {
      Berlin:
        "Start looking early, especially for WG rooms. Viewing appointments fill up quickly!",
      Barcelona:
        "Avoid tourist areas for better prices. Gràcia and Poble Sec are great neighborhoods.",
      Amsterdam:
        "Register for housing corporations immediately. Consider student housing outside the center.",
      Vienna:
        "OeAD student housing is affordable. Private market is competitive, start early.",
      Prague:
        "Very affordable compared to Western Europe. Dormitories are a great budget option.",
      Stockholm:
        "Housing queue system - register as early as possible. Consider suburbs for better prices.",
      Toulouse:
        "CROUS offers cheap student housing. Pink city is beautiful and affordable.",
      Dublin:
        "Expensive city! Consider sharing to reduce costs. Temple Bar area is fun but pricey.",
    };
    return tips[city] || "Research the area well and start your search early!";
  };

  return testimonials.map((testimonial, index) => ({
    id: testimonial.id,
    studentName: testimonial.studentName,
    studentAvatar:
      index === 0
        ? "https://cdn.builder.io/api/v1/image/assets%2F3ab1e1015f654e219ee7dc3d44bc47c8%2F76989c425d164c7683fb6621d949af84?format=webp&width=800"
        : `https://images.unsplash.com/photo-${1500000000000 + index * 100000}?w=150&h=150&fit=crop&crop=face`,
    homeUniversity: testimonial.homeUniversity,
    city: testimonial.city,
    country: testimonial.country,
    accommodationType: testimonial.accommodationType,
    monthlyRent: testimonial.monthlyRent,
    address: `${testimonial.city} City Center`,
    neighborhood: getNeighborhood(testimonial.city),
    roomSize: 15 + Math.floor(Math.random() * 20),
    rating: testimonial.rating,
    review: testimonial.accommodationReview,
    landlordEmail: index % 3 === 0 ? `landlord${index}@example.com` : undefined,
    bookingWebsite:
      index % 2 === 0
        ? bookingWebsites[index % bookingWebsites.length]
        : undefined,
    platformUsed: platforms[index % platforms.length],
    billsIncluded: index % 3 !== 0,
    additionalCosts:
      index % 3 === 0 ? 50 + Math.floor(Math.random() * 100) : undefined,
    amenities: getRandomAmenities(),
    nearbyAmenities: getNearbyAmenities(testimonial.city),
    transportLinks: `Metro station 5-10 min walk, Bus stop 2 min walk`,
    wouldRecommend: testimonial.wouldRecommend,
    semester: testimonial.semester,
    year: testimonial.year,
    contactAllowed: index % 4 !== 0,
    tips: getTipsForCity(testimonial.city),
    images: [
      index === 0
        ? "https://cdn.builder.io/api/v1/image/assets%2F3ab1e1015f654e219ee7dc3d44bc47c8%2F76989c425d164c7683fb6621d949af84?format=webp&width=800"
        : `https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800`,
      "https://images.unsplash.com/photo-1515263487990-61b07816b704?w=800",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
    ],
  }));
};
