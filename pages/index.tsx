import type { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import Header from "../components/Header";
import Footer from "../src/components/Footer";
import { Button } from "../src/components/ui/button";
import { PUBLIC_DESTINATIONS_ROUTE } from "../src/lib/publicRoutes";
import { Icon } from "@iconify/react";
import type { PublicDestinationSignalTone } from "../src/lib/publicDestinationPresentation";
import {
  loadHomePagePublicData,
  type HomePageFeaturedDestinationData,
} from "../src/server/homePagePublicData";
import { PUBLIC_DESTINATION_PAGE_REVALIDATE_SECONDS } from "../src/lib/publicDestinationCache";

// ============================================================================
// TYPES
// ============================================================================
interface HomePageProps {
  publicDataAvailable: boolean;
  totalHostUniversities: number | null;
  totalApprovedSubmissions: number | null;
  totalDestinations: number | null;
  strongerSignalDestinations: number | null;
  featuredDestinations: FeaturedDestination[];
}

interface FeaturedDestination extends HomePageFeaturedDestinationData {
  city: string;
  country: string;
  slug: string;
  image: string;
  submissionCount: number;
  hostUniversityCount: number;
  signalLabel: string;
  signalTone: PublicDestinationSignalTone;
}

// City images mapping for destinations without custom imageUrl
const CITY_IMAGES: Record<string, string> = {
  barcelona:
    "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&h=600&fit=crop",
  amsterdam:
    "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&h=600&fit=crop",
  prague:
    "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=800&h=600&fit=crop",
  lisbon:
    "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800&h=600&fit=crop",
  berlin:
    "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&h=600&fit=crop",
  paris:
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop",
  rome: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=600&fit=crop",
  vienna:
    "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800&h=600&fit=crop",
  madrid:
    "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=600&fit=crop",
  munich:
    "https://images.unsplash.com/photo-1595867818082-083862f3d630?w=800&h=600&fit=crop",
  milan:
    "https://images.unsplash.com/photo-1520440229-6469a149ac59?w=800&h=600&fit=crop",
  stockholm:
    "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=800&h=600&fit=crop",
  copenhagen:
    "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=800&h=600&fit=crop",
  dublin:
    "https://images.unsplash.com/photo-1549918864-48ac978761a4?w=800&h=600&fit=crop",
  budapest:
    "https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&h=600&fit=crop",
  warsaw:
    "https://images.unsplash.com/photo-1519197924294-4ba991a11128?w=800&h=600&fit=crop",
  athens:
    "https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&h=600&fit=crop",
  krakow:
    "https://images.unsplash.com/photo-1574069810860-61b199c51a44?w=800&h=600&fit=crop",
  brussels:
    "https://images.unsplash.com/photo-1559113202-c916b8e44373?w=800&h=600&fit=crop",
  helsinki:
    "https://images.unsplash.com/photo-1538332576228-eb5b4c4de6f5?w=800&h=600&fit=crop",
};

const DEFAULT_DESTINATION_IMAGE =
  "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&h=600&fit=crop";

export default function HomePage({
  publicDataAvailable,
  totalHostUniversities,
  totalApprovedSubmissions,
  totalDestinations,
  strongerSignalDestinations,
  featuredDestinations,
}: HomePageProps) {
  const hasFeaturedDestinations = featuredDestinations.length > 0;
  const formatNumber = (value: number | null) =>
    typeof value === "number" ? value.toLocaleString() : "-";

  return (
    <>
      <Head>
        <title>Erasmus Journey | Explore Destinations</title>
        <meta
          name="description"
          content="Explore approved Erasmus destination insights from Cyprus university students, including housing and course examples."
        />
      </Head>

      <Header />

      <main className="min-h-screen bg-white">
        <section className="border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <h1 className="text-3xl md:text-5xl font-semibold text-gray-900 tracking-tight">
              Find out what Erasmus is really like in your city
            </h1>
            <p className="mt-4 text-base md:text-lg text-gray-600 max-w-3xl">
              Every submission is reviewed before publishing. No unverified
              data. Real rent, real courses, real experiences from Cyprus
              students.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/share-experience">
                <Button className="w-full sm:w-auto h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white">
                  Share your experience
                </Button>
              </Link>
              <Link href={PUBLIC_DESTINATIONS_ROUTE}>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto h-11 px-6 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Explore destinations
                </Button>
              </Link>
            </div>
            <p className="mt-5 text-sm text-gray-500">
              Every submission is reviewed by a moderator before it goes live.
              Your name is never shown publicly.
            </p>
            {!publicDataAvailable ? (
              <p className="mt-3 text-sm text-amber-700">
                Public destination data is temporarily unavailable.
              </p>
            ) : null}
          </div>
        </section>

        {false && (
        <section className="border-b border-gray-100 bg-gray-50/60">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid md:grid-cols-3 gap-3">
              {[
                "Approved student submissions",
                "Housing and budget insights",
                "Course equivalence examples",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700"
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {
                  label: "Destinations",
                  value: formatNumber(totalDestinations),
                },
                {
                  label: "Approved submissions",
                  value: formatNumber(totalApprovedSubmissions),
                },
                {
                  label: "Host universities",
                  value: formatNumber(totalHostUniversities),
                },
                {
                  label: "Stronger-signal destinations",
                  value: formatNumber(strongerSignalDestinations),
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-3"
                >
                  <div className="text-xl font-semibold text-gray-900">
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
        )}

        <section className="py-14 md:py-16 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
                  Featured destinations
                </h2>
                <p className="mt-2 text-gray-600">
                  Compare cities before you decide.
                </p>
              </div>
              <Link
                href={PUBLIC_DESTINATIONS_ROUTE}
                className="text-sm font-medium text-blue-700 hover:text-blue-800"
              >
                View all destinations
              </Link>
            </div>

            {hasFeaturedDestinations ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredDestinations.slice(0, 6).map((dest) => (
                  <article
                    key={dest.slug}
                    className="rounded-xl border border-gray-200 bg-white overflow-hidden"
                  >
                    <div className="relative h-36">
                      <Image
                        src={dest.image}
                        alt={`${dest.city}, ${dest.country}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {dest.city}
                      </h3>
                      <p className="text-sm text-gray-600">{dest.country}</p>
                      <div className="mt-3 space-y-1 text-sm text-gray-600">
                        <p>{dest.submissionCount} approved submissions</p>
                        <p>
                          {dest.signalLabel}
                          {dest.signalTone === "warning"
                            ? " (early signal)"
                            : ""}
                        </p>
                      </div>
                      <Link
                        href={`${PUBLIC_DESTINATIONS_ROUTE}/${dest.slug}`}
                        className="mt-4 inline-flex text-sm font-medium text-blue-700 hover:text-blue-800"
                      >
                        View destination
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6">
                <p className="text-gray-700">
                  No featured destinations are available yet.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="py-14 md:py-16 border-b border-gray-100 bg-gray-50/60">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
              Why students use Erasmus Journey
            </h2>
            <div className="mt-6 grid md:grid-cols-3 gap-4">
              {[
                {
                  title: "You don't know if the rent is realistic",
                  text: "See what students actually paid for accommodation in each city — not estimates, real numbers from approved submissions.",
                },
                {
                  title: "Your university won't tell you which courses transferred",
                  text: "Browse course equivalency examples from past students. Peer data only — not official recognition decisions.",
                },
                {
                  title: "You're choosing a city based on Instagram",
                  text: "Compare cities using structured data reviewed and approved before publishing.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-gray-200 bg-white p-5"
                >
                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14 md:py-16 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
              How Erasmus Journey helps
            </h2>
            <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  step: "1",
                  title: "Explore a destination",
                  text: "Start with a city and see approved student signals.",
                },
                {
                  step: "2",
                  title: "Check housing and budget",
                  text: "Review rent patterns and housing recommendations.",
                },
                {
                  step: "3",
                  title: "Review course examples",
                  text: "Compare course equivalence examples from past students.",
                },
                {
                  step: "4",
                  title: "Plan with more confidence",
                  text: "Use approved data to make a clearer decision.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="rounded-xl border border-gray-200 bg-white p-5"
                >
                  <p className="text-xs font-semibold text-blue-700">
                    Step {item.step}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 md:py-14">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
              Ready to compare destinations?
            </h2>
            <p className="mt-3 text-gray-600">
              Explore approved student insights before you choose.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href={PUBLIC_DESTINATIONS_ROUTE}>
                <Button className="w-full sm:w-auto h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white">
                  Explore destinations
                </Button>
              </Link>
              <Link
                href="/share-experience"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Share your experience
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

// ============================================================================
// DATA FETCHING
// ============================================================================
function getFeaturedDestinationImage(city: string): string {
  return CITY_IMAGES[city.toLowerCase()] || DEFAULT_DESTINATION_IMAGE;
}

export const getStaticProps: GetStaticProps<HomePageProps> = async () => {
  try {
    const homePagePublicData = await loadHomePagePublicData();
    const props: HomePageProps = {
      publicDataAvailable: homePagePublicData.isAvailable,
      totalHostUniversities: homePagePublicData.stats.totalHostUniversities,
      totalApprovedSubmissions:
        homePagePublicData.stats.totalApprovedSubmissions,
      totalDestinations: homePagePublicData.stats.totalDestinations,
      strongerSignalDestinations:
        homePagePublicData.stats.strongerSignalDestinations,
      featuredDestinations: homePagePublicData.featuredDestinations.map(
        (destination) => ({
          ...destination,
          image: getFeaturedDestinationImage(destination.city),
        }),
      ),
    };

    return { props, revalidate: PUBLIC_DESTINATION_PAGE_REVALIDATE_SECONDS };
  } catch (error) {
    console.error("Error fetching homepage data:", error);

    const props: HomePageProps = {
      publicDataAvailable: false,
      totalHostUniversities: null,
      totalApprovedSubmissions: null,
      totalDestinations: null,
      strongerSignalDestinations: null,
      featuredDestinations: [],
    };

    return {
      props,
      revalidate: PUBLIC_DESTINATION_PAGE_REVALIDATE_SECONDS,
    };
  }
};
