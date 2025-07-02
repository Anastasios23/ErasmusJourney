import { NextApiRequest, NextApiResponse } from "next";

interface ContentData {
  accommodations: any[];
  stories: any[];
  destinations: any[];
  courseMatching: any[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { type } = req.query;

    // This would fetch from your form submissions database
    // For now, we'll generate mock data based on typical form submissions
    const mockFormSubmissions = [
      {
        id: "1",
        type: "accommodation",
        status: "published",
        data: {
          name: "Barcelona Student Residence",
          type: "University Dormitory",
          location: "Barcelona, Spain",
          city: "Barcelona",
          country: "Spain",
          rating: 4.5,
          priceRange: "€400-600/month",
          amenities: ["WiFi", "Gym", "Study Rooms", "Laundry"],
          description:
            "Modern student residence located in the heart of Barcelona, just 10 minutes from the university campus.",
          images: ["/api/placeholder/400/300"],
          contactInfo: {
            email: "info@barcelonaresidence.com",
            phone: "+34 123 456 789",
            website: "www.barcelonaresidence.com",
          },
          userReview: {
            author: "Maria S.",
            rating: 5,
            content:
              "Amazing place to live during my Erasmus! Great facilities and friendly staff.",
          },
        },
      },
      {
        id: "2",
        type: "story",
        status: "published",
        data: {
          title: "My Life-Changing Semester in Barcelona",
          author: "Alex Johnson",
          homeUniversity: "UNIC",
          hostUniversity: "University of Barcelona",
          semester: "Fall 2023",
          destination: "Barcelona, Spain",
          excerpt:
            "Discover how studying abroad in Barcelona transformed my perspective on life and career.",
          content: `
            When I first arrived in Barcelona, I was nervous but excited. The city welcomed me with open arms, and I quickly discovered that this experience would change my life forever.

            **Academic Experience**
            The University of Barcelona offered courses that weren't available at my home university. The teaching style was more interactive, and I loved the diversity of perspectives from international students.

            **Cultural Immersion**
            Living with Spanish students helped me improve my language skills dramatically. We explored the city together, discovering hidden gems and local traditions.

            **Personal Growth**
            This experience taught me independence, adaptability, and gave me a global perspective that I carry with me today.
          `,
          tags: ["barcelona", "erasmus", "personal-growth", "culture"],
          images: [
            "/api/placeholder/800/400",
            "/api/placeholder/400/300",
            "/api/placeholder/400/300",
          ],
          likes: 24,
          publishedDate: "2024-01-15",
        },
      },
      {
        id: "3",
        type: "basic-info",
        status: "published",
        data: {
          homeUniversity: "UNIC",
          hostDestination: "Barcelona, Spain",
          hostUniversity: "University of Barcelona",
          department: "Computer Science",
          levelOfStudy: "bachelor",
          semester: "Fall 2023",
        },
      },
      {
        id: "4",
        type: "course-matching",
        status: "published",
        data: {
          homeUniversity: "UNIC",
          hostUniversity: "University of Barcelona",
          department: "Computer Science",
          levelOfStudy: "bachelor",
          courses: [
            {
              hostCourse: {
                name: "Advanced Algorithms",
                code: "CS401",
                ects: "6",
                difficulty: "4",
              },
              homeCourse: {
                name: "Algorithm Design",
                code: "CS301",
                ects: "6",
              },
            },
            {
              hostCourse: {
                name: "Machine Learning Fundamentals",
                code: "CS402",
                ects: "6",
                difficulty: "3",
              },
              homeCourse: {
                name: "Introduction to AI",
                code: "CS302",
                ects: "6",
              },
            },
          ],
          evaluation: {
            difficulty: "The courses were challenging but manageable",
            recommendation: "Highly recommend for computer science students",
          },
        },
      },
    ];

    // Generate content based on form submissions
    const generateContent = () => {
      const accommodations = mockFormSubmissions
        .filter((s) => s.type === "accommodation" && s.status === "published")
        .map((s) => ({
          id: s.id,
          ...s.data,
          location: s.data.city + ", " + s.data.country,
        }));

      const stories = mockFormSubmissions
        .filter((s) => s.type === "story" && s.status === "published")
        .map((s) => ({
          id: s.id,
          ...s.data,
        }));

      // Generate destinations from form submissions
      const destinationMap = new Map();
      mockFormSubmissions
        .filter((s) => s.status === "published")
        .forEach((submission) => {
          let destination = null;
          let university = null;

          if (submission.type === "basic-info") {
            destination = submission.data.hostDestination;
            university = submission.data.hostUniversity;
          } else if (submission.type === "course-matching") {
            const parts = submission.data.hostUniversity.split(",");
            destination =
              parts.length > 1 ? parts.slice(1).join(",").trim() : "Unknown";
            university = submission.data.hostUniversity;
          } else if (submission.type === "story") {
            destination = submission.data.destination;
            university = submission.data.hostUniversity;
          }

          if (destination) {
            const [city, country] = destination.split(",").map((s) => s.trim());
            const key = `${city}-${country}`;

            if (!destinationMap.has(key)) {
              destinationMap.set(key, {
                id: key,
                name: city,
                country: country,
                description: `Experience the vibrant culture and excellent universities in ${city}.`,
                image: "/api/placeholder/600/400",
                studentCount: 0,
                universities: new Set(),
                costLevel: "medium", // This could be derived from accommodation data
              });
            }

            const dest = destinationMap.get(key);
            dest.studentCount += 1;
            if (university) {
              dest.universities.add(university);
            }
          }
        });

      const destinations = Array.from(destinationMap.values()).map((dest) => ({
        ...dest,
        universities: Array.from(dest.universities),
      }));

      const courseMatching = mockFormSubmissions
        .filter((s) => s.type === "course-matching" && s.status === "published")
        .map((s) => ({
          id: s.id,
          ...s.data,
        }));

      return {
        accommodations,
        stories,
        destinations,
        courseMatching,
      };
    };

    const content = generateContent();

    // Return specific type or all content
    if (type && type !== "all") {
      res.status(200).json({ [type]: content[type as keyof ContentData] });
    } else {
      res.status(200).json(content);
    }
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
