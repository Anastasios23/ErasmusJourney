import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  nationality?: string;
  homeCity?: string;
  homeCountry?: string;
  profileCompletion: number;
  joinDate: Date;
  totalSubmissions: number;
  submissionTypes: string[];
  favoriteDestinations: string[];
  achievements: Array<{
    type: string;
    title: string;
    description: string;
    earnedAt: Date;
  }>;
}

interface UserActivity {
  recentSubmissions: Array<{
    id: string;
    type: string;
    title: string;
    createdAt: Date;
    status: string;
  }>;
  engagements: Array<{
    type: "LIKE" | "BOOKMARK" | "COMMENT" | "VIEW";
    targetId: string;
    targetType: "STORY" | "SUBMISSION";
    createdAt: Date;
  }>;
  streakDays: number;
  totalPoints: number;
}

// Hook for user profile data
export function useUserProfile(userId?: string) {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const targetUserId = userId || session?.user?.id;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!targetUserId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/users/${targetUserId}/profile`);
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [targetUserId]);

  return { profile, loading };
}

// Hook for user activity data
export function useUserActivity(userId?: string) {
  const { data: session } = useSession();
  const [activity, setActivity] = useState<UserActivity | null>(null);
  const [loading, setLoading] = useState(true);

  const targetUserId = userId || session?.user?.id;

  useEffect(() => {
    const fetchActivity = async () => {
      if (!targetUserId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/users/${targetUserId}/activity`);
        if (response.ok) {
          const data = await response.json();
          setActivity(data);
        }
      } catch (error) {
        console.error("Error fetching user activity:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [targetUserId]);

  return { activity, loading };
}

// Calculate profile completion percentage
export function calculateProfileCompletion(user: any): number {
  const fields = [
    "firstName",
    "lastName",
    "email",
    "nationality",
    "homeCity",
    "homeCountry",
    "image",
  ];

  const completedFields = fields.filter((field) => {
    const value = user[field];
    return value && value.trim && value.trim().length > 0;
  });

  return Math.round((completedFields.length / fields.length) * 100);
}

// Generate user achievements based on activity
export function generateUserAchievements(
  submissionCount: number,
  engagementCount: number,
  streakDays: number,
): Array<{ type: string; title: string; description: string; earnedAt: Date }> {
  const achievements = [];

  if (submissionCount >= 1) {
    achievements.push({
      type: "FIRST_SUBMISSION",
      title: "First Steps",
      description: "Submitted your first form",
      earnedAt: new Date(),
    });
  }

  if (submissionCount >= 5) {
    achievements.push({
      type: "ACTIVE_CONTRIBUTOR",
      title: "Active Contributor",
      description: "Submitted 5 forms",
      earnedAt: new Date(),
    });
  }

  if (engagementCount >= 10) {
    achievements.push({
      type: "COMMUNITY_MEMBER",
      title: "Community Member",
      description: "Engaged with 10 stories",
      earnedAt: new Date(),
    });
  }

  if (streakDays >= 7) {
    achievements.push({
      type: "WEEK_STREAK",
      title: "Week Warrior",
      description: "Active for 7 consecutive days",
      earnedAt: new Date(),
    });
  }

  return achievements;
}

// Hook for global user statistics
export function useUserStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    topContributors: [] as Array<{
      id: string;
      name: string;
      submissionCount: number;
      points: number;
    }>,
    countryDistribution: [] as Array<{
      country: string;
      userCount: number;
    }>,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/users/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching user stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading };
}
