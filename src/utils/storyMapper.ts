import { Story } from "../hooks/useStories";

export interface LegacyStory {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  imageUrl: string | null;
  photos: Array<{
    id: string;
    image: string;
    caption: string;
    location: string;
    description: string;
  }>;
  location: {
    city?: string;
    country?: string;
    university?: string;
  };
  author: {
    name: string;
    university?: string;
    avatar: string;
    bio: string;
    program: string;
  };
  period?: string;
  tags: string[];
  likes: number;
  views: number;
  comments: number;
  readingTime: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Maps new student story format to legacy story format for backward compatibility
 */
export function mapStudentStoryToLegacy(story: Story): LegacyStory {
  return {
    id: story.id,
    title: story.title || `${story.studentName}'s Experience in ${story.city}`,
    content: story.content || story.story || "",
    excerpt: story.excerpt || story.story?.substring(0, 200) + "..." || "",
    imageUrl: story.imageUrl || null,
    photos: story.photos || [],
    location: {
      city: story.location?.city || story.city,
      country: story.location?.country || story.country,
      university: story.location?.university || story.university,
    },
    author: {
      name: story.author?.name || story.studentName || "Anonymous",
      university: story.author?.university || story.university,
      avatar:
        story.author?.avatar ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(story.studentName || "anonymous")}`,
      bio: story.author?.bio || `Student from ${story.university}`,
      program: story.author?.program || story.levelOfStudy || "Student",
    },
    period: story.period || story.exchangePeriod,
    tags: story.tags || story.helpTopics || [],
    likes: story.likes || 0,
    views: story.views || 0,
    comments: story.comments || 0,
    readingTime:
      story.readingTime ||
      Math.ceil((story.story || "").split(" ").length / 200),
    featured: story.featured || false,
    createdAt: story.createdAt,
    updatedAt: story.updatedAt || story.createdAt,
  };
}

/**
 * Checks if a story is in the new format (from student-stories API)
 */
export function isNewStudentStoryFormat(story: any): story is Story {
  return story.studentName !== undefined || story.helpTopics !== undefined;
}
