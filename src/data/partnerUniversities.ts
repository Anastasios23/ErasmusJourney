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
  { name: "Universidad de Sevilla", city: "Sevilla", country: "Spain" },
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
  { name: "Charles University", city: "Prague", country: "Czech Republic" },
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

// Frederick University - Additional departments
const FREDERICK_MARITIME: PartnerUniversity[] = [
  { name: "Tallinna Tehnikakorgkool", city: "Tallinn", country: "Estonia" },
  {
    name: "Jade University of Applied Science",
    city: "Wilhelmshaven",
    country: "Germany",
  },
];

const FREDERICK_LAW: PartnerUniversity[] = [
  {
    name: "Ethino kai Kapodistriako Panepistimio Athinon",
    city: "Athens",
    country: "Greece",
  },
  {
    name: "Democritus University Of Thrace",
    city: "Komotini",
    country: "Greece",
  },
  { name: "La Rochelle Universite", city: "La Rochelle", country: "France" },
  { name: "University of Trnave", city: "Trnava", country: "Slovakia" },
  {
    name: "Univerzita Mateja Bela V Banskej Bystrici",
    city: "Banská Bystrica",
    country: "Slovakia",
  },
  {
    name: "Univerzitet Privredna Akademija U Novom Sadu",
    city: "Novi Sad",
    country: "Serbia",
  },
  { name: "Universidade De Coimbra", city: "Coimbra", country: "Portugal" },
  {
    name: "Viesoji Istaiga Europos Humanitarinis Universitetas",
    city: "Vilnius",
    country: "Lithuania",
  },
  { name: "Hellenic Open University", city: "Patras", country: "Greece" },
  { name: "University of Macedonia", city: "Thessaloniki", country: "Greece" },
];

const FREDERICK_CIVIL_ENGINEERING: PartnerUniversity[] = [
  {
    name: "Metropolia University of Applied Sciences",
    city: "Helsinki",
    country: "Finland",
  },
  {
    name: "Czech Technical University",
    city: "Prague",
    country: "Czech Republic",
  },
  {
    name: "Technical University of Kosice",
    city: "Košice",
    country: "Slovakia",
  },
  {
    name: "Democritus University of Thrace",
    city: "Komotini",
    country: "Greece",
  },
  { name: "Tallinna Tehnikakorgkool", city: "Tallinn", country: "Estonia" },
  { name: "La Rochelle Universite", city: "La Rochelle", country: "France" },
  {
    name: "Universitatea Tehnica de Constructii Bucuresti",
    city: "Bucharest",
    country: "Romania",
  },
  {
    name: "Kaunas University of Technology",
    city: "Kaunas",
    country: "Lithuania",
  },
  {
    name: "Diethnes Panepistimio Ellados",
    city: "Thessaloniki",
    country: "Greece",
  },
  { name: "Nisantasi Universitesi", city: "Istanbul", country: "Turkey" },
  {
    name: "Klaipeda University Applied Sciences",
    city: "Klaipėda",
    country: "Lithuania",
  },
  { name: "Universite d'Orleans", city: "Orléans", country: "France" },
  { name: "Hellenic Open University", city: "Patras", country: "Greece" },
];

const FREDERICK_ELECTRICAL_ENGINEERING: PartnerUniversity[] = [
  {
    name: "Metropolia University of Applied Sciences",
    city: "Helsinki",
    country: "Finland",
  },
  {
    name: "Technical University of Kosice",
    city: "Košice",
    country: "Slovakia",
  },
  {
    name: "Technology University of Gdansk",
    city: "Gdańsk",
    country: "Poland",
  },
  {
    name: "Democritus University of Thrace",
    city: "Komotini",
    country: "Greece",
  },
  { name: "Tallinna Tehnikakorgkool", city: "Tallinn", country: "Estonia" },
  { name: "Nisantasi Universitesi", city: "Istanbul", country: "Turkey" },
  {
    name: "Kaunas University of Technology",
    city: "Kaunas",
    country: "Lithuania",
  },
  {
    name: "Uniwersytet Technologiczno-Humanistyczny im. Kazimierza Pulaskiego w Radomiu",
    city: "Radom",
    country: "Poland",
  },
  {
    name: "University Of Western Macedonia",
    city: "Kozani",
    country: "Greece",
  },
  {
    name: "Academia im. Jacuba z Paradyza",
    city: "Świebodzin",
    country: "Poland",
  },
  { name: "University of Split", city: "Split", country: "Croatia" },
  {
    name: "Klaipeda University Applied Sciences",
    city: "Klaipėda",
    country: "Lithuania",
  },
  {
    name: "Hellenic Mediterranean University",
    city: "Heraklion",
    country: "Greece",
  },
  { name: "Hochschule Stralsund", city: "Stralsund", country: "Germany" },
  { name: "University of Aalen", city: "Aalen", country: "Germany" },
  {
    name: "Technical University of Bucharest",
    city: "Bucharest",
    country: "Romania",
  },
  { name: "Kadir Has University", city: "Istanbul", country: "Turkey" },
  { name: "Universite d'Orleans", city: "Orléans", country: "France" },
];

const FREDERICK_COMPUTER_SCIENCE: PartnerUniversity[] = [
  {
    name: "Kaunas University Of Technology",
    city: "Kaunas",
    country: "Lithuania",
  },
  {
    name: "Technische Hochschule Deggendorf",
    city: "Deggendorf",
    country: "Germany",
  },
  { name: "La Rochelle Universite", city: "La Rochelle", country: "France" },
  { name: "Panepistimio Thessalias", city: "Volos", country: "Greece" },
  {
    name: "Wyzsza Szkola Przedsiebiorczoscii Administracji W Lublinie",
    city: "Lublin",
    country: "Poland",
  },
  { name: "Tomas Moore", city: "Mechelen", country: "Belgium" },
  { name: "Universidad De Leon", city: "León", country: "Spain" },
  {
    name: "Viesoji Istaiga Europos Humanitarinis Universitetas",
    city: "Vilnius",
    country: "Lithuania",
  },
  {
    name: "Universitatea Politehnica Din Bucuresti",
    city: "Bucharest",
    country: "Romania",
  },
  {
    name: "Metropolia University Of Applied Sciences",
    city: "Helsinki",
    country: "Finland",
  },
  { name: "Diethnes Panepistimio Ellados", city: "Athens", country: "Greece" },
  {
    name: "Akademia Im. Jakuba Z Paradyza",
    city: "Świebodzin",
    country: "Poland",
  },
  {
    name: "University Of Western Macedonia",
    city: "Kozani",
    country: "Greece",
  },
  {
    name: "Univerzita Mateja Bela V Banskej Bystrici",
    city: "Banská Bystrica",
    country: "Slovakia",
  },
  {
    name: "Klaipeda University Applied Sciences",
    city: "Klaipėda",
    country: "Lithuania",
  },
  { name: "University of Aalen", city: "Aalen", country: "Germany" },
  { name: "Hochschule Stralsund", city: "Stralsund", country: "Germany" },
  { name: "Hochschule der Medien", city: "Stuttgart", country: "Germany" },
  {
    name: "Instituto Universitário de Lisboa",
    city: "Lisbon",
    country: "Portugal",
  },
  { name: "Hellenic Open University", city: "Patras", country: "Greece" },
];

const FREDERICK_PSYCHOLOGY: PartnerUniversity[] = [
  { name: "Nisantasi Universitesi", city: "Istanbul", country: "Turkey" },
  {
    name: "Kaunas University of Technology",
    city: "Kaunas",
    country: "Lithuania",
  },
  { name: "University of Ioannina", city: "Ioannina", country: "Greece" },
  {
    name: "South-West University Neofit Rilski",
    city: "Blagoevgrad",
    country: "Bulgaria",
  },
];

const FREDERICK_NURSING: PartnerUniversity[] = [
  {
    name: "Instituto Politecnico De Santarem",
    city: "Santarém",
    country: "Portugal",
  },
  { name: "Linkopings University", city: "Linköping", country: "Sweden" },
  { name: "Medical University - Sofia", city: "Sofia", country: "Bulgaria" },
  { name: "Tallinna Tervishoiu Kõrgkool", city: "Tallinn", country: "Estonia" },
  { name: "Diethnes Panepistimio Ellados", city: "Athens", country: "Greece" },
  {
    name: "Aristoteleio Panepistimio Thessalonikis",
    city: "Thessaloniki",
    country: "Greece",
  },
  { name: "University of Thessaly", city: "Volos", country: "Greece" },
  {
    name: "Universita Degli Studi Di Foggia",
    city: "Foggia",
    country: "Italy",
  },
  {
    name: "Vysoka skola zdravotnicka, o.p.s.",
    city: "Prague",
    country: "Czech Republic",
  },
  {
    name: "Klaipeda University Applied Sciences",
    city: "Klaipėda",
    country: "Lithuania",
  },
  { name: "University of Valencia", city: "Valencia", country: "Spain" },
  {
    name: "Hellenic Mediterranean University",
    city: "Heraklion",
    country: "Greece",
  },
  { name: "University of Ioannina", city: "Ioannina", country: "Greece" },
  { name: "University of Patra", city: "Patras", country: "Greece" },
  {
    name: "Democritus University of Thrace",
    city: "Komotini",
    country: "Greece",
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

const UCLAN_ENGINEERING: PartnerUniversity[] = [
  { name: "Tampere University", city: "Tampere", country: "Finland" },
  {
    name: "University of the Littoral Opal Coast",
    city: "Dunkirk",
    country: "France",
  },
  {
    name: "Kaunas University of Technology",
    city: "Kaunas",
    country: "Lithuania",
  },
  { name: "Klaipeda University", city: "Klaipeda", country: "Lithuania" },
  { name: "Széchenyi István University", city: "Győr", country: "Hungary" },
  { name: "University of Žilina", city: "Žilina", country: "Slovakia" },
  {
    name: "Universitatea Tehnica Gheorghe Asachi Din Iasi",
    city: "Iași",
    country: "Romania",
  },
  {
    name: "Alexandru Ioan Cuza University of Iași",
    city: "Iași",
    country: "Romania",
  },
  { name: "The University of Oradea", city: "Oradea", country: "Romania" },
  { name: "University of Niš", city: "Niš", country: "Serbia" },
  { name: "Universidad de Virgo", city: "Virgo", country: "Spain" },
];

const UCLAN_SPORTS: PartnerUniversity[] = [
  { name: "Vrije Universiteit Brussel", city: "Brussels", country: "Belgium" },
  { name: "Masaryk University", city: "Brno", country: "Czech Republic" },
  {
    name: "University of Reunion Island",
    city: "Saint-Denis",
    country: "France",
  },
  { name: "Universite De Lorraine", city: "Nancy", country: "France" },
  {
    name: "Aristotelio Panepistimio Thessalonikis",
    city: "Thessaloniki",
    country: "Greece",
  },
  {
    name: "Hungarian University of Sports Science",
    city: "Budapest",
    country: "Hungary",
  },
  { name: "University of Pécs", city: "Pécs", country: "Hungary" },
  { name: "University of Tuscia", city: "Viterbo", country: "Italy" },
  { name: "Klaipeda University", city: "Klaipeda", country: "Lithuania" },
  { name: "Molde University", city: "Molde", country: "Norway" },
  {
    name: "Ss. CYRIL AND METHODIUS UNIVERSITY IN SKOPJE",
    city: "Skopje",
    country: "North Macedonia",
  },
  {
    name: "University of Trás-os-Montes and Alto Douro",
    city: "Vila Real",
    country: "Portugal",
  },
  {
    name: "Ovidius University of Constanța",
    city: "Constanța",
    country: "Romania",
  },
  {
    name: "Polytechnic Institute of Leiria",
    city: "Leiria",
    country: "Portugal",
  },
];

const UCLAN_LAW: PartnerUniversity[] = [
  { name: "University of Ostrava", city: "Ostrava", country: "Czech Republic" },
  { name: "Tallinn University", city: "Tallinn", country: "Estonia" },
  { name: "University of Turku", city: "Turku", country: "Finland" },
  { name: "Universite De Bordeaux", city: "Bordeaux", country: "France" },
  { name: "Ruhr-Universitaet Bochum", city: "Bochum", country: "Germany" },
  {
    name: "EKA University of Applied Sciences",
    city: "Tartu",
    country: "Estonia",
  },
  { name: "Riga Graduate School of Law", city: "Riga", country: "Latvia" },
  { name: "Cracow University of Economics", city: "Kraków", country: "Poland" },
  {
    name: "Ovidius University of Constanța",
    city: "Constanța",
    country: "Romania",
  },
  {
    name: "University of Social Sciences",
    city: "Târgu Mureș",
    country: "Romania",
  },
  { name: "University of Niš", city: "Niš", country: "Serbia" },
  { name: "Megatrend University", city: "Belgrade", country: "Serbia" },
];

// EUC agreements by department
const EUC_MEDICINE: PartnerUniversity[] = [
  { name: "University of West Attica", city: "Athens", country: "Greece" },
  {
    name: "Aristotle University of Thessaloniki",
    city: "Thessaloniki",
    country: "Greece",
  },
  {
    name: "Democritus University of Thrace",
    city: "Komotini",
    country: "Greece",
  },
  {
    name: "Faculty of Medicine Lyon Sud - Charles Mérieux",
    city: "Lyon",
    country: "France",
  },
  {
    name: "Katowice School of Technology",
    city: "Katowice",
    country: "Poland",
  },
  {
    name: "National and Kapodistrian University of Athens",
    city: "Athens",
    country: "Greece",
  },
  { name: "Sapienza Universita Di Roma", city: "Rome", country: "Italy" },
  { name: "Universidad Europea de Madrid", city: "Madrid", country: "Spain" },
  {
    name: "Universita degli Studi di Milano-Bicocca",
    city: "Milan",
    country: "Italy",
  },
  {
    name: "Universitat Degli Studi Di Roma Tor Vergata",
    city: "Rome",
    country: "Italy",
  },
  { name: "Universitat Heidelberg", city: "Heidelberg", country: "Germany" },
  { name: "University of Catania", city: "Catania", country: "Italy" },
  { name: "University of Cologne", city: "Cologne", country: "Germany" },
  { name: "University of Crete", city: "Heraklion", country: "Greece" },
  { name: "University of Ioannina", city: "Ioannina", country: "Greece" },
  { name: "University of Patras", city: "Patras", country: "Greece" },
  {
    name: "University of Szeged-Szegedi Tudomanyegyetem",
    city: "Szeged",
    country: "Hungary",
  },
  { name: "University of Thessaly", city: "Volos", country: "Greece" },
  {
    name: "Universita degli Studi G.d'Annunzio Chieti-Perscara",
    city: "Chieti",
    country: "Italy",
  },
];

const EUC_PSYCHOLOGY: PartnerUniversity[] = [
  {
    name: "Aristotle University of Thessaloniki",
    city: "Thessaloniki",
    country: "Greece",
  },
  {
    name: "Katolicki Uniwersytet Lubelski Jana Pawła II",
    city: "Lublin",
    country: "Poland",
  },
  { name: "Kazimierz Wielki University", city: "Bydgoszcz", country: "Poland" },
  {
    name: "Panteion University of Social and Political Sciences",
    city: "Athens",
    country: "Greece",
  },
  {
    name: "SWPS University of Social Sciences and Humanities",
    city: "Warsaw",
    country: "Poland",
  },
  {
    name: "Universidad Europea de Valencia",
    city: "Valencia",
    country: "Spain",
  },
  {
    name: "Universitat Autonoma De Barcelona",
    city: "Barcelona",
    country: "Spain",
  },
  { name: "University of Crete", city: "Heraklion", country: "Greece" },
  {
    name: "University of Economics & Human Sciences in Warsaw",
    city: "Warsaw",
    country: "Poland",
  },
  { name: "University of Ioannina", city: "Ioannina", country: "Greece" },
  {
    name: "University of New York in Prague",
    city: "Prague",
    country: "Czech Republic",
  },
  {
    name: "PANEUROPSKA VYSOKA SKOLA NO",
    city: "Bratislava",
    country: "Slovakia",
  },
];

const EUC_NURSING: PartnerUniversity[] = [
  {
    name: "Klaipeda State University of Applied Sciences",
    city: "Klaipeda",
    country: "Lithuania",
  },
  {
    name: "Polytechnic University of Viana do Castelo",
    city: "Viana do Castelo",
    country: "Portugal",
  },
  { name: "University of Peloponnese", city: "Tripoli", country: "Greece" },
  { name: "University of West Attica", city: "Athens", country: "Greece" },
  { name: "University of Thessaly", city: "Volos", country: "Greece" },
  {
    name: "International Hellenic University",
    city: "Thessaloniki",
    country: "Greece",
  },
  { name: "University of Ioannina", city: "Ioannina", country: "Greece" },
  { name: "University of Patras", city: "Patras", country: "Greece" },
  {
    name: "UNIWERSYTET KALISKI IM. PREZYDENTA STANISLAWA WOJCIECHOWSKIEGO",
    city: "Kalisz",
    country: "Poland",
  },
  {
    name: "University of Western Macedonia",
    city: "Kozani",
    country: "Greece",
  },
];

const EUC_BUSINESS: PartnerUniversity[] = [
  {
    name: "Rotterdam University of Applied Sciences",
    city: "Rotterdam",
    country: "Netherlands",
  },
  {
    name: "Windesheim University of Applied Sciences",
    city: "Zwolle",
    country: "Netherlands",
  },
  { name: "University of Peloponnese", city: "Tripoli", country: "Greece" },
  { name: "Comenius University", city: "Bratislava", country: "Slovakia" },
  {
    name: "Democritus University of Thrace",
    city: "Komotini",
    country: "Greece",
  },
  {
    name: "ESCE International Business School",
    city: "Paris",
    country: "France",
  },
  { name: "Estonian Aviation Academy", city: "Tartu", country: "Estonia" },
  {
    name: "Fundacio per a la Universitat Oberta de Catalunya",
    city: "Barcelona",
    country: "Spain",
  },
  { name: "Haute Ecole Libre Mosane", city: "Liège", country: "Belgium" },
  {
    name: "Hochschule Munchen University of Applied Sciences",
    city: "Munich",
    country: "Germany",
  },
  {
    name: "ICES Catholic University of Vendee",
    city: "La Roche-sur-Yon",
    country: "France",
  },
  {
    name: "Institut d'Etudes Politiques de Paris (SciencesPo)",
    city: "Paris",
    country: "France",
  },
  {
    name: "University of New York in Prague",
    city: "Prague",
    country: "Czech Republic",
  },
  {
    name: "University of Pardubice",
    city: "Pardubice",
    country: "Czech Republic",
  },
  { name: "University of Patras", city: "Patras", country: "Greece" },
  { name: "University of Pitesti", city: "Pitești", country: "Romania" },
  { name: "University of West Attica", city: "Athens", country: "Greece" },
  {
    name: "University of Western Macedonia",
    city: "Kozani",
    country: "Greece",
  },
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
    {
      homeUniversity: "Frederick University",
      homeDepartment: "Maritime",
      partnerUniversities: FREDERICK_MARITIME,
    },
    {
      homeUniversity: "Frederick University",
      homeDepartment: "Law",
      partnerUniversities: FREDERICK_LAW,
    },
    {
      homeUniversity: "Frederick University",
      homeDepartment: "Civil Engineering",
      partnerUniversities: FREDERICK_CIVIL_ENGINEERING,
    },
    {
      homeUniversity: "Frederick University",
      homeDepartment: "Electrical Engineering",
      partnerUniversities: FREDERICK_ELECTRICAL_ENGINEERING,
    },
    {
      homeUniversity: "Frederick University",
      homeDepartment: "Computer Science",
      partnerUniversities: FREDERICK_COMPUTER_SCIENCE,
    },
    {
      homeUniversity: "Frederick University",
      homeDepartment: "Psychology",
      partnerUniversities: FREDERICK_PSYCHOLOGY,
    },
    {
      homeUniversity: "Frederick University",
      homeDepartment: "Nursing",
      partnerUniversities: FREDERICK_NURSING,
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
    {
      homeUniversity: "University of Central Lancashire Cyprus",
      homeDepartment: "Engineering",
      partnerUniversities: UCLAN_ENGINEERING,
    },
    {
      homeUniversity: "University of Central Lancashire Cyprus",
      homeDepartment: "Sports and Exercise Science",
      partnerUniversities: UCLAN_SPORTS,
    },
    {
      homeUniversity: "University of Central Lancashire Cyprus",
      homeDepartment: "Law",
      partnerUniversities: UCLAN_LAW,
    },

    // European University Cyprus
    {
      homeUniversity: "European University Cyprus",
      homeDepartment: "Medicine",
      partnerUniversities: EUC_MEDICINE,
    },
    {
      homeUniversity: "European University Cyprus",
      homeDepartment: "Psychology",
      partnerUniversities: EUC_PSYCHOLOGY,
    },
    {
      homeUniversity: "European University Cyprus",
      homeDepartment: "Nursing and Midwifery",
      partnerUniversities: EUC_NURSING,
    },
    {
      homeUniversity: "European University Cyprus",
      homeDepartment: "Business Administration",
      partnerUniversities: EUC_BUSINESS,
    },
  ];

// Helper function to remove duplicate universities
const removeDuplicateUniversities = (
  universities: PartnerUniversity[],
): PartnerUniversity[] => {
  const uniqueUniversities = new Map<string, PartnerUniversity>();

  universities.forEach((uni) => {
    const key = `${uni.name}-${uni.city}-${uni.country}`;
    if (!uniqueUniversities.has(key)) {
      uniqueUniversities.set(key, uni);
    }
  });

  return Array.from(uniqueUniversities.values());
};

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
  const partners = agreement ? agreement.partnerUniversities : [];
  return removeDuplicateUniversities(partners);
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
