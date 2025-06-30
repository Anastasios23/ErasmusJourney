import { useState } from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Header from "../../components/Header";
import { Button } from "../../src/components/ui/button";
import { Badge } from "../../src/components/ui/badge";
import { Card, CardContent } from "../../src/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../src/components/ui/avatar";
import { Separator } from "../../src/components/ui/separator";
import {
  ArrowLeft,
  Heart,
  Eye,
  Calendar,
  Share2,
  MessageSquare,
  Flag,
  Bookmark,
  MapPin,
  GraduationCap,
  Clock,
} from "lucide-react";

interface StoryDetail {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: {
    firstName: string;
    lastName: string;
    avatar: string;
    bio: string;
    university: string;
    program: string;
  };
  university: string;
  country: string;
  city: string;
  category: string;
  tags: string[];
  likes: number;
  views: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
  image: string;
  readingTime: number;
  featured: boolean;
  relatedStories: Array<{
    id: string;
    title: string;
    excerpt: string;
    author: string;
    image: string;
    category: string;
  }>;
}

interface StoryDetailPageProps {
  story: StoryDetail | null;
}

export default function StoryDetailPage({ story }: StoryDetailPageProps) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  if (!story) {
    return (
      <>
        <Head>
          <title>Story Not Found - Erasmus Journey Platform</title>
        </Head>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="pt-20 pb-16 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Story Not Found
              </h1>
              <p className="text-gray-600 mb-6">
                The story you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/student-stories">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Stories
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: story.title,
          text: story.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const formatContent = (content: string) => {
    return content.split("\n\n").map((paragraph, index) => (
      <p key={index} className="mb-4 leading-relaxed">
        {paragraph}
      </p>
    ));
  };

  return (
    <>
      <Head>
        <title>{story.title} - Erasmus Journey Platform</title>
        <meta name="description" content={story.excerpt} />
        <meta property="og:title" content={story.title} />
        <meta property="og:description" content={story.excerpt} />
        <meta property="og:image" content={story.image} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="pt-20 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Back Navigation */}
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Stories
              </Button>
            </div>

            {/* Article Header */}
            <article className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Hero Image */}
              <div className="aspect-video overflow-hidden">
                <img
                  src={story.image}
                  alt={story.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="p-8">
                {/* Meta Info */}
                <div className="mb-6">
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <Badge variant="secondary">{story.category}</Badge>
                    {story.featured && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        Featured
                      </Badge>
                    )}
                    {story.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {story.city}, {story.country}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" />
                      <span>{story.university}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{story.readingTime} min read</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(story.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                  {story.title}
                </h1>

                {/* Author Info */}
                <div className="flex items-center justify-between mb-8 pb-6 border-b">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={story.author.avatar} />
                      <AvatarFallback>
                        {story.author.firstName[0]}
                        {story.author.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-lg">
                        {story.author.firstName} {story.author.lastName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {story.author.program} at {story.author.university}
                      </div>
                      <div className="text-sm text-gray-500">
                        {story.author.bio}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsLiked(!isLiked)}
                      className={isLiked ? "text-red-500 border-red-500" : ""}
                    >
                      <Heart
                        className={`h-4 w-4 mr-1 ${isLiked ? "fill-current" : ""}`}
                      />
                      {story.likes + (isLiked ? 1 : 0)}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsBookmarked(!isBookmarked)}
                      className={
                        isBookmarked ? "text-blue-500 border-blue-500" : ""
                      }
                    >
                      <Bookmark
                        className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`}
                      />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Story Content */}
                <div className="prose prose-lg max-w-none mb-8">
                  {formatContent(story.content)}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm text-gray-600 mb-8">
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span>{story.likes} likes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{story.views} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{story.comments} comments</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-6 border-t">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsLiked(!isLiked)}
                      className={isLiked ? "text-red-500 border-red-500" : ""}
                    >
                      <Heart
                        className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`}
                      />
                      {isLiked ? "Liked" : "Like"}
                    </Button>
                    <Button variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Comment
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm">
                      <Flag className="h-4 w-4 mr-1" />
                      Report
                    </Button>
                  </div>
                </div>
              </div>
            </article>

            {/* Related Stories */}
            {story.relatedStories.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Related Stories
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {story.relatedStories.map((relatedStory) => (
                    <Card
                      key={relatedStory.id}
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => router.push(`/stories/${relatedStory.id}`)}
                    >
                      <div className="aspect-video overflow-hidden rounded-t-lg">
                        <img
                          src={relatedStory.image}
                          alt={relatedStory.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                      <CardContent className="pt-4">
                        <Badge variant="secondary" className="mb-2">
                          {relatedStory.category}
                        </Badge>
                        <h3 className="font-semibold mb-2 line-clamp-2">
                          {relatedStory.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {relatedStory.excerpt}
                        </p>
                        <div className="text-xs text-gray-500">
                          by {relatedStory.author}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Section */}
            <Card className="mt-12 bg-blue-50 border-blue-200">
              <CardContent className="pt-8 pb-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Share Your Erasmus Story
                </h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Have an amazing experience to share? Help future students by
                  sharing your insights, tips, and memorable moments.
                </p>
                <Link href="/share-story">
                  <Button size="lg">Share Your Story</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const { id } = params!;

  // Sample story data (in production this would come from your database)
  const sampleStories: Record<string, StoryDetail> = {
    "1": {
      id: "1",
      title: "My Amazing Semester in Barcelona: A Life-Changing Experience",
      excerpt:
        "Studying at UPC Barcelona was a life-changing experience. The city's vibrant culture, amazing architecture, and friendly locals made my Erasmus journey unforgettable.",
      content: `When I first stepped off the plane in Barcelona, I had no idea that this city would become my second home and that this semester would completely change my perspective on life.

**The First Weeks: Culture Shock and Adaptation**

The first few weeks were a whirlwind of emotions. Everything was new - the language, the food, the academic system, and even the way people socialized. I remember feeling overwhelmed but excited at the same time. The orientation week at UPC (Universitat Politècnica de Catalunya) was incredibly well-organized, and I met students from all over Europe.

**Academic Life at UPC**

The academic system in Spain was quite different from what I was used to back home. Professors were more approachable, and there was a strong emphasis on group work and practical applications. My favorite course was "Sustainable Urban Development," which included field trips around Barcelona to study the city's innovative urban planning solutions.

The engineering labs were state-of-the-art, and I had access to equipment that wasn't available at my home university. This hands-on experience was invaluable for my thesis project.

**Discovering Barcelona's Culture**

Barcelona is a city that never sleeps. From the architectural marvels of Gaudí to the vibrant nightlife in El Born, there was always something to explore. I spent countless hours wandering through Park Güell, and each visit revealed something new.

The food culture was another revelation. Tapas weren't just a meal - they were a social experience. I learned to appreciate the Spanish concept of "sobremesa" - the time spent talking after a meal, which often lasted longer than the meal itself.

**Building Lifelong Friendships**

One of the most unexpected aspects of my Erasmus experience was the deep friendships I formed. My flatmates came from Germany, Italy, and France, and we created our own little international family. We cooked together, traveled together, and supported each other through the challenges of living abroad.

I also joined the ESN (Erasmus Student Network) Barcelona, which organized trips and events. Through ESN, I traveled to Valencia, Sevilla, and even made it to Morocco for a weekend trip.

**Challenges and Growth**

Of course, it wasn't all sunshine and sangria. I faced homesickness, language barriers, and the stress of navigating a different academic system. There were moments when I questioned whether I had made the right decision.

But these challenges pushed me to grow in ways I never expected. I became more independent, more adaptable, and more confident in my ability to handle uncertainty. I learned to communicate in Spanish (and picked up some Catalan too!), and I developed a global perspective that has influenced my career choices.

**The Impact on My Future**

My semester in Barcelona didn't just expand my academic knowledge - it shaped who I am today. I returned home with a broader worldview, increased cultural sensitivity, and a network of international friends and professional contacts.

The experience also influenced my career path. I'm now working for a multinational company, and the cross-cultural communication skills I developed during my Erasmus have been invaluable.

**Advice for Future Erasmus Students**

If you're considering an Erasmus exchange, my advice is simple: do it. Don't let fear or uncertainty hold you back. Yes, there will be challenges, but the personal and professional growth you'll experience is worth every moment of discomfort.

Be open to new experiences, embrace the differences you encounter, and remember that feeling lost or confused is part of the journey. Some of my best memories came from situations that initially seemed overwhelming.

**Final Thoughts**

Barcelona will always have a special place in my heart. It's where I discovered my passion for sustainable urban development, where I learned to appreciate different cultures, and where I realized that home isn't just a place - it's the people you surround yourself with.

If you're thinking about studying abroad, don't hesitate. The world is waiting for you to explore it.`,
      author: {
        firstName: "Maria",
        lastName: "K.",
        avatar:
          "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop&crop=face",
        bio: "Environmental Engineering student passionate about sustainable urban development",
        university: "Universitat Politècnica de Catalunya",
        program: "Environmental Engineering",
      },
      university: "Universitat Politècnica de Catalunya",
      country: "Spain",
      city: "Barcelona",
      category: "EXPERIENCE",
      tags: [
        "Barcelona",
        "Engineering",
        "Culture",
        "Personal Growth",
        "Travel",
        "ESN",
      ],
      likes: 45,
      views: 230,
      comments: 12,
      createdAt: "2024-01-15",
      updatedAt: "2024-01-15",
      image:
        "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=400&fit=crop",
      readingTime: 8,
      featured: true,
      relatedStories: [
        {
          id: "2",
          title: "Finding the Perfect Student Accommodation in Prague",
          excerpt:
            "Tips and tricks for finding affordable, comfortable housing in Prague.",
          author: "Andreas M.",
          image:
            "https://images.unsplash.com/photo-1542324151-ee2b73cb0d95?w=400&h=200&fit=crop",
          category: "ACCOMMODATION",
        },
        {
          id: "3",
          title: "Navigating Academic Life at Sorbonne University",
          excerpt:
            "Everything you need to know about the academic system in France.",
          author: "Elena P.",
          image:
            "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&h=200&fit=crop",
          category: "ACADEMICS",
        },
      ],
    },
    "2": {
      id: "2",
      title: "Finding the Perfect Student Accommodation in Prague",
      excerpt:
        "Tips and tricks for finding affordable, comfortable housing in Prague. From dorms to shared apartments, here's what I learned during my search.",
      content: `Finding accommodation in Prague as an international student can seem daunting, but with the right approach and timing, you can find a great place to call home during your exchange.

**Starting Your Search Early**

The key to finding good accommodation in Prague is starting early. I began my search three months before my arrival, which gave me a good selection of options. Most student residences have application deadlines in spring for the autumn semester.

**Types of Accommodation Available**

Prague offers several types of student accommodation:

1. **University Dormitories**: The most affordable option, usually ranging from 150-300 EUR per month. Charles University has several dormitories, with Hvězda and Kajetánka being popular among international students.

2. **Private Student Residences**: More expensive (400-600 EUR) but often include better facilities and are located closer to the city center.

3. **Shared Apartments**: The middle ground (250-450 EUR), offering more independence while keeping costs reasonable.

4. **Studio Apartments**: The most expensive option (500-800 EUR) but gives you complete privacy and independence.

**My Experience with Student Residence**

I chose to stay at the Hvězda dormitory, and it was one of the best decisions I made. The building was recently renovated, and I had my own room with a shared kitchen and bathroom. The best part was the international community - students from over 20 countries lived there.

The residence organized regular events, from movie nights to city tours, which made it easy to meet people and settle in. The location was also perfect - just 15 minutes to the city center by tram.

**What to Look for When Choosing**

Based on my experience and that of my friends, here are the key factors to consider:

- **Location and Transport**: Prague has an excellent public transport system. Even if you're not in the center, make sure you're near a tram or metro line.
- **Included Amenities**: Check what's included - internet, utilities, cleaning services, kitchen equipment.
- **Community**: If you want to meet other students, choose residences or shared apartments with common areas.
- **Budget**: Remember to factor in utilities if they're not included.

**Practical Tips for Your Search**

1. **Use Multiple Platforms**: Don't rely on just one website. I used the university housing portal, Facebook groups, and local websites like Sreality.cz.

2. **Join Facebook Groups**: Groups like "Prague Housing for Students" and "Erasmus Prague" are goldmines for finding rooms and getting advice.

3. **Be Prepared for Quick Decisions**: Good places go fast, especially affordable ones near the center. Have your documents ready.

4. **Visit if Possible**: If you can visit Prague before moving, do it. Seeing places in person helps you make better decisions.

**Red Flags to Avoid**

During my search, I encountered some situations that taught me what to avoid:
- Requests for large deposits before viewing
- Properties significantly below market price (usually scams)
- Landlords who refuse to show the property via video call
- Contracts that seem too good to be true

**Budget Breakdown**

Here's what I spent monthly on accommodation-related expenses:
- Dormitory rent: 280 EUR
- Internet (included): 0 EUR
- Utilities (included): 0 EUR
- Laundry: 15 EUR
- Total: 295 EUR

**Living in Prague: Beyond Accommodation**

Prague quickly became one of my favorite cities. The historic center is breathtaking, but don't miss the local neighborhoods like Vinohrady and Karlín. The city has a vibrant student life, with numerous cafes, bars, and cultural events.

The cost of living is very reasonable compared to Western European capitals. A meal at a student restaurant costs around 3-5 EUR, and a beer is often cheaper than water!

**Final Advice**

Don't stress too much about finding the "perfect" place. Prague is a compact city with great public transport, so even if your first choice doesn't work out, you can always move later. The important thing is to have a place secured before you arrive.

Focus on finding somewhere safe, affordable, and well-connected to your university. The rest - the friends, the experiences, the memories - will follow naturally in this beautiful city.`,
      author: {
        firstName: "Andreas",
        lastName: "M.",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        bio: "Business student who loves exploring new cities and cultures",
        university: "Charles University",
        program: "International Business",
      },
      university: "Charles University",
      country: "Czech Republic",
      city: "Prague",
      category: "ACCOMMODATION",
      tags: ["Prague", "Housing", "Budget", "Student Life", "Tips"],
      likes: 32,
      views: 145,
      comments: 8,
      createdAt: "2024-01-10",
      updatedAt: "2024-01-10",
      image:
        "https://images.unsplash.com/photo-1542324151-ee2b73cb0d95?w=800&h=400&fit=crop",
      readingTime: 6,
      featured: false,
      relatedStories: [
        {
          id: "1",
          title: "My Amazing Semester in Barcelona",
          excerpt:
            "A life-changing experience studying at UPC Barcelona and discovering Spanish culture.",
          author: "Maria K.",
          image:
            "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400&h=200&fit=crop",
          category: "EXPERIENCE",
        },
      ],
    },
  };

  const story = sampleStories[id as string] || null;

  return {
    props: {
      story,
    },
  };
};
