import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface UniversityExchange {
  id: string;
  universityName: string;
  location: string;
  country: string;
  studentsCount: number;
  departments: string[];
  studyLevels: string[];
  cyprusUniversities: string[];
  courseMatches: number;
  totalHostCourses?: string;
  totalHomeCourses?: string;
  image: string;
  description: string;
  highlights: string[];
  averageRating: number;
  academicStrength: string;
  researchFocus: string[];
  languageOfInstruction: string[];
  semesterOptions: string[];
  applicationDeadline: string;
  establishedYear: number;
  worldRanking?: number;
  erasmusCode: string;
  contactEmail: string;
  website: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Get all basic info submissions for university data
    const basicInfoSubmissions = await prisma.formSubmission.findMany({
      where: { type: "BASIC_INFO" },
      select: {
        id: true,
        data: true,
      },
    });

    // Get all course matching submissions
    const courseMatchingSubmissions = await prisma.formSubmission.findMany({
      where: { type: "COURSE_MATCHING" },
      select: {
        id: true,
        data: true,
      },
    });

    // Create a map to group course matching by basic info
    const courseMatchingByBasicInfo = new Map();
    courseMatchingSubmissions.forEach((submission) => {
      const submissionData = submission.data as any;
      if (submissionData.basicInfoId) {
        courseMatchingByBasicInfo.set(
          submissionData.basicInfoId,
          submission.data,
        );
      }
    });

    // Group submissions by university
    const universityMap = new Map();

    basicInfoSubmissions.forEach((submission) => {
      const data = submission.data as any;
      const universityName = data.hostUniversity || "Unknown University";
      const location =
        data.hostUniversityLocation ||
        data.destinationCity ||
        "Unknown Location";

      if (!universityMap.has(universityName)) {
        universityMap.set(universityName, {
          universityName,
          location,
          students: [],
          departments: new Set(),
          studyLevels: new Set(),
          cyprusUniversities: new Set(),
          courseMatches: 0,
          totalHostCourses: "",
          totalHomeCourses: "",
          submissions: [],
        });
      }

      const university = universityMap.get(universityName);
      university.students.push(submission.id);

      // Add departments
      if (data.hostDepartment) {
        university.departments.add(data.hostDepartment);
      }

      // Add study levels
      if (data.levelOfStudy) {
        university.studyLevels.add(data.levelOfStudy);
      }

      // Add Cyprus universities
      if (data.homeUniversity) {
        university.cyprusUniversities.add(data.homeUniversity);
      }

      // Check for course matching data
      const courseData = courseMatchingByBasicInfo.get(submission.id);
      if (courseData) {
        university.courseMatches++;
        if (courseData.hostCourseCount) {
          university.totalHostCourses = courseData.hostCourseCount;
        }
        if (courseData.homeCourseCount) {
          university.totalHomeCourses = courseData.homeCourseCount;
        }
      }

      university.submissions.push({
        basicInfo: data,
        courseMatching: courseData,
      });
    });

    // Convert to array and create university exchange objects
    const exchanges: UniversityExchange[] = Array.from(
      universityMap.values(),
    ).map((university: any) => {
      const country = getCountryFromLocation(university.location);
      const exchangeId = university.universityName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-");

      return {
        id: exchangeId,
        universityName: university.universityName,
        location: university.location,
        country,
        studentsCount: university.students.length,
        departments: Array.from(university.departments),
        studyLevels: Array.from(university.studyLevels),
        cyprusUniversities: Array.from(university.cyprusUniversities),
        courseMatches: university.courseMatches,
        totalHostCourses: university.totalHostCourses,
        totalHomeCourses: university.totalHomeCourses,
        image: getUniversityImage(university.universityName, country),
        description: generateUniversityDescription(university),
        highlights: generateUniversityHighlights(university),
        averageRating: calculateAverageRating(university.submissions),
        academicStrength: getAcademicStrength(university.departments),
        researchFocus: getResearchFocus(university.departments),
        languageOfInstruction: getLanguageOfInstruction(country),
        semesterOptions: [
          "Fall Semester",
          "Spring Semester",
          "Full Academic Year",
        ],
        applicationDeadline: getApplicationDeadline(country),
        establishedYear: getEstimatedEstablishedYear(university.universityName),
        worldRanking: getEstimatedRanking(
          university.universityName,
          university.students.length,
        ),
        erasmusCode: generateErasmusCode(country, university.universityName),
        contactEmail: generateContactEmail(university.universityName),
        website: generateWebsite(university.universityName),
      };
    });

    // Sort by student count (popularity)
    exchanges.sort((a, b) => b.studentsCount - a.studentsCount);

    res.status(200).json(exchanges);
  } catch (error) {
    console.error("Error fetching university exchanges:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

function getCountryFromLocation(location: string): string {
  const locationCountryMap: { [key: string]: string } = {
    berlin: "Germany",
    barcelona: "Spain",
    prague: "Czech Republic",
    amsterdam: "Netherlands",
    vienna: "Austria",
    lyon: "France",
    liepāja: "Latvia",
    vilnius: "Lithuania",
    budapest: "Hungary",
    bilbao: "Spain",
    ingolstadt: "Germany",
    limerick: "Ireland",
    modena: "Italy",
    virgo: "Spain",
    fafe: "Portugal",
    msida: "Malta",
    warsaw: "Poland",
  };

  const locationLower = location.toLowerCase();
  for (const [city, country] of Object.entries(locationCountryMap)) {
    if (locationLower.includes(city)) {
      return country;
    }
  }
  return "Unknown";
}

function getUniversityImage(universityName: string, country: string): string {
  // Generate university-specific images based on country and type
  const universityType = getUniversityType(universityName);
  return `/api/placeholder/400/300?text=${encodeURIComponent(universityName)}&bg=${getCountryColor(country)}&type=${universityType}`;
}

function getUniversityType(universityName: string): string {
  const name = universityName.toLowerCase();
  if (name.includes("technical") || name.includes("technology"))
    return "technical";
  if (name.includes("applied")) return "applied";
  if (name.includes("economics") || name.includes("business"))
    return "business";
  if (name.includes("arts") || name.includes("fine")) return "arts";
  return "general";
}

function getCountryColor(country: string): string {
  const colors: { [key: string]: string } = {
    Germany: "4A90E2",
    Spain: "E94B3C",
    "Czech Republic": "7B68EE",
    Netherlands: "FF8C00",
    Austria: "DC143C",
    France: "0055A4",
    Latvia: "9E1B32",
    Lithuania: "FDB462",
    Hungary: "477050",
    Ireland: "169B62",
    Italy: "009246",
    Portugal: "FF0000",
    Malta: "CF142B",
    Poland: "DC143C",
  };
  return colors[country] || "6B7280";
}

function generateUniversityDescription(university: any): string {
  const { universityName, location, students, departments, courseMatches } =
    university;
  const departmentList = Array.from(departments).slice(0, 3).join(", ");

  let description = `${universityName} in ${location} is a dynamic institution `;

  if (students.length > 20) {
    description += `highly popular among Erasmus students, hosting ${students.length} Cyprus students. `;
  } else if (students.length > 10) {
    description += `well-regarded by Erasmus students, with ${students.length} Cyprus participants. `;
  } else {
    description += `offering quality exchange programs for ${students.length} Cyprus students. `;
  }

  if (departments.size > 0) {
    description += `Strong academic programs in ${departmentList}${departments.size > 3 ? " and more" : ""}. `;
  }

  if (courseMatches > 0) {
    description += `Excellent course matching opportunities with ${courseMatches} successful course transfers recorded.`;
  }

  return description;
}

function generateUniversityHighlights(university: any): string[] {
  const highlights = [];
  const {
    students,
    departments,
    courseMatches,
    studyLevels,
    cyprusUniversities,
  } = university;

  if (students.length > 15) {
    highlights.push("🌟 Top Choice for Cyprus Students");
  }

  if (courseMatches > 0) {
    highlights.push("📚 Proven Course Matching Success");
  }

  if (departments.size >= 3) {
    highlights.push("🎓 Multi-Disciplinary Programs");
  }

  if (studyLevels.has("master") && studyLevels.has("bachelor")) {
    highlights.push("📈 All Study Levels Available");
  }

  if (cyprusUniversities.size > 1) {
    highlights.push("🤝 Multiple Cyprus University Partnerships");
  }

  // Add location-specific highlights
  const location = university.location.toLowerCase();
  if (location.includes("berlin")) {
    highlights.push("🏛️ Rich Historical & Cultural Scene");
  } else if (location.includes("barcelona")) {
    highlights.push("🏖️ Mediterranean Lifestyle");
  } else if (location.includes("amsterdam")) {
    highlights.push("🚲 Bike-Friendly Academic City");
  }

  return highlights.slice(0, 4);
}

function calculateAverageRating(submissions: any[]): number {
  // Generate rating based on various factors
  let totalScore = 0;
  let factors = 0;

  submissions.forEach((submission) => {
    const { basicInfo, courseMatching } = submission;

    // Factor in course matching success
    if (courseMatching) {
      if (courseMatching.courseMatchingDifficult === "Easy") {
        totalScore += 5;
      } else if (courseMatching.courseMatchingDifficult === "Medium") {
        totalScore += 4;
      } else if (courseMatching.courseMatchingDifficult === "Hard") {
        totalScore += 3;
      }
      factors++;
    }

    // Factor in general satisfaction indicators
    if (basicInfo.overallExperience) {
      if (basicInfo.overallExperience.includes("Excellent")) {
        totalScore += 5;
      } else if (basicInfo.overallExperience.includes("Good")) {
        totalScore += 4;
      } else if (basicInfo.overallExperience.includes("Average")) {
        totalScore += 3;
      }
      factors++;
    }
  });

  // Default rating based on popularity
  if (factors === 0) {
    return submissions.length > 20 ? 4.5 : submissions.length > 10 ? 4.2 : 4.0;
  }

  return Math.round((totalScore / factors) * 10) / 10;
}

function getAcademicStrength(departments: Set<string>): string {
  const deptArray = Array.from(departments);

  if (
    deptArray.some(
      (d) =>
        d.toLowerCase().includes("computer") ||
        d.toLowerCase().includes("engineering"),
    )
  ) {
    return "Technology & Engineering";
  }
  if (
    deptArray.some(
      (d) =>
        d.toLowerCase().includes("business") ||
        d.toLowerCase().includes("economics"),
    )
  ) {
    return "Business & Economics";
  }
  if (
    deptArray.some(
      (d) =>
        d.toLowerCase().includes("medicine") ||
        d.toLowerCase().includes("health"),
    )
  ) {
    return "Health & Medical Sciences";
  }
  if (
    deptArray.some(
      (d) =>
        d.toLowerCase().includes("law") || d.toLowerCase().includes("legal"),
    )
  ) {
    return "Law & Social Sciences";
  }
  if (
    deptArray.some(
      (d) =>
        d.toLowerCase().includes("art") || d.toLowerCase().includes("design"),
    )
  ) {
    return "Arts & Design";
  }

  return "Multidisciplinary";
}

function getResearchFocus(departments: Set<string>): string[] {
  const focus = [];
  const deptArray = Array.from(departments);

  deptArray.forEach((dept) => {
    const deptLower = dept.toLowerCase();
    if (deptLower.includes("computer")) focus.push("Computer Science");
    if (deptLower.includes("engineering")) focus.push("Engineering");
    if (deptLower.includes("business")) focus.push("Business Studies");
    if (deptLower.includes("medicine")) focus.push("Medical Research");
    if (deptLower.includes("psychology")) focus.push("Psychology");
    if (deptLower.includes("law")) focus.push("Legal Studies");
    if (deptLower.includes("education")) focus.push("Educational Sciences");
    if (deptLower.includes("physics")) focus.push("Physics");
    if (deptLower.includes("architecture")) focus.push("Architecture");
  });

  return focus.length > 0 ? focus.slice(0, 3) : ["Liberal Arts", "Research"];
}

function getLanguageOfInstruction(country: string): string[] {
  const languages: { [key: string]: string[] } = {
    Germany: ["German", "English"],
    Spain: ["Spanish", "English"],
    "Czech Republic": ["Czech", "English"],
    Netherlands: ["Dutch", "English"],
    Austria: ["German", "English"],
    France: ["French", "English"],
    Latvia: ["Latvian", "English"],
    Lithuania: ["Lithuanian", "English"],
    Hungary: ["Hungarian", "English"],
    Ireland: ["English"],
    Italy: ["Italian", "English"],
    Portugal: ["Portuguese", "English"],
    Malta: ["Maltese", "English"],
    Poland: ["Polish", "English"],
  };
  return languages[country] || ["English"];
}

function getApplicationDeadline(country: string): string {
  // Most European universities have similar deadlines
  return "March 15 (Fall), October 15 (Spring)";
}

function getEstimatedEstablishedYear(universityName: string): number {
  const name = universityName.toLowerCase();

  // Historic universities
  if (name.includes("charles")) return 1348;
  if (name.includes("vienna") && !name.includes("technology")) return 1365;
  if (name.includes("barcelona") && !name.includes("polytechnic")) return 1450;
  if (name.includes("amsterdam") && !name.includes("applied")) return 1632;
  if (name.includes("humboldt")) return 1810;

  // Technical universities (usually newer)
  if (name.includes("technical") || name.includes("technology")) return 1950;
  if (name.includes("applied")) return 1970;
  if (name.includes("polytechnic")) return 1960;

  // Default for general universities
  return 1920;
}

function getEstimatedRanking(
  universityName: string,
  studentCount: number,
): number | undefined {
  const name = universityName.toLowerCase();

  // Well-known universities get better rankings
  if (
    name.includes("humboldt") ||
    name.includes("charles") ||
    name.includes("vienna")
  )
    return 200;
  if (name.includes("amsterdam") && !name.includes("applied")) return 300;
  if (name.includes("barcelona") && !name.includes("polytechnic")) return 400;

  // Popularity factor
  if (studentCount > 20) return 500;
  if (studentCount > 10) return 700;

  return undefined; // No ranking data
}

function generateErasmusCode(country: string, universityName: string): string {
  const countryCodes: { [key: string]: string } = {
    Germany: "D",
    Spain: "E",
    "Czech Republic": "CZ",
    Netherlands: "NL",
    Austria: "A",
    France: "F",
    Latvia: "LV",
    Lithuania: "LT",
    Hungary: "HU",
    Ireland: "IRL",
    Italy: "I",
    Portugal: "P",
    Malta: "MT",
    Poland: "PL",
  };

  const countryCode = countryCodes[country] || "EU";
  const universityCode = universityName
    .substring(0, 10)
    .toUpperCase()
    .replace(/[^A-Z]/g, "");

  return `${countryCode} ${universityCode}01`;
}

function generateContactEmail(universityName: string): string {
  const cleanName = universityName
    .toLowerCase()
    .replace(/university|of|the/g, "")
    .replace(/[^a-z]/g, "")
    .substring(0, 10);

  return `erasmus@${cleanName}.edu`;
}

function generateWebsite(universityName: string): string {
  const cleanName = universityName
    .toLowerCase()
    .replace(/university|of|the/g, "")
    .replace(/[^a-z]/g, "")
    .substring(0, 15);

  return `https://www.${cleanName}.edu`;
}
