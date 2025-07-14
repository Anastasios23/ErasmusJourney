import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkExistingStories() {
  console.log("Checking existing stories...");

  const stories = await prisma.formSubmission.findMany({
    where: {
      type: "STORY",
    },
    select: {
      id: true,
      title: true,
      type: true,
      status: true,
      createdAt: true,
    },
  });

  console.log(`Found ${stories.length} existing stories:`);
  stories.forEach((story) => {
    console.log(`- ${story.title} (${story.type}, ${story.status})`);
  });

  return stories;
}

async function createTestUser() {
  // Create a test user if none exists
  let user = await prisma.user.findFirst();

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        universityInCyprus: "University of Cyprus",
        studyProgram: "Computer Science",
      },
    });
    console.log("Created test user");
  }

  return user;
}

async function addTestStories() {
  console.log("Adding more test story data...");

  const user = await createTestUser();

  const testStories = [
    {
      title: "Discovering Art and Culture in Vienna",
      data: {
        storyTitle: "Discovering Art and Culture in Vienna",
        overallDescription: `My semester in Vienna was an incredible journey through one of Europe's most culturally rich cities. As an art student, I couldn't have asked for a better place to study and grow as an artist.

**Arriving in Vienna**

When I first arrived at Vienna International Airport, I was immediately struck by the city's blend of imperial grandeur and modern efficiency. The train ride into the city center took me past stunning architecture that I would later learn to appreciate in much greater detail.

My accommodation was in a student residence near the University of Applied Arts Vienna (Universität für angewandte Kunst Wien). The building was modern but situated in a historic neighborhood where every street corner seemed to hold centuries of artistic heritage.

**Academic Life at the University**

The University of Applied Arts Vienna exceeded all my expectations. The professors were working artists and designers who brought real-world experience into the classroom. My favorite course was "Contemporary Art in Historical Context," which included regular visits to Vienna's world-class museums and galleries.

The Belvedere Palace, with its incredible collection including Klimt's "The Kiss," became like a second home to me. I had a student pass that allowed unlimited visits, and I would often go there just to sit and sketch, absorbing the masterpieces around me.

**Exploring Vienna's Cultural Scene**

Vienna's cultural offerings are simply unparalleled. Beyond the famous museums like the Kunsthistorisches Museum and the Leopold Museum, I discovered countless smaller galleries showcasing contemporary Austrian and international artists.

The city's coffee house culture became an integral part of my daily routine. Café Central, with its historic significance and artistic atmosphere, became my favorite study spot. The tradition of spending hours over a single coffee while reading, writing, or sketching felt perfectly natural in Vienna.

**Learning German and Making Friends**

While my courses were primarily in English, I was determined to improve my German. The university offered excellent language courses, and I practiced constantly with local students who were incredibly patient and encouraging.

Through the Erasmus Student Network and university clubs, I met students from all over the world. We formed a tight-knit international community, organizing cultural exchanges and exploring the city together. Some of my best memories are of late-night discussions about art and philosophy in various Vienna bars and cafés.

**Art Projects and Personal Growth**

My coursework included several major projects that pushed me creatively. One project involved creating a multimedia installation inspired by Vienna's imperial history and its contemporary multicultural reality. Working on this piece in Vienna, surrounded by the actual historical references, was transformative.

I also participated in a collaborative exhibition with local art students at a gallery in the Kunstquartier. Seeing my work displayed alongside that of Austrian artists was both humbling and inspiring. The opening night was one of the highlights of my entire exchange experience.

**Weekend Adventures**

Vienna's central location made it easy to explore other parts of Austria and neighboring countries. Weekend trips to Salzburg, Prague, and Budapest provided additional cultural perspectives and artistic inspiration.

One particularly memorable excursion was to the Wachau Valley, where I spent a weekend painting landscapes along the Danube River. The experience of creating art en plein air in such a beautiful setting was magical and influenced my work for the rest of my stay.

**The Impact on My Artistic Development**

Living and studying in Vienna profoundly influenced my artistic development. The city's rich artistic heritage, combined with its vibrant contemporary scene, provided endless inspiration. I experimented with new techniques and mediums, and my style evolved in ways I hadn't anticipated.

The exposure to different artistic traditions and contemporary practices broadened my perspective significantly. I learned to appreciate not just the final artwork but the cultural and historical contexts that shape artistic expression.

**Challenges and Growth**

Of course, the experience wasn't without challenges. The initial language barrier made some social situations difficult, and I occasionally felt homesick, especially during the darker winter months. However, these challenges ultimately contributed to my personal growth and resilience.

Learning to navigate a different educational system and cultural expectations taught me adaptability and independence. I became more confident in expressing my ideas and more open to feedback and collaboration.

**Lasting Friendships and Connections**

The relationships I built in Vienna continue to enrich my life. I maintain close contact with fellow students from around the world, and we often share our artistic developments and career progress. Several of these friendships have led to collaborative projects and professional opportunities.

My professors and mentors at the University of Applied Arts continue to provide guidance and support. The network I built in Vienna has been invaluable as I've progressed in my artistic career.

**Professional Development**

Beyond the artistic skills I developed, my Vienna experience provided crucial professional development. I learned about the art market, gallery operations, and cultural institutions through internships and volunteer opportunities.

I volunteered at several galleries and museums, gaining behind-the-scenes experience that has proven invaluable in my career. These experiences also provided professional references and networking opportunities that continue to benefit me.

**Reflection on the Experience**

Looking back, my semester in Vienna was transformative in every sense. It shaped not only my artistic practice but also my worldview and personal identity. The city's combination of historical depth and contemporary innovation provided the perfect environment for creative and personal growth.

Vienna taught me that art is not created in isolation but emerges from cultural dialogue and historical context. This understanding has profoundly influenced how I approach my own work and how I engage with the broader art world.

**Advice for Future Students**

For anyone considering studying art in Vienna, my advice is to immerse yourself completely in the city's cultural life. Visit museums regularly, attend gallery openings, participate in local art events, and engage with the vibrant student community.

Don't be afraid to experiment with new artistic approaches and techniques. Vienna's supportive and innovative educational environment is perfect for taking creative risks and pushing your boundaries.

**Continuing Connection**

I return to Vienna regularly, both for personal visits and professional opportunities. The city continues to inspire and challenge me, and I maintain active connections with the artistic community there.

My Vienna experience was more than an academic exchange; it was a transformative journey that continues to influence my life and work. The city, with its incredible artistic heritage and vibrant contemporary scene, will always hold a special place in my heart and my artistic development.`,
        firstName: "Isabella",
        lastName: "Schmidt",
        email: "isabella.schmidt@example.com",
        hostCity: "Vienna",
        hostCountry: "Austria",
        hostUniversity: "University of Applied Arts Vienna",
        universityInCyprus: "European University Cyprus",
        studyProgram: "Fine Arts",
        exchangePeriod: "Fall 2023",
        photos: [
          {
            id: "1",
            image:
              "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800&h=600&fit=crop",
            caption: "The magnificent Schönbrunn Palace gardens",
            location: "Schönbrunn Palace, Vienna",
            description:
              "One of my favorite places to sketch and find inspiration",
            title: "Imperial Gardens",
          },
          {
            id: "2",
            image:
              "https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=800&h=600&fit=crop",
            caption: "My art studio at the University",
            location: "University of Applied Arts Vienna",
            description:
              "Where I created some of my best work during the exchange",
            title: "My Creative Space",
          },
        ],
        tags: ["Vienna", "Art", "Austria", "Museums", "Culture", "Fine Arts"],
        submissionType: "photo-story",
        allowPublicUse: true,
      },
    },
    {
      title: "Engineering Excellence in Zurich",
      data: {
        storyTitle: "Engineering Excellence in Zurich",
        overallDescription: `My exchange semester at ETH Zurich was an incredible journey into one of the world's most prestigious engineering institutions. Located in the heart of Switzerland, ETH provided not only world-class education but also stunning natural beauty and a multicultural environment.

**Choosing ETH Zurich**

When I saw ETH Zurich on the list of available exchange destinations, I knew it was my first choice. ETH's reputation in engineering and technology is unparalleled, and the opportunity to study in Switzerland, with its innovation ecosystem and stunning landscapes, was irresistible.

The application process was competitive, but when I received the acceptance letter, I knew I was about to embark on an extraordinary academic adventure.

**Arrival and First Impressions**

Landing in Zurich in early September, I was immediately impressed by the city's perfect blend of urban sophistication and natural beauty. The train ride from the airport to the city center offered glimpses of Lake Zurich and the Alps in the distance - a view that never got old during my stay.

My accommodation was in a student residence on the ETH campus, which sits on a hill overlooking the city. The modern facilities and international community made settling in much easier than I had anticipated.

**Academic Excellence at ETH**

ETH Zurich's engineering programs are truly world-class. The curriculum was challenging but incredibly rewarding, with access to cutting-edge laboratories and research facilities that most universities can only dream of.

My favorite course was "Sustainable Engineering Systems," which combined theoretical knowledge with practical applications. We worked on real-world projects, including designing renewable energy systems for Swiss municipalities. The professors were not just academics but industry leaders who brought current research and practice into the classroom.

**Research Opportunities**

One of the highlights of my exchange was participating in a research project on advanced materials for sustainable construction. Working alongside PhD students and postdocs gave me insights into the research process and confirmed my interest in pursuing graduate studies.

The research facilities at ETH are absolutely incredible. I had access to equipment and technologies that I had only read about in textbooks. This hands-on experience with cutting-edge research tools was invaluable for my academic and professional development.

**International Environment**

ETH's international character was one of its most appealing aspects. My classmates came from all over the world, bringing diverse perspectives to engineering problems. Study groups became multicultural brainstorming sessions where different approaches to problem-solving were shared and explored.

This diversity extended beyond academics. The international student community organized cultural events, hiking trips, and social gatherings that helped me understand not just Swiss culture but cultures from around the globe.

**Exploring Switzerland**

Living in Zurich provided incredible opportunities to explore Switzerland's natural beauty. Weekend hiking trips in the Alps became a regular activity, and I discovered that some of my best problem-solving insights came during long walks in the mountains.

I particularly enjoyed trips to the Jungfraujoch, Matterhorn region, and various Swiss lakes. The country's efficient transportation system made it easy to explore, and I often combined outdoor adventures with visits to other Swiss cities like Geneva, Basel, and Bern.

**Language and Cultural Integration**

While my courses were in English, I was determined to learn German (specifically Swiss German, which is quite different!). ETH offered excellent language courses, and I practiced with local students who were patient with my attempts at their unique dialect.

Understanding the local language and culture enhanced my experience significantly. I could participate more fully in local events, understand cultural nuances, and build deeper relationships with Swiss students and residents.

**Innovation Ecosystem**

Zurich's position as a global innovation hub provided unique opportunities to engage with startups, tech companies, and research institutions. I attended numerous tech meetups, startup events, and innovation conferences.

Through ETH's connections, I had the opportunity to visit Google's Zurich office, various pharmaceutical companies, and innovative Swiss startups. These visits provided insights into how Swiss companies approach innovation and maintain their competitive edge in global markets.

**Challenges and Personal Growth**

The academic rigor at ETH was intense, and initially, I struggled to keep up with the pace and depth of the coursework. The standards were higher than what I was used to, and I had to develop better study habits and time management skills.

The cost of living in Switzerland was also a shock. Everything from food to transportation was more expensive than I had anticipated. This taught me to budget carefully and find creative ways to enjoy the city without breaking the bank.

**Technical Skills Development**

Beyond the theoretical knowledge, my time at ETH significantly enhanced my technical skills. I learned advanced simulation software, worked with sophisticated laboratory equipment, and developed proficiency in programming languages that are crucial in modern engineering.

The project-based learning approach meant that I applied these skills to real problems, which was far more valuable than just learning theory. By the end of my exchange, I felt significantly more prepared for professional engineering work.

**Professional Networking**

ETH's alumni network and industry connections provided excellent networking opportunities. I attended career fairs, industry talks, and alumni events where I met professionals working for major Swiss and international companies.

These connections have been invaluable for my career. Several alumni offered mentorship, and some contacts have led to internship and job opportunities. The Swiss approach to professional networking - based on genuine relationships and mutual respect - was refreshing and effective.

**Cultural Experiences**

Living in Zurich exposed me to Swiss culture in ways that tourism never could. I participated in local festivals, learned about Swiss democracy and civic engagement, and experienced the famous Swiss precision and quality in daily life.

The work-life balance in Switzerland was inspiring. Despite the high standards and productivity, there was a strong emphasis on personal time, outdoor activities, and family life. This cultural approach influenced my own perspective on career and life priorities.

**Environmental Consciousness**

Switzerland's commitment to environmental sustainability was evident everywhere, from public transportation to waste management to renewable energy. This environmental consciousness influenced my engineering studies and career interests.

I became more interested in sustainable engineering practices and environmental applications of technology. This shift in focus has guided my subsequent academic choices and career direction.

**Final Projects and Achievements**

My final project at ETH involved designing a smart building system for energy optimization. Working on this project in Switzerland, with access to real data and advanced simulation tools, produced results that exceeded my expectations.

The project was selected for presentation at a student conference, and I received excellent feedback from professors and industry professionals. This achievement boosted my confidence and confirmed my abilities as an engineer.

**Lasting Impact**

My semester at ETH Zurich was transformative both academically and personally. The rigorous academic environment pushed me to higher standards, while the international and multicultural setting broadened my perspective significantly.

The experience influenced my career trajectory, leading me to pursue graduate studies and eventually work for an international engineering firm where my Swiss experience and network have been valuable assets.

**Advice for Future Students**

For anyone considering an exchange at ETH Zurich, my advice is to prepare for intensity but embrace the challenge. The academic standards are high, but the support and resources available are exceptional.

Take advantage of the research opportunities, even if they seem challenging. The experience and connections you'll gain are invaluable. Also, don't forget to explore Switzerland's incredible natural beauty - it's the perfect complement to intensive academic work.

**Continuing Connections**

I maintain strong connections with ETH through alumni networks, former classmates, and research collaborations. Several of my ETH contacts have become long-term professional and personal relationships.

I return to Zurich regularly for conferences and meetings, and each visit reminds me of the transformative impact that semester had on my life and career. ETH Zurich provided not just education but a foundation for lifelong learning and international collaboration.`,
        firstName: "Andreas",
        lastName: "Mueller",
        email: "andreas.mueller@example.com",
        hostCity: "Zurich",
        hostCountry: "Switzerland",
        hostUniversity: "ETH Zurich",
        universityInCyprus: "Cyprus University of Technology",
        studyProgram: "Mechanical Engineering",
        exchangePeriod: "Fall 2023",
        photos: [
          {
            id: "1",
            image:
              "https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=800&h=600&fit=crop",
            caption: "ETH Zurich main building with Alpine backdrop",
            location: "ETH Zurich, Switzerland",
            description:
              "The iconic main building where I spent countless hours studying",
            title: "My University",
          },
          {
            id: "2",
            image:
              "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=800&h=600&fit=crop",
            caption: "Weekend hiking in the Swiss Alps",
            location: "Swiss Alps",
            description:
              "One of many hiking adventures that cleared my mind for studying",
            title: "Alpine Adventures",
          },
        ],
        tags: [
          "Zurich",
          "Engineering",
          "Switzerland",
          "Research",
          "Innovation",
          "Alps",
        ],
        submissionType: "photo-story",
        allowPublicUse: true,
      },
    },
    {
      title: "Language Immersion and Culture in Salamanca",
      data: {
        storyTitle: "Language Immersion and Culture in Salamanca",
        overallDescription: `My exchange semester in Salamanca was the perfect combination of language learning, cultural immersion, and academic growth. Known as the "Golden City" for its stunning sandstone architecture, Salamanca provided an ideal environment for studying Spanish literature and perfecting my language skills.

**Choosing Salamanca**

When I decided to focus on Spanish studies, Salamanca was the obvious choice. The University of Salamanca is one of the oldest universities in Europe, with a reputation for excellence in language and literature studies. The city's size was perfect - large enough to offer all necessary amenities but small enough to feel like a community.

**Arrival and First Impressions**

Flying into Madrid and taking the train to Salamanca gave me my first taste of the Spanish countryside. Arriving at Salamanca's train station and seeing the golden glow of the historic city center in the evening light was magical.

My accommodation was with a Spanish host family, which I had specifically requested to maximize my language immersion. The Fernández family welcomed me warmly and immediately began helping me with my Spanish, correcting my mistakes with patience and encouraging my progress.

**Academic Life at the University of Salamanca**

The University of Salamanca's Spanish Studies program was everything I had hoped for. Classes were conducted entirely in Spanish, which was challenging initially but incredibly effective for improving my language skills.

My favorite course was "Contemporary Spanish Literature," where we analyzed works by authors like García Lorca, Machado, and contemporary writers. Reading these works in their original language, in the country where they were written, added layers of understanding that would have been impossible otherwise.

**Language Learning Journey**

Living with a Spanish family accelerated my language learning dramatically. Every meal was a conversation practice session, and my host parents were incredibly patient with my mistakes while consistently encouraging me to express myself in Spanish.

I also joined a language exchange program where I paired with Spanish students learning English. These sessions became not just language practice but cultural exchange, as we shared perspectives on everything from literature to politics to daily life.

**Exploring Salamanca's Culture**

Salamanca's cultural richness extends far beyond its university. The Plaza Mayor, considered one of the most beautiful squares in Spain, became my favorite study spot. Sitting in a café with my books, surrounded by baroque architecture, made studying feel like a privilege rather than work.

The city's tapas culture became an integral part of my social life. Evening paseos (walks) followed by tapas with friends became a cherished routine. These relaxed social gatherings were perfect for practicing conversational Spanish in natural settings.

**Weekend Adventures**

Salamanca's location made it easy to explore other parts of Spain. Weekend trips to Madrid, Toledo, and Segovia provided opportunities to experience different regions and dialects of Spanish.

One particularly memorable trip was to Santiago de Compostela, where I walked the final portion of the Camino. This pilgrimage experience, conducted entirely in Spanish with fellow pilgrims from around the world, was both spiritually and linguistically enriching.

**Cultural Events and Festivals**

During my stay, I experienced several Spanish festivals, including the local festivities honoring the city's patron saint. Participating in these celebrations, understanding the historical and cultural significance, and engaging with locals in Spanish provided deep cultural insights.

I also attended numerous cultural events at the university and around the city - poetry readings, theater performances, and art exhibitions. These events, conducted in Spanish, challenged my language skills while providing rich cultural experiences.

**Academic Projects and Research**

For my major research project, I studied the influence of Spanish Golden Age literature on contemporary Spanish writers. Having access to original manuscripts and documents in the university's historic library was incredible.

I also participated in a collaborative project with Spanish students, analyzing regional dialects and their representation in literature. This project required not just language skills but cultural understanding and research abilities.

**Building Relationships**

The friendships I formed in Salamanca became one of the most valuable aspects of my exchange. My Spanish friends were patient language teachers, cultural guides, and genuine companions who helped me navigate both academic and social challenges.

My relationship with my host family evolved from formal hosting to genuine family connection. They included me in family gatherings, celebrations, and daily life in ways that provided authentic cultural immersion.

**Challenges and Growth**

The initial language barrier was significant. During my first weeks, I often felt frustrated by my inability to express complex thoughts clearly. However, this challenge pushed me to be more creative in communication and more persistent in learning.

Adapting to Spanish schedules and social customs took time. Late dinners, afternoon siestas, and different concepts of time required adjustment but ultimately enriched my cultural understanding.

**Professional Development**

My improved Spanish skills opened new career possibilities. I gained confidence in professional Spanish communication through internship opportunities with local cultural organizations.

I also developed teaching skills by volunteering to tutor English-speaking students in Spanish conversation. This experience confirmed my interest in language education and cultural exchange.

**Cultural Understanding**

Living in Salamanca provided deep insights into Spanish culture, history, and contemporary society. I learned about regional identities, political perspectives, and social customs that go far beyond typical tourist experiences.

Understanding Spanish culture enhanced my appreciation for Spanish literature and helped me analyze texts with greater cultural context and sensitivity.

**Impact on Language Skills**

By the end of my semester, my Spanish had improved dramatically. I could participate in complex academic discussions, understand rapid colloquial speech, and express nuanced thoughts and emotions in Spanish.

More importantly, I developed cultural fluency - the ability to understand not just what is said but what is meant, including cultural references, humor, and subtleties.

**Research and Academic Achievement**

My research project on Golden Age literature influences was selected for presentation at a student conference. Presenting in Spanish to an audience of professors and students was challenging but immensely rewarding.

The positive feedback I received confirmed that my language skills and cultural understanding had reached a sophisticated level.

**Lasting Connections**

The relationships I built in Salamanca continue to enrich my life. I maintain regular contact with my host family, Spanish friends, and fellow international students from my program.

These connections have led to return visits, professional opportunities, and ongoing cultural exchange that extends far beyond my semester abroad.

**Career Impact**

My Salamanca experience significantly influenced my career direction. I now work as a Spanish teacher and cultural liaison, directly applying the skills and cultural understanding I developed during my exchange.

The confidence I gained in Spanish communication has opened doors to international opportunities and assignments that wouldn't have been possible without this transformative experience.

**Personal Transformation**

Beyond language skills and cultural knowledge, my semester in Salamanca fostered personal growth. I became more adaptable, confident in unfamiliar situations, and appreciative of cultural diversity.

The experience taught me that true language learning requires cultural immersion and that understanding another culture provides insights into your own.

**Advice for Future Students**

For anyone considering language studies in Salamanca, I strongly recommend staying with a host family and fully committing to Spanish-only communication. The temporary discomfort of struggling with the language yields tremendous long-term benefits.

Participate actively in cultural events and local life. Language learning happens as much outside the classroom as inside, and cultural understanding is essential for true fluency.

**Continuing Connection**

I return to Salamanca regularly to visit my host family and maintain my connections to the city and university. Each visit allows me to appreciate how much I grew during my exchange and to continue developing my Spanish skills and cultural understanding.

Salamanca will always hold a special place in my heart as the city where I not only learned Spanish but discovered a new perspective on literature, culture, and life itself.`,
        firstName: "Emma",
        lastName: "Rodriguez",
        email: "emma.rodriguez@example.com",
        hostCity: "Salamanca",
        hostCountry: "Spain",
        hostUniversity: "University of Salamanca",
        universityInCyprus: "University of Cyprus",
        studyProgram: "Spanish Literature",
        exchangePeriod: "Spring 2024",
        photos: [
          {
            id: "1",
            image:
              "https://images.unsplash.com/photo-1539650116574-75c0c6d73a10?w=800&h=600&fit=crop",
            caption: "The magnificent Plaza Mayor at sunset",
            location: "Plaza Mayor, Salamanca",
            description:
              "My favorite study spot with the most beautiful architecture in Spain",
            title: "Golden Hour in Salamanca",
          },
          {
            id: "2",
            image:
              "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&h=600&fit=crop",
            caption: "University of Salamanca historic facade",
            location: "University of Salamanca, Spain",
            description:
              "The historic university where I studied Spanish literature",
            title: "My Academic Home",
          },
        ],
        tags: [
          "Salamanca",
          "Spanish",
          "Spain",
          "Literature",
          "Language",
          "Culture",
        ],
        submissionType: "photo-story",
        allowPublicUse: true,
      },
    },
  ];

  for (const storyData of testStories) {
    try {
      await prisma.formSubmission.create({
        data: {
          title: storyData.title,
          type: "STORY",
          status: "PUBLISHED",
          userId: user.id,
          data: storyData.data,
        },
      });
      console.log(`✓ Added story: ${storyData.title}`);
    } catch (error) {
      console.error(`✗ Error adding story ${storyData.title}:`, error);
    }
  }
}

async function testApiEndpoints() {
  console.log("\nTesting API endpoints...");

  try {
    // Test stories list endpoint
    const storiesResponse = await fetch("http://localhost:3000/api/stories");
    if (storiesResponse.ok) {
      const storiesData = await storiesResponse.json();
      console.log(
        `✓ Stories API working - found ${storiesData.stories.length} stories`,
      );

      // Test individual story endpoints
      for (const story of storiesData.stories.slice(0, 2)) {
        const storyResponse = await fetch(
          `http://localhost:3000/api/stories/${story.id}`,
        );
        if (storyResponse.ok) {
          console.log(`✓ Story detail API working for: ${story.title}`);
        } else {
          console.log(`✗ Story detail API failed for: ${story.title}`);
        }
      }
    } else {
      console.log("✗ Stories API failed");
    }
  } catch (error) {
    console.log("✗ API testing failed:", error.message);
  }
}

async function main() {
  await checkExistingStories();
  await addTestStories();
  console.log("\nTest data added successfully!");

  // Wait a moment then test APIs
  setTimeout(testApiEndpoints, 1000);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
