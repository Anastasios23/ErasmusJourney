export interface CityDestination {
  id: string;
  city: string;
  country: string;
  description: string;
  costLevel: "low" | "medium" | "high";
  averageRent: string;
  transportCost: string;
  foodBudget: string;
  popularUniversities: string[];
  climate: string;
  language: string;
  studentLife: string;
  attractions: string[];
  tips: string[];
  testimonials: {
    studentName: string;
    university: string;
    quote: string;
    rating: number;
  }[];
  imageUrl?: string;
}

export const CITIES_DESTINATIONS: CityDestination[] = [
  // Germany
  {
    id: "berlin-germany",
    city: "Berlin",
    country: "Germany",
    description:
      "Germany's vibrant capital with rich history, amazing nightlife, and affordable student life.",
    costLevel: "medium",
    averageRent: "€400-600/month",
    transportCost: "€86/month (student)",
    foodBudget: "€200-300/month",
    popularUniversities: [
      "Humboldt University of Berlin",
      "Technical University of Berlin",
      "Free University of Berlin",
    ],
    climate: "Continental - Cold winters, warm summers",
    language: "German (English widely spoken in universities)",
    studentLife: "Incredible nightlife, countless museums, startup ecosystem",
    attractions: [
      "Brandenburg Gate",
      "East Side Gallery",
      "Museum Island",
      "Reichstag Building",
      "Checkpoint Charlie",
    ],
    tips: [
      "Get a student discount card for museums",
      "Use bike-sharing systems for cheap transport",
      "Explore different neighborhoods for varied experiences",
      "Take advantage of free university events",
    ],
    testimonials: [
      {
        studentName: "Maria Santos",
        university: "Technical University of Berlin",
        quote:
          "Berlin changed my perspective on life. The city is so diverse and welcoming to international students.",
        rating: 5,
      },
    ],
  },
  {
    id: "munich-germany",
    city: "Munich",
    country: "Germany",
    description:
      "Bavaria's capital combining traditional German culture with modern innovation and excellent universities.",
    costLevel: "high",
    averageRent: "€600-800/month",
    transportCost: "€70/month (student)",
    foodBudget: "€250-350/month",
    popularUniversities: [
      "Technical University of Munich",
      "Ludwig Maximilian University",
      "Munich University of Applied Sciences",
    ],
    climate: "Continental - Snowy winters, pleasant summers",
    language: "German (Bavarian dialect common)",
    studentLife: "Beer gardens, Oktoberfest, Alps nearby for weekend trips",
    attractions: [
      "Marienplatz",
      "Neuschwanstein Castle (day trip)",
      "English Garden",
      "BMW Museum",
      "Viktualienmarkt",
    ],
    tips: [
      "Book accommodation early - very competitive",
      "Get a Bayern-Ticket for regional travel",
      "Join student organizations for social life",
      "Budget extra for higher cost of living",
    ],
    testimonials: [],
  },

  // Spain
  {
    id: "barcelona-spain",
    city: "Barcelona",
    country: "Spain",
    description:
      "Mediterranean gem with stunning architecture, beaches, and vibrant student culture.",
    costLevel: "medium",
    averageRent: "€500-700/month",
    transportCost: "€40/month (student)",
    foodBudget: "€200-280/month",
    popularUniversities: [
      "University of Barcelona",
      "Universitat Pompeu Fabra",
      "Universitat Autònoma de Barcelona",
    ],
    climate: "Mediterranean - Mild winters, hot summers",
    language: "Spanish & Catalan",
    studentLife: "Beach culture, nightlife, incredible food scene",
    attractions: [
      "Sagrada Familia",
      "Park Güell",
      "Las Ramblas",
      "Barceloneta Beach",
      "Gothic Quarter",
    ],
    tips: [
      "Learn basic Catalan phrases",
      "Use Bicing bike-sharing system",
      "Explore beyond tourist areas",
      "Take advantage of student discounts",
    ],
    testimonials: [
      {
        studentName: "Andreas Mueller",
        university: "University of Barcelona",
        quote:
          "Barcelona offers the perfect balance of studies and lifestyle. The city has something for everyone.",
        rating: 5,
      },
    ],
  },
  {
    id: "madrid-spain",
    city: "Madrid",
    country: "Spain",
    description:
      "Spain's energetic capital with world-class museums, parks, and dynamic student life.",
    costLevel: "medium",
    averageRent: "€450-650/month",
    transportCost: "€35/month (student)",
    foodBudget: "€180-250/month",
    popularUniversities: [
      "Complutense University of Madrid",
      "Universidad Autónoma de Madrid",
      "Universidad Carlos III de Madrid",
    ],
    climate: "Continental Mediterranean - Hot summers, mild winters",
    language: "Spanish",
    studentLife: "Late-night culture, excellent public transport, royal parks",
    attractions: [
      "Prado Museum",
      "Retiro Park",
      "Royal Palace",
      "Puerta del Sol",
      "Thyssen-Bornemisza Museum",
    ],
    tips: [
      "Adapt to Spanish schedule (late dinners)",
      "Use Abono Joven for student transport",
      "Explore different neighborhoods",
      "Take day trips to nearby cities",
    ],
    testimonials: [],
  },

  // France
  {
    id: "paris-france",
    city: "Paris",
    country: "France",
    description:
      "The City of Light offering unparalleled culture, history, and academic excellence.",
    costLevel: "high",
    averageRent: "€700-1000/month",
    transportCost: "€38/month (student Navigo)",
    foodBudget: "€300-400/month",
    popularUniversities: [
      "Sorbonne University",
      "Sciences Po",
      "École Normale Supérieure",
    ],
    climate: "Oceanic - Mild, rainy winters and summers",
    language: "French",
    studentLife: "Cafés, museums, Seine walks, rich cultural life",
    attractions: [
      "Eiffel Tower",
      "Louvre Museum",
      "Notre-Dame Cathedral",
      "Champs-Élysées",
      "Montmartre",
    ],
    tips: [
      "Apply for CAF housing assistance",
      "Use Vélib' bike system",
      "Get student museum passes",
      "Explore free cultural events",
    ],
    testimonials: [],
  },

  // Italy
  {
    id: "rome-italy",
    city: "Rome",
    country: "Italy",
    description:
      "Eternal City where history meets modern student life in an incredible setting.",
    costLevel: "medium",
    averageRent: "€500-700/month",
    transportCost: "€35/month (student)",
    foodBudget: "€200-300/month",
    popularUniversities: [
      "Sapienza University of Rome",
      "University of Roma Tre",
      "LUISS Guido Carli",
    ],
    climate: "Mediterranean - Hot summers, mild winters",
    language: "Italian",
    studentLife: "Historical sites everywhere, amazing food, vibrant piazzas",
    attractions: [
      "Colosseum",
      "Vatican City",
      "Trevi Fountain",
      "Roman Forum",
      "Pantheon",
    ],
    tips: [
      "Walk everywhere - city is very walkable",
      "Try aperitivo culture",
      "Visit free churches and sites",
      "Learn basic Italian for daily life",
    ],
    testimonials: [],
  },
  {
    id: "milan-italy",
    city: "Milan",
    country: "Italy",
    description:
      "Fashion and design capital with excellent universities and modern lifestyle.",
    costLevel: "high",
    averageRent: "€600-800/month",
    transportCost: "€22/month (student)",
    foodBudget: "€250-350/month",
    popularUniversities: [
      "Bocconi University",
      "University of Milan",
      "Politecnico di Milano",
    ],
    climate: "Humid subtropical - Hot summers, foggy winters",
    language: "Italian",
    studentLife: "Fashion, business networking, aperitivo culture",
    attractions: [
      "Milan Cathedral (Duomo)",
      "La Scala Opera House",
      "Navigli Canals",
      "Quadrilatero della Moda",
      "Brera District",
    ],
    tips: [
      "Network in business districts",
      "Explore fashion opportunities",
      "Use ATM public transport efficiently",
      "Budget for higher costs",
    ],
    testimonials: [],
  },

  // Netherlands
  {
    id: "amsterdam-netherlands",
    city: "Amsterdam",
    country: "Netherlands",
    description:
      "Liberal, bike-friendly city with excellent English-taught programs and vibrant culture.",
    costLevel: "high",
    averageRent: "€700-1000/month",
    transportCost: "€100/month (including bike)",
    foodBudget: "€300-400/month",
    popularUniversities: [
      "University of Amsterdam",
      "VU Amsterdam",
      "Amsterdam University of Applied Sciences",
    ],
    climate: "Oceanic - Mild, wet weather year-round",
    language: "Dutch (English widely spoken)",
    studentLife: "Cycling culture, canals, liberal atmosphere, great nightlife",
    attractions: [
      "Van Gogh Museum",
      "Anne Frank House",
      "Rijksmuseum",
      "Jordaan District",
      "Vondelpark",
    ],
    tips: [
      "Get a bike immediately",
      "Apply early for student housing",
      "Use OV-chipkaart for transport",
      "Embrace the cycling culture",
    ],
    testimonials: [
      {
        studentName: "Elena Rodriguez",
        university: "University of Amsterdam",
        quote:
          "Amsterdam's international atmosphere made me feel at home immediately. The bike culture is amazing!",
        rating: 5,
      },
    ],
  },

  // Czech Republic
  {
    id: "prague-czech",
    city: "Prague",
    country: "Czech Republic",
    description:
      "Fairytale city with stunning architecture, affordable living, and rich cultural heritage.",
    costLevel: "low",
    averageRent: "€300-500/month",
    transportCost: "€15/month (student)",
    foodBudget: "€150-250/month",
    popularUniversities: [
      "Charles University",
      "Czech Technical University",
      "University of Economics",
    ],
    climate: "Continental - Cold winters, warm summers",
    language: "Czech (English in universities)",
    studentLife:
      "Beer culture, beautiful architecture, affordable entertainment",
    attractions: [
      "Prague Castle",
      "Charles Bridge",
      "Old Town Square",
      "Wenceslas Square",
      "Jewish Quarter",
    ],
    tips: [
      "Learn basic Czech phrases",
      "Use public transport extensively",
      "Explore beyond city center",
      "Take advantage of low costs",
    ],
    testimonials: [],
  },

  // Poland
  {
    id: "krakow-poland",
    city: "Krakow",
    country: "Poland",
    description:
      "Medieval city with vibrant student life, rich history, and very affordable living.",
    costLevel: "low",
    averageRent: "€250-400/month",
    transportCost: "€10/month (student)",
    foodBudget: "€120-200/month",
    popularUniversities: [
      "Jagiellonian University",
      "AGH University of Science and Technology",
      "Krakow University of Economics",
    ],
    climate: "Continental - Cold winters, warm summers",
    language: "Polish (English in universities)",
    studentLife:
      "Very affordable, beautiful old town, active student community",
    attractions: [
      "Main Market Square",
      "Wawel Castle",
      "Kazimierz District",
      "St. Mary's Basilica",
      "Cloth Hall",
    ],
    tips: [
      "Budget is very student-friendly",
      "Use student discounts everywhere",
      "Explore nearby Auschwitz memorial",
      "Join student organizations",
    ],
    testimonials: [],
  },

  // Portugal
  {
    id: "lisbon-portugal",
    city: "Lisbon",
    country: "Portugal",
    description:
      "Sunny coastal capital with friendly locals, great weather, and growing tech scene.",
    costLevel: "medium",
    averageRent: "€400-600/month",
    transportCost: "€22/month (student)",
    foodBudget: "€180-280/month",
    popularUniversities: [
      "University of Lisbon",
      "NOVA University Lisbon",
      "Technical University of Lisbon",
    ],
    climate: "Mediterranean - Mild winters, hot summers",
    language: "Portuguese (English increasingly common)",
    studentLife:
      "Beach nearby, great weather, friendly culture, growing startup scene",
    attractions: [
      "Belém Tower",
      "Jerónimos Monastery",
      "Alfama District",
      "Tram 28",
      "Sintra (day trip)",
    ],
    tips: [
      "Use the iconic trams",
      "Explore coastal areas",
      "Try local pastéis de nata",
      "Take day trips to beaches",
    ],
    testimonials: [],
  },

  // Austria
  {
    id: "vienna-austria",
    city: "Vienna",
    country: "Austria",
    description:
      "Imperial city with world-class education, classical music, and high quality of life.",
    costLevel: "medium",
    averageRent: "€400-650/month",
    transportCost: "€75/month (student)",
    foodBudget: "€200-300/month",
    popularUniversities: [
      "University of Vienna",
      "Vienna University of Technology",
      "Vienna University of Economics",
    ],
    climate: "Continental - Cold winters, warm summers",
    language: "German",
    studentLife:
      "Coffee house culture, classical music, beautiful architecture",
    attractions: [
      "Schönbrunn Palace",
      "Stephansdom",
      "Belvedere Palace",
      "Naschmarkt",
      "Prater Park",
    ],
    tips: [
      "Enjoy coffee house culture",
      "Use student concert tickets",
      "Explore imperial history",
      "Take advantage of cultural offerings",
    ],
    testimonials: [],
  },
];

// Helper functions
export const getAllCityDestinations = (): CityDestination[] => {
  return CITIES_DESTINATIONS;
};

export const getCityDestinationsByCountry = (
  country: string,
): CityDestination[] => {
  return CITIES_DESTINATIONS.filter((dest) => dest.country === country);
};

export const getCityDestinationById = (
  id: string,
): CityDestination | undefined => {
  return CITIES_DESTINATIONS.find((dest) => dest.id === id);
};

export const getUniqueCountries = (): string[] => {
  return [...new Set(CITIES_DESTINATIONS.map((dest) => dest.country))].sort();
};

export const getDestinationsByCostLevel = (
  costLevel: "low" | "medium" | "high",
): CityDestination[] => {
  return CITIES_DESTINATIONS.filter((dest) => dest.costLevel === costLevel);
};

export const searchDestinations = (searchTerm: string): CityDestination[] => {
  const term = searchTerm.toLowerCase();
  return CITIES_DESTINATIONS.filter(
    (dest) =>
      dest.city.toLowerCase().includes(term) ||
      dest.country.toLowerCase().includes(term) ||
      dest.description.toLowerCase().includes(term) ||
      dest.popularUniversities.some((uni) => uni.toLowerCase().includes(term)),
  );
};
