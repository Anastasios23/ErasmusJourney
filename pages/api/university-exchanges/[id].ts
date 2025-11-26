import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface DepartmentData {
  name: string;
  studentsCount: number;
  students: any[];
  ratings: number[];
  studyLevels: Set<string>;
  courses: Set<string>;
  courseMatchingStats: {
    totalStudentsWithCourseData: number;
    averageDifficulty: number;
    averageECTS: number;
    commonExamTypes: Set<string>;
    studentsWhoFoundDifficult: number;
    courseMatchingChallenges: string[];
    difficultyPercentage: number;
  };
}

interface UniversityData {
  id: string;
  universityName: string;
  location: string;
  country: string;
  studentsCount: number;
  departments: Map<string, DepartmentData>;
  studyLevels: Set<string>;
  cyprusUniversities: Set<string>;
  courseMatches: number;
  ratings: number[];
  semesters: Set<string>;
  years: Set<string>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ message: "University ID is required" });
    }

    // Fetch university with all related data
    const university = await prisma.universities.findUnique({
      where: { id },
      include: {
        faculties: {
          include: {
            departments: true
          }
        },
        hostExperiences: {
          where: {
            status: { in: ["SUBMITTED", "COMPLETED", "APPROVED"] }
          },
          include: {
            courseMappings: true,
            accommodationReviews: true
          }
        }
      }
    });

    if (!university) {
      return res.status(404).json({ message: "University not found" });
    }

    // Group data by department
    const departmentsMap = new Map<string, DepartmentData>();

    // Initialize departments from DB
    university.faculties.forEach(faculty => {
      faculty.departments.forEach(dept => {
        departmentsMap.set(dept.name, {
          name: dept.name,
          studentsCount: 0,
          students: [],
          ratings: [],
          studyLevels: new Set(),
          courses: new Set(),
          courseMatchingStats: {
            totalStudentsWithCourseData: 0,
            averageDifficulty: 0,
            averageECTS: 0,
            commonExamTypes: new Set(),
            studentsWhoFoundDifficult: 0,
            courseMatchingChallenges: [],
            difficultyPercentage: 0
          }
        });
      });
    });

    const studyLevels = new Set<string>();
    const cyprusUniversities = new Set<string>();
    const semesters = new Set<string>();
    const years = new Set<string>();
    let totalRating = 0;
    let ratingCount = 0;
    let courseMatchesCount = 0;

    // Process experiences
    university.hostExperiences.forEach(exp => {
      const basicInfo = exp.basicInfo as any || {};
      const experienceData = exp.experience as any || {};
      const coursesData = exp.courses as any || {};
      
      const deptName = basicInfo.hostDepartment || "General";
      
      if (!departmentsMap.has(deptName)) {
        departmentsMap.set(deptName, {
          name: deptName,
          studentsCount: 0,
          students: [],
          ratings: [],
          studyLevels: new Set(),
          courses: new Set(),
          courseMatchingStats: {
            totalStudentsWithCourseData: 0,
            averageDifficulty: 0,
            averageECTS: 0,
            commonExamTypes: new Set(),
            studentsWhoFoundDifficult: 0,
            courseMatchingChallenges: [],
            difficultyPercentage: 0
          }
        });
      }

      const dept = departmentsMap.get(deptName)!;
      dept.studentsCount++;
      
      // Collect stats
      if (basicInfo.levelOfStudy) {
        dept.studyLevels.add(basicInfo.levelOfStudy);
        studyLevels.add(basicInfo.levelOfStudy);
      }
      if (basicInfo.homeUniversity) cyprusUniversities.add(basicInfo.homeUniversity);
      if (basicInfo.exchangePeriod) semesters.add(basicInfo.exchangePeriod);
      if (basicInfo.academicYear) years.add(basicInfo.academicYear);

      let rating = 0;
      if (experienceData.overallRating) {
        rating = parseInt(experienceData.overallRating);
        if (!isNaN(rating)) {
          dept.ratings.push(rating);
          totalRating += rating;
          ratingCount++;
        }
      }

      // Course Mappings
      const mappings = exp.courseMappings;
      let studentHasCourseData = false;
      let studentDifficulty = 0;
      let studentEcts = 0;
      let studentCoursesCount = 0;

      const detailedCourses: any[] = [];

      mappings.forEach(mapping => {
        studentHasCourseData = true;
        courseMatchesCount++;
        
        if (mapping.hostCourseName) {
          dept.courses.add(mapping.hostCourseName);
          detailedCourses.push({
            name: mapping.hostCourseName,
            code: mapping.hostCourseCode,
            ects: mapping.hostCredits,
            homeCourseName: mapping.homeCourseName,
            homeCourseCode: mapping.homeCourseCode,
            homeCourseCredits: mapping.homeCredits
          });
        }

        if (mapping.hostCredits) {
          studentEcts += mapping.hostCredits;
          studentCoursesCount++;
        }
      });

      // Update Department Course Stats
      if (studentHasCourseData) {
        dept.courseMatchingStats.totalStudentsWithCourseData++;
        
        // Extract difficulty/challenges from JSON if available (not in CourseMapping table yet)
        if (coursesData.difficulty) {
           const diffMap: any = { "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "easy": 2, "medium": 3, "hard": 4 };
           const val = diffMap[coursesData.difficulty.toString().toLowerCase()] || 3;
           dept.courseMatchingStats.averageDifficulty += val;
           if (val >= 4) dept.courseMatchingStats.studentsWhoFoundDifficult++;
        }
        
        if (studentCoursesCount > 0) {
          dept.courseMatchingStats.averageECTS += (studentEcts / studentCoursesCount);
        }
      }

      // Add Student Experience
      dept.students.push({
        studentName: basicInfo.studentName || "Anonymous Student", // Privacy?
        department: deptName,
        studyLevel: basicInfo.levelOfStudy || "Undergraduate",
        submissionId: exp.id,
        semester: basicInfo.exchangePeriod || "Fall",
        year: basicInfo.academicYear || "2024",
        rating: rating > 0 ? rating : undefined,
        courses: detailedCourses.map(c => c.name),
        detailedCourses: detailedCourses,
        testimonial: experienceData.bestExperience || experienceData.generalTips,
        // ... other fields
      });
    });

    // Finalize Department Data
    const departments = Array.from(departmentsMap.values()).map(dept => {
       const avgRating = dept.ratings.length > 0 ? dept.ratings.reduce((a, b) => a + b, 0) / dept.ratings.length : 0;
       
       // Finalize course stats
       const stats = dept.courseMatchingStats;
       if (stats.totalStudentsWithCourseData > 0) {
         stats.averageDifficulty = Math.round((stats.averageDifficulty / stats.totalStudentsWithCourseData) * 10) / 10;
         stats.averageECTS = Math.round((stats.averageECTS / stats.totalStudentsWithCourseData) * 10) / 10;
         stats.difficultyPercentage = Math.round((stats.studentsWhoFoundDifficult / stats.totalStudentsWithCourseData) * 100);
       }

       // Common courses
       const courseCounts = new Map<string, number>();
       dept.students.forEach(s => s.courses?.forEach(c => courseCounts.set(c, (courseCounts.get(c) || 0) + 1)));
       const commonCourses = Array.from(courseCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10).map(e => e[0]);

       return {
         ...dept,
         averageRating: Math.round(avgRating * 10) / 10,
         studyLevels: Array.from(dept.studyLevels),
         commonCourses,
         courseMatchingStats: {
           ...stats,
           commonExamTypes: Array.from(stats.commonExamTypes)
         }
       };
    }).sort((a, b) => b.studentsCount - a.studentsCount);

    const averageRating = ratingCount > 0 ? Math.round((totalRating / ratingCount) * 10) / 10 : 0;

    const universityDetail = {
      id: university.id,
      universityName: university.name,
      location: university.city,
      country: university.country,
      studentsCount: university.hostExperiences.length,
      departments: departments,
      studyLevels: Array.from(studyLevels),
      cyprusUniversities: Array.from(cyprusUniversities),
      courseMatches: courseMatchesCount,
      averageRating,
      image: university.imageUrl || "/placeholder.svg",
      description: university.description || `Experience at ${university.name}`,
      highlights: [], // Generate dynamically if needed
      academicStrength: departments.length > 0 ? departments[0].name : "General",
      researchFocus: [],
      languageOfInstruction: ["English"], // Placeholder or fetch from DB
      semesterOptions: Array.from(semesters),
      applicationDeadline: "Varies",
      establishedYear: 1900, // Placeholder
      erasmusCode: university.code,
      contactEmail: "contact@university.edu", // Placeholder
      website: university.website || ""
    };

    res.status(200).json(universityDetail);
  } catch (error) {
    console.error("Error fetching university details:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
