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

/**
 * Fetches course matching experiences from form submissions
 */
export async function getCourseMatchingExperiences(): Promise<{
  experiences: CourseMatchingExperience[];
  stats: CourseMatchingStats;
}> {
  try {
    // Get all published course matching submissions
    const courseMatchingSubmissions = await prisma.formSubmission.findMany({
      where: {
        type: "COURSE_MATCHING",
        status: "PUBLISHED",
      },
      include: {
        user: {
          include: {
            formSubmissions: {
              where: {
                status: "PUBLISHED",
                type: "BASIC_INFO",
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const experiences: CourseMatchingExperience[] = [];

    for (const submission of courseMatchingSubmissions) {
      const courseData = submission.data as any;

      // Get linked basic info for additional student details
      const basicInfo = submission.user?.formSubmissions.find(
        (s) => s.type === "BASIC_INFO"
      );
      const basicData = basicInfo?.data as any;

      // Check if user has linked experience/story submissions
      const hasLinkedStory = submission.user?.formSubmissions.some(
        (s) => s.type === "EXPERIENCE" || s.type === "STORY"
      ) || false;

      // Create anonymized student name
      const studentName = generateAnonymousName(submission.userId);

      // Ensure we have required fields
      if (!courseData.hostUniversity || !courseData.homeUniversity) {
        continue;
      }

      const experience: CourseMatchingExperience = {
        id: submission.id,
        studentName,
        homeUniversity: courseData.homeUniversity || basicData?.homeUniversity || "Unknown",
        homeDepartment: courseData.homeDepartment || basicData?.homeDepartment || "Unknown",
        hostUniversity: courseData.hostUniversity || basicData?.hostUniversity || "Unknown",
        hostDepartment: courseData.hostDepartment || basicData?.hostDepartment || "Unknown",
        hostCity: basicData?.hostCity || basicData?.destinationCity || "Unknown",
        hostCountry: basicData?.hostCountry || basicData?.destinationCountry || "Unknown",
        levelOfStudy: courseData.levelOfStudy || basicData?.levelOfStudy || "Bachelor",
        hostCourseCount: courseData.hostCourseCount || 0,
        homeCourseCount: courseData.homeCourseCount || 0,
        courseMatchingDifficult: courseData.courseMatchingDifficult || "Moderate",
        courseMatchingChallenges: courseData.courseMatchingChallenges,
        timeSpentOnMatching: courseData.timeSpentOnMatching,
        creditsTransferredSuccessfully: courseData.creditsTransferredSuccessfully,
        totalCreditsAttempted: courseData.totalCreditsAttempted,
        recommendCourses: courseData.recommendCourses || "Yes",
        recommendationReason: courseData.recommendationReason,
        overallAcademicExperience: courseData.overallAcademicExperience,
        biggestCourseChallenge: courseData.biggestCourseChallenge,
        academicAdviceForFuture: courseData.academicAdviceForFuture,
        teachingQuality: courseData.teachingQuality,
        languageOfInstruction: courseData.languageOfInstruction,
        classSize: courseData.classSize,
        studentSupportServices: courseData.studentSupportServices,
        courseSelectionTips: courseData.courseSelectionTips,
        academicPreparationAdvice: courseData.academicPreparationAdvice,
        bestCoursesRecommendation: courseData.bestCoursesRecommendation,
        coursesToAvoid: courseData.coursesToAvoid,
        hasLinkedStory,
        hostCourses: courseData.hostCourses || [],
        equivalentCourses: courseData.equivalentCourses || [],
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
  university?: string
): Promise<CourseMatchingExperience[]> {
  try {
    const { experiences } = await getCourseMatchingExperiences();

    return experiences.filter(exp => {
      const matchesCity = exp.hostCity.toLowerCase() === city.toLowerCase();
      const matchesCountry = !country || exp.hostCountry.toLowerCase() === country.toLowerCase();
      const matchesUniversity = !university || exp.hostUniversity.toLowerCase().includes(university.toLowerCase());

      return matchesCity && matchesCountry && matchesUniversity;
    });
  } catch (error) {
    console.error("Error fetching course matching experiences by destination:", error);
    return [];
  }
}

/**
 * Generate anonymized student names for privacy
 */
function generateAnonymousName(userId: string): string {
  const firstNames = [
    "Alex", "Jordan", "Sam", "Taylor", "Casey", "Morgan", "Jamie", "Riley",
    "Avery", "Cameron", "Quinn", "Rowan", "Sage", "River", "Phoenix", "Eden"
  ];

  const lastInitials = ["A.", "B.", "C.", "D.", "E.", "F.", "G.", "H.", "I.", "J.", "K.", "L.", "M.", "N.", "O.", "P."];

  // Use user ID to generate consistent but anonymous names
  const hash = userId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);

  const firstName = firstNames[Math.abs(hash) % firstNames.length];
  const lastInitial = lastInitials[Math.abs(hash >> 4) % lastInitials.length];

  return `${firstName} ${lastInitial}`;
}

/**
 * Calculate comprehensive statistics for course matching experiences
 */
function calculateCourseMatchingStats(experiences: CourseMatchingExperience[]): CourseMatchingStats {
  if (experiences.length === 0) {
    return getEmptyStats();
  }

  // Difficulty mapping for numerical calculations
  const difficultyMap: Record<string, number> = {
    "Very Easy": 1,
    "Easy": 2,
    "Moderate": 3,
    "Difficult": 4,
    "Very Difficult": 5,
  };

  // Calculate average difficulty
  const avgDifficulty = experiences.reduce((sum, exp) => {
    return sum + (difficultyMap[exp.courseMatchingDifficult] || 3);
  }, 0) / experiences.length;

  // Calculate success rate (based on credit transfer)
  const experiencesWithTransferData = experiences.filter(
    exp => exp.creditsTransferredSuccessfully && exp.totalCreditsAttempted
  );

  const successRate = experiencesWithTransferData.length > 0
    ? experiencesWithTransferData.reduce((sum, exp) => {
        return sum + ((exp.creditsTransferredSuccessfully! / exp.totalCreditsAttempted!) * 100);
      }, 0) / experiencesWithTransferData.length
    : 0;

  // Calculate average courses matched
  const avgCoursesMatched = experiences.reduce((sum, exp) => {
    return sum + exp.homeCourseCount;
  }, 0) / experiences.length;

  // Top destinations
  const destinationCounts = new Map<string, number>();
  experiences.forEach(exp => {
    const destination = `${exp.hostCity}, ${exp.hostCountry}`;
    destinationCounts.set(destination, (destinationCounts.get(destination) || 0) + 1);
  });

  const topDestinations = Array.from(destinationCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Top departments
  const departmentCounts = new Map<string, number>();
  experiences.forEach(exp => {
    departmentCounts.set(exp.hostDepartment, (departmentCounts.get(exp.hostDepartment) || 0) + 1);
  });

  const topDepartments = Array.from(departmentCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Difficulty breakdown
  const difficultyBreakdown: Record<string, number> = {};
  experiences.forEach(exp => {
    const difficulty = exp.courseMatchingDifficult;
    difficultyBreakdown[difficulty] = (difficultyBreakdown[difficulty] || 0) + 1;
  });

  // Recommendation rate
  const recommendationRate = (experiences.filter(exp => exp.recommendCourses === "Yes").length / experiences.length) * 100;

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
    const experiences = await getCourseMatchingExperiencesByDestination(city, country);

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
function extractCommonChallenges(experiences: CourseMatchingExperience[]): string[] {
  const challenges: string[] = [];

  experiences.forEach(exp => {
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

  experiences.forEach(exp => {
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
  const departmentData = new Map<string, {
    count: number;
    avgDifficulty: number;
    avgSuccess: number;
    difficulties: string[];
  }>();

  const difficultyMap: Record<string, number> = {
    "Very Easy": 1,
    "Easy": 2,
    "Moderate": 3,
    "Difficult": 4,
    "Very Difficult": 5,
  };

  experiences.forEach(exp => {
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
    data.avgDifficulty = data.difficulties.reduce((sum, diff) => {
      return sum + (difficultyMap[diff] || 3);
    }, 0) / data.difficulties.length;
  });

  return Array.from(departmentData.entries()).map(([name, data]) => ({
    department: name,
    studentCount: data.count,
    avgDifficulty: Math.round(data.avgDifficulty * 10) / 10,
  }));
}
