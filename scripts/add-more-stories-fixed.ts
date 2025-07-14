import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const testStories = [
  {
    title: "My Life-Changing Semester in Berlin",
    storyTitle: "My Life-Changing Semester in Berlin",
    overallDescription: `When I decided to apply for an Erasmus exchange, I never imagined how much it would change my perspective on life, learning, and myself. Berlin became more than just a destination; it became a second home that taught me invaluable lessons about resilience, creativity, and the power of cultural diversity.

**The Decision to Go**

Choosing Berlin wasn't random. As an engineering student, I was drawn to Germany's reputation for innovation and precision. But beyond academics, I was curious about the city's rich history and vibrant cultural scene. The application process was competitive, but when I received the acceptance letter, I knew I was about to embark on something extraordinary.

**First Impressions and Culture Shock**

Arriving in Berlin in September, I was immediately struck by the city's contrasts. Modern glass buildings stood next to remnants of the Berlin Wall, and street art covered surfaces everywhere. The cultural shock was real - from the directness of German communication to the different academic expectations.

The first weeks were challenging. Finding accommodation, navigating the bureaucracy, and adjusting to a new academic system while trying to improve my German felt overwhelming. But the international student community at TU Berlin was incredibly welcoming, and I quickly found my footing.

**Academic Excellence at TU Berlin**

The Technische Universität Berlin exceeded all my expectations. The engineering programs were cutting-edge, with access to laboratories and research facilities that were world-class. What impressed me most was the practical approach to learning - theory was always connected to real-world applications.

I particularly enjoyed the course "Sustainable Energy Systems," which included visits to wind farms and solar installations around Brandenburg. The professors were not just academics but industry experts who brought real-world insights into the classroom.

**Exploring German Culture and History**

Living in Berlin means being surrounded by history at every corner. I spent countless weekends exploring museums, from the impressive collections at Museum Island to the moving exhibits at the Jewish Museum. Walking through Brandenburg Gate and along the remains of the Berlin Wall gave me a profound understanding of European history that no textbook could provide.

The food scene was another delightful discovery. Beyond traditional German cuisine, Berlin's international character meant I could find authentic food from around the world. Sunday markets became a weekly ritual, and I learned to appreciate the German coffee culture.

**Building International Friendships**

One of the most valuable aspects of my exchange was the international community I became part of. My student residence housed people from over 15 countries, and we formed a tight-knit group that explored the city together. We organized cultural exchange evenings where everyone shared food and traditions from their home countries.

These friendships extended beyond social activities. Study groups became multicultural learning experiences where different perspectives enriched our understanding of complex engineering problems. I learned as much from my peers as I did from professors.

**Challenges and Personal Growth**

Not everything was perfect. Homesickness hit hard during the winter months when days were short and gray. The academic workload was intense, and balancing studies with exploration required careful time management. There were moments when I questioned whether I was making the most of the opportunity.

But these challenges became catalysts for personal growth. I learned to be more independent, to adapt quickly to new situations, and to find strength in uncertainty. My problem-solving skills improved not just in engineering but in everyday life.

**Travel and Discovery**

Being in the heart of Europe opened up incredible travel opportunities. Weekend trips to Prague, Vienna, and Amsterdam were affordable and easy. Each destination offered new perspectives and experiences that broadened my worldview.

One particularly memorable trip was to the Black Forest region, where I hiked through stunning landscapes and stayed in a traditional German guesthouse. These experiences outside Berlin helped me understand the diversity within Germany itself.

**Language Learning and Communication**

While many courses were in English, I was determined to improve my German. I enrolled in language classes, practiced with local students, and gradually became more confident in daily conversations. By the end of my stay, I could navigate complex discussions about my field of study in German.

This linguistic progress opened doors to deeper cultural understanding and more meaningful connections with local students and professors. It also enhanced my CV significantly for future career opportunities.

**Research Opportunities**

One of the highlights of my exchange was participating in a research project on renewable energy storage systems. Working alongside PhD students and researchers gave me insights into the latest developments in my field and confirmed my interest in pursuing graduate studies.

The research environment at TU Berlin was collaborative and innovative. I learned advanced simulation software and contributed to a paper that was later published in a conference proceedings. This experience was instrumental in shaping my career goals.

**Professional Network Building**

The exchange provided numerous networking opportunities through university events, industry visits, and career fairs. I made connections with professionals in the German engineering sector and learned about career paths I hadn't previously considered.

The international alumni network from my exchange program has proven invaluable. Even years later, I maintain contact with fellow exchange students who have become professionals around the world.

**Reflections on the Experience**

Looking back, my semester in Berlin was transformative in ways I couldn't have anticipated. It wasn't just about academic achievement or cultural exposure; it was about discovering my capability to thrive in challenging and unfamiliar environments.

The experience influenced my career trajectory significantly. I now work for a multinational company where my international experience and cultural sensitivity are valued assets. The problem-solving skills and adaptability I developed in Berlin serve me daily in my professional life.

**Advice for Future Students**

For anyone considering an exchange in Berlin, my advice is to embrace every opportunity. Don't limit yourself to your comfort zone - join clubs, attend events, travel, and engage with the local community. The city has so much to offer beyond academics.

Prepare for bureaucracy and paperwork, but don't let it discourage you. Learn some German before you go - even basic conversational skills will enhance your experience significantly. Most importantly, be open to having your perspectives challenged and changed.

**Lasting Impact**

Berlin taught me that home is not just where you're from, but where you feel you belong. The city and its people welcomed me, challenged me, and helped me grow into a more confident, capable, and culturally aware person.

The friendships I made, the knowledge I gained, and the memories I created will last a lifetime. My exchange semester was not just an academic experience; it was a journey of personal discovery that I wouldn't trade for anything.`,
    firstName: "Elena",
    lastName: "Rodriguez",
    hostCity: "Berlin",
    hostCountry: "Germany",
    hostUniversity: "Technische Universität Berlin",
    universityInCyprus: "University of Cyprus",
    studyProgram: "Mechanical Engineering",
    exchangePeriod: "Fall 2023",
    photos: [
      {
        id: "1",
        image:
          "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&h=600&fit=crop",
        caption: "Brandenburg Gate at sunset",
        location: "Brandenburg Gate, Berlin",
        description: "One of my first tourist photos in Berlin",
      },
      {
        id: "2",
        image:
          "https://images.unsplash.com/photo-1587330979470-3346b2bd2626?w=800&h=600&fit=crop",
        caption: "TU Berlin campus in autumn",
        location: "Technische Universität Berlin",
        description: "The beautiful campus where I spent most of my time",
      },
    ],
    tags: [
      "Berlin",
      "Engineering",
      "Germany",
      "Personal Growth",
      "Research",
      "Culture",
    ],
  },
  {
    title: "Art, Culture, and Culinary Adventures in Florence",
    storyTitle: "Art, Culture, and Culinary Adventures in Florence",
    overallDescription: `My exchange semester in Florence was like stepping into a Renaissance painting that came to life. As an art history student, I couldn't have asked for a better classroom than this magnificent Italian city, where every street corner holds centuries of artistic heritage.

**Choosing Florence**

When I saw Florence on the list of available destinations, it felt like destiny. Having studied Renaissance art for years, the opportunity to study in the city where Michelangelo, Brunelleschi, and Botticelli created their masterpieces was irresistible. The University of Florence's art history program was exactly what I needed to deepen my knowledge.

**Arrival and First Impressions**

Landing in Florence in early September, I was immediately overwhelmed by the beauty surrounding me. The taxi ride from the airport to the city center was like a preview of the treasures awaiting me. When I first saw the Duomo rising above the red-tiled roofs, I literally gasped.

My accommodation was in a traditional Florentine apartment just across the Arno River in the Oltrarno district. The narrow streets, artisan workshops, and local markets gave me an authentic taste of Florentine life from day one.

**Academic Life at the University of Florence**

The University of Florence's art history department was everything I had hoped for and more. Classes were often held in historic buildings, and we regularly had lessons directly in front of the artworks we were studying. Imagine analyzing Michelangelo's David while standing in the Accademia Gallery!

My professors were world-renowned experts who brought passion and deep knowledge to every lecture. The course "Art and Society in Renaissance Florence" included walking seminars through the city, where we studied frescoes in their original locations and learned about the social context of artistic creation.

**Immersion in Art and Culture**

Living in Florence meant having unlimited access to some of the world's most important art collections. I had season passes to the Uffizi, Pitti Palace, and Bargello, and I visited regularly, discovering new details each time. The Uffizi became like a second home - I knew the security guards by name!

Beyond the famous museums, I explored lesser-known churches and private collections. Some of my most profound experiences happened in small chapels with frescoes by unknown masters, where I could sit quietly and absorb the spiritual and artistic atmosphere.

The experience was transformative and shaped my understanding of art history in ways no classroom could achieve.`,
    firstName: "Sophie",
    lastName: "Chen",
    hostCity: "Florence",
    hostCountry: "Italy",
    hostUniversity: "University of Florence",
    universityInCyprus: "European University Cyprus",
    studyProgram: "Art History",
    exchangePeriod: "Fall 2023",
    photos: [
      {
        id: "1",
        image:
          "https://images.unsplash.com/photo-1541620672031-8cb10f27b2fb?w=800&h=600&fit=crop",
        caption: "The iconic Duomo at golden hour",
        location: "Florence Cathedral, Italy",
        description: "My favorite view from the rooftop of my building",
      },
      {
        id: "2",
        image:
          "https://images.unsplash.com/photo-1516960121891-a5e5c89b5e2b?w=800&h=600&fit=crop",
        caption: "Ponte Vecchio at sunrise",
        location: "Ponte Vecchio, Florence",
        description: "Early morning walks across this historic bridge",
      },
    ],
    tags: ["Florence", "Art", "Italy", "Renaissance", "Culture", "History"],
  },
  {
    title: "Innovation and Startups: My Tech Journey in Stockholm",
    storyTitle: "Innovation and Startups: My Tech Journey in Stockholm",
    overallDescription: `Stockholm proved to be the perfect destination for my computer science exchange, offering cutting-edge technology education, a thriving startup ecosystem, and the unique Scandinavian approach to work-life balance that I'd heard so much about.

**Why Stockholm?**

Choosing Stockholm for my exchange wasn't difficult once I researched Sweden's reputation in technology and innovation. Home to companies like Spotify, Skype, and Klarna, Stockholm has established itself as a global tech hub. The KTH Royal Institute of Technology's computer science program was exactly what I needed to advance my skills.

**Arriving in the Tech Capital**

Landing in Stockholm in January meant arriving in the middle of winter, but the city's efficient infrastructure and warm indoor spaces made the cold manageable. What struck me immediately was the seamless integration of technology into daily life - from digital payments to smart public transportation.

My accommodation in a student residence in Östermalm put me in the heart of the city. The modern facilities and international community made settling in much easier than I had anticipated.

**Academic Excellence at KTH**

KTH's computer science program exceeded all my expectations. The curriculum was perfectly balanced between theoretical foundations and practical applications. What impressed me most was the emphasis on sustainable technology and ethical programming practices.

My favorite course was "Human-Computer Interaction in Digital Society," which challenged us to think about technology's social impact. We worked on real projects with local companies, giving us insight into how Swedish tech companies approach user experience and design.

**The Stockholm Tech Ecosystem**

Being in Stockholm meant having unprecedented access to one of Europe's most dynamic startup ecosystems. I attended numerous tech meetups, startup events, and conferences. The level of innovation and the collaborative spirit were inspiring.

I had the opportunity to visit several unicorn companies, including Spotify's headquarters. These visits provided insights into how Swedish companies scale globally while maintaining their distinctive culture and values.

The experience opened my eyes to the possibilities in tech entrepreneurship and influenced my career direction significantly.`,
    firstName: "Marcus",
    lastName: "Johnson",
    hostCity: "Stockholm",
    hostCountry: "Sweden",
    hostUniversity: "KTH Royal Institute of Technology",
    universityInCyprus: "Cyprus University of Technology",
    studyProgram: "Computer Science",
    exchangePeriod: "Spring 2024",
    photos: [
      {
        id: "1",
        image:
          "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=800&h=600&fit=crop",
        caption: "Stockholm's colorful Gamla Stan",
        location: "Gamla Stan, Stockholm",
        description: "The historic old town where I spent many afternoons",
      },
      {
        id: "2",
        image:
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
        caption: "KTH campus in winter",
        location: "KTH Royal Institute of Technology",
        description:
          "My home away from home during those productive study sessions",
      },
    ],
    tags: [
      "Stockholm",
      "Technology",
      "Sweden",
      "Startups",
      "Innovation",
      "Computer Science",
    ],
  },
];

async function addTestStories() {
  console.log("Adding test stories...");

  for (const story of testStories) {
    try {
      await prisma.formSubmission.create({
        data: {
          title: story.title,
          type: "STORY",
          status: "PUBLISHED",
          data: story,
        },
      });
      console.log(`Added story: ${story.storyTitle}`);
    } catch (error) {
      console.error(`Error adding story ${story.storyTitle}:`, error);
    }
  }

  console.log("Finished adding test stories.");
}

addTestStories()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
