import { useState, useEffect } from "react";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { prisma } from "../../lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { Badge } from "../../src/components/ui/badge";
import { Button } from "../../src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../src/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../src/components/ui/avatar";
import { Skeleton } from "../../src/components/ui/skeleton";
import Header from "../../components/Header";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Euro,
  Globe,
  GraduationCap,
  Heart,
  Home,
  MapPin,
  MessageSquare,
  Share2,
  Star,
  ThumbsUp,
  User,
} from "lucide-react";
import { toast } from "sonner";

// This is a placeholder type. In a real app, this would be generated from your API/schema
type Story = {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  photos: { url: string; caption: string }[];
  location: {
    city: string;
    country: string;
    university: string;
  };
  author: {
    name: string;
    university: string;
  };
  period: string;
  tags: string[];
  likes: number;
  views: number;
  createdAt: string;
  updatedAt: string;
};

export const getServerSideProps: GetServerSideProps<{
  story: Story | null;
}> = async (context) => {
  const { id } = context.params!;
  try {
    // Query the database directly instead of using HTTP fetch
    const submission = await prisma.formSubmission.findUnique({
      where: { id: id as string },
    });

    if (!submission) {
      return { props: { story: null } };
    }

    const userData = await prisma.user.findUnique({
      where: { id: submission.userId },
      select: { firstName: true, email: true },
    });

    const basicInfo = await prisma.formSubmission.findFirst({
      where: {
        userId: submission.userId,
        type: "BASIC_INFO",
        status: "SUBMITTED",
      },
    });

    const accommodationInfo = await prisma.formSubmission.findFirst({
      where: {
        userId: submission.userId,
        type: "ACCOMMODATION",
        status: "SUBMITTED",
      },
    });

    const expensesInfo = await prisma.formSubmission.findFirst({
      where: {
        userId: submission.userId,
        type: "LIVING_EXPENSES",
        status: "SUBMITTED",
      },
    });

    const story = {
      id: submission.id,
      studentName: (submission.data as any).nickname || userData?.firstName || "Anonymous Student",
      university: (basicInfo?.data as any)?.hostUniversity || "Unknown University",
      city: (basicInfo?.data as any)?.hostCity || "Unknown City",
      country: (basicInfo?.data as any)?.hostCountry || "Unknown Country",
      department: (basicInfo?.data as any)?.departmentInCyprus || "Unknown Department",
      levelOfStudy: (basicInfo?.data as any)?.levelOfStudy || "Unknown Level",
      exchangePeriod: (basicInfo?.data as any)?.exchangePeriod || "Unknown Period",
      story: (submission.data as any).personalExperience || (submission.data as any).adviceForFutureStudents || "No story provided",
      tips: (submission.data as any).budgetTips || (expensesInfo?.data as any)?.overallBudgetAdvice || [],
      helpTopics: (submission.data as any).helpTopics || [],
      contactMethod: (submission.data as any).publicProfile === "yes" ? (submission.data as any).contactMethod : null,
      contactInfo: (submission.data as any).publicProfile === "yes" && (submission.data as any).contactMethod === "email" ? ((submission.data as any).email || userData?.email) : null,
      accommodationTips: (accommodationInfo?.data as any)?.additionalNotes || null,
      budgetTips: expensesInfo?.data ? {
        cheapGroceries: (expensesInfo.data as any).cheapGroceryPlaces,
        cheapEating: (expensesInfo.data as any).cheapEatingPlaces,
        transportation: (expensesInfo.data as any).transportationTips,
        socialLife: (expensesInfo.data as any).socialLifeTips,
        travel: (expensesInfo.data as any).travelTips,
        overall: (expensesInfo.data as any).overallBudgetAdvice,
      } : null,
      createdAt: submission.createdAt.toISOString(),
      isPublic: (submission.data as any).publicProfile === "yes",
    };

    return { props: { story } };
  } catch (error) {
    console.error(`Error fetching story ${id}:`, error);
    // Return a server error state
    return { props: { story: null } };
  }
};

export default function StoryDetail({
  story,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: story?.title,
          text: `Check out this Erasmus story from ${story?.location.city}!`,
          url: window.location.href,
        })
        .then(() => console.log("Successful share"))
        .catch((error) => console.log("Error sharing", error));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(story?.likes || 0);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
    toast.success(isLiked ? "Unliked!" : "You liked this story!");
  };

  if (router.isFallback) {
    return <StorySkeleton />;
  }

  if (!story) {
    return (
      <>
        <Head>
          <title>Story Not Found</title>
        </Head>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-center px-4">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Story Not Found
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Oops! We couldn't find the story you're looking for. It might have
              been moved or deleted.
            </p>
            <Link href="/student-stories">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to All Stories
              </Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{`${story.title} - Erasmus Story`}</title>
        <meta
          name="description"
          content={`Read about an Erasmus experience in ${story.location.city}, ${story.location.country}.`}
        />
      </Head>

      <div className="min-h-screen bg-white">
        <Header />

        <main className="pt-20 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <article>
              {/* Header */}
              <div className="mb-8">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="mb-4"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Stories
                </Button>
                <div className="flex flex-wrap gap-2 mb-4">
                  {story.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
                  {story.title}
                </h1>
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {story.author.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span>{story.author.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Published on{" "}
                      {new Date(story.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Main Image */}
              {story.imageUrl && (
                <div className="mb-8 rounded-lg overflow-hidden aspect-video relative">
                  <Image
                    src={story.imageUrl}
                    alt={story.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}

              {/* Story Stats */}
              <div className="flex items-center justify-between py-4 border-t border-b">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Home className="h-5 w-5 text-gray-500" />
                    <span className="text-sm">
                      Home: {story.author.university}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="h-5 w-5 text-gray-500" />
                    <span className="text-sm">
                      Host: {story.location.university}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <span className="text-sm">
                      {story.location.city}, {story.location.country}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    className={`flex items-center space-x-2 ${
                      isLiked ? "text-red-500" : ""
                    }`}
                  >
                    <ThumbsUp
                      className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`}
                    />
                    <span>{likeCount}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="flex items-center space-x-2"
                  >
                    <Share2 className="h-5 w-5" />
                    <span>Share</span>
                  </Button>
                </div>
              </div>

              {/* Story Content */}
              <div
                className="prose prose-lg max-w-none mt-8"
                dangerouslySetInnerHTML={{ __html: story.content }}
              />

              {/* Photo Gallery */}
              {story.photos && story.photos.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-2xl font-bold mb-4">Photo Gallery</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {story.photos.map((photo, index) => (
                      <div key={index} className="group relative">
                        <div className="aspect-square w-full overflow-hidden rounded-lg">
                          <Image
                            src={photo.url}
                            alt={photo.caption || `Photo ${index + 1}`}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        {photo.caption && (
                          <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 p-2 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {photo.caption}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Author Bio */}
              <div className="mt-12 pt-8 border-t">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback>
                      {story.author.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">
                      About {story.author.name}
                    </h3>
                    <p className="text-gray-600">
                      Studied at {story.author.university} and went on exchange
                      to {story.location.university} during the {story.period}{" "}
                      academic period.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                {/* CTA Section */}
                <Card className="mt-12 bg-blue-50 border-blue-200">
                  <CardContent className="pt-8 pb-8 text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Share Your Erasmus Story
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                      Have an amazing experience to share? Help future students
                      by sharing your insights, tips, and memorable moments.
                    </p>
                    <Link href="/share-story">
                      <Button size="lg">Share Your Story</Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </article>
          </div>
        </main>
      </div>
    </>
  );
}

const StorySkeleton = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <Skeleton className="h-8 w-1/4 mb-4" />
        <Skeleton className="h-12 w-3/4 mb-6" />
        <div className="flex items-center space-x-4 mb-8">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-96 w-full rounded-lg mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-5/6" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </div>
      </div>
    </div>
  );
};
