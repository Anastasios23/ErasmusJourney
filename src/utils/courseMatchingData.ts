import { prisma } from "../../lib/prisma";

export interface CourseMatchingExperience {
  id: string;
  studentName: string;
  homeUniversity: string;
  homeDepartment: string;
  hostUniversity: string;
  hostDepartment: string;
  hostCity: string;
  hostCountry: string;
  levelOfStudy: string;
  hostCourseCount: number;
  homeCourseCount: number;
  courseMatchingDifficult: string;
  courseMatchingChallenges?: string;
  timeSpentOnMatching?: string;
  creditsTransferredSuccessfully?: number;
  totalCreditsAttempted?: number;
  recommendCourses: string;
  recommendationReason?: string;
  overallAcademicExperience?: number;
  biggestCourseChallenge?: string;
  academicAdviceForFuture?: string;
  teachingQuality?: number;
  languageOfInstruction?: string;
  classSize?: string;
  studentSupportServices?: number;
  courseSelectionTips?: string;
  academicPreparationAdvice?: string;
  bestCoursesRecommendation?: string;
  coursesToAvoid?: string;
  hasLinkedStory?: boolean;
  hostCourses?: Array<{
    name: string;
    code?: string;
    ects: number;
    difficulty?: string;
    examTypes?: string[];
    teachingStyle?: string;
    workload?: string;
    recommendation?: string;
    type?: string;
  }>;
  equivalentCourses?: Array<{
    hostCourseName: string;
    homeCourseName: string;
    hostCourseCode?: string;
    homeCourseCode?: string;
    ects: number;
    matchQuality?: string;
    approvalDifficulty?: string;
    notes?: string;
  }>;
}

export interface CourseMatchingStats {
  totalExperiences: number;
  avgDifficulty: number;
  successRate: number;
  avgCoursesMatched: number;
  topDestinations: Array<{ name: string; count: number }>;
  topDepartments: Array<{ name: string; count: number }>;
  difficultyBreakdown: Record<string, number>;
  recommendationRate: number;
}

function asRecord(value: unknown): Record<string, any> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, any>;
}

function readString(source: Record<string, any>, keys: string[]): string {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }

  return "";
}

function readNumber(source: Record<string, any>, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string") {
      const parsed = Number.parseFloat(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return undefined;
}

function readYesNo(source: Record<string, any>, keys: string[]): string {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === "string") {
      return value;
    }

    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
  }

  return "Yes";
}

/**
 * Fetches course matching experiences from the canonical ErasmusExperience model.
 */
export async function getCourseMatchingExperiences(): Promise<{
  experiences: CourseMatchingExperience[];
  stats: CourseMatchingStats;
}> {
  try {
    const experienceRows = await prisma.erasmusExperience.findMany({
      where: {
        status: "APPROVED",
      },
      include: {
        hostUniversity: {
          select: { name: true },
        },
        homeUniversity: {
          select: { name: true },
        },
      },
      orderBy: {
        submittedAt: "desc",
      },
    });

    const experiences: CourseMatchingExperience[] = [];

    for (const row of experienceRows) {
      const courseData = asRecord(row.courses);
      const basicData = asRecord(row.basicInfo);
      const experienceData = asRecord(row.experience);

      if (Object.keys(courseData).length === 0) {
        continue;
      }

      const studentName = generateAnonymousName(row.userId);

      const homeUni =
        readString(courseData, ["homeUniversity", "universityInCyprus"]) ||
        readString(basicData, ["homeUniversity", "universityInCyprus"]) ||
        row.homeUniversity?.name ||
        "Unknown";

      const hostUni =
        readString(courseData, ["hostUniversity"]) ||
        readString(basicData, ["hostUniversity"]) ||
        row.hostUniversity?.name ||
        "Unknown";

      const courseMatches = Array.isArray(courseData.courseMatches)
        ? courseData.courseMatches
        : [];

      const hostCourses = Array.isArray(courseData.hostCourses)
        ? courseData.hostCourses
        : courseMatches.map((match: any) => ({
            name: match.hostCourse,
            code: match.hostCourseCode,
            ects: match.hostCredits || 0,
            difficulty: match.difficulty,
            workload: match.workload,
            recommendation: match.recommendation,
          }));

      const equivalentCourses = Array.isArray(courseData.equivalentCourses)
        ? courseData.equivalentCourses
        : courseMatches.map((match: any) => ({
            hostCourseName: match.hostCourse,
            homeCourseName: match.homeCourse,
            hostCourseCode: match.hostCourseCode,
            homeCourseCode: match.homeCourseCode,
            ects: match.hostCredits || 0,
            matchQuality: match.grade ? "Good" : "Unknown",
          }));

      const experience: CourseMatchingExperience = {
        id: row.id,
        studentName,
        homeUniversity: homeUni,
        homeDepartment:
          readString(courseData, ["homeDepartment", "studyProgram"]) ||
          readString(basicData, ["homeDepartment", "studyProgram"]) ||
          "Unknown",
        hostUniversity: hostUni,
        hostDepartment:
          readString(courseData, ["hostDepartment", "studyProgram"]) ||
          readString(basicData, ["hostDepartment", "studyProgram"]) ||
          "Unknown",
        hostCity:
          row.hostCity ||
          readString(courseData, ["hostCity", "city"]) ||
          readString(basicData, ["hostCity", "destinationCity", "city"]) ||
          "Unknown",
        hostCountry:
          row.hostCountry ||
          readString(courseData, ["hostCountry", "country"]) ||
          readString(basicData, ["hostCountry", "destinationCountry", "country"]) ||
          "Unknown",
        levelOfStudy:
          readString(courseData, ["levelOfStudy"]) ||
          readString(basicData, ["levelOfStudy"]) ||
          "Bachelor",
        hostCourseCount:
          readNumber(courseData, ["hostCourseCount"]) || hostCourses.length || 0,
        homeCourseCount:
          readNumber(courseData, ["homeCourseCount"]) || equivalentCourses.length || 0,
        courseMatchingDifficult: readString(courseData, ["courseMatchingDifficult"]) || "Moderate",
        courseMatchingChallenges: readString(courseData, ["courseMatchingChallenges"]) || undefined,
        timeSpentOnMatching: readString(courseData, ["timeSpentOnMatching"]) || undefined,
        creditsTransferredSuccessfully:
          readNumber(courseData, ["creditsTransferredSuccessfully"]),
        totalCreditsAttempted: readNumber(courseData, ["totalCreditsAttempted"]),
        recommendCourses: readYesNo(courseData, ["recommendCourses"]),
        recommendationReason: readString(courseData, ["recommendationReason"]) || undefined,
        overallAcademicExperience: readNumber(courseData, ["overallAcademicExperience"]),
        biggestCourseChallenge: readString(courseData, ["biggestCourseChallenge"]) || undefined,
        academicAdviceForFuture: readString(courseData, ["academicAdviceForFuture"]) || undefined,
        teachingQuality: readNumber(courseData, ["teachingQuality"]),
        languageOfInstruction: readString(courseData, ["languageOfInstruction"]) || undefined,
        classSize: readString(courseData, ["classSize"]) || undefined,
        studentSupportServices: readNumber(courseData, ["studentSupportServices"]),
        courseSelectionTips: readString(courseData, ["courseSelectionTips"]) || undefined,
        academicPreparationAdvice:
          readString(courseData, ["academicPreparationAdvice"]) || undefined,
        bestCoursesRecommendation:
          readString(courseData, ["bestCoursesRecommendation"]) || undefined,
        coursesToAvoid: readString(courseData, ["coursesToAvoid"]) || undefined,
        hasLinkedStory: Object.keys(experienceData).length > 0,
        hostCourses,
        equivalentCourses,
      };

      experiences.push(experience);
    }

    // Calculate statistics
    const stats = calculateCourseMatchingStats(experiences);

    return { experiences, stats };
  } catch (error) {
    console.error("Error fetching course matching experiences:", error);
    return { experiences: [], stats: getEmptyStats() };
  }
}

/**
 * Get course matching experiences for a specific city/university
 */
export async function getCourseMatchingExperiencesByDestination(
  city: string,
  country?: string,
  university?: string,
): Promise<CourseMatchingExperience[]> {
  try {
    const { experiences } = await getCourseMatchingExperiences();

    return experiences.filter((exp) => {
      const matchesCity = exp.hostCity.toLowerCase() === city.toLowerCase();
      const matchesCountry =
        !country || exp.hostCountry.toLowerCase() === country.toLowerCase();
      const matchesUniversity =
        !university ||
        exp.hostUniversity.toLowerCase().includes(university.toLowerCase());

      return matchesCity && matchesCountry && matchesUniversity;
    });
  } catch (error) {
    console.error(
      "Error fetching course matching experiences by destination:",
      error,
    );
    return [];
  }
}

/**
 * Generate anonymized student names for privacy
 */
function generateAnonymousName(userId: string): string {
  const firstNames = [
    "Alex",
    "Jordan",
    "Sam",
    "Taylor",
    "Casey",
    "Morgan",
    "Jamie",
    "Riley",
    "Avery",
    "Cameron",
    "Quinn",
    "Rowan",
    "Sage",
    "River",
    "Phoenix",
    "Eden",
  ];

  const lastInitials = [
    "A.",
    "B.",
    "C.",
    "D.",
    "E.",
    "F.",
    "G.",
    "H.",
    "I.",
    "J.",
    "K.",
    "L.",
    "M.",
    "N.",
    "O.",
    "P.",
  ];

  // Use user ID to generate consistent but anonymous names
  const hash = userId.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

  const firstName = firstNames[Math.abs(hash) % firstNames.length];
  const lastInitial = lastInitials[Math.abs(hash >> 4) % lastInitials.length];

  return `${firstName} ${lastInitial}`;
}

/**
 * Calculate comprehensive statistics for course matching experiences
 */
function calculateCourseMatchingStats(
  experiences: CourseMatchingExperience[],
): CourseMatchingStats {
  if (experiences.length === 0) {
    return getEmptyStats();
  }

  // Difficulty mapping for numerical calculations
  const difficultyMap: Record<string, number> = {
    "Very Easy": 1,
    Easy: 2,
    Moderate: 3,
    Difficult: 4,
    "Very Difficult": 5,
  };

  // Calculate average difficulty
  const avgDifficulty =
    experiences.reduce((sum, exp) => {
      return sum + (difficultyMap[exp.courseMatchingDifficult] || 3);
    }, 0) / experiences.length;

  // Calculate success rate (based on credit transfer)
  const experiencesWithTransferData = experiences.filter(
    (exp) => exp.creditsTransferredSuccessfully && exp.totalCreditsAttempted,
  );

  const successRate =
    experiencesWithTransferData.length > 0
      ? experiencesWithTransferData.reduce((sum, exp) => {
          return (
            sum +
            (exp.creditsTransferredSuccessfully! / exp.totalCreditsAttempted!) *
              100
          );
        }, 0) / experiencesWithTransferData.length
      : 0;

  // Calculate average courses matched
  const avgCoursesMatched =
    experiences.reduce((sum, exp) => {
      return sum + exp.homeCourseCount;
    }, 0) / experiences.length;

  // Top destinations
  const destinationCounts = new Map<string, number>();
  experiences.forEach((exp) => {
    const destination = `${exp.hostCity}, ${exp.hostCountry}`;
    destinationCounts.set(
      destination,
      (destinationCounts.get(destination) || 0) + 1,
    );
  });

  const topDestinations = Array.from(destinationCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Top departments
  const departmentCounts = new Map<string, number>();
  experiences.forEach((exp) => {
    departmentCounts.set(
      exp.hostDepartment,
      (departmentCounts.get(exp.hostDepartment) || 0) + 1,
    );
  });

  const topDepartments = Array.from(departmentCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Difficulty breakdown
  const difficultyBreakdown: Record<string, number> = {};
  experiences.forEach((exp) => {
    const difficulty = exp.courseMatchingDifficult;
    difficultyBreakdown[difficulty] =
      (difficultyBreakdown[difficulty] || 0) + 1;
  });

  // Recommendation rate
  const recommendationRate =
    (experiences.filter((exp) => exp.recommendCourses === "Yes").length /
      experiences.length) *
    100;

  return {
    totalExperiences: experiences.length,
    avgDifficulty,
    successRate,
    avgCoursesMatched,
    topDestinations,
    topDepartments,
    difficultyBreakdown,
    recommendationRate,
  };
}

/**
 * Get empty stats structure
 */
function getEmptyStats(): CourseMatchingStats {
  return {
    totalExperiences: 0,
    avgDifficulty: 0,
    successRate: 0,
    avgCoursesMatched: 0,
    topDestinations: [],
    topDepartments: [],
    difficultyBreakdown: {},
    recommendationRate: 0,
  };
}

/**
 * Get course matching insights for a specific destination
 */
export async function getCourseMatchingInsights(city: string, country: string) {
  try {
    const experiences = await getCourseMatchingExperiencesByDestination(
      city,
      country,
    );

    if (experiences.length === 0) {
      return null;
    }

    const stats = calculateCourseMatchingStats(experiences);

    // Additional insights specific to this destination
    const commonChallenges = extractCommonChallenges(experiences);
    const bestAdvice = extractBestAdvice(experiences);
    const departmentInsights = calculateDepartmentInsights(experiences);

    return {
      ...stats,
      experiences: experiences.slice(0, 6), // Latest 6 experiences
      commonChallenges,
      bestAdvice,
      departmentInsights,
    };
  } catch (error) {
    console.error("Error getting course matching insights:", error);
    return null;
  }
}

/**
 * Extract common challenges from experiences
 */
function extractCommonChallenges(
  experiences: CourseMatchingExperience[],
): string[] {
  const challenges: string[] = [];

  experiences.forEach((exp) => {
    if (exp.courseMatchingChallenges) {
      challenges.push(exp.courseMatchingChallenges);
    }
    if (exp.biggestCourseChallenge) {
      challenges.push(exp.biggestCourseChallenge);
    }
  });

  // Return most common challenges (simplified - could use better text analysis)
  return challenges.slice(0, 3);
}

/**
 * Extract best advice from experiences
 */
function extractBestAdvice(experiences: CourseMatchingExperience[]): string[] {
  const advice: string[] = [];

  experiences.forEach((exp) => {
    if (exp.academicAdviceForFuture) {
      advice.push(exp.academicAdviceForFuture);
    }
    if (exp.courseSelectionTips) {
      advice.push(exp.courseSelectionTips);
    }
    if (exp.academicPreparationAdvice) {
      advice.push(exp.academicPreparationAdvice);
    }
  });

  return advice.slice(0, 3);
}

/**
 * Calculate insights by department
 */
function calculateDepartmentInsights(experiences: CourseMatchingExperience[]) {
  const departmentData = new Map<
    string,
    {
      count: number;
      avgDifficulty: number;
      avgSuccess: number;
      difficulties: string[];
    }
  >();

  const difficultyMap: Record<string, number> = {
    "Very Easy": 1,
    Easy: 2,
    Moderate: 3,
    Difficult: 4,
    "Very Difficult": 5,
  };

  experiences.forEach((exp) => {
    const dept = exp.hostDepartment;
    if (!departmentData.has(dept)) {
      departmentData.set(dept, {
        count: 0,
        avgDifficulty: 0,
        avgSuccess: 0,
        difficulties: [],
      });
    }

    const data = departmentData.get(dept)!;
    data.count++;
    data.difficulties.push(exp.courseMatchingDifficult);
  });

  // Calculate averages
  departmentData.forEach((data, dept) => {
    data.avgDifficulty =
      data.difficulties.reduce((sum, diff) => {
        return sum + (difficultyMap[diff] || 3);
      }, 0) / data.difficulties.length;
  });

  return Array.from(departmentData.entries()).map(([name, data]) => ({
    department: name,
    studentCount: data.count,
    avgDifficulty: Math.round(data.avgDifficulty * 10) / 10,
  }));
}
