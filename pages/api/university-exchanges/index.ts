import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { CYPRUS_UNIVERSITIES } from "../../../src/data/universityAgreements";

interface BasicInfoFormData {
  universityInCyprus: string;
  hostUniversity: string;
  hostCity: string;
  hostCountry: string;
  departmentInCyprus: string;
  levelOfStudy: string;
  [key: string]: any;
}

interface CourseMatchingFormData {
  courses: Array<{
    type: string;
    [key: string]: any;
  }>;
  courseMatchingDifficult: string;
  recommendCourses: string;
  [key: string]: any;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Get all basic info submissions
    const exchanges = await prisma.formSubmission.findMany({
      where: {
        type: "BASIC_INFO",
        status: "SUBMITTED",
      },
    });

    // Group by home university -> host university partnership
    const exchangeMap = new Map();

    exchanges.forEach((exchange) => {
      const {
        universityInCyprus,
        hostUniversity,
        hostCity,
        hostCountry,
        departmentInCyprus,
        levelOfStudy,
      } = exchange.data as BasicInfoFormData;

      const key = `${universityInCyprus}-${hostUniversity}`;

      if (!exchangeMap.has(key)) {
        const homeUni = CYPRUS_UNIVERSITIES.find(
          (u) => u.code === universityInCyprus,
        );

        exchangeMap.set(key, {
          id: key.toLowerCase().replace(/\s+/g, "-"),
          hostCountry,
          departments: new Set(),
          levels: new Set(),
          studentCount: 0,
          experiences: [],
          courseMatches: [],
        });
      }

      // Get course matching data
      if (departmentInCyprus) {
        const exchangeData = exchangeMap.get(key);
        if (exchangeData) {
          exchangeData.departments.add(departmentInCyprus);
          exchangeData.levels.add(levelOfStudy);
          exchangeData.studentCount++;
        }
      }
    });

    // Get course matching data
    const courseSubmissions = await prisma.formSubmission.findMany({
      where: {
        type: "COURSE_MATCHING",
        status: "SUBMITTED",
      },
    });

    courseSubmissions.forEach((course) => {
      const courseData = course.data as CourseMatchingFormData;
      // Assuming 'formId' or similar field exists in the course matching submission data
      const linkedFormId = courseData.basicInfoId || courseData.formId;
      const basicInfo = linkedFormId
        ? (exchanges.find((e) => e.id === linkedFormId)
            ?.data as BasicInfoFormData)
        : null;

      if (basicInfo) {
        const key = `${basicInfo.universityInCyprus}-${basicInfo.hostUniversity}`;
        const exchangeData = exchangeMap.get(key);

        if (exchangeData && courseData.courses) {
          exchangeData.courseMatches.push({
            hostCourses: courseData.courses.filter((c) => c.type === "host"),
            homeCourses: courseData.courses.filter((c) => c.type === "home"),
            difficulty: courseData.courseMatchingDifficult,
            recommended: courseData.recommendCourses,
          });
        }
      }
    });

    // Convert to array and format
    const formattedExchanges = Array.from(exchangeMap.values()).map(
      (exchange) => ({
        ...exchange,
        departments: Array.from(exchange.departments),
        levels: Array.from(exchange.levels),
        averageRating: 4.0 + Math.random() * 1.0, // Generate rating between 4.0-5.0
        partnershipType: "Erasmus+",
        availableSpots: Math.floor(Math.random() * 10) + 5, // Random spots 5-15
      }),
    );

    res.status(200).json({ exchanges: formattedExchanges });
  } catch (error) {
    console.error("Error fetching university exchanges:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
