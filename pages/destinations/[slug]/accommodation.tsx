import React from "react";
import Head from "next/head";
import Link from "next/link";
import type { GetStaticPaths, GetStaticProps } from "next";

import Header from "../../../components/Header";
import PublicDestinationSubnav from "../../../src/components/PublicDestinationSubnav";
import Footer from "../../../src/components/Footer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../src/components/ui/card";
import {
  formatPublicDestinationMoney,
  getPublicDestinationCurrencyMeta,
} from "../../../src/lib/publicDestinationPresentation";
import { PUBLIC_DESTINATION_PAGE_REVALIDATE_SECONDS } from "../../../src/lib/publicDestinationCache";
import type { PublicDestinationAccommodationInsights } from "../../../src/types/publicDestinations";

interface DestinationAccommodationPageProps {
  destination: PublicDestinationAccommodationInsights;
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="pt-5">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function PreviewItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3 text-sm">
      <span className="text-slate-600">{label}</span>
      <span className="text-right font-medium text-slate-950">{value}</span>
    </div>
  );
}

export default function DestinationAccommodationPage({
  destination,
}: DestinationAccommodationPageProps) {
  const currencyMeta = getPublicDestinationCurrencyMeta(destination.currency);
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

  return (
    <div className="min-h-screen bg-slate-50">
      <Head>
        <title>{`Accommodation in ${destination.city}, ${destination.country} | Erasmus Journey`}</title>
        <meta
          name="description"
          content={`Approved and anonymized accommodation insights for ${destination.city}, ${destination.country}.`}
        />
      </Head>

      <Header />

      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
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
          <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Accommodation in {destination.city}, {destination.country}
          </h1>
          <p className="max-w-3xl text-base leading-8 text-slate-600">
            Approved and anonymized housing insights from Cyprus university
            students.
          </p>
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm leading-6 text-slate-600 shadow-sm">
            Student-reported accommodation averages from approved submissions.
            Addresses and identity details are removed before publication.
          </div>
          {currencyMeta.isMixed ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900 shadow-sm">
              Some rent reports use more than one currency. Treat costs as
              directional rather than exact.
            </div>
          ) : null}
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <SummaryCard
            label="Avg rent"
            value={formatPublicDestinationMoney(
              destination.averageRent,
              destination.currency,
            )}
          />
          <SummaryCard
            label="Accommodation entries"
            value={destination.sampleSize}
          />
          <SummaryCard
            label="Recommendation rate"
            value={
              destination.recommendationRate === null
                ? "N/A"
                : `${destination.recommendationRate}%`
            }
          />
        </section>

        <p className="mt-4 text-sm text-slate-500">
          Based on {destination.submissionCount} approved{" "}
          {destination.submissionCount === 1 ? "submission" : "submissions"}{" "}
          across {destination.hostUniversityCount} host{" "}
          {destination.hostUniversityCount === 1
            ? "university"
            : "universities"}
          .
        </p>

        <div className="mt-8">
          <PublicDestinationSubnav
            slug={destination.slug}
            active="accommodation"
          />
        </div>

        {!hasAccommodationData ? (
          <Card className="mt-8 border-slate-200 shadow-sm">
            <CardContent className="py-10 text-center text-slate-600">
              Approved submissions exist for this destination, but no public
              accommodation insights can be shown yet.
            </CardContent>
          </Card>
        ) : (
          <>
            <section className="mt-8 grid gap-5 lg:grid-cols-2">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="space-y-3">
                  <CardTitle className="text-2xl text-slate-950">
                    Housing overview
                  </CardTitle>
                  <p className="text-sm leading-6 text-slate-600">
                    The main housing signals students report before you look at
                    the full detail.
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <PreviewItem
                    label="Avg rent"
                    value={formatPublicDestinationMoney(
                      destination.averageRent,
                      destination.currency,
                    )}
                  />
                  <PreviewItem
                    label="Most common housing type"
                    value={topType ? topType.type : "Not enough data yet"}
                  />
                  <PreviewItem
                    label="Most common difficulty"
                    value={
                      topDifficulty
                        ? topDifficulty.level
                        : "Not enough data yet"
                    }
                  />
                  <PreviewItem
                    label="Most mentioned area"
                    value={topArea ? topArea.name : "Not enough data yet"}
                  />
                  <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                    {getAccommodationRecommendationLine(
                      destination.recommendationYesCount,
                      destination.recommendationSampleSize,
                      destination.recommendationRate,
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="space-y-3">
                  <CardTitle className="text-2xl text-slate-950">
                    Accommodation types
                  </CardTitle>
                  <p className="text-sm leading-6 text-slate-600">
                    Reported housing types with average rents where available.
                  </p>
                </CardHeader>
                <CardContent>
                  {sortedTypes.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No accommodation type data yet.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {sortedTypes.map((item) => (
                        <li
                          key={item.type}
                          className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3 text-sm"
                        >
                          <div>
                            <p className="font-medium text-slate-950">
                              {item.type}
                            </p>
                            <p className="text-slate-500">
                              {item.count}{" "}
                              {item.count === 1 ? "report" : "reports"}
                            </p>
                          </div>
                          <p className="font-medium text-slate-950">
                            {formatPublicDestinationMoney(
                              item.averageRent,
                              destination.currency,
                            )}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </section>

            <section className="mt-8 grid gap-5 lg:grid-cols-2">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="space-y-3">
                  <CardTitle className="text-2xl text-slate-950">
                    Areas students mention
                  </CardTitle>
                  <p className="text-sm leading-6 text-slate-600">
                    Generalized area names only. Exact addresses are never
                    shown.
                  </p>
                </CardHeader>
                <CardContent>
                  {sortedAreas.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No neighborhood data yet.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {sortedAreas.map((area) => (
                        <span
                          key={area.name}
                          className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700"
                        >
                          {area.name} ({area.count})
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="space-y-3">
                  <CardTitle className="text-2xl text-slate-950">
                    Student comments
                  </CardTitle>
                  <p className="text-sm leading-6 text-slate-600">
                    Shortened and filtered comments from approved submissions.
                  </p>
                </CardHeader>
                <CardContent>
                  {destination.reviewSnippets.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No public review snippets yet.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {destination.reviewSnippets.map((snippet, index) => (
                        <li
                          key={`${snippet.slice(0, 24)}-${index}`}
                          className="rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700"
                        >
                          {snippet}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

function getAccommodationRecommendationLine(
  recommendationYesCount: number,
  recommendationSampleSize: number,
  recommendationRate: number | null,
): string {
  if (recommendationSampleSize === 0 || recommendationRate === null) {
    return "No public recommendation responses are available yet.";
  }

  return `${recommendationYesCount} of ${recommendationSampleSize} students would recommend their accommodation setup here.`;
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
