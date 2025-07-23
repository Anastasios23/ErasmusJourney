import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Populating sample form data...");

  // Create sample users first
  const users = await createSampleUsers();
  console.log(`✅ Created ${users.length} sample users`);

  // Create sample stories
  const stories = await createSampleStories(users);
  console.log(`✅ Created ${stories.length} sample stories`);

  // Create sample accommodation experiences
  const accommodations = await createSampleAccommodations(users);
  console.log(`✅ Created ${accommodations.length} sample accommodations`);

  // Create sample course matching submissions
  const courseMatching = await createSampleCourseMatching(users);
  console.log(`✅ Created ${courseMatching.length} sample course matching forms`);

  // Create sample mentorship profiles
  const mentorship = await createSampleMentorship(users);
  console.log(`✅ Created ${mentorship.length} sample mentorship profiles`);

  // Create sample living expenses data
  const livingExpenses = await createSampleLivingExpenses(users);
  console.log(`✅ Created ${livingExpenses.length} sample living expenses forms`);

  console.log("\n🎉 Sample data population completed!");
}

async function createSampleUsers() {
  const userData = [
    {
      email: "alexandra.petrou@ucy.ac.cy",
      firstName: "Alexandra",
      lastName: "Petrou",
      password: "$2a$10$hash", // placeholder hash
      role: "USER",
      studentId: "UCY2019001",
      nationality: "Cyprus",
      homeCity: "Nicosia",
      homeCountry: "Cyprus",
    },
    {
      email: "emma.rodriguez@cut.ac.cy",
      firstName: "Emma",
      lastName: "Rodriguez",
      password: "$2a$10$hash",
      role: "USER",
      studentId: "CUT2020045",
      nationality: "Spain",
      homeCity: "Limassol",
      homeCountry: "Cyprus",
    },
    {
      email: "andreas.mueller@frederick.ac.cy",
      firstName: "Andreas",
      lastName: "Mueller",
      password: "$2a$10$hash",
      role: "USER",
      studentId: "FRE2019023",
      nationality: "Germany",
      homeCity: "Nicosia",
      homeCountry: "Cyprus",
    },
    {
      email: "sofia.komninos@euc.ac.cy",
      firstName: "Sofia",
      lastName: "Komninos",
      password: "$2a$10$hash",
      role: "USER",
      studentId: "EUC2020012",
      nationality: "Cyprus",
      homeCity: "Larnaca",
      homeCountry: "Cyprus",
    },
    {
      email: "marc.dubois@unic.ac.cy",
      firstName: "Marc",
      lastName: "Dubois",
      password: "$2a$10$hash",
      role: "USER",
      studentId: "UNIC2019067",
      nationality: "France",
      homeCity: "Nicosia",
      homeCountry: "Cyprus",
    },
    {
      email: "isabella.schmidt@ucy.ac.cy",
      firstName: "Isabella",
      lastName: "Schmidt",
      password: "$2a$10$hash",
      role: "USER",
      studentId: "UCY2020034",
      nationality: "Austria",
      homeCity: "Paphos",
      homeCountry: "Cyprus",
    },
  ];

  const users = [];
  for (const user of userData) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      });
      
      if (!existingUser) {
        const created = await prisma.user.create({ data: user });
        users.push(created);
      } else {
        users.push(existingUser);
      }
    } catch (error) {
      console.log(`User ${user.email} might already exist, skipping...`);
    }
  }
  
  return users;
}

async function createSampleStories(users: any[]) {
  const storyData = [
    {
      userId: users[0].id,
      type: "STORY",
      title: "My Incredible Semester in Prague - Czech Republic",
      status: "PUBLISHED",
      data: {
        firstName: "Alexandra",
        lastName: "Petrou",
        email: "alexandra.petrou@ucy.ac.cy",
        universityInCyprus: "University of Cyprus",
        studyProgram: "Business Administration",
        hostUniversity: "Charles University",
        hostCity: "Prague",
        hostCountry: "Czech Republic",
        exchangePeriod: "Fall 2023",
        storyTitle: "My Incredible Semester in Prague - Czech Republic",
        overallDescription: "My semester in Prague was absolutely transformative! The city's rich history, stunning architecture, and vibrant student life created the perfect environment for both academic growth and personal discovery. From wandering through the medieval streets of Old Town to studying in libraries that felt like palaces, every day brought new adventures. The local students were incredibly welcoming, and I made lifelong friendships while exploring Czech culture, trying traditional food like goulash and trdelník, and traveling to nearby countries on weekends. This experience broadened my worldview and gave me confidence I never knew I had.",
        academicExperience: "Charles University exceeded all my expectations. The professors were knowledgeable and encouraged international perspectives in discussions. My favorite course was 'European Business Strategy' which gave me insights I couldn't get back home. The university's libraries and facilities were world-class, and the international student office provided excellent support throughout my stay.",
        culturalExperience: "Prague's culture is a beautiful blend of medieval charm and modern innovation. I loved attending classical concerts at historic venues, exploring art galleries, and participating in traditional festivals. The Christmas markets were magical! Learning basic Czech helped me connect with locals, who shared fascinating stories about their city's history.",
        challenges: "The main challenge was the language barrier initially, but people were patient and helpful. The weather was much colder than Cyprus, so I had to adapt my wardrobe. Sometimes I felt homesick, especially during holidays, but the international student community became my second family.",
        personalGrowth: "This experience taught me independence, adaptability, and openness to new perspectives. I became more confident in navigating unfamiliar situations and learned to appreciate different ways of life. I also improved my English and picked up some Czech phrases!",
        recommendations: "Don't hesitate to try local food, even if it seems unusual! Join student organizations and clubs - it's the best way to make friends. Travel as much as possible on weekends; Europe is so accessible from Prague. And definitely learn some basic Czech phrases; locals really appreciate the effort.",
        wouldRecommend: "Absolutely",
        overallRating: 5,
        socialLifeRating: 5,
        academicRating: 4,
        accommodationRating: 4,
        photos: [
          {
            url: "https://images.unsplash.com/photo-1541849546-216549ae216d?w=600&h=400&fit=crop",
            caption: "Prague Castle at sunset - breathtaking views!"
          },
          {
            url: "https://images.unsplash.com/photo-1513805959324-96eb66ca8bd8?w=600&h=400&fit=crop",
            caption: "Charles Bridge during my morning runs"
          }
        ],
        tags: ["prague", "czech-republic", "business", "culture", "travel"],
        funFact: "I learned to cook traditional Czech svíčková and now make it for my family back in Cyprus!",
        bestMemory: "Watching the sunrise from Prague Castle with my international friends on New Year's Day - it felt like the beginning of a new chapter in my life."
      }
    },
    {
      userId: users[1].id,
      type: "STORY",
      title: "Architecture and Friendships in Barcelona",
      status: "PUBLISHED",
      data: {
        firstName: "Emma",
        lastName: "Rodriguez",
        email: "emma.rodriguez@cut.ac.cy",
        universityInCyprus: "Cyprus University of Technology",
        studyProgram: "Architecture",
        hostUniversity: "Universitat Politècnica de Catalunya",
        hostCity: "Barcelona",
        hostCountry: "Spain",
        exchangePeriod: "Spring 2024",
        storyTitle: "Architecture and Friendships in Barcelona",
        overallDescription: "Barcelona was the perfect city for an architecture student! Studying Gaudí's masterpieces in person while living in this vibrant Mediterranean city was a dream come true. The combination of incredible architecture, delicious food, beautiful beaches, and welcoming people made this the best experience of my university years. I improved my Spanish, made international friends, and gained a new perspective on sustainable urban design that will influence my career forever.",
        academicExperience: "The architecture program at UPC was exceptional. We had site visits to iconic buildings like Casa Batlló and La Sagrada Família. The professors were practicing architects who shared real-world insights. Working on a sustainable housing project for Barcelona's neighborhoods was challenging but incredibly rewarding.",
        culturalExperience: "Living in Barcelona means embracing the Mediterranean lifestyle - late dinners, afternoon siestas, and socializing until early morning. I fell in love with tapas culture, flamenco dancing, and the passionate way Catalans discuss their city's future. The art scene is incredible - from Picasso Museum to street art in El Raval.",
        challenges: "The fast-paced Catalan dialect was challenging at first, and the different academic schedule took some adjustment. Finding affordable housing near the university was competitive, but the student housing office helped me find a great shared apartment with local students.",
        personalGrowth: "This experience made me more creative and confident in expressing my ideas. Living with Spanish flatmates improved my language skills dramatically and taught me about Spanish family values and traditions. I also became more environmentally conscious, inspired by Barcelona's smart city initiatives.",
        recommendations: "Join the architecture student association - they organize amazing field trips! Try to live with local students rather than just internationals to really improve your Spanish. Explore beyond the touristy areas; neighborhoods like Gràcia and Poblenou have amazing hidden gems.",
        wouldRecommend: "Absolutely",
        overallRating: 5,
        socialLifeRating: 5,
        academicRating: 5,
        accommodationRating: 3,
        photos: [
          {
            url: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600&h=400&fit=crop",
            caption: "Studying at Park Güell - my outdoor office!"
          },
          {
            url: "https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?w=600&h=400&fit=crop",
            caption: "La Sagrada Família - architectural inspiration daily"
          }
        ],
        tags: ["barcelona", "spain", "architecture", "gaudi", "mediterranean"],
        funFact: "I sketched over 200 architectural details around the city and created my own Barcelona architecture guidebook!",
        bestMemory: "Watching the sunset from Park Güell with my international friends while discussing our dream architecture projects."
      }
    },
    {
      userId: users[2].id,
      type: "STORY",
      title: "Engineering Excellence in Berlin",
      status: "PUBLISHED",
      data: {
        firstName: "Andreas",
        lastName: "Mueller",
        email: "andreas.mueller@frederick.ac.cy",
        universityInCyprus: "Frederick University",
        studyProgram: "Mechanical Engineering",
        hostUniversity: "Technical University of Berlin",
        hostCity: "Berlin",
        hostCountry: "Germany",
        exchangePeriod: "Fall 2023",
        storyTitle: "Engineering Excellence in Berlin",
        overallDescription: "Berlin offered me the perfect combination of cutting-edge technology, rich history, and incredible nightlife. As an engineering student, I was amazed by Germany's industrial heritage and innovation. The city's startup ecosystem, world-class universities, and multicultural environment created endless opportunities for learning and networking. From visiting Siemens factories to partying in underground clubs, Berlin showed me that work-life balance is essential for creativity and innovation.",
        academicExperience: "TU Berlin's engineering program is world-renowned for a reason. The labs are equipped with the latest technology, and professors are leaders in their fields. I particularly enjoyed the 'Industry 4.0' course where we worked with real automotive companies. The emphasis on sustainability and green technology aligns perfectly with my career goals.",
        culturalExperience: "Berlin's history is fascinating and tragic, but the city has rebuilt itself as a symbol of freedom and creativity. I visited historical sites like the Brandenburg Gate and Berlin Wall, but also experienced the vibrant art scene in neighborhoods like Kreuzberg and Friedrichshain. The city never sleeps, and there's always something happening.",
        challenges: "German bureaucracy can be overwhelming for international students - so many forms and procedures! The winter was harsh and dark, which affected my mood initially. Also, making German friends took patience since they can seem reserved at first, but once you break the ice, they're incredibly loyal and fun.",
        personalGrowth: "This experience taught me the importance of precision and methodology in engineering - very German traits that I now apply to my work. I also learned to appreciate different approaches to problem-solving and became more environmentally conscious through exposure to Germany's sustainability initiatives.",
        recommendations: "Learn German before you go - it makes a huge difference in connecting with locals and understanding the culture. Take advantage of the excellent public transportation to explore other German cities. Join student organizations and sports clubs to meet people. And don't miss the Christmas markets in winter!",
        wouldRecommend: "Definitely",
        overallRating: 4,
        socialLifeRating: 4,
        academicRating: 5,
        accommodationRating: 4,
        photos: [
          {
            url: "https://images.unsplash.com/photo-1587330979470-3010b06cccd4?w=600&h=400&fit=crop",
            caption: "Brandenburg Gate - symbol of German reunification"
          },
          {
            url: "https://images.unsplash.com/photo-1559564484-0b4f8d90fdaa?w=600&h=400&fit=crop",
            caption: "TU Berlin campus - where innovation happens"
          }
        ],
        tags: ["berlin", "germany", "engineering", "technology", "history"],
        funFact: "I learned to brew traditional German beer in a student club and now I'm planning to start a microbrewery back in Cyprus!",
        bestMemory: "Presenting my sustainable energy project to industry professionals at TU Berlin's innovation showcase and receiving positive feedback."
      }
    },
    {
      userId: users[3].id,
      type: "STORY",
      title: "Psychology Studies in Vienna - A Cultural Journey",
      status: "PUBLISHED",
      data: {
        firstName: "Sofia",
        lastName: "Komninos",
        email: "sofia.komninos@euc.ac.cy",
        universityInCyprus: "European University Cyprus",
        studyProgram: "Psychology",
        hostUniversity: "University of Vienna",
        hostCity: "Vienna",
        hostCountry: "Austria",
        exchangePeriod: "Spring 2024",
        storyTitle: "Psychology Studies in Vienna - A Cultural Journey",
        overallDescription: "Vienna, the city of Freud, was the perfect place to study psychology! The combination of imperial architecture, rich intellectual history, and world-class coffee culture created an inspiring environment for deep thinking and learning. I gained new perspectives on human behavior while immersing myself in Austrian culture, from opera performances to philosophical discussions in traditional coffeehouses. This experience broadened my understanding of European psychology traditions and gave me lifelong memories.",
        academicExperience: "The University of Vienna's psychology department has an incredible reputation. Studying where Freud once walked was surreal! The professors emphasized both theoretical knowledge and practical applications. My favorite course was 'Cross-Cultural Psychology' which perfectly complemented my international experience. The research opportunities were excellent.",
        culturalExperience: "Vienna's cultural scene is unmatched. I attended operas at the State Opera House, visited art museums like the Belvedere, and spent countless hours in traditional coffeehouses reading and writing. The Viennese take their cultural heritage seriously, and I learned to appreciate classical music, art, and intellectual discourse.",
        challenges: "The formal Austrian communication style took some getting used to after the more relaxed Cypriot approach. The cost of living was higher than expected, especially dining out. Winter was long and dark, but the beautiful Christmas markets and cozy coffeehouses made it bearable.",
        personalGrowth: "This experience deepened my analytical thinking and cultural sensitivity - essential skills for a psychologist. I became more independent and confident in academic discussions. Living in Vienna also taught me to slow down and appreciate life's finer details, like the art of coffee drinking and classical music.",
        recommendations: "Take advantage of the student discounts for cultural events - Vienna offers so much! Learn some German basics; Austrians appreciate the effort. Explore the coffeehouse culture; it's where you'll have the best conversations. Don't miss day trips to Salzburg and the Danube Valley.",
        wouldRecommend: "Absolutely",
        overallRating: 5,
        socialLifeRating: 4,
        academicRating: 5,
        accommodationRating: 4,
        photos: [
          {
            url: "https://images.unsplash.com/photo-1539650116574-75c0c6d73a10?w=600&h=400&fit=crop",
            caption: "Schönbrunn Palace - weekend study sessions in the gardens"
          },
          {
            url: "https://images.unsplash.com/photo-1548634403-6d4f3b216529?w=600&h=400&fit=crop",
            caption: "Traditional Viennese coffeehouse - my second office"
          }
        ],
        tags: ["vienna", "austria", "psychology", "culture", "freud"],
        funFact: "I wrote my semester thesis in the same coffeehouse where it's rumored Freud used to meet with his colleagues!",
        bestMemory: "Attending a psychology conference at the University of Vienna and presenting my research on cultural adaptation to an international audience."
      }
    }
  ];

  const stories = [];
  for (const story of storyData) {
    try {
      const created = await prisma.formSubmission.create({ data: story });
      stories.push(created);
    } catch (error) {
      console.log(`Error creating story: ${story.title}`);
    }
  }
  
  return stories;
}

async function createSampleAccommodations(users: any[]) {
  const accommodationData = [
    {
      userId: users[0].id,
      type: "ACCOMMODATION",
      title: "Student Dormitory Experience in Prague",
      status: "PUBLISHED",
      data: {
        firstName: "Alexandra",
        lastName: "Petrou",
        email: "alexandra.petrou@ucy.ac.cy",
        universityInCyprus: "University of Cyprus",
        hostCity: "Prague",
        hostCountry: "Czech Republic",
        hostUniversity: "Charles University",
        accommodationType: "Student Dormitory",
        accommodationName: "Kajetánka Dormitory",
        accommodationAddress: "Újezd 450/40, Prague 1",
        neighborhood: "Lesser Town (Malá Strana)",
        monthlyRent: 320,
        currency: "EUR",
        utilitiesIncluded: true,
        roomType: "Single room with shared bathroom",
        amenities: ["WiFi", "Laundry", "Common kitchen", "Study rooms", "24/7 security"],
        accommodationRating: 4,
        overallRating: 4,
        pros: [
          "Close to city center and university",
          "International student community",
          "Affordable price for the location",
          "Good security and maintenance"
        ],
        cons: [
          "Shared bathrooms can be busy",
          "Thin walls - can be noisy",
          "No private kitchen",
          "Limited parking"
        ],
        tips: [
          "Book early - popular dormitory fills up quickly",
          "Bring your own bedding and towels",
          "Join dormitory social events to make friends",
          "Keep common areas clean to maintain good relationships"
        ],
        transportationAccess: "Excellent - tram stop right outside, 15 minutes to city center",
        safetyRating: 5,
        wouldRecommend: true,
        additionalNotes: "Perfect for students who want to be in the heart of Prague with an international community. The location more than makes up for the basic facilities.",
        photos: [
          {
            url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&h=400&fit=crop",
            caption: "My cozy dorm room with Prague Castle views"
          }
        ]
      }
    },
    {
      userId: users[1].id,
      type: "ACCOMMODATION",
      title: "Shared Apartment Living in Barcelona",
      status: "PUBLISHED",
      data: {
        firstName: "Emma",
        lastName: "Rodriguez",
        email: "emma.rodriguez@cut.ac.cy",
        universityInCyprus: "Cyprus University of Technology",
        hostCity: "Barcelona",
        hostCountry: "Spain",
        hostUniversity: "Universitat Politècnica de Catalunya",
        accommodationType: "Shared Apartment",
        accommodationName: "Gracia Flatshare",
        accommodationAddress: "Carrer de Verdi, Barcelona",
        neighborhood: "Gràcia",
        monthlyRent: 480,
        currency: "EUR",
        utilitiesIncluded: false,
        roomType: "Private room in 4-bedroom apartment",
        amenities: ["WiFi", "Washing machine", "Full kitchen", "Balcony", "Air conditioning"],
        accommodationRating: 3,
        overallRating: 4,
        pros: [
          "Vibrant neighborhood with great nightlife",
          "Local Spanish flatmates helped with language",
          "Close to Park Güell and university",
          "Authentic Barcelona living experience"
        ],
        cons: [
          "More expensive than expected",
          "Utilities not included added extra cost",
          "Apartment was older with some maintenance issues",
          "Competitive market - took time to find"
        ],
        tips: [
          "Use Spanish housing websites like Idealista",
          "Visit apartments in person before committing",
          "Learn basic Spanish phrases for viewings",
          "Have all documents ready (university letter, bank statements)"
        ],
        transportationAccess: "Good - metro station 10 minutes walk, bus connections to university",
        safetyRating: 4,
        wouldRecommend: true,
        additionalNotes: "Living with locals was the best decision for improving Spanish and understanding Catalan culture. The neighborhood has amazing local bars and restaurants.",
        photos: [
          {
            url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop",
            caption: "Our apartment balcony overlooking Gràcia streets"
          }
        ]
      }
    },
    {
      userId: users[2].id,
      type: "ACCOMMODATION",
      title: "Student Housing Complex in Berlin",
      status: "PUBLISHED",
      data: {
        firstName: "Andreas",
        lastName: "Mueller",
        email: "andreas.mueller@frederick.ac.cy",
        universityInCyprus: "Frederick University",
        hostCity: "Berlin",
        hostCountry: "Germany",
        hostUniversity: "Technical University of Berlin",
        accommodationType: "Student Housing Complex",
        accommodationName: "Hans-Böckler-Haus",
        accommodationAddress: "Hardenbergstraße, Berlin",
        neighborhood: "Charlottenburg",
        monthlyRent: 420,
        currency: "EUR",
        utilitiesIncluded: true,
        roomType: "Studio apartment",
        amenities: ["WiFi", "Gym", "Study rooms", "Cafeteria", "Bike storage", "Laundry"],
        accommodationRating: 4,
        overallRating: 4,
        pros: [
          "Modern facilities and well-maintained",
          "Close to TU Berlin campus",
          "Great community atmosphere",
          "All utilities included in rent",
          "Good value for money in Berlin"
        ],
        cons: [
          "Can feel institutional rather than homey",
          "Strict quiet hours enforcement",
          "Limited guest policy",
          "Waiting list for popular room types"
        ],
        tips: [
          "Apply early through Studentenwerk Berlin",
          "Join resident activities to meet people",
          "Respect quiet hours - Germans take this seriously",
          "Use the gym and study rooms - great facilities"
        ],
        transportationAccess: "Excellent - U-Bahn station nearby, direct connection to university",
        safetyRating: 5,
        wouldRecommend: true,
        additionalNotes: "Perfect for students who want modern amenities and a structured environment. The international student community here is very active.",
        photos: [
          {
            url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop",
            caption: "Modern student housing complex with all amenities"
          }
        ]
      }
    }
  ];

  const accommodations = [];
  for (const accommodation of accommodationData) {
    try {
      const created = await prisma.formSubmission.create({ data: accommodation });
      accommodations.push(created);
    } catch (error) {
      console.log(`Error creating accommodation: ${accommodation.title}`);
    }
  }
  
  return accommodations;
}

async function createSampleCourseMatching(users: any[]) {
  const courseData = [
    {
      userId: users[0].id,
      type: "COURSE_MATCHING",
      title: "Business Courses Equivalency - Prague",
      status: "PUBLISHED",
      data: {
        firstName: "Alexandra",
        lastName: "Petrou",
        email: "alexandra.petrou@ucy.ac.cy",
        universityInCyprus: "University of Cyprus",
        studyProgram: "Business Administration",
        hostUniversity: "Charles University",
        hostCity: "Prague",
        hostCountry: "Czech Republic",
        academicYear: "2023-2024",
        semester: "Fall",
        courseMatches: [
          {
            homeCourse: "Strategic Management",
            homeCourseCode: "BUSI350",
            homeCredits: 6,
            hostCourse: "European Business Strategy",
            hostCourseCode: "JEB055",
            hostCredits: 6,
            difficulty: "Challenging",
            workload: "Heavy",
            recommendation: "Excellent course with real case studies from European companies. Professor brings industry experience.",
            grade: "A-"
          },
          {
            homeCourse: "International Marketing",
            homeCourseCode: "MARK320",
            homeCredits: 6,
            hostCourse: "Global Marketing in Digital Age",
            hostCourseCode: "JEB091",
            hostCredits: 5,
            difficulty: "Moderate",
            workload: "Medium",
            recommendation: "Great focus on digital marketing trends. Group project with international students was valuable.",
            grade: "B+"
          },
          {
            homeCourse: "Financial Analysis",
            homeCourseCode: "FINA310",
            homeCredits: 6,
            hostCourse: "Corporate Finance in Central Europe",
            hostCourseCode: "JEB044",
            hostCredits: 6,
            difficulty: "Challenging",
            workload: "Heavy",
            recommendation: "Intense but rewarding. Focused on Eastern European markets which was unique perspective.",
            grade: "B"
          }
        ],
        overallAcademicExperience: "The academic level at Charles University was excellent. Professors encouraged critical thinking and international perspectives. The business program has strong connections with local and international companies.",
        languageOfInstruction: "English",
        languageRequirements: "IELTS 6.5 or equivalent",
        studyTips: [
          "Participate actively in class discussions",
          "Form study groups with local students",
          "Attend guest lectures from industry professionals",
          "Use the excellent library resources"
        ],
        examFormat: "Mix of written exams, group projects, and presentations",
        gradingSystem: "Czech grading scale (1-4, where 1 is excellent)",
        professorQuality: 4,
        courseRelevance: 5,
        practicalApplication: 4,
        overallSatisfaction: 5
      }
    },
    {
      userId: users[2].id,
      type: "COURSE_MATCHING",
      title: "Engineering Curriculum - TU Berlin",
      status: "PUBLISHED",
      data: {
        firstName: "Andreas",
        lastName: "Mueller",
        email: "andreas.mueller@frederick.ac.cy",
        universityInCyprus: "Frederick University",
        studyProgram: "Mechanical Engineering",
        hostUniversity: "Technical University of Berlin",
        hostCity: "Berlin",
        hostCountry: "Germany",
        academicYear: "2023-2024",
        semester: "Fall",
        courseMatches: [
          {
            homeCourse: "Advanced Manufacturing",
            homeCourseCode: "MECH450",
            homeCredits: 6,
            hostCourse: "Industry 4.0 and Smart Manufacturing",
            hostCourseCode: "MB-104",
            hostCredits: 6,
            difficulty: "Very Challenging",
            workload: "Very Heavy",
            recommendation: "Cutting-edge course with latest technology. Lab work with industrial robots. Essential for modern engineers.",
            grade: "1.7"
          },
          {
            homeCourse: "Sustainable Engineering",
            homeCourseCode: "MECH380",
            homeCredits: 6,
            hostCourse: "Green Technology and Environmental Engineering",
            hostCourseCode: "MB-078",
            hostCredits: 5,
            difficulty: "Challenging",
            workload: "Heavy",
            recommendation: "Germany leads in green technology. Excellent insights into renewable energy systems and sustainable design.",
            grade: "1.3"
          }
        ],
        overallAcademicExperience: "TU Berlin is world-class for engineering. The combination of theoretical depth and practical application is impressive. Strong industry connections provide real-world context.",
        languageOfInstruction: "English (some courses in German)",
        languageRequirements: "TOEFL 90+ or IELTS 6.5+",
        studyTips: [
          "German engineering precision is real - be thorough in all work",
          "Take advantage of industry partnerships and company visits",
          "Join student engineering clubs for networking",
          "Learn basic German for better integration"
        ],
        examFormat: "Written exams, practical lab reports, and design projects",
        gradingSystem: "German scale (1.0-4.0, where 1.0 is excellent)",
        professorQuality: 5,
        courseRelevance: 5,
        practicalApplication: 5,
        overallSatisfaction: 5
      }
    }
  ];

  const courses = [];
  for (const course of courseData) {
    try {
      const created = await prisma.formSubmission.create({ data: course });
      courses.push(created);
    } catch (error) {
      console.log(`Error creating course matching: ${course.title}`);
    }
  }
  
  return courses;
}

async function createSampleMentorship(users: any[]) {
  const mentorshipData = [
    {
      userId: users[0].id,
      type: "MENTORSHIP",
      title: "Alexandra Petrou - Business Mentor",
      status: "PUBLISHED",
      data: {
        firstName: "Alexandra",
        lastName: "Petrou",
        email: "alexandra.petrou@ucy.ac.cy",
        universityInCyprus: "University of Cyprus",
        studyProgram: "Business Administration",
        hostUniversity: "Charles University",
        hostCity: "Prague",
        hostCountry: "Czech Republic",
        exchangePeriod: "Fall 2023",
        specializations: ["Business Strategy", "International Marketing", "Study Abroad Preparation"],
        languagesSpoken: ["Greek", "English", "Basic Czech"],
        helpTopics: [
          "Academic preparation for business studies",
          "Cultural adaptation in Central Europe",
          "Finding accommodation in Prague",
          "Networking with international students",
          "Career opportunities in European business"
        ],
        availabilityLevel: "High",
        responseTime: "within-day",
        preferredContactMethod: "Email and video calls",
        mentorshipExperience: "Helped 5 students prepare for their exchange to Prague",
        additionalAdvice: "Prague is an incredible city for business students! The combination of historical charm and modern business opportunities creates unique learning experiences. Don't hesitate to reach out - I love helping fellow Cypriot students make the most of their exchange!",
        funFact: "I started a small consulting business helping Czech companies expand to Mediterranean markets during my exchange!",
        wantToHelp: "yes",
        publicProfile: "yes",
        allowPublicContact: "yes"
      }
    },
    {
      userId: users[1].id,
      type: "MENTORSHIP",
      title: "Emma Rodriguez - Architecture Mentor",
      status: "PUBLISHED",
      data: {
        firstName: "Emma",
        lastName: "Rodriguez",
        email: "emma.rodriguez@cut.ac.cy",
        universityInCyprus: "Cyprus University of Technology",
        studyProgram: "Architecture",
        hostUniversity: "Universitat Politècnica de Catalunya",
        hostCity: "Barcelona",
        hostCountry: "Spain",
        exchangePeriod: "Spring 2024",
        specializations: ["Sustainable Architecture", "Urban Design", "Spanish Culture"],
        languagesSpoken: ["Spanish", "English", "Greek", "Catalan"],
        helpTopics: [
          "Architecture portfolio preparation",
          "Finding housing in Barcelona",
          "Spanish language learning tips",
          "Exploring Catalonian culture",
          "Sustainable design opportunities"
        ],
        availabilityLevel: "Medium",
        responseTime: "within-week",
        preferredContactMethod: "WhatsApp and email",
        mentorshipExperience: "Currently mentoring 3 architecture students planning their exchange",
        additionalAdvice: "Barcelona is paradise for architecture students! Study Gaudí's work in person, explore the modernist buildings, and don't miss the opportunity to work on sustainable urban projects. The city itself is your classroom!",
        funFact: "I created a digital guide to Barcelona's hidden architectural gems that's now used by the university!",
        wantToHelp: "yes",
        publicProfile: "yes",
        allowPublicContact: "yes"
      }
    },
    {
      userId: users[2].id,
      type: "MENTORSHIP",
      title: "Andreas Mueller - Engineering Mentor",
      status: "PUBLISHED",
      data: {
        firstName: "Andreas",
        lastName: "Mueller",
        email: "andreas.mueller@frederick.ac.cy",
        universityInCyprus: "Frederick University",
        studyProgram: "Mechanical Engineering",
        hostUniversity: "Technical University of Berlin",
        hostCity: "Berlin",
        hostCountry: "Germany",
        exchangePeriod: "Fall 2023",
        specializations: ["Industrial Engineering", "German Engineering Culture", "Green Technology"],
        languagesSpoken: ["German", "English", "Greek"],
        helpTopics: [
          "German university application process",
          "Technical German vocabulary",
          "Engineering lab preparation",
          "Industry networking in Germany",
          "Green technology career paths"
        ],
        availabilityLevel: "Medium",
        responseTime: "within-few-days",
        preferredContactMethod: "LinkedIn and email",
        mentorshipExperience: "Mentored 8 engineering students, with 6 successfully completing German exchanges",
        additionalAdvice: "German engineering education is rigorous but incredibly rewarding. Prepare well academically, learn basic German, and embrace the precision-focused culture. The networking opportunities in Germany's industrial sector are unmatched!",
        funFact: "I interned at BMW during my exchange and now work on sustainable automotive projects inspired by German innovation!",
        wantToHelp: "yes",
        publicProfile: "yes",
        allowPublicContact: "yes"
      }
    }
  ];

  const mentors = [];
  for (const mentor of mentorshipData) {
    try {
      const created = await prisma.formSubmission.create({ data: mentor });
      mentors.push(created);
    } catch (error) {
      console.log(`Error creating mentorship: ${mentor.title}`);
    }
  }
  
  return mentors;
}

async function createSampleLivingExpenses(users: any[]) {
  const expenseData = [
    {
      userId: users[0].id,
      type: "LIVING_EXPENSES",
      title: "Living Costs in Prague - Student Budget",
      status: "PUBLISHED",
      data: {
        firstName: "Alexandra",
        lastName: "Petrou",
        email: "alexandra.petrou@ucy.ac.cy",
        hostCity: "Prague",
        hostCountry: "Czech Republic",
        exchangePeriod: "Fall 2023",
        currency: "EUR",
        monthlyBudget: {
          accommodation: 320,
          food: 280,
          transportation: 25,
          entertainment: 150,
          utilities: 0, // included in accommodation
          study_materials: 40,
          shopping: 100,
          travel: 200,
          total: 1115
        },
        budgetTips: [
          "Cook at home to save money - Czech ingredients are affordable",
          "Use student discounts for transportation and entertainment",
          "Shop at local markets for fresh, cheap produce",
          "Take advantage of free museums on certain days",
          "Travel to nearby countries with student rail passes"
        ],
        costComparison: "About 30-40% cheaper than Cyprus for food and entertainment",
        unexpectedExpenses: [
          "Winter clothing - much colder than Cyprus",
          "Currency exchange fees",
          "Tourist activities when family visited"
        ],
        savingTips: [
          "Get Czech bank account to avoid foreign transaction fees",
          "Buy monthly transport pass instead of individual tickets",
          "Join student organizations for free events and activities",
          "Use Erasmus Student Network discounts"
        ],
        overallAffordability: 4,
        budgetAccuracy: "Very accurate - stayed within 5% of planned budget"
      }
    },
    {
      userId: users[1].id,
      type: "LIVING_EXPENSES",
      title: "Barcelona Living Expenses - Mediterranean Lifestyle",
      status: "PUBLISHED",
      data: {
        firstName: "Emma",
        lastName: "Rodriguez",
        email: "emma.rodriguez@cut.ac.cy",
        hostCity: "Barcelona",
        hostCountry: "Spain",
        exchangePeriod: "Spring 2024",
        currency: "EUR",
        monthlyBudget: {
          accommodation: 480,
          food: 350,
          transportation: 40,
          entertainment: 200,
          utilities: 80,
          study_materials: 50,
          shopping: 150,
          travel: 180,
          total: 1530
        },
        budgetTips: [
          "Eat lunch menus (menu del día) for great value",
          "Share Netflix/Spotify accounts with flatmates",
          "Use Bicing bike sharing for short trips",
          "Take advantage of happy hour prices",
          "Beach activities are free entertainment!"
        ],
        costComparison: "Similar to Cyprus but more expensive for accommodation",
        unexpectedExpenses: [
          "Higher utility costs in summer (air conditioning)",
          "Tourist tax when friends visited",
          "More expensive healthy food options"
        ],
        savingTips: [
          "Shop at Mercadona for groceries - good prices",
          "Use student housing office for accommodation search",
          "Take metro instead of taxis",
          "Cook with flatmates to share costs"
        ],
        overallAffordability: 3,
        budgetAccuracy: "Went over budget by 15% - underestimated social expenses"
      }
    }
  ];

  const expenses = [];
  for (const expense of expenseData) {
    try {
      const created = await prisma.formSubmission.create({ data: expense });
      expenses.push(created);
    } catch (error) {
      console.log(`Error creating living expenses: ${expense.title}`);
    }
  }
  
  return expenses;
}

main()
  .catch((e) => {
    console.error("Error in sample data creation:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
