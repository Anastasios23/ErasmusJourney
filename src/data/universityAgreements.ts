export interface UniversityAgreement {
  homeUniversity: string;
  homeDepartment: string;
  partnerUniversity: string;
  partnerCity: string;
  partnerCountry: string;
  agreementType?: "student" | "staff" | "both" | "traineeship";
  notes?: string;
}

export interface UniversityProfile {
  code: string;
  name: string;
  shortName: string;
  country: string;
  city: string;
  departments: string[];
  totalAgreements: number;
}

// University profiles for Cyprus universities
export const CYPRUS_UNIVERSITIES: UniversityProfile[] = [
  {
    code: "UNIC",
    name: "University of Nicosia",
    shortName: "UNIC",
    country: "Cyprus",
    city: "Nicosia",
    departments: [
      "Accounting",
      "Architecture",
      "Biomedical Sciences",
      "Business Administration",
      "Blockchain & Digital Currency",
      "Computer Engineering",
      "Contemporary Nursing",
      "Counseling Psychology",
      "Criminology",
      "Civil and Environmental Engineering",
      "Clinical Dietetics",
      "Clinical Psychology",
      "Education Sciences",
      "English Language and Literature",
      "Energy, Oil and Gas Management",
      "Environmental and Energy Management",
      "Exercise Science and Physical Education",
      "Computer Science",
      "Dance",
      "Digital Art and Design",
      "Digital Communications",
      "Digital Media and Communications",
      "Economics and Finance",
      "Engineering Management",
      "Electrical Engineering",
      "Fine Art",
      "Family Medicine",
      "Graphic & Digital Design",
      "Health Services Administration",
      "Hospitality Management",
      "Human Biology",
      "Human Resources",
      "Human Rights",
      "Interior Design",
      "Interactive Media & Animation",
      "International Relations and European Studies",
      "Law",
      "Management Information Systems",
      "Mathematics",
      "Mechanical Engineering",
      "Medicine",
      "Medical Sciences",
      "Mental Health Nursing",
      "Media and Communications",
      "Music",
      "Nursing",
      "Nutrition and Dietetics",
      "Oil and Gas Engineering",
      "Orthopedic Science and Rehabilitation",
      "PR, Advertising and Marketing",
      "Primary Education",
      "Pre-Primary Education",
      "Psychology",
      "Public Administration",
      "Pharmacy",
      "Physiotherapy",
      "Social Work",
      "Sports Management",
      "Sports Nutrition and Dietetics",
      "Sports Science",
      "Teaching English to Speakers of Other Languages",
      "Tourism, Leisure and Events Management",
      "Veterinary Medicine",
    ],
    totalAgreements: 0,
  },
  {
    code: "UCY",
    name: "University of Cyprus",
    shortName: "UCY",
    country: "Cyprus",
    city: "Nicosia",
    departments: [
      "English Studies",
      "French and European Studies",
      "Turkish and Middle Eastern Studies",
      "Medicine",
      "Chemistry",
      "Computer Science",
      "Mathematics and Statistics",
      "Physics",
      "Biological Sciences",
      "Education",
      "Law",
      "Psychology",
      "Social and Political Sciences",
      "Economics",
      "Business Administration",
      "Accounting and Finance",
      "Architecture",
      "Electrical and Computer Engineering",
      "Mechanical and Manufacturing Engineering",
      "Civil and Environmental Engineering",
      "Byzantine and Modern Greek Studies",
      "History and Archaeology",
      "Classics and Philosophy",
    ],
    totalAgreements: 0,
  },
  {
    code: "UCLan",
    name: "University of Central Lancashire Cyprus",
    shortName: "UCLan Cyprus",
    country: "Cyprus",
    city: "Larnaca",
    departments: [
      "Accounting and Finance",
      "Arts and Media",
      "Business Administration",
      "Computing",
      "Cybersecurity",
      "Economics",
      "Engineering",
      "English Language and Literature",
      "Ethics",
      "Finance",
      "Hospitality and Tourism",
      "ICTs and Electronic Engineering",
      "Languages and Linguistics",
      "Law",
      "Management",
      "Marketing",
      "Mathematics",
      "Media Production and Web Design",
      "Physics",
      "Psychology",
      "Sports and Exercise Science",
    ],
    totalAgreements: 0,
  },
  {
    code: "Frederick",
    name: "Frederick University",
    shortName: "Frederick",
    country: "Cyprus",
    city: "Nicosia",
    departments: [
      "Visual Communication",
      "Interior Design",
      "Fashion Design and Image",
      "Journalism",
      "Business Administration and Marketing",
      "Maritime",
      "Law",
      "Civil Engineering",
      "Electrical Engineering",
      "Mechanical Engineering",
      "Computer Sciences and Engineering",
      "Architecture",
      "Automotive",
      "Pre-primary and Primary Education",
      "Social Work",
      "Psychology",
      "Nursing",
      "Pharmacy",
      "Physical Education and Sports Science",
      "Physiotherapy",
    ],
    totalAgreements: 0,
  },
  {
    code: "EUC",
    name: "European University Cyprus",
    shortName: "EUC",
    country: "Cyprus",
    city: "Nicosia",
    departments: [
      "Accounting & Finance",
      "Audiology",
      "Art and Design",
      "Biological Sciences",
      "Business and Administration",
      "Communication & Information Sciences",
      "Engineering",
      "English Studies",
      "Environment",
      "Finance",
      "Graphic Design",
      "Dietetics",
      "Occupational Therapy",
      "Health",
      "Computer Science",
      "Cultural Heritage",
      "Education",
      "Economics",
      "Mathematics & Physics",
      "Physical Education and Sports Science",
      "Physiotherapy",
      "Speech Therapy",
      "Pharmacy",
      "Tourism and Hospitality",
      "Information and Communication Technology",
      "Languages",
      "Law",
      "Nursing and Midwifery",
      "Psychology",
      "Medicine",
      "Music and Performing Arts",
    ],
    totalAgreements: 0,
  },
];

// UNIC University Agreements
export const UNIC_AGREEMENTS: UniversityAgreement[] = [
  // Accounting (BSc)
  {
    homeUniversity: "UNIC",
    homeDepartment: "Accounting",
    partnerUniversity: "University of National and World Economy",
    partnerCity: "Sofia",
    partnerCountry: "Bulgaria",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Accounting",
    partnerUniversity:
      "University of Rijeka, Faculty of Economics and Business",
    partnerCity: "Rijeka",
    partnerCountry: "Croatia",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Accounting",
    partnerUniversity: "Polytechnic of Šibenik",
    partnerCity: "Šibenik",
    partnerCountry: "Croatia",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Accounting",
    partnerUniversity:
      "Brno University of Technology, Faculty of Business and Management",
    partnerCity: "Brno",
    partnerCountry: "Czech Republic",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Accounting",
    partnerUniversity: "University College of Northern Denmark - UCN",
    partnerCity: "Aalborg",
    partnerCountry: "Denmark",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Accounting",
    partnerUniversity: "ESC Rennes - School of Business",
    partnerCity: "Rennes",
    partnerCountry: "France",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Accounting",
    partnerUniversity: "KEDGE",
    partnerCity: "Bordeaux",
    partnerCountry: "France",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Accounting",
    partnerUniversity: "Institut Limayrac",
    partnerCity: "Toulouse",
    partnerCountry: "France",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Accounting",
    partnerUniversity: "University of Rennes",
    partnerCity: "Rennes",
    partnerCountry: "France",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Accounting",
    partnerUniversity: "Frankfurt University of Applied Sciences",
    partnerCity: "Frankfurt",
    partnerCountry: "Germany",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Accounting",
    partnerUniversity: "University of Peloponnese",
    partnerCity: "Patras",
    partnerCountry: "Greece",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Accounting",
    partnerUniversity: "University of Thessaly",
    partnerCity: "Larissa",
    partnerCountry: "Greece",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Accounting",
    partnerUniversity: "University of Crete",
    partnerCity: "Heraklion",
    partnerCountry: "Greece",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Accounting",
    partnerUniversity: "University of Piraeus",
    partnerCity: "Piraeus",
    partnerCountry: "Greece",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Accounting",
    partnerUniversity: "Kauno kolegija/ Kaunas University of Applied Sciences",
    partnerCity: "Kaunas",
    partnerCountry: "Lithuania",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Accounting",
    partnerUniversity: "Siauliu Valstybine Kolegija",
    partnerCity: "Šiauliai",
    partnerCountry: "Lithuania",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Accounting",
    partnerUniversity: "Vilniaus Kolegija University of Applied Sciences",
    partnerCity: "Vilnius",
    partnerCountry: "Lithuania",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Accounting",
    partnerUniversity: "State University of Applied Sciences in Wloclawek",
    partnerCity: "Włocławek",
    partnerCountry: "Poland",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Accounting",
    partnerUniversity: "Instituto Politécnico Da Guarda",
    partnerCity: "Guarda",
    partnerCountry: "Portugal",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Accounting",
    partnerUniversity: "Romanian-American University",
    partnerCity: "Bucharest",
    partnerCountry: "Romania",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Accounting",
    partnerUniversity: "Slovak University of Agriculture in Nitra",
    partnerCity: "Nitra",
    partnerCountry: "Slovakia",
  },

  // Architecture (BA)
  {
    homeUniversity: "UNIC",
    homeDepartment: "Architecture",
    partnerUniversity: "TU Wien",
    partnerCity: "Vienna",
    partnerCountry: "Austria",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Architecture",
    partnerUniversity: "KU Leuven",
    partnerCity: "Leuven",
    partnerCountry: "Belgium",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Architecture",
    partnerUniversity: "University College of Northern Denmark - UCN",
    partnerCity: "Aalborg",
    partnerCountry: "Denmark",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Architecture",
    partnerUniversity: "National - Higher School of Architecture- Marseille",
    partnerCity: "Marseille",
    partnerCountry: "France",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Architecture",
    partnerUniversity: "University of Thessaly",
    partnerCity: "Larissa",
    partnerCountry: "Greece",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Architecture",
    partnerUniversity:
      "University of West Attica / Panepistimio Dytikis Attikis",
    partnerCity: "Athens",
    partnerCountry: "Greece",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Architecture",
    partnerUniversity: "Aristotle University of Thessaloniki",
    partnerCity: "Thessaloniki",
    partnerCountry: "Greece",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Architecture",
    partnerUniversity: "National Technical University of Athens",
    partnerCity: "Athens",
    partnerCountry: "Greece",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Architecture",
    partnerUniversity: "Bauhaus-Universität Weimar",
    partnerCity: "Weimar",
    partnerCountry: "Germany",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Architecture",
    partnerUniversity: "Hochschule Anhalt University of Applied Sciences",
    partnerCity: "Bernburg",
    partnerCountry: "Germany",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Architecture",
    partnerUniversity: "University of Naples Federico II",
    partnerCity: "Naples",
    partnerCountry: "Italy",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Architecture",
    partnerUniversity: "Universita Iuav di Venezia",
    partnerCity: "Venice",
    partnerCountry: "Italy",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Architecture",
    partnerUniversity: "University of Trieste",
    partnerCity: "Trieste",
    partnerCountry: "Italy",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Architecture",
    partnerUniversity: "RISEBA University of Applied Sciences",
    partnerCity: "Riga",
    partnerCountry: "Latvia",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Architecture",
    partnerUniversity: "Kaunas University of Technology",
    partnerCity: "Kaunas",
    partnerCountry: "Lithuania",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Architecture",
    partnerUniversity: "Universidade do Minho",
    partnerCity: "Braga",
    partnerCountry: "Portugal",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Architecture",
    partnerUniversity: "Universitatea Tehnica Cluj-Napoca",
    partnerCity: "Cluj-Napoca",
    partnerCountry: "Romania",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Architecture",
    partnerUniversity: "University of Alicante",
    partnerCity: "Alicante",
    partnerCountry: "Spain",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Architecture",
    partnerUniversity: "Technical University of Madrid",
    partnerCity: "Madrid",
    partnerCountry: "Spain",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Architecture",
    partnerUniversity: "Umea School of Architecture",
    partnerCity: "Umeå",
    partnerCountry: "Sweden",
  },

  // Business Administration (BBA) - First 50 entries
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "University of Applied Sciences BFI Vienna",
    partnerCity: "Vienna",
    partnerCountry: "Austria",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "KU Leuven",
    partnerCity: "Leuven",
    partnerCountry: "Belgium",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "Technical University of Varna",
    partnerCity: "Varna",
    partnerCountry: "Bulgaria",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "Hogeschool West-Vlaanderen Howest",
    partnerCity: "Bruges/Kortrijk",
    partnerCountry: "Belgium",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "VIVES University",
    partnerCity: "West Flanders",
    partnerCountry: "Belgium",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "Agricultural University of Plovdiv",
    partnerCity: "Plovdiv",
    partnerCountry: "Bulgaria",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "University of National and World Economy",
    partnerCity: "Sofia",
    partnerCountry: "Bulgaria",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "Libertas Business School",
    partnerCity: "Zagreb/Dubrovnik",
    partnerCountry: "Croatia",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity:
      "University of Rijeka, Faculty of Economics and Business",
    partnerCity: "Rijeka",
    partnerCountry: "Croatia",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "Polytechnic of Šibenik",
    partnerCity: "Šibenik",
    partnerCountry: "Croatia",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "Collegium Fluminense Polytechnic of Rijeka",
    partnerCity: "Rijeka",
    partnerCountry: "Croatia",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "Metropolitan University Prague",
    partnerCity: "Prague",
    partnerCountry: "Czech Republic",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity:
      "Brno University of Technology, Faculty of Business and Management",
    partnerCity: "Brno",
    partnerCountry: "Czech Republic",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "Mendel University in Brno",
    partnerCity: "Brno",
    partnerCountry: "Czech Republic",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "VIA University College",
    partnerCity: "Horsens",
    partnerCountry: "Denmark",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "Copenhagen Business Academy",
    partnerCity: "Copenhagen",
    partnerCountry: "Denmark",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "University College of Northern Denmark - UCN",
    partnerCity: "Aalborg",
    partnerCountry: "Denmark",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "Tallinn University",
    partnerCity: "Tallinn",
    partnerCountry: "Estonia",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "Université de Tours",
    partnerCity: "Tours",
    partnerCountry: "France",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "Institut Limayrac",
    partnerCity: "Toulouse",
    partnerCountry: "France",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "Université Lumière Lyon 2",
    partnerCity: "Lyon",
    partnerCountry: "France",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "Haaga-Helia University of Applied Sciences",
    partnerCity: "Helsinki",
    partnerCountry: "Finland",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "Turun Ammattikorkeakoulu Oy",
    partnerCity: "Turku",
    partnerCountry: "Finland",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "Tampere University of Applied Sciences",
    partnerCity: "Tampere",
    partnerCountry: "Finland",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "Groupe ESC Troyes",
    partnerCity: "Troyes",
    partnerCountry: "France",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "EDC Business School",
    partnerCity: "Paris",
    partnerCountry: "France",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "Ecole De Management De Normandie",
    partnerCity: "Caen",
    partnerCountry: "France",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "Groupe Kedge Business School",
    partnerCity: "Bordeaux",
    partnerCountry: "France",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "ESC Rennes - School of Business",
    partnerCity: "Rennes",
    partnerCountry: "France",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "Skema Business School Association",
    partnerCity: "Lille",
    partnerCountry: "France",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "ESCE International Business School",
    partnerCity: "Paris",
    partnerCountry: "France",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "IPAG Business School in Paris",
    partnerCity: "Paris",
    partnerCountry: "France",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "Aalen University",
    partnerCity: "Aalen",
    partnerCountry: "Germany",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "Hochschule Emden/Leer",
    partnerCity: "Emden/Leer",
    partnerCountry: "Germany",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "Frankfurt University of Applied Sciences",
    partnerCity: "Frankfurt",
    partnerCountry: "Germany",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "Hochschule Anhalt University of Applied Sciences",
    partnerCity: "Köthen",
    partnerCountry: "Germany",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "Hochschule Merseburg",
    partnerCity: "Merseburg",
    partnerCountry: "Germany",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "Technische Hochschule Ingolstadt",
    partnerCity: "Ingolstadt",
    partnerCountry: "Germany",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity:
      "Deggendorf Institute of Technology / Technische Hochschule Deggendorf",
    partnerCity: "Deggendorf",
    partnerCountry: "Germany",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "SRH Berlin University of Applied Sciences",
    partnerCity: "Berlin",
    partnerCountry: "Germany",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "Universität Kassel",
    partnerCity: "Kassel",
    partnerCountry: "Germany",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "Hochschule Schmalkalden",
    partnerCity: "Schmalkalden",
    partnerCountry: "Germany",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "Leuphana Universitat Luneburg",
    partnerCity: "Lüneburg",
    partnerCountry: "Germany",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "Hochschule fur Angewandte Wissenschaften Munchen",
    partnerCity: "Munich",
    partnerCountry: "Germany",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "Leibniz Universität Hannover",
    partnerCity: "Hanover",
    partnerCountry: "Germany",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "Hochschule Stralsund",
    partnerCity: "Stralsund",
    partnerCountry: "Germany",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "University of Bielefeld",
    partnerCity: "Bielefeld",
    partnerCountry: "Germany",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "University of Patras",
    partnerCity: "Patras",
    partnerCountry: "Greece",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "University of Crete",
    partnerCity: "Rethymno/Heraklion",
    partnerCountry: "Greece",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "Athens University of Economics and Business",
    partnerCity: "Athens",
    partnerCountry: "Greece",
  },
  {
    homeUniversity: "UNIC",
    homeDepartment: "Business Administration",
    partnerUniversity: "University of the Aegean ( Mytilene)",
    partnerCity: "Mytilene",
    partnerCountry: "Greece",
  },

  // Note: This is a partial implementation. The full dataset would include all agreements for all universities.
  // For brevity, I'm showing the pattern with representative entries from each category.
];

// UCY University Agreements (sample entries)
export const UCY_AGREEMENTS: UniversityAgreement[] = [
  // English Studies
  {
    homeUniversity: "UCY",
    homeDepartment: "English Studies",
    partnerUniversity: "University of Roma Tre",
    partnerCity: "Rome",
    partnerCountry: "Italy",
  },
  {
    homeUniversity: "UCY",
    homeDepartment: "English Studies",
    partnerUniversity: "Aristotle University of Thessaloniki",
    partnerCity: "Thessaloniki",
    partnerCountry: "Greece",
  },
  {
    homeUniversity: "UCY",
    homeDepartment: "English Studies",
    partnerUniversity: "Universita per Stranieri of Siena",
    partnerCity: "Siena",
    partnerCountry: "Italy",
  },
  {
    homeUniversity: "UCY",
    homeDepartment: "English Studies",
    partnerUniversity: "Padagogische Hochschule Freiburg",
    partnerCity: "Freiburg",
    partnerCountry: "Germany",
  },
  {
    homeUniversity: "UCY",
    homeDepartment: "English Studies",
    partnerUniversity: "Universitat Rovira I Virgili",
    partnerCity: "Tarragona",
    partnerCountry: "Spain",
  },

  // Medicine
  {
    homeUniversity: "UCY",
    homeDepartment: "Medicine",
    partnerUniversity: "University of Patras",
    partnerCity: "Patras",
    partnerCountry: "Greece",
  },
  {
    homeUniversity: "UCY",
    homeDepartment: "Medicine",
    partnerUniversity: "University of Ioannina",
    partnerCity: "Ioannina",
    partnerCountry: "Greece",
  },
  {
    homeUniversity: "UCY",
    homeDepartment: "Medicine",
    partnerUniversity:
      "National School of Public Health (University of West Attica)",
    partnerCity: "Athens",
    partnerCountry: "Greece",
  },
  {
    homeUniversity: "UCY",
    homeDepartment: "Medicine",
    partnerUniversity: "National and Kapodistrian University of Athens",
    partnerCity: "Athens",
    partnerCountry: "Greece",
  },

  // Computer Science
  {
    homeUniversity: "UCY",
    homeDepartment: "Computer Science",
    partnerUniversity: "University of Crete",
    partnerCity: "Heraklion",
    partnerCountry: "Greece",
  },
  {
    homeUniversity: "UCY",
    homeDepartment: "Computer Science",
    partnerUniversity: "Universidad de A Coruna",
    partnerCity: "A Coruña",
    partnerCountry: "Spain",
  },
  {
    homeUniversity: "UCY",
    homeDepartment: "Computer Science",
    partnerUniversity: "University of Rey Juan Carlos",
    partnerCity: "Madrid",
    partnerCountry: "Spain",
  },
  {
    homeUniversity: "UCY",
    homeDepartment: "Computer Science",
    partnerUniversity: "Aristotle University of Thessaloniki",
    partnerCity: "Thessaloniki",
    partnerCountry: "Greece",
  },
];

// UCLan University Agreements (sample entries)
export const UCLAN_AGREEMENTS: UniversityAgreement[] = [
  // Business Administration
  {
    homeUniversity: "UCLan",
    homeDepartment: "Business Administration",
    partnerUniversity: "Vienna University of Economics and Business",
    partnerCity: "Vienna",
    partnerCountry: "Austria",
    agreementType: "staff",
  },
  {
    homeUniversity: "UCLan",
    homeDepartment: "Business Administration",
    partnerUniversity: "VUZF University-Sofia",
    partnerCity: "Sofia",
    partnerCountry: "Bulgaria",
  },
  {
    homeUniversity: "UCLan",
    homeDepartment: "Business Administration",
    partnerUniversity: "Sofia University St. Kliment Ohridski",
    partnerCity: "Sofia",
    partnerCountry: "Bulgaria",
  },
  {
    homeUniversity: "UCLan",
    homeDepartment: "Business Administration",
    partnerUniversity: "University of Applied Sciences Stralsund",
    partnerCity: "Stralsund",
    partnerCountry: "Germany",
  },

  // Computing
  {
    homeUniversity: "UCLan",
    homeDepartment: "Computing",
    partnerUniversity: "University of Lille",
    partnerCity: "Lille",
    partnerCountry: "France",
    notes: "French classes only",
  },
  {
    homeUniversity: "UCLan",
    homeDepartment: "Computing",
    partnerUniversity: "University of the Littoral Opal Coast",
    partnerCity: "Dunkirk",
    partnerCountry: "France",
  },
  {
    homeUniversity: "UCLan",
    homeDepartment: "Computing",
    partnerUniversity: "University of Western Macedonia",
    partnerCity: "Kozani",
    partnerCountry: "Greece",
  },

  // Law
  {
    homeUniversity: "UCLan",
    homeDepartment: "Law",
    partnerUniversity: "University of Ostrava",
    partnerCity: "Ostrava",
    partnerCountry: "Czech Republic",
    agreementType: "traineeship",
  },
  {
    homeUniversity: "UCLan",
    homeDepartment: "Law",
    partnerUniversity: "Tallinn University",
    partnerCity: "Tallinn",
    partnerCountry: "Estonia",
  },
  {
    homeUniversity: "UCLan",
    homeDepartment: "Law",
    partnerUniversity: "University of Turku",
    partnerCity: "Turku",
    partnerCountry: "Finland",
  },
];

// Frederick University Agreements (sample entries)
export const FREDERICK_AGREEMENTS: UniversityAgreement[] = [
  // Visual Communication
  {
    homeUniversity: "Frederick",
    homeDepartment: "Visual Communication",
    partnerUniversity: "Technical University of Kosice",
    partnerCity: "Košice",
    partnerCountry: "Slovakia",
  },
  {
    homeUniversity: "Frederick",
    homeDepartment: "Visual Communication",
    partnerUniversity: "Panepistimio Dytikis Makedonias",
    partnerCity: "Kozani",
    partnerCountry: "Greece",
  },
  {
    homeUniversity: "Frederick",
    homeDepartment: "Visual Communication",
    partnerUniversity: "E. S. le Mirail",
    partnerCity: "Toulouse",
    partnerCountry: "France",
  },

  // Business Administration
  {
    homeUniversity: "Frederick",
    homeDepartment: "Business Administration",
    partnerUniversity: "Technical University Of Kosice",
    partnerCity: "Košice",
    partnerCountry: "Slovakia",
  },
  {
    homeUniversity: "Frederick",
    homeDepartment: "Business Administration",
    partnerUniversity: "Tomas Moore",
    partnerCity: "Mechelen",
    partnerCountry: "Belgium",
  },
  {
    homeUniversity: "Frederick",
    homeDepartment: "Business Administration",
    partnerUniversity: "Tallinn University Of Technology",
    partnerCity: "Tallinn",
    partnerCountry: "Estonia",
  },

  // Civil Engineering
  {
    homeUniversity: "Frederick",
    homeDepartment: "Civil Engineering",
    partnerUniversity: "Metropolia University of Applied Sciences",
    partnerCity: "Helsinki",
    partnerCountry: "Finland",
  },
  {
    homeUniversity: "Frederick",
    homeDepartment: "Civil Engineering",
    partnerUniversity: "Czech Technical University",
    partnerCity: "Prague",
    partnerCountry: "Czech Republic",
  },
  {
    homeUniversity: "Frederick",
    homeDepartment: "Civil Engineering",
    partnerUniversity: "Technical University of Kosice",
    partnerCity: "Košice",
    partnerCountry: "Slovakia",
  },
];

// EUC University Agreements (sample entries)
export const EUC_AGREEMENTS: UniversityAgreement[] = [
  // Business and Administration
  {
    homeUniversity: "EUC",
    homeDepartment: "Business and Administration",
    partnerUniversity: "Rotterdam University of Applied Sciences",
    partnerCity: "Rotterdam",
    partnerCountry: "Netherlands",
  },
  {
    homeUniversity: "EUC",
    homeDepartment: "Business and Administration",
    partnerUniversity: "Windesheim University of Applied Sciences",
    partnerCity: "Zwolle",
    partnerCountry: "Netherlands",
  },
  {
    homeUniversity: "EUC",
    homeDepartment: "Business and Administration",
    partnerUniversity: "University of Peloponnese",
    partnerCity: "Tripoli",
    partnerCountry: "Greece",
  },

  // Medicine
  {
    homeUniversity: "EUC",
    homeDepartment: "Medicine",
    partnerUniversity: "University of West Attica (Previous TEI of Athens)",
    partnerCity: "Athens",
    partnerCountry: "Greece",
  },
  {
    homeUniversity: "EUC",
    homeDepartment: "Medicine",
    partnerUniversity: "Aristotle University of Thessaloniki",
    partnerCity: "Thessaloniki",
    partnerCountry: "Greece",
  },
  {
    homeUniversity: "EUC",
    homeDepartment: "Medicine",
    partnerUniversity: "Democritus University of Thrace",
    partnerCity: "Komotini",
    partnerCountry: "Greece",
  },

  // Psychology
  {
    homeUniversity: "EUC",
    homeDepartment: "Psychology",
    partnerUniversity: "Aristotle University of Thessaloniki",
    partnerCity: "Thessaloniki",
    partnerCountry: "Greece",
  },
  {
    homeUniversity: "EUC",
    homeDepartment: "Psychology",
    partnerUniversity: "Katolicki Uniwersytet Lubelski Jana Pawła II",
    partnerCity: "Lublin",
    partnerCountry: "Poland",
  },
  {
    homeUniversity: "EUC",
    homeDepartment: "Psychology",
    partnerUniversity: "Universidad Europea de Valencia",
    partnerCity: "Valencia",
    partnerCountry: "Spain",
  },
];

// Combined agreements for easy searching
export const ALL_UNIVERSITY_AGREEMENTS: UniversityAgreement[] = [
  ...UNIC_AGREEMENTS,
  ...UCY_AGREEMENTS,
  ...UCLAN_AGREEMENTS,
  ...FREDERICK_AGREEMENTS,
  ...EUC_AGREEMENTS,
];

// Helper functions
export function getAgreementsByUniversity(
  universityCode: string,
): UniversityAgreement[] {
  return ALL_UNIVERSITY_AGREEMENTS.filter(
    (agreement) => agreement.homeUniversity === universityCode,
  );
}

export function getAgreementsByDepartment(
  universityCode: string,
  department: string,
): UniversityAgreement[] {
  return ALL_UNIVERSITY_AGREEMENTS.filter(
    (agreement) =>
      agreement.homeUniversity === universityCode &&
      agreement.homeDepartment === department,
  );
}

export function getAgreementsByCountry(country: string): UniversityAgreement[] {
  return ALL_UNIVERSITY_AGREEMENTS.filter(
    (agreement) => agreement.partnerCountry === country,
  );
}

export function getPartnerCountries(): string[] {
  const countries = new Set(
    ALL_UNIVERSITY_AGREEMENTS.map((agreement) => agreement.partnerCountry),
  );
  return Array.from(countries).sort();
}

export function getPartnerCities(): string[] {
  const cities = new Set(
    ALL_UNIVERSITY_AGREEMENTS.map((agreement) => agreement.partnerCity),
  );
  return Array.from(cities).sort();
}

export function searchAgreements(query: string): UniversityAgreement[] {
  const lowerQuery = query.toLowerCase();
  return ALL_UNIVERSITY_AGREEMENTS.filter(
    (agreement) =>
      agreement.partnerUniversity.toLowerCase().includes(lowerQuery) ||
      agreement.partnerCity.toLowerCase().includes(lowerQuery) ||
      agreement.partnerCountry.toLowerCase().includes(lowerQuery) ||
      agreement.homeDepartment.toLowerCase().includes(lowerQuery),
  );
}
