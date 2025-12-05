import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { city, country, university } = req.query;

  if (!city || !country) {
    return res.status(400).json({ message: 'City and country are required' });
  }

  try {
    const whereClause: any = {
      hostCity: { equals: city as string, mode: 'insensitive' },
      hostCountry: { equals: country as string, mode: 'insensitive' },
      isComplete: true,
      status: { notIn: ['DRAFT', 'REJECTED'] },
    };

    if (university) {
      // Try to match by university name or ID
      // Since we might receive a name, we need to handle that
      // But usually it's better to filter by ID if possible. 
      // For now, let's assume we might get a name and we want to filter experiences 
      // that are linked to a university with that name OR have the name stored directly if that's how it works.
      // Looking at schema: hostUniversityId is a relation.
      // If university param is an ID (cuid), use hostUniversityId.
      // If it's a name, we might need to find the university first or filter by relation.
      
      // Simple heuristic: if it looks like a CUID (25 chars alphanumeric), assume ID.
      // Otherwise assume name.
      const isCuid = (university as string).length === 25 && !((university as string).includes(' '));
      
      if (isCuid) {
         whereClause.hostUniversityId = university;
      } else {
         whereClause.hostUniversity = {
            name: { contains: university as string, mode: 'insensitive' }
         };
      }
    }

    const experiences = await prisma.erasmusExperience.findMany({
      where: whereClause,
      include: {
        hostUniversity: true,
        homeUniversity: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Aggregate data
    const totalExperiences = experiences.length;
    
    // Calculate stats
    let totalDifficulty = 0;
    let difficultyCount = 0;
    let totalCoursesMatched = 0;
    let totalSuccessRate = 0;
    let totalRecommendationRate = 0;
    
    const difficultyBreakdown: Record<string, number> = {
      '1': 0, '2': 0, '3': 0, '4': 0, '5': 0
    };
    
    const commonChallengesSet = new Set<string>();
    const topAdviceSet = new Set<string>();
    const departmentStats: Record<string, { count: number, difficultySum: number, successSum: number }> = {};

    const processedExperiences = experiences.map(exp => {
      const coursesData = exp.courses as any || {};
      const experienceData = exp.experience as any || {};
      
      // Difficulty
      const difficulty = parseInt(coursesData.academicDifficulty || '0');
      if (difficulty > 0) {
        totalDifficulty += difficulty;
        difficultyCount++;
        difficultyBreakdown[difficulty.toString()] = (difficultyBreakdown[difficulty.toString()] || 0) + 1;
      }

      // Success Rate (courses matched / total courses)
      const hostCourses = coursesData.hostCourses || [];
      const matchedCourses = coursesData.equivalentCourses || [];
      const matchCount = matchedCourses.length;
      const totalCount = hostCourses.length;
      
      let successRate = 0;
      if (totalCount > 0) {
        successRate = (matchCount / totalCount) * 100;
        totalSuccessRate += successRate;
      }
      totalCoursesMatched += matchCount;

      // Recommendation
      const wouldRecommend = experienceData.wouldRecommend || false;
      if (wouldRecommend) totalRecommendationRate++;

      // Challenges & Advice
      if (coursesData.courseMatchingChallenges) commonChallengesSet.add(coursesData.courseMatchingChallenges);
      if (coursesData.academicAdviceForFuture) topAdviceSet.add(coursesData.academicAdviceForFuture);

      // Department Stats
      const dept = (exp.basicInfo as any)?.hostDepartment || 'Unknown';
      if (!departmentStats[dept]) {
        departmentStats[dept] = { count: 0, difficultySum: 0, successSum: 0 };
      }
      departmentStats[dept].count++;
      if (difficulty > 0) departmentStats[dept].difficultySum += difficulty;
      departmentStats[dept].successSum += successRate;

      return {
        id: exp.id,
        studentName: (exp.basicInfo as any)?.firstName || 'Anonymous',
        homeUniversity: exp.homeUniversity?.name || (exp.basicInfo as any)?.homeUniversity || 'Unknown',
        homeDepartment: (exp.basicInfo as any)?.homeDepartment || 'Unknown',
        hostUniversity: exp.hostUniversity?.name || (exp.basicInfo as any)?.hostUniversity || 'Unknown',
        hostDepartment: dept,
        levelOfStudy: (exp.basicInfo as any)?.studyLevel || 'Unknown',
        hostCourseCount: totalCount,
        homeCourseCount: matchCount,
        courseMatchingDifficult: coursesData.courseMatchingDifficult || 'Neutral',
        courseMatchingChallenges: coursesData.courseMatchingChallenges,
        recommendCourses: coursesData.recommendCourses || 'Yes',
        hostCourses: hostCourses,
        equivalentCourses: matchedCourses,
      };
    });

    const avgDifficulty = difficultyCount > 0 ? totalDifficulty / difficultyCount : 0;
    const avgSuccessRate = totalExperiences > 0 ? totalSuccessRate / totalExperiences : 0;
    const avgCoursesMatched = totalExperiences > 0 ? totalCoursesMatched / totalExperiences : 0;
    const recommendationRate = totalExperiences > 0 ? (totalRecommendationRate / totalExperiences) * 100 : 0;

    const departmentInsights = Object.entries(departmentStats).map(([dept, stats]) => ({
      department: dept,
      studentCount: stats.count,
      avgDifficulty: stats.difficultySum / stats.count || 0,
      avgSuccess: stats.successSum / stats.count || 0,
    })).sort((a, b) => b.studentCount - a.studentCount);

    const insights = {
      totalExperiences,
      avgDifficulty,
      difficultyBreakdown,
      avgCoursesMatched,
      avgCreditsTransferred: 0, // Placeholder
      successRate: avgSuccessRate,
      recommendationRate,
      commonChallenges: Array.from(commonChallengesSet).slice(0, 5),
      topAdvice: Array.from(topAdviceSet).slice(0, 5),
      departmentInsights,
      experiences: processedExperiences,
    };

    res.status(200).json({ insights });
  } catch (error) {
    console.error('Error fetching course matching insights:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
