export interface Destination {
  id: string;
  country: string;
  city: string;
  university: string;
  universityShort: string;
  partnerUniversities: string[];
  language: string;
  costOfLiving: "low" | "medium" | "high";
  averageRent: number;
  popularWith: string[];
  imageUrl: string;
  description: string;
}

export interface StudentTestimonial {
  id: string;
  studentName: string;
  homeUniversity: string;
  hostUniversity: string;
  city: string;
  country: string;
  semester: string;
  year: number;
  accommodationType: string;
  monthlyRent: number;
  rating: number;
  accommodationReview: string;
  cityReview: string;
  budgetTips: string;
  wouldRecommend: boolean;
  avatar: string;
}

export const ERASMUS_DESTINATIONS: Destination[] = [
  {
    id: "berlin_germany",
    country: "Germany",
    city: "Berlin",
    university: "Technical University of Berlin",
    universityShort: "TU Berlin",
    partnerUniversities: [
      "University of Cyprus",
      "Cyprus University of Technology",
    ],
    language: "German/English",
    costOfLiving: "medium",
    averageRent: 450,
    popularWith: ["Engineering", "Computer Science", "Architecture"],
    imageUrl:
      "https://images.unsplash.com/photo-1587330979470-3010b06cccd4?w=600&h=400&fit=crop",
    description:
      "Vibrant capital city with excellent technical education and rich cultural life.",
  },
  {
    id: "barcelona_spain",
    country: "Spain",
    city: "Barcelona",
    university: "Universitat Politècnica de Catalunya",
    universityShort: "UPC",
    partnerUniversities: ["University of Cyprus", "University of Nicosia"],
    language: "Spanish/Catalan/English",
    costOfLiving: "medium",
    averageRent: 500,
    popularWith: ["Architecture", "Engineering", "Business"],
    imageUrl:
      "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600&h=400&fit=crop",
    description:
      "Mediterranean coastal city famous for Gaudí architecture and vibrant student life.",
  },
  {
    id: "amsterdam_netherlands",
    country: "Netherlands",
    city: "Amsterdam",
    university: "University of Amsterdam",
    universityShort: "UvA",
    partnerUniversities: ["University of Cyprus", "European University Cyprus"],
    language: "Dutch/English",
    costOfLiving: "high",
    averageRent: 650,
    popularWith: ["Business", "Social Sciences", "Psychology"],
    imageUrl:
      "https://images.unsplash.com/photo-1459679749680-18eb29d40cd2?w=600&h=400&fit=crop",
    description:
      "Historic city with world-class universities and excellent English-taught programs.",
  },
  {
    id: "vienna_austria",
    country: "Austria",
    city: "Vienna",
    university: "Vienna University of Technology",
    universityShort: "TU Wien",
    partnerUniversities: [
      "Cyprus University of Technology",
      "Frederick University",
    ],
    language: "German/English",
    costOfLiving: "medium",
    averageRent: 400,
    popularWith: ["Engineering", "Architecture", "Music"],
    imageUrl:
      "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=600&h=400&fit=crop",
    description:
      "Imperial city with prestigious technical university and rich cultural heritage.",
  },
  {
    id: "prague_czech",
    country: "Czech Republic",
    city: "Prague",
    university: "Charles University",
    universityShort: "CUNI",
    partnerUniversities: ["University of Cyprus", "UCLan Cyprus"],
    language: "Czech/English",
    costOfLiving: "low",
    averageRent: 300,
    popularWith: ["Medicine", "Humanities", "Law"],
    imageUrl:
      "https://images.unsplash.com/photo-1541849546-216549ae216d?w=600&h=400&fit=crop",
    description:
      "Fairy-tale city with one of Europe's oldest universities and affordable living.",
  },
  {
    id: "stockholm_sweden",
    country: "Sweden",
    city: "Stockholm",
    university: "Royal Institute of Technology",
    universityShort: "KTH",
    partnerUniversities: [
      "Cyprus University of Technology",
      "University of Nicosia",
    ],
    language: "Swedish/English",
    costOfLiving: "high",
    averageRent: 550,
    popularWith: ["Engineering", "Computer Science", "Design"],
    imageUrl:
      "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=600&h=400&fit=crop",
    description:
      "Innovative Nordic capital with cutting-edge technology programs and stunning archipelago.",
  },
  {
    id: "toulouse_france",
    country: "France",
    city: "Toulouse",
    university: "Université de Toulouse",
    universityShort: "UT",
    partnerUniversities: ["University of Cyprus", "Frederick University"],
    language: "French/English",
    costOfLiving: "medium",
    averageRent: 380,
    popularWith: ["Aerospace Engineering", "Business", "Languages"],
    imageUrl:
      "https://images.unsplash.com/photo-1548634403-6d4f3b216529?w=600&h=400&fit=crop",
    description:
      "Pink city famous for aerospace industry and excellent student atmosphere.",
  },
  {
    id: "dublin_ireland",
    country: "Ireland",
    city: "Dublin",
    university: "Technological University Dublin",
    universityShort: "TU Dublin",
    partnerUniversities: ["Cyprus University of Technology", "UCLan Cyprus"],
    language: "English",
    costOfLiving: "high",
    averageRent: 600,
    popularWith: ["Technology", "Business", "Media"],
    imageUrl:
      "https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?w=600&h=400&fit=crop",
    description:
      "English-speaking tech hub with friendly culture and vibrant student life.",
  },
];

export const STUDENT_TESTIMONIALS: StudentTestimonial[] = [
  {
    id: "testimonial_1",
    studentName: "Maria Konstantinou",
    homeUniversity: "University of Cyprus",
    hostUniversity: "Technical University of Berlin",
    city: "Berlin",
    country: "Germany",
    semester: "Fall",
    year: 2023,
    accommodationType: "Student Dormitory",
    monthlyRent: 420,
    rating: 5,
    accommodationReview:
      "Amazing dorm in Friedrichshain! The room was modern and clean, with excellent Wi-Fi. Great common areas where I met students from all over Europe. The location was perfect - 20 minutes to university by bike and close to all the nightlife.",
    cityReview:
      "Berlin is incredible for students! So much history, amazing food scene, and the best part - everything is affordable. The public transport is efficient, and there's always something happening. Museums, parties, markets - this city never sleeps. Perfect for young people!",
    budgetTips:
      "Shop at Lidl and Aldi for groceries (save 40% compared to other stores). Get a monthly transport pass for €86 - totally worth it. Many museums are free on certain days. For eating out, Turkish food is delicious and cheap!",
    wouldRecommend: true,
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616c96f40b3?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: "testimonial_2",
    studentName: "Andreas Georgiou",
    homeUniversity: "Cyprus University of Technology",
    hostUniversity: "Universitat Politècnica de Catalunya",
    city: "Barcelona",
    country: "Spain",
    semester: "Spring",
    year: 2023,
    accommodationType: "Shared Apartment",
    monthlyRent: 480,
    rating: 4,
    accommodationReview:
      "Shared a 3-bedroom apartment with two Spanish students near Sagrada Familia. The flat was a bit old but charming, with a small balcony. My roommates were amazing and helped me improve my Spanish. Finding accommodation was stressful, but totally worth it in the end.",
    cityReview:
      "Barcelona is paradise! Beach, mountains, incredible architecture, and the food... don't get me started on the tapas! The nightlife is legendary - clubs open until 6 AM. Weather is perfect year-round. Only downside: very touristy in summer.",
    budgetTips:
      "Avoid restaurants near touristy areas - they're overpriced. Go to local markets like Boquería for fresh produce. Get a bicycle - it's the best way to explore and much cheaper than metro. Happy hour is from 6-8 PM in most bars!",
    wouldRecommend: true,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: "testimonial_3",
    studentName: "Elena Papadopoulou",
    homeUniversity: "University of Nicosia",
    hostUniversity: "University of Amsterdam",
    city: "Amsterdam",
    country: "Netherlands",
    semester: "Full Year",
    year: 2022,
    accommodationType: "University Dorms",
    monthlyRent: 620,
    rating: 4,
    accommodationReview:
      "University housing in Zuid district. Small but efficient room with shared kitchen and bathroom. Great community feeling - organized movie nights and dinners. A bit expensive but everything included (utilities, internet). Staff was very helpful with any issues.",
    cityReview:
      "Amsterdam is incredibly international and bike-friendly! Everyone speaks perfect English, making integration easy. The canal system is beautiful, and there are amazing museums. Coffee shops everywhere (and not just for coffee 😉). Can be quite rainy, so invest in good rain gear!",
    budgetTips:
      "Buy a second-hand bike immediately - it's essential! Albert Heijn has good student discounts. Avoid eating out every day - it's very expensive. Visit free museums on certain days. Stroopwafels from street vendors are cheaper than in tourist shops!",
    wouldRecommend: true,
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: "testimonial_4",
    studentName: "Christos Michaelidis",
    homeUniversity: "Frederick University",
    hostUniversity: "Vienna University of Technology",
    city: "Vienna",
    country: "Austria",
    semester: "Fall",
    year: 2023,
    accommodationType: "Private Studio",
    monthlyRent: 450,
    rating: 5,
    accommodationReview:
      "Found a lovely studio apartment in the 3rd district through WG-Gesucht. Fully furnished with a kitchenette and small bathroom. The landlord was super nice and spoke English. Close to university and city center. A bit pricey but totally worth the privacy and comfort.",
    cityReview:
      "Vienna is like living in a fairy tale! The architecture is stunning, coffee culture is amazing (try Sachertorte!), and classical music is everywhere. Very safe city, excellent public transport. Locals can be a bit formal at first but are very helpful once you get to know them.",
    budgetTips:
      "Student meals at university are only €4 and quite good! Many events are free or heavily discounted with student ID. Wiener Linien student pass is €150/semester - great deal. Shop at Hofer (Aldi) for cheap groceries. Christmas markets in winter are magical and free to visit!",
    wouldRecommend: true,
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: "testimonial_5",
    studentName: "Sofia Antoniou",
    homeUniversity: "UCLan Cyprus",
    hostUniversity: "Charles University",
    city: "Prague",
    country: "Czech Republic",
    semester: "Spring",
    year: 2023,
    accommodationType: "Student Dormitory",
    monthlyRent: 280,
    rating: 4,
    accommodationReview:
      "Stayed at Kajetánka dormitory - basic but clean rooms with shared facilities. Great location near the city center. Met so many international students! The common room was always busy with people from different countries. Some rooms can be noisy, but overall great experience.",
    cityReview:
      "Prague is absolutely magical! The old town looks like something from a movie, and beer is cheaper than water (literally!). The nightlife is amazing, and the people are very friendly. Public transport is efficient and cheap. Perfect for students on a budget who want European charm.",
    budgetTips:
      "Czech beer is incredibly cheap - under €1 in some places! Eat at local pubs (hospoda) for authentic and affordable meals. Tesco and Kaufland are best for groceries. Many museums have student discounts. Walking tours are free (tip-based) and worth doing!",
    wouldRecommend: true,
    avatar:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: "testimonial_6",
    studentName: "Dimitris Loizou",
    homeUniversity: "Cyprus University of Technology",
    hostUniversity: "Royal Institute of Technology",
    city: "Stockholm",
    country: "Sweden",
    semester: "Fall",
    year: 2022,
    accommodationType: "Shared Apartment",
    monthlyRent: 580,
    rating: 3,
    accommodationReview:
      "Shared apartment in Södermalm with two Swedish engineering students. Modern apartment with great views, but quite expensive. My roommates were nice but a bit reserved initially. The area is trendy with lots of cafes and vintage shops. Housing market is very competitive!",
    cityReview:
      "Stockholm is breathtakingly beautiful, especially in autumn! The archipelago is incredible - take boat trips on weekends. Very tech-forward city with amazing startups. People are friendly but reserved. Dark winters can be challenging, but the summer midnight sun makes up for it!",
    budgetTips:
      "Everything is expensive, so budget carefully! ICA and Coop have some affordable options. Student discounts are available everywhere - always ask! Cook at home to save money. Free museums on certain days. Nature is free and stunning - hiking, swimming in summer!",
    wouldRecommend: true,
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: "testimonial_7",
    studentName: "Antonia Stavrou",
    homeUniversity: "European University Cyprus",
    hostUniversity: "Université de Toulouse",
    city: "Toulouse",
    country: "France",
    semester: "Spring",
    year: 2023,
    accommodationType: "University Residence",
    monthlyRent: 350,
    rating: 4,
    accommodationReview:
      "Lived in Cité Universitaire - very French experience! Small room but had everything needed. Shared kitchen was always busy with international students cooking together. Staff only spoke French, which forced me to practice! Good location with direct metro to university.",
    cityReview:
      "Toulouse is the perfect size - not too big, not too small! The pink brick buildings are gorgeous, especially at sunset. Great student atmosphere with lots of young people. Food is incredible - so many local specialties to try. Climate is perfect - warm but not too hot.",
    budgetTips:
      "CROUS restaurants are super cheap for students - €3.30 for full meals! Carrefour and Leclerc for affordable groceries. Many cultural events are free or discounted for students. Bike sharing system Vélô is great for getting around. Local markets have fresh, cheap produce!",
    wouldRecommend: true,
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: "testimonial_8",
    studentName: "Nikos Petridis",
    homeUniversity: "University of Cyprus",
    hostUniversity: "Technological University Dublin",
    city: "Dublin",
    country: "Ireland",
    semester: "Fall",
    year: 2023,
    accommodationType: "Private Apartment",
    monthlyRent: 650,
    rating: 3,
    accommodationReview:
      "Rented a small apartment in Rathmines through Daft.ie. Nice area, close to city center but quite expensive. The apartment was modern but tiny - typical Dublin! Landlord was professional and responsive. Housing market is very competitive, so start searching early!",
    cityReview:
      "Dublin is fantastic for English speakers! The people are incredibly friendly and welcoming - typical Irish hospitality. Temple Bar area is touristy but fun. Phoenix Park is huge and beautiful. Lots of tech companies, so great for networking. Rain is frequent but manageable.",
    budgetTips:
      "Rent is the biggest expense - try to share to reduce costs. Tesco and Dunnes for groceries. Student discounts widely available. Avoid Temple Bar for drinks - very expensive! Local pubs in residential areas are much cheaper. Bus pass for students is great value!",
    wouldRecommend: true,
    avatar:
      "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=100&h=100&fit=crop&crop=face",
  },
];

// Helper functions
export const getDestinationsByUniversity = (
  universityName: string,
): Destination[] => {
  return ERASMUS_DESTINATIONS.filter((dest) =>
    dest.partnerUniversities.includes(universityName),
  );
};

export const getTestimonialsByDestination = (
  city: string,
): StudentTestimonial[] => {
  return STUDENT_TESTIMONIALS.filter(
    (testimonial) => testimonial.city === city,
  );
};

export const getTestimonialsByUniversity = (
  universityName: string,
): StudentTestimonial[] => {
  return STUDENT_TESTIMONIALS.filter(
    (testimonial) =>
      testimonial.homeUniversity === universityName ||
      testimonial.hostUniversity.includes(universityName),
  );
};

export const getAllDestinations = (): Destination[] => ERASMUS_DESTINATIONS;

export const getAllTestimonials = (): StudentTestimonial[] =>
  STUDENT_TESTIMONIALS;
