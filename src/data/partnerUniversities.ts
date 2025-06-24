export interface PartnerUniversity {
  name: string;
  city: string;
  country: string;
  erasmusCode?: string;
  website?: string;
}

export interface UniversityDepartmentAgreement {
  homeUniversity: string;
  homeDepartment: string;
  partnerUniversities: PartnerUniversity[];
}

// University of Cyprus - English Studies
const UCY_ENGLISH_STUDIES: PartnerUniversity[] = [
  { name: "University of Roma Tre", city: "Rome", country: "Italy" },
  {
    name: "Aristotle University of Thessaloniki",
    city: "Thessaloniki",
    country: "Greece",
  },
  {
    name: "Universita per Stranieri of Siena",
    city: "Siena",
    country: "Italy",
  },
  {
    name: "Padagogische Hochschule Freiburg",
    city: "Freiburg",
    country: "Germany",
  },
  { name: "Universitat Rovira I Virgili", city: "Tarragona", country: "Spain" },
  { name: "University of Bucharest", city: "Bucharest", country: "Romania" },
  { name: "Universidad del Pais Vasco", city: "Bilbao", country: "Spain" },
  {
    name: "Uniwersytet Warminsko-Mazurski W Olsztynie",
    city: "Olsztyn",
    country: "Poland",
  },
  { name: "Universidad de Granada", city: "Granada", country: "Spain" },
  { name: "Universitat Konstanz", city: "Konstanz", country: "Germany" },
  { name: "University of Porto", city: "Porto", country: "Portugal" },
  {
    name: "Pedagogical University of Krakow",
    city: "Krakow",
    country: "Poland",
  },
  {
    name: "Universidad de Castilla-La Mancha",
    city: "Castila-La Mancha",
    country: "Spain",
  },
  { name: "Universitat Giessen", city: "Giessen", country: "Germany" },
  { name: "Vytautas Magnus University", city: "Kaunas", country: "Lithuania" },
  { name: "CY Cergy Paris Université", city: "Cergy", country: "France" },
  {
    name: "Universite de Caen Basse-Normandie",
    city: "Caen",
    country: "France",
  },
  {
    name: "Elliniko Anikto Panepistimio (HOU)",
    city: "Patra",
    country: "Greece",
  },
  { name: "University of Eotvos Lorand", city: "Budapest", country: "Hungary" },
  { name: "University of Roma Tre", city: "Sevilla", country: "Spain" },
  { name: "University of Jyvaskyla", city: "Jyvaskya", country: "Finland" },
  { name: "Universitat Bamberg", city: "Bamberg", country: "Germany" },
  { name: "Universite de Liege", city: "Liege", country: "Belgium" },
  { name: "University of Malaga", city: "Malaga", country: "Spain" },
  { name: "Universidad de A Coruna", city: "La-Coruna", country: "Spain" },
  {
    name: "Kaunas University of Technology",
    city: "Kaunas",
    country: "Lithuania",
  },
  {
    name: "University Alexandru Ioan Cuza of Iasi",
    city: "Iasi",
    country: "Romania",
  },
  { name: "University of Cagliari", city: "Cagliari", country: "Italy" },
  { name: "University of Lodz", city: "Lodz", country: "Poland" },
  {
    name: "Metropolitan University Prague",
    city: "Prague",
    country: "Czech Republic",
  },
  { name: "University of Vilnius", city: "Vilnius", country: "Lithuania" },
  { name: "Aarhus University", city: "Arhus", country: "Denmark" },
  {
    name: "National and Kapodistrian University of Athens",
    city: "Athens",
    country: "Greece",
  },
  { name: "Universidad de Alicante", city: "Alicante", country: "Spain" },
  { name: "University Of Ljubljana", city: "Ljubljana", country: "Slovenia" },
  { name: "Universität Passau", city: "Passau", country: "Germany" },
  {
    name: "Universite de Provence Aix Marseille I",
    city: "Marseille",
    country: "France",
  },
  {
    name: "Julius-Maximillians-Universitat Wurzburg",
    city: "Wurzburg",
    country: "Germany",
  },
  { name: "Universita Degli Studi Di Parma", city: "Parma", country: "Italy" },
  { name: "University of Roma Tre", city: "Prague", country: "Czech Republic" },
  { name: "Sofia University", city: "Sofia", country: "Bulgaria" },
  { name: "Ionio University", city: "Athens", country: "Greece" },
  {
    name: "Universitat Jaume I",
    city: "Castellon de la Plana",
    country: "Spain",
  },
  { name: "University of Tartu", city: "Tartu", country: "Estonia" },
  { name: "University of Valladolid", city: "Valladolid", country: "Spain" },
  { name: "University of Foggia", city: "Foggia", country: "Italy" },
  { name: "Bielefeld University", city: "Bielefeld", country: "Germany" },
  { name: "University of Pau", city: "Pau", country: "France" },
  { name: "University of Regensburg", city: "Regensburg", country: "Germany" },
  { name: "University of Limerick", city: "Limerick", country: "Ireland" },
  { name: "University of Warsaw", city: "Warsaw", country: "Poland" },
  { name: "University of Wroclaw", city: "Wroclaw", country: "Poland" },
  { name: "University of Cologne", city: "Cologne", country: "Germany" },
  { name: "Universita del Salento", city: "Lecce", country: "Italy" },
  { name: "University of Malta", city: "Msida", country: "Malta" },
];

// Frederick University agreements by department
const FREDERICK_VISUAL_COMMUNICATION: PartnerUniversity[] = [
  {
    name: "Technical University of Kosice",
    city: "Košice",
    country: "Slovakia",
  },
  {
    name: "Panepistimio Dytikis Makedonias",
    city: "Kozani",
    country: "Greece",
  },
  { name: "E. S. le Mirail", city: "Toulouse", country: "France" },
  {
    name: "Kaunas University Of Technology",
    city: "Kaunas",
    country: "Lithuania",
  },
  {
    name: "Escuela Superior de Diseño de la Rioja",
    city: "Logroño",
    country: "Spain",
  },
  {
    name: "Aristoteleio Panepistimio Thessalonikis",
    city: "Thessaloniki",
    country: "Greece",
  },
  {
    name: "Escola de Arte e Superior de Deseño Ramón Falcón",
    city: "Lugo",
    country: "Spain",
  },
  { name: "ESADA", city: "Granada", country: "Spain" },
  { name: "ESSDM Escuela Sevilla de Moda", city: "Seville", country: "Spain" },
  {
    name: "Karelia University of Applied Sciences",
    city: "Joensuu",
    country: "Finland",
  },
  { name: "Art Academy of Latvia", city: "Riga", country: "Latvia" },
];

const FREDERICK_INTERIOR_DESIGN: PartnerUniversity[] = [
  {
    name: "Technical University of Kosice",
    city: "Košice",
    country: "Slovakia",
  },
  {
    name: "University of Western Macedonia",
    city: "Kozani",
    country: "Greece",
  },
  { name: "University of Zagreb", city: "Zagreb", country: "Croatia" },
  {
    name: "South-West University Neofit Rilski",
    city: "Blagoevgrad",
    country: "Bulgaria",
  },
  {
    name: "Escuela Superior de Diseño de la Rioja",
    city: "Logroño",
    country: "Spain",
  },
  { name: "E. S. le Mirail", city: "Toulouse", country: "France" },
  {
    name: "Kaunas University Of Technology",
    city: "Kaunas",
    country: "Lithuania",
  },
  {
    name: "Wyzsza Szkola Przedsiebiorczoscii Administracji w Lublinie",
    city: "Lublin",
    country: "Poland",
  },
  { name: "Nisantasi Universitesi", city: "Istanbul", country: "Turkey" },
  { name: "Universidade de Evora", city: "Évora", country: "Portugal" },
  {
    name: "Escola de Arte e Superior de Deseño Ramón Falcón",
    city: "Lugo",
    country: "Spain",
  },
  { name: "ESADA", city: "Granada", country: "Spain" },
  {
    name: "University of Design, Inovation and Technology",
    city: "Madrid",
    country: "Spain",
  },
  { name: "Art Academy of Latvia", city: "Riga", country: "Latvia" },
];

const FREDERICK_FASHION_DESIGN: PartnerUniversity[] = [
  {
    name: "Technical University of Kosice",
    city: "Košice",
    country: "Slovakia",
  },
  { name: "University of Zagreb", city: "Zagreb", country: "Croatia" },
  {
    name: "South-West University Neofit Rilski",
    city: "Blagoevgrad",
    country: "Bulgaria",
  },
  {
    name: "Escuela Superior de Diseño de la Rioja",
    city: "Logroño",
    country: "Spain",
  },
  { name: "E. S. le Mirail", city: "Toulouse", country: "France" },
  {
    name: "University of Western Macedonia",
    city: "Kozani",
    country: "Greece",
  },
  {
    name: "Kaunas University Of Technology",
    city: "Kaunas",
    country: "Lithuania",
  },
  {
    name: "Wyzsza Szkola Przedsiebiorczoscii Administracji w Lublinie",
    city: "Lublin",
    country: "Poland",
  },
  { name: "Nisantasi Universitesi", city: "Istanbul", country: "Turkey" },
  { name: "Universidade de Evora", city: "Évora", country: "Portugal" },
  { name: "Bsp Business & Law School", city: "Berlin", country: "Germany" },
  {
    name: "Escola de Arte e Superior de Deseño Ramón Falcón",
    city: "Lugo",
    country: "Spain",
  },
  { name: "ESSDM Escuela Sevilla de Moda", city: "Seville", country: "Spain" },
  { name: "ESADA", city: "Granada", country: "Spain" },
  { name: "Art Academy of Latvia", city: "Riga", country: "Latvia" },
  {
    name: "Panepistimio Dytikis Makedonias",
    city: "Western Macedonia",
    country: "Greece",
  },
  {
    name: "University of Design, Inovation and Technology",
    city: "Madrid",
    country: "Spain",
  },
];

const FREDERICK_JOURNALISM: PartnerUniversity[] = [
  { name: "E. S. le Mirail", city: "Toulouse", country: "France" },
  {
    name: "Panepistimio Dytikis Makedonias",
    city: "Kozani",
    country: "Greece",
  },
  {
    name: "Technical University of Kosice",
    city: "Košice",
    country: "Slovakia",
  },
  {
    name: "Wyzsza Szkola Przedsiebiorczoscii Administracji w Lublinie",
    city: "Lublin",
    country: "Poland",
  },
  {
    name: "Kaunas University of Technology",
    city: "Kaunas",
    country: "Lithuania",
  },
  {
    name: "Ethiko kai Kapodistriako Panepistimio Athinon",
    city: "Athens",
    country: "Greece",
  },
  {
    name: "Karelia University of Applied Sciences",
    city: "Joensuu",
    country: "Finland",
  },
  { name: "Hellenic Open University", city: "Patras", country: "Greece" },
];

const FREDERICK_BUSINESS: PartnerUniversity[] = [
  {
    name: "Technical University Of Kosice",
    city: "Košice",
    country: "Slovakia",
  },
  { name: "Tomas Moore", city: "Mechelen", country: "Belgium" },
  {
    name: "Tallinn University Of Technology",
    city: "Tallinn",
    country: "Estonia",
  },
  {
    name: "Seinajoki University Of Applied Sciences",
    city: "Seinäjoki",
    country: "Finland",
  },
  { name: "Riga Technical University", city: "Riga", country: "Latvia" },
  {
    name: "Kaunas University Of Technology",
    city: "Kaunas",
    country: "Lithuania",
  },
  {
    name: "Oth Ostbayerische Technische Hochschule Amberg-Weiden",
    city: "Amberg-Weiden",
    country: "Germany",
  },
  { name: "La Rochelle Universite", city: "La Rochelle", country: "France" },
  { name: "Bsp Business & Law School", city: "Berlin", country: "Germany" },
  {
    name: "Univerzita Mateja Bela V Banskej Bystrici",
    city: "Banská Bystrica",
    country: "Slovakia",
  },
  { name: "Nisantasi Universitesi", city: "Istanbul", country: "Turkey" },
  { name: "University Of Thessaly", city: "Volos", country: "Greece" },
  {
    name: "Univerzitet Privredna Akademija U Novom Sadu",
    city: "Novi Sad",
    country: "Serbia",
  },
  { name: "Universidad De Leon", city: "León", country: "Spain" },
  {
    name: "Metropolia University Of Applied Sciences",
    city: "Helsinki",
    country: "Finland",
  },
  {
    name: "Instituto Politecnico De Santarem",
    city: "Santarém",
    country: "Portugal",
  },
  { name: "Universidad de Oviedo", city: "Oviedo", country: "Spain" },
  {
    name: "Instituto Politechnico do Porto",
    city: "Porto",
    country: "Portugal",
  },
  {
    name: "Technische Hochschule Deggendorf",
    city: "Deggendorf",
    country: "Germany",
  },
  {
    name: "Universidad del Pais Vasco/ Euskal Herriko Unibertsitatea",
    city: "Bilbao",
    country: "Spain",
  },
  {
    name: "Universite Polytechnique Hauts-De-France",
    city: "Valenciennes",
    country: "France",
  },
  {
    name: "Klaipeda University Applied Sciences",
    city: "Klaipėda",
    country: "Lithuania",
  },
  {
    name: "Hellenic Mediteranian University",
    city: "Heraklion",
    country: "Greece",
  },
  {
    name: "Universidad Catolica De Valencia",
    city: "Valencia",
    country: "Spain",
  },
  { name: "Universidad De Valencia", city: "Valencia", country: "Spain" },
  {
    name: "Universidad Autonoma de Barcelona",
    city: "Barcelona",
    country: "Spain",
  },
  { name: "University of Aalen", city: "Aalen", country: "Germany" },
  { name: "Hochschule der Medien", city: "Stuttgart", country: "Germany" },
  {
    name: "Technical University of Wroclaw",
    city: "Wrocław",
    country: "Poland",
  },
  { name: "Hellenic Open University", city: "Patras", country: "Greece" },
  {
    name: "Paneistimio Dytikis Makedonias",
    city: "Western Macedonia",
    country: "Greece",
  },
  {
    name: "Academia im. Jacuba z Paradyza",
    city: "Gorzów Wielkopolski",
    country: "Poland",
  },
  {
    name: "Avans University of Applied Sciences",
    city: "Breda",
    country: "Netherlands",
  },
];

// UCLan agreements by department
const UCLAN_BUSINESS: PartnerUniversity[] = [
  {
    name: "Vienna University of Economics and Business",
    city: "Vienna",
    country: "Austria",
  },
  { name: "VUZF University-Sofia", city: "Sofia", country: "Bulgaria" },
  {
    name: "Sofia University St. Kliment Ohridski",
    city: "Sofia",
    country: "Bulgaria",
  },
  {
    name: "Varna Free University Chernorizets Hrabar",
    city: "Varna",
    country: "Bulgaria",
  },
  {
    name: "University of Applied Sciences Stralsund",
    city: "Stralsund",
    country: "Germany",
  },
  { name: "Frankfurt University", city: "Frankfurt", country: "Germany" },
  { name: "University of West Attica", city: "Athens", country: "Greece" },
  { name: "University of the Aegean", city: "Mytilene", country: "Greece" },
  { name: "University of Piraeus", city: "Piraeus", country: "Greece" },
  { name: "University of Patras", city: "Patras", country: "Greece" },
  { name: "University of Macedonia", city: "Thessaloniki", country: "Greece" },
  { name: "University of Udine", city: "Udine", country: "Italy" },
  { name: "University of Turin", city: "Turin", country: "Italy" },
  { name: "University of Rome Tor Vergata", city: "Rome", country: "Italy" },
  { name: "University of Palermo", city: "Palermo", country: "Italy" },
  { name: "ISMA University", city: "Riga", country: "Latvia" },
  {
    name: "EKA University of Applied Sciences",
    city: "Riga",
    country: "Latvia",
  },
  {
    name: "Kaunas University of Technology",
    city: "Kaunas",
    country: "Lithuania",
  },
  { name: "Molde University", city: "Molde", country: "Norway" },
  {
    name: "Uniwersytet Ekonomiczny W Katowicach",
    city: "Katowice",
    country: "Poland",
  },
  { name: "Random Academy of Economics", city: "Warsaw", country: "Poland" },
  {
    name: "East European Academy of Applied Sciences in Białystok",
    city: "Białystok",
    country: "Poland",
  },
  {
    name: "Alexandru Ioan Cuza University of Iași",
    city: "Iași",
    country: "Romania",
  },
  { name: "Megatrend University", city: "Belgrade", country: "Serbia" },
  {
    name: "University of Castilla-La Mancha",
    city: "Ciudad Real",
    country: "Spain",
  },
  {
    name: "Universidad Francisco de Vitoria",
    city: "Madrid",
    country: "Spain",
  },
  {
    name: "UNIR - La Universidad en Internet",
    city: "Logroño",
    country: "Spain",
  },
  {
    name: "University of Applied Sciences and Arts Northwestern Switzerland",
    city: "Basel",
    country: "Switzerland",
  },
  { name: "Menlo College", city: "Atherton", country: "United States" },
  {
    name: "American University in the Emirates",
    city: "Dubai",
    country: "United Arab Emirates",
  },
];

const UCLAN_COMPUTING: PartnerUniversity[] = [
  { name: "University of Lille", city: "Lille", country: "France" },
  {
    name: "University of the Littoral Opal Coast",
    city: "Dunkirk",
    country: "France",
  },
  { name: "University of Cote d'Azur, Nice", city: "Nice", country: "France" },
  {
    name: "EKA University of Applied Sciences",
    city: "Riga",
    country: "Latvia",
  },
  { name: "Klaipeda University", city: "Klaipėda", country: "Lithuania" },
  {
    name: "University of Western Macedonia",
    city: "Kozani",
    country: "Greece",
  },
  { name: "University of Niš", city: "Niš", country: "Serbia" },
  { name: "University of Žilina", city: "Žilina", country: "Slovakia" },
  { name: "University of Seville", city: "Seville", country: "Spain" },
  {
    name: "University of Castilla-La Mancha",
    city: "Ciudad Real",
    country: "Spain",
  },
  { name: "The University of Oradea", city: "Oradea", country: "Romania" },
];

// Main agreements database
export const UNIVERSITY_DEPARTMENT_AGREEMENTS: UniversityDepartmentAgreement[] =
  [
    // University of Cyprus
    {
      homeUniversity: "University of Cyprus",
      homeDepartment: "English Studies",
      partnerUniversities: UCY_ENGLISH_STUDIES,
    },

    // Frederick University
    {
      homeUniversity: "Frederick University",
      homeDepartment: "Visual Communication",
      partnerUniversities: FREDERICK_VISUAL_COMMUNICATION,
    },
    {
      homeUniversity: "Frederick University",
      homeDepartment: "Interior Design",
      partnerUniversities: FREDERICK_INTERIOR_DESIGN,
    },
    {
      homeUniversity: "Frederick University",
      homeDepartment: "Fashion Design and Image",
      partnerUniversities: FREDERICK_FASHION_DESIGN,
    },
    {
      homeUniversity: "Frederick University",
      homeDepartment: "Journalism",
      partnerUniversities: FREDERICK_JOURNALISM,
    },
    {
      homeUniversity: "Frederick University",
      homeDepartment: "Business Administration",
      partnerUniversities: FREDERICK_BUSINESS,
    },
    {
      homeUniversity: "Frederick University",
      homeDepartment: "Marketing",
      partnerUniversities: FREDERICK_BUSINESS,
    },
    {
      homeUniversity: "Frederick University",
      homeDepartment: "Accounting and Finance",
      partnerUniversities: FREDERICK_BUSINESS,
    },

    // UCLan Cyprus
    {
      homeUniversity: "University of Central Lancashire Cyprus",
      homeDepartment: "Business Administration",
      partnerUniversities: UCLAN_BUSINESS,
    },
    {
      homeUniversity: "University of Central Lancashire Cyprus",
      homeDepartment: "Computing",
      partnerUniversities: UCLAN_COMPUTING,
    },
    {
      homeUniversity: "University of Central Lancashire Cyprus",
      homeDepartment: "Computer Science",
      partnerUniversities: UCLAN_COMPUTING,
    },
  ];

// Helper functions
export const getPartnerUniversitiesForDepartment = (
  homeUniversity: string,
  department: string,
): PartnerUniversity[] => {
  const agreement = UNIVERSITY_DEPARTMENT_AGREEMENTS.find(
    (agreement) =>
      agreement.homeUniversity === homeUniversity &&
      agreement.homeDepartment === department,
  );
  return agreement ? agreement.partnerUniversities : [];
};

export const getDepartmentsWithAgreements = (
  homeUniversity: string,
): string[] => {
  return UNIVERSITY_DEPARTMENT_AGREEMENTS.filter(
    (agreement) => agreement.homeUniversity === homeUniversity,
  ).map((agreement) => agreement.homeDepartment);
};

export const getAllPartnerUniversities = (): PartnerUniversity[] => {
  const allPartners = UNIVERSITY_DEPARTMENT_AGREEMENTS.flatMap(
    (agreement) => agreement.partnerUniversities,
  );

  // Remove duplicates based on name and city
  const uniquePartners = allPartners.filter(
    (partner, index, self) =>
      index ===
      self.findIndex((p) => p.name === partner.name && p.city === partner.city),
  );

  return uniquePartners;
};

export const formatUniversityDisplay = (partner: PartnerUniversity): string => {
  return `${partner.name} - ${partner.city}, ${partner.country}`;
};

export const getUniversitiesWithAgreements = (): string[] => {
  return Array.from(
    new Set(
      UNIVERSITY_DEPARTMENT_AGREEMENTS.map(
        (agreement) => agreement.homeUniversity,
      ),
    ),
  );
};

// API Information and Integration Points
export const ERASMUS_API_ENDPOINTS = {
  EWP_IIA_API: "https://registry.erasmuswithoutpaper.eu/api/iias",
  ERASMUS_CHARTER_DB: "https://erasmusdb.com/api",
  MOBILITY_FACTSHEET_API:
    "https://registry.erasmuswithoutpaper.eu/api/factsheet",
};

// Future integration with real APIs
export const fetchPartnerUniversitiesFromAPI = async (
  homeUniversity: string,
  department: string,
): Promise<PartnerUniversity[]> => {
  // This function would integrate with real EWP APIs in production
  // For now, return the static data
  return getPartnerUniversitiesForDepartment(homeUniversity, department);
};
