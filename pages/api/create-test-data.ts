import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("🧪 Creating test form submissions...");

    // Create test user
    const testUser = await prisma.user.upsert({
      where: { email: "test.student@ucy.ac.cy" },
      update: {},
      create: {
        email: "test.student@ucy.ac.cy",
        firstName: "Test",
        lastName: "Student",
        password: "$2a$10$hash",
        role: "USER",
        studentId: "TEST001",
        nationality: "Cyprus",
        homeCity: "Nicosia",
        homeCountry: "Cyprus",
      },
    });

    // Create destination submission (Basic Information)
    const destinationSubmission = await prisma.formSubmission.create({
      data: {
        userId: testUser.id,
        type: "basic-information",
        title: "Exchange Experience: Barcelona, Spain",
        data: {
          universityInCyprus: "University of Cyprus",
          hostUniversity: "University of Barcelona",
          hostCity: "Barcelona",
          hostCountry: "Spain",
          studyLevel: "BACHELOR",
          fieldOfStudy: "Computer Science",
          studyPeriod: "Fall 2024",
          overallExperience:
            "Amazing experience! Barcelona is vibrant with incredible culture.",
          culturalHighlights: [
            "Sagrada Familia",
            "Park Güell",
            "Gothic Quarter",
          ],
          challenges: ["Language barrier", "Finding accommodation"],
          recommendations: "Learn basic Spanish before going",
          costOfLiving: {
            accommodation: 400,
            food: 250,
            transport: 50,
            entertainment: 150,
            total: 850,
          },
        },
        status: "SUBMITTED",
      },
    });

    // Create university exchange submission (Course Matching)
    const universitySubmission = await prisma.formSubmission.create({
      data: {
        userId: testUser.id,
        type: "course-matching",
        title: "Course Matching: Sorbonne University",
        data: {
          universityInCyprus: "University of Cyprus",
          hostUniversity: "Sorbonne University",
          hostCity: "Paris",
          hostCountry: "France",
          studyLevel: "MASTER",
          fieldOfStudy: "Literature",
          courseMatching: {
            availableCourses: [
              {
                courseName: "French Literature in the 19th Century",
                courseCode: "FLIT301",
                ects: 6,
                difficultyLevel: "MEDIUM",
                examType: "WRITTEN",
                semester: "FALL",
              },
              {
                courseName: "Comparative European Literature",
                courseCode: "COMP401",
                ects: 8,
                difficultyLevel: "HARD",
                examType: "PROJECT",
                semester: "FALL",
              },
            ],
            totalEcts: 14,
            academicYear: "2024-2025",
            language: "French",
          },
        },
        status: "SUBMITTED",
      },
    });

    // Create accommodation submission
    const accommodationSubmission = await prisma.formSubmission.create({
      data: {
        userId: testUser.id,
        type: "accommodation",
        title: "Accommodation Experience: Eixample, Barcelona",
        data: {
          hostCity: "Barcelona",
          hostCountry: "Spain",
          hostUniversity: "University of Barcelona",
          studyPeriod: "Fall 2024",
          housingType: "DORMITORY",
          neighborhood: "Eixample",
          distanceToUniversity: 2.5,
          monthlyRent: 450,
          roomType: "SINGLE",
          privateBathroom: true,
          amenities: ["WiFi", "Kitchen", "Laundry", "Gym"],
          furnished: true,
          utilitiesIncluded: true,
          landlordContact: "residencia.eixample@ub.edu",
          deposit: 450,
          contractLength: "5 months",
          overallRating: 4,
          cleanlinessRating: 4,
          locationRating: 5,
          valueRating: 4,
          safetyRating: 5,
          experienceDescription:
            "Great university dormitory in the heart of Barcelona! Perfect location and modern facilities.",
          pros: ["Perfect location", "Modern facilities", "Great community"],
          cons: ["Can be noisy on weekends", "Limited kitchen space"],
          wouldRecommend: true,
        },
        status: "SUBMITTED",
      },
    });

    res.status(200).json({
      message: "Test data created successfully!",
      submissions: {
        destination: destinationSubmission.id,
        university: universitySubmission.id,
        accommodation: accommodationSubmission.id,
      },
      testInstructions: {
        destinations: "/admin/destinations",
        universities: "/admin/university-exchanges",
        accommodations: "/admin/student-accommodations",
      },
    });
  } catch (error) {
    console.error("Error creating test data:", error);
    res.status(500).json({
      error: "Failed to create test data",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
