import { ErasmusDestination, StudentTestimonial } from "./destinations";
import {
  UniversityAgreement,
  ALL_UNIVERSITY_AGREEMENTS,
  CYPRUS_UNIVERSITIES,
  getAgreementsByCountry,
  getPartnerCountries,
} from "./universityAgreements";

export interface EnhancedDestination extends ErasmusDestination {
  cyprusUniversityPartnerships: {
    universityCode: string;
    universityName: string;
    departments: string[];
    agreementCount: number;
  }[];
  totalCyprusPartnerships: number;
  availableForDepartments: string[];
}

export interface UniversitySearchResult {
  university: string;
  city: string;
  country: string;
  departments: string[];
  cyprusPartners: string[];
  agreementCount: number;
}

// Generate enhanced destinations based on university agreements
export function generateEnhancedDestinations(): EnhancedDestination[] {
  const destinations: EnhancedDestination[] = [];
  const processedCities = new Set<string>();

  // Group agreements by partner city
  const agreementsByCity = new Map<string, UniversityAgreement[]>();

  ALL_UNIVERSITY_AGREEMENTS.forEach((agreement) => {
    const cityKey = `${agreement.partnerCity}, ${agreement.partnerCountry}`;
    if (!agreementsByCity.has(cityKey)) {
      agreementsByCity.set(cityKey, []);
    }
    agreementsByCity.get(cityKey)!.push(agreement);
  });

  agreementsByCity.forEach((agreements, cityKey) => {
    const [city, country] = cityKey.split(", ");

    if (processedCities.has(cityKey)) return;
    processedCities.add(cityKey);

    // Get unique universities in this city
    const universities = new Set(agreements.map((a) => a.partnerUniversity));
    const primaryUniversity = Array.from(universities)[0];

    // Calculate Cyprus university partnerships
    const cyprusPartnerships = new Map<
      string,
      {
        universityCode: string;
        universityName: string;
        departments: Set<string>;
      }
    >();

    agreements.forEach((agreement) => {
      const cyprusUni = CYPRUS_UNIVERSITIES.find(
        (u) => u.code === agreement.homeUniversity,
      );
      if (cyprusUni) {
        const key = agreement.homeUniversity;
        if (!cyprusPartnerships.has(key)) {
          cyprusPartnerships.set(key, {
            universityCode: cyprusUni.code,
            universityName: cyprusUni.name,
            departments: new Set(),
          });
        }
        cyprusPartnerships.get(key)!.departments.add(agreement.homeDepartment);
      }
    });

    // Determine cost of living based on country
    const costOfLiving = getCostOfLiving(country);
    const averageRent = getAverageRent(country, city);
    const popularDepartments = getTopDepartments(agreements);

    const destination: EnhancedDestination = {
      id: `${city.toLowerCase().replace(/\s+/g, "_")}_${country.toLowerCase().replace(/\s+/g, "_")}`,
      country,
      city,
      university: primaryUniversity,
      universityShort: getUniversityShortName(primaryUniversity),
      partnerUniversities: CYPRUS_UNIVERSITIES.map((u) => u.name),
      language: getLanguage(country),
      costOfLiving,
      averageRent,
      popularWith: popularDepartments,
      imageUrl: getDestinationImage(city, country),
      description: generateDestinationDescription(
        city,
        country,
        agreements.length,
      ),
      cyprusUniversityPartnerships: Array.from(cyprusPartnerships.values()).map(
        (p) => ({
          universityCode: p.universityCode,
          universityName: p.universityName,
          departments: Array.from(p.departments),
          agreementCount: agreements.filter(
            (a) => a.homeUniversity === p.universityCode,
          ).length,
        }),
      ),
      totalCyprusPartnerships: agreements.length,
      availableForDepartments: Array.from(
        new Set(agreements.map((a) => a.homeDepartment)),
      ),
    };

    destinations.push(destination);
  });

  return destinations.sort(
    (a, b) => b.totalCyprusPartnerships - a.totalCyprusPartnerships,
  );
}

// Helper functions for destination enhancement
function getCostOfLiving(country: string): "low" | "medium" | "high" {
  const highCostCountries = [
    "Norway",
    "Sweden",
    "Denmark",
    "Switzerland",
    "United Kingdom",
    "Ireland",
    "Netherlands",
    "Germany",
    "Austria",
    "France",
  ];
  const lowCostCountries = [
    "Bulgaria",
    "Romania",
    "Poland",
    "Lithuania",
    "Latvia",
    "Estonia",
    "Slovakia",
    "Czech Republic",
    "Croatia",
    "Slovenia",
  ];

  if (highCostCountries.includes(country)) return "high";
  if (lowCostCountries.includes(country)) return "low";
  return "medium";
}

function getAverageRent(country: string, city: string): number {
  // Estimated average rent based on country and major cities
  const rentData: Record<string, Record<string, number>> = {
    Germany: {
      Berlin: 450,
      Munich: 650,
      Frankfurt: 600,
      Hamburg: 500,
      default: 450,
    },
    France: {
      Paris: 700,
      Lyon: 500,
      Toulouse: 400,
      Marseille: 450,
      default: 450,
    },
    Spain: {
      Madrid: 500,
      Barcelona: 550,
      Valencia: 400,
      Seville: 350,
      default: 400,
    },
    Italy: { Rome: 550, Milan: 600, Naples: 400, Turin: 450, default: 450 },
    Netherlands: { Amsterdam: 700, Rotterdam: 600, Utrecht: 650, default: 600 },
    Poland: { Warsaw: 350, Krakow: 300, Gdansk: 280, default: 300 },
    "Czech Republic": { Prague: 400, Brno: 300, default: 350 },
    Greece: { Athens: 350, Thessaloniki: 300, Patras: 250, default: 300 },
    Portugal: { Lisbon: 450, Porto: 350, Coimbra: 300, default: 350 },
    Austria: { Vienna: 500, Graz: 400, default: 450 },
    Belgium: { Brussels: 500, Antwerp: 450, Leuven: 400, default: 450 },
    Sweden: { Stockholm: 600, Gothenburg: 500, default: 550 },
    Norway: { Oslo: 700, Bergen: 600, default: 650 },
    Denmark: { Copenhagen: 650, Aalborg: 500, default: 575 },
    Finland: { Helsinki: 500, Turku: 400, default: 450 },
  };

  const countryData = rentData[country];
  if (!countryData) return 350; // Default for unlisted countries

  return countryData[city] || countryData.default || 350;
}

function getLanguage(country: string): string {
  const languages: Record<string, string> = {
    Germany: "German/English",
    France: "French",
    Spain: "Spanish",
    Italy: "Italian",
    Netherlands: "Dutch/English",
    Poland: "Polish/English",
    "Czech Republic": "Czech/English",
    Greece: "Greek/English",
    Portugal: "Portuguese/English",
    Austria: "German/English",
    Belgium: "Dutch/French/English",
    Sweden: "Swedish/English",
    Norway: "Norwegian/English",
    Denmark: "Danish/English",
    Finland: "Finnish/English",
    Estonia: "Estonian/English",
    Latvia: "Latvian/English",
    Lithuania: "Lithuanian/English",
    Slovakia: "Slovak/English",
    Slovenia: "Slovenian/English",
    Croatia: "Croatian/English",
    Romania: "Romanian/English",
    Bulgaria: "Bulgarian/English",
    Hungary: "Hungarian/English",
    Ireland: "English",
    "United Kingdom": "English",
    Malta: "Maltese/English",
  };

  return languages[country] || "English";
}

function getTopDepartments(agreements: UniversityAgreement[]): string[] {
  const departmentCounts = new Map<string, number>();
  agreements.forEach((agreement) => {
    const current = departmentCounts.get(agreement.homeDepartment) || 0;
    departmentCounts.set(agreement.homeDepartment, current + 1);
  });

  return Array.from(departmentCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map((entry) => entry[0]);
}

function getUniversityShortName(universityName: string): string {
  // Generate short names for universities
  const words = universityName.split(" ");
  if (words.length <= 2) return universityName;

  // Common patterns for university short names
  if (universityName.includes("University of")) {
    const place = universityName.replace("University of ", "");
    return `U. ${place.split(" ")[0]}`;
  }

  if (universityName.includes("Technical University")) {
    const place = universityName
      .replace("Technical University", "")
      .replace("of ", "")
      .trim();
    return `TU ${place.split(" ")[0]}`;
  }

  // Create acronym from major words
  const majorWords = words.filter(
    (word) =>
      ![
        "of",
        "the",
        "and",
        "in",
        "at",
        "for",
        "University",
        "College",
        "Institute",
        "School",
      ].includes(word),
  );

  if (majorWords.length >= 2) {
    return majorWords
      .slice(0, 3)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  }

  return words.slice(0, 2).join(" ");
}

function getDestinationImage(city: string, country: string): string {
  // Return appropriate stock images for European cities
  const cityImages: Record<string, string> = {
    Berlin:
      "https://images.unsplash.com/photo-1587330979470-3d27b94e1adc?w=800&h=600&fit=crop",
    Paris:
      "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&h=600&fit=crop",
    Rome: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=600&fit=crop",
    Madrid:
      "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=600&fit=crop",
    Amsterdam:
      "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&h=600&fit=crop",
    Barcelona:
      "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&h=600&fit=crop",
    Vienna:
      "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800&h=600&fit=crop",
    Prague:
      "https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&h=600&fit=crop",
    Athens:
      "https://images.unsplash.com/photo-1555993539-1732b0258670?w=800&h=600&fit=crop",
    Lisbon:
      "https://images.unsplash.com/photo-1588642709086-ce44c6b01e0e?w=800&h=600&fit=crop",
  };

  if (cityImages[city]) {
    return cityImages[city];
  }

  // Default images by country
  const countryImages: Record<string, string> = {
    Germany:
      "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&h=600&fit=crop",
    France:
      "https://images.unsplash.com/photo-1485296887913-a7b39db57cf6?w=800&h=600&fit=crop",
    Italy:
      "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800&h=600&fit=crop",
    Spain:
      "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&h=600&fit=crop",
    Netherlands:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
  };

  return (
    countryImages[country] ||
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop"
  );
}

function generateDestinationDescription(
  city: string,
  country: string,
  partnershipCount: number,
): string {
  const descriptions: Record<string, string> = {
    Germany: `Experience world-class education in ${city}, a dynamic German city known for its academic excellence and vibrant student life.`,
    France: `Discover the charm of ${city}, where French culture meets international academia in this beautiful ${country} destination.`,
    Italy: `Immerse yourself in the rich history and culture of ${city}, a stunning Italian city perfect for academic and personal growth.`,
    Spain: `Enjoy the warm climate and vibrant atmosphere of ${city}, a popular Spanish destination for international students.`,
    Netherlands: `Study in the progressive and international environment of ${city}, known for its excellent universities and student-friendly culture.`,
    Poland: `Experience affordable, high-quality education in ${city}, a rapidly developing Polish city with strong academic traditions.`,
    Greece: `Combine academic excellence with Mediterranean lifestyle in ${city}, a historic Greek city perfect for studies and exploration.`,
  };

  const baseDescription =
    descriptions[country] ||
    `Discover excellent educational opportunities in ${city}, ${country}, a destination that combines academic quality with cultural richness.`;

  return `${baseDescription} With ${partnershipCount} partnership agreements available, this destination offers diverse opportunities across multiple academic disciplines.`;
}

// Search and filter functions
export function searchDestinationsByDepartment(
  department: string,
): EnhancedDestination[] {
  const enhanced = generateEnhancedDestinations();
  return enhanced.filter((dest) =>
    dest.availableForDepartments.some((dept) =>
      dept.toLowerCase().includes(department.toLowerCase()),
    ),
  );
}

export function getDestinationsByUniversity(
  universityCode: string,
): EnhancedDestination[] {
  const enhanced = generateEnhancedDestinations();
  return enhanced.filter((dest) =>
    dest.cyprusUniversityPartnerships.some(
      (p) => p.universityCode === universityCode,
    ),
  );
}

export function getTopDestinationsByPartnerships(
  limit: number = 20,
): EnhancedDestination[] {
  const enhanced = generateEnhancedDestinations();
  return enhanced.slice(0, limit);
}

export function getDestinationStatistics() {
  const enhanced = generateEnhancedDestinations();
  const countries = new Set(enhanced.map((d) => d.country));
  const totalPartnerships = enhanced.reduce(
    (sum, d) => sum + d.totalCyprusPartnerships,
    0,
  );
  const departments = new Set(
    enhanced.flatMap((d) => d.availableForDepartments),
  );

  return {
    totalDestinations: enhanced.length,
    totalCountries: countries.size,
    totalPartnerships,
    totalDepartments: departments.size,
    topCountries: Array.from(countries)
      .map((country) => ({
        country,
        destinationCount: enhanced.filter((d) => d.country === country).length,
        partnershipCount: enhanced
          .filter((d) => d.country === country)
          .reduce((sum, d) => sum + d.totalCyprusPartnerships, 0),
      }))
      .sort((a, b) => b.partnershipCount - a.partnershipCount)
      .slice(0, 10),
  };
}

// University search functionality
export function searchUniversities(query: string): UniversitySearchResult[] {
  const lowerQuery = query.toLowerCase();
  const results = new Map<string, UniversitySearchResult>();

  ALL_UNIVERSITY_AGREEMENTS.forEach((agreement) => {
    const key = `${agreement.partnerUniversity}-${agreement.partnerCity}-${agreement.partnerCountry}`;

    if (
      agreement.partnerUniversity.toLowerCase().includes(lowerQuery) ||
      agreement.partnerCity.toLowerCase().includes(lowerQuery) ||
      agreement.partnerCountry.toLowerCase().includes(lowerQuery)
    ) {
      if (!results.has(key)) {
        results.set(key, {
          university: agreement.partnerUniversity,
          city: agreement.partnerCity,
          country: agreement.partnerCountry,
          departments: [],
          cyprusPartners: [],
          agreementCount: 0,
        });
      }

      const result = results.get(key)!;
      if (!result.departments.includes(agreement.homeDepartment)) {
        result.departments.push(agreement.homeDepartment);
      }
      if (!result.cyprusPartners.includes(agreement.homeUniversity)) {
        result.cyprusPartners.push(agreement.homeUniversity);
      }
      result.agreementCount++;
    }
  });

  return Array.from(results.values()).sort(
    (a, b) => b.agreementCount - a.agreementCount,
  );
}
