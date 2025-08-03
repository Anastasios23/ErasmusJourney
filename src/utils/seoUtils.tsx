import Head from "next/head";
import { StudentStoryResponse } from "../types/studentStories";

interface StoryMetaTagsProps {
  story: StudentStoryResponse;
  baseUrl?: string;
}

export function StoryMetaTags({
  story,
  baseUrl = "https://erasmusjourney.com",
}: StoryMetaTagsProps) {
  const title = `${story.studentName}'s Experience in ${story.city} - Erasmus Journey`;
  const description =
    story.story.length > 160
      ? story.story.substring(0, 157) + "..."
      : story.story;

  const url = `${baseUrl}/stories/${story.id}`;
  const imageUrl = `${baseUrl}/api/og/story/${story.id}`;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="article" />
      <meta property="og:image" content={imageUrl} />
      <meta
        property="og:image:alt"
        content={`${story.studentName}'s story from ${story.city}`}
      />
      <meta property="og:site_name" content="Erasmus Journey" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {/* Article-specific Tags */}
      <meta property="article:published_time" content={story.createdAt} />
      <meta property="article:author" content={story.studentName} />
      <meta property="article:section" content="Student Stories" />
      {story.helpTopics.map((topic, index) => (
        <meta key={index} property="article:tag" content={topic} />
      ))}

      {/* Location Tags */}
      <meta name="geo.placename" content={`${story.city}, ${story.country}`} />
      <meta name="geo.region" content={story.country} />

      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content={story.studentName} />
      <meta
        name="keywords"
        content={`erasmus, ${story.city}, ${story.country}, ${story.university}, study abroad, ${story.helpTopics.join(", ")}`}
      />
    </Head>
  );
}

interface StoriesListMetaTagsProps {
  totalStories: number;
  baseUrl?: string;
}

export function StoriesListMetaTags({
  totalStories,
  baseUrl = "https://erasmusjourney.com",
}: StoriesListMetaTagsProps) {
  const title = "Student Stories - Real Erasmus Experiences | Erasmus Journey";
  const description = `Read ${totalStories}+ inspiring stories from Erasmus students. Get insights, tips, and motivation for your study abroad journey.`;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={`${baseUrl}/student-stories`} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={`${baseUrl}/student-stories`} />
      <meta property="og:type" content="website" />
      <meta
        property="og:image"
        content={`${baseUrl}/images/student-stories-og.jpg`}
      />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />

      <meta name="robots" content="index, follow" />
      <meta
        name="keywords"
        content="erasmus stories, study abroad experiences, student testimonials, erasmus tips"
      />
    </Head>
  );
}

/**
 * Generate structured data for a student story
 */
export function generateStoryStructuredData(
  story: StudentStoryResponse,
  baseUrl = "https://erasmusjourney.com",
) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${story.studentName}'s Experience in ${story.city}`,
    description: story.story.substring(0, 200),
    image: `${baseUrl}/api/og/story/${story.id}`,
    author: {
      "@type": "Person",
      name: story.studentName,
      affiliation: {
        "@type": "EducationalOrganization",
        name: story.university,
      },
    },
    publisher: {
      "@type": "Organization",
      name: "Erasmus Journey",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.png`,
      },
    },
    datePublished: story.createdAt,
    dateModified: story.createdAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/stories/${story.id}`,
    },
    about: {
      "@type": "Place",
      name: `${story.city}, ${story.country}`,
      address: {
        "@type": "PostalAddress",
        addressLocality: story.city,
        addressCountry: story.country,
      },
    },
    keywords: story.helpTopics.join(", "),
    articleSection: "Student Stories",
    wordCount: story.story.split(" ").length,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

/**
 * Generate URL slug from story data
 */
export function generateStorySlug(story: StudentStoryResponse): string {
  const base = `${story.studentName}-${story.city}-${story.country}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${base}-${story.id.slice(-8)}`;
}
