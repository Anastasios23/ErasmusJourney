import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import type { GetStaticPaths, GetStaticProps } from "next";

import Header from "../../../components/Header";
import PublicDestinationSubnav from "../../../src/components/PublicDestinationSubnav";
import Footer from "../../../src/components/Footer";
import { Button } from "../../../src/components/ui/button";
import {
  formatPublicDestinationMoney,
  getPublicDestinationCurrencyMeta,
} from "../../../src/lib/publicDestinationPresentation";
import { PUBLIC_DESTINATION_PAGE_REVALIDATE_SECONDS } from "../../../src/lib/publicDestinationCache";
import type { PublicDestinationAccommodationInsights } from "../../../src/types/publicDestinations";

interface DestinationAccommodationPageProps {
  destination: PublicDestinationAccommodationInsights;
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-5 py-4 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
        {value}
      </p>
    </div>
  );
}

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-3">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-right text-sm font-medium text-gray-950">
        {value}
      </span>
    </div>
  );
}

export default function DestinationAccommodationPage({
  destination,
}: DestinationAccommodationPageProps) {
  const currencyMeta = getPublicDestinationCurrencyMeta(destination.currency);
  const [showAllSnippets, setShowAllSnippets] = useState(false);

  const hasAccommodationData =
    destination.sampleSize > 0 ||
    destination.types.length > 0 ||
    destination.difficulty.length > 0 ||
    destination.commonAreas.length > 0 ||
    destination.reviewSnippets.length > 0 ||
    destination.recommendationSampleSize > 0;

  const sortedTypes = [...destination.types].sort(
    (left, right) =>
      right.count - left.count || left.type.localeCompare(right.type),
  );

  const sortedDifficulty = [...destination.difficulty].sort(
    (left, right) =>
      right.count - left.count || left.level.localeCompare(right.level),
  );

  const sortedAreas = [...destination.commonAreas].sort(
    (left, right) =>
      right.count - left.count || left.name.localeCompare(right.name),
  );

  const topType = sortedTypes[0] ?? null;
  const topDifficulty = sortedDifficulty[0] ?? null;
  const topArea = sortedAreas[0] ?? null;

  const visibleSnippets = showAllSnippets
    ? destination.reviewSnippets
    : destination.reviewSnippets.slice(0, 3);

  const hasMoreSnippets =
    destination.reviewSnippets.length > 3 && !showAllSnippets;

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>{`Accommodation in ${destination.city}, ${destination.country} | Erasmus Journey`}</title>
        <meta
          name="description"
          content={`Approved and anonymized accommodation insights for ${destination.city}, ${destination.country}.`}
        />
      </Head>

      <Header />

      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        {/* Hero Section */}
        <section className="mb-8 space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
            <Link href="/destinations" className="underline underline-offset-4">
              Back to destinations
            </Link>
            <span>/</span>
            <Link
              href={`/destinations/${destination.slug}`}
              className="underline underline-offset-4"
            >
              Destination overview
            </Link>
          </div>

          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
              Accommodation in {destination.city}, {destination.country}
            </h1>
            <p className="mt-3 text-sm text-gray-600">
              Approved and anonymized student housing insights for{" "}
              {destination.city}, {destination.country}.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
            Student submissions are anonymized. Housing types and costs are based
            on published responses.
            {currencyMeta.isMixed && (
              <> Reported in mixed currencies. Use amounts as guidance, not exact
              comparisons.</>
            )}
          </div>

          <div className="mt-8">
            <PublicDestinationSubnav
              slug={destination.slug}
              active="accommodation"
            />
          </div>
        </section>

        {!hasAccommodationData ? (
          <div className="rounded-lg border border-gray-200 bg-white px-6 py-10 text-center text-gray-600 sm:px-8">
            Approved submissions exist for this destination, but no public
            accommodation insights can be shown yet.
          </div>
        ) : (
          <>
            {/* Top Stats */}
            <section className="mb-8 grid gap-4 sm:grid-cols-3">
              <StatCard
                label="Average rent"
                value={formatPublicDestinationMoney(
                  destination.averageRent,
                  destination.currency,
                )}
              />
              <StatCard
                label="Recommendation rate"
                value={
                  destination.recommendationRate === null
                    ? "N/A"
                    : `${destination.recommendationRate}%`
                }
              />
              <StatCard
                label="Housing entries"
                value={destination.sampleSize}
              />
            </section>

            {/* Housing at a Glance */}
            <section className="mb-8 grid gap-6 lg:grid-cols-2">
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="mb-6 text-lg font-semibold text-gray-950">
                  Housing at a glance
                </h2>
                <div className="space-y-0.5 border-t border-gray-200">
                  <SummaryItem
                    label="Average rent"
                    value={formatPublicDestinationMoney(
                      destination.averageRent,
                      destination.currency,
                    )}
                  />
                  <div className="border-t border-gray-200 py-3">
                    <p className="text-sm text-gray-600">
                      {getAccommodationRecommendationText(
                        destination.recommendationRate,
                      )}
                    </p>
                    {destination.recommendationRate !== null && (
                      <p className="mt-1 text-sm font-medium text-gray-950">
                        {destination.recommendationRate}% recommend
                      </p>
                    )}
                  </div>
                  <SummaryItem
                    label="Most common housing type"
                    value={topType ? topType.type : "Not enough data yet"}
                  />
                  <SummaryItem
                    label="Most common difficulty"
                    value={
                      topDifficulty
                        ? topDifficulty.level
                        : "Not enough data yet"
                    }
                  />
                  <SummaryItem
                    label="Most mentioned area"
                    value={topArea ? topArea.name : "Not enough data yet"}
                  />
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="mb-6 text-lg font-semibold text-gray-950">
                  Housing types
                </h2>
                {sortedTypes.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No accommodation type data yet.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {sortedTypes.map((item, index) => {
                      const percentage =
                        destination.sampleSize > 0
                          ? Math.round(
                              (item.count / destination.sampleSize) * 100,
                            )
                          : 0;
                      return (
                        <li
                          key={item.type}
                          className="rounded-lg border border-gray-100 bg-gray-50 p-3"
                        >
                          <div className="flex items-baseline justify-between gap-3 mb-2">
                            <span className="font-medium text-gray-950">
                              {item.type}
                            </span>
                            <span className="text-sm text-gray-500">
                              {percentage}%
                            </span>
                          </div>
                          <div className="mb-2 h-1.5 rounded-full bg-gray-200">
                            <div
                              className="h-full rounded-full bg-gray-400"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-600">
                            {item.count}{" "}
                            {item.count === 1 ? "report" : "reports"} •{" "}
                            {formatPublicDestinationMoney(
                              item.averageRent,
                              destination.currency,
                            )}{" "}
                            avg
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </section>

            {/* How Hard It Is to Find Housing */}
            {sortedDifficulty.length > 0 && (
              <section className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="mb-6 text-lg font-semibold text-gray-950">
                  How hard is it to find housing
                </h2>
                <div className="space-y-4">
                  {sortedDifficulty.map((item) => {
                    const percentage =
                      destination.sampleSize > 0
                        ? Math.round((item.count / destination.sampleSize) * 100)
                        : 0;
                    return (
                      <div key={item.level}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-950">
                            {item.level}
                          </span>
                          <span className="text-sm text-gray-600">
                            {item.count}{" "}
                            {item.count === 1 ? "student" : "students"}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-gray-400"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Common Areas */}
            {sortedAreas.length > 0 && (
              <section className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="mb-6 text-lg font-semibold text-gray-950">
                  Common areas students mention
                </h2>
                <p className="mb-4 text-xs text-gray-500">
                  Generalized area mentions only. Exact addresses are never
                  shown.
                </p>
                <ul className="space-y-2">
                  {sortedAreas.slice(0, 6).map((area) => (
                    <li key={area.name} className="flex justify-between text-sm">
                      <span className="text-gray-950">{area.name}</span>
                      <span className="text-gray-500">{area.count}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Student Housing Comments */}
            {visibleSnippets.length > 0 && (
              <section className="mb-12 rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="mb-6 text-lg font-semibold text-gray-950">
                  Student housing comments
                </h2>
                <ul className="space-y-3">
                  {visibleSnippets.map((snippet, index) => (
                    <li
                      key={`${snippet.slice(0, 24)}-${index}`}
                      className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm leading-6 text-gray-700"
                    >
                      "{snippet}"
                    </li>
                  ))}
                </ul>
                {hasMoreSnippets && (
                  <button
                    onClick={() => setShowAllSnippets(true)}
                    className="mt-4 text-sm font-medium text-gray-600 underline underline-offset-2 hover:text-gray-950"
                  >
                    Show more comments ({destination.reviewSnippets.length - 3}{" "}
                    more)
                  </button>
                )}
              </section>
            )}

            {/* Bottom CTA */}
            <section className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
              <h3 className="mb-2 text-lg font-semibold text-gray-950">
                Want to see if the academics also fit?
              </h3>
              <p className="mb-4 text-sm text-gray-600">
                Explore course matches and academic fit for this destination.
              </p>
              <Link href={`/destinations/${destination.slug}/courses`}>
                <Button className="bg-gray-900 text-white hover:bg-gray-800">
                  View course examples
                </Button>
              </Link>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

function getAccommodationRecommendationText(
  recommendationRate: number | null,
): string {
  if (recommendationRate === null) {
    return "Not enough recommendation data yet";
  }

  if (recommendationRate >= 70) {
    return "Mostly recommended by students";
  }

  if (recommendationRate >= 40) {
    return "Mixed student recommendations";
  }

  return "Use caution — recommendation rate is low";
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const { getPublicDestinationList } = await import(
      "../../../src/server/publicDestinations"
    );
    const destinations = await getPublicDestinationList();

    return {
      paths: destinations.map((destination) => ({
        params: { slug: destination.slug },
      })),
      fallback: "blocking",
    };
  } catch (error) {
    console.error(
      "Failed to build destination accommodation static paths:",
      error,
    );

    return {
      paths: [],
      fallback: "blocking",
    };
  }
};

export const getStaticProps: GetStaticProps<
  DestinationAccommodationPageProps
> = async (context) => {
  const slug = context.params?.slug;

  if (typeof slug !== "string" || !slug.trim()) {
    return { notFound: true };
  }

  const {
    getPublicAccommodationInsightsByDestinationSlug,
    getPublicDestinationList,
  } = await import("../../../src/server/publicDestinations");

  const destination =
    await getPublicAccommodationInsightsByDestinationSlug(slug);

  if (!destination && !slug.includes("-")) {
    const destinations = await getPublicDestinationList();
    const matchedByCity = destinations.find(
      (item) => item.city.toLowerCase().replace(/\s+/g, "-") === slug,
    );

    if (matchedByCity) {
      return {
        redirect: {
          destination: `/destinations/${matchedByCity.slug}/accommodation`,
          permanent: false,
        },
      };
    }
  }

  if (!destination) {
    return { notFound: true };
  }

  return {
    props: {
      destination,
    },
    revalidate: PUBLIC_DESTINATION_PAGE_REVALIDATE_SECONDS,
  };
};
