import React from "react";
import Head from "next/head";
import Link from "next/link";
import type { GetServerSideProps } from "next";

import Header from "../../../components/Header";
import PublicDestinationSignalNotice from "../../../src/components/PublicDestinationSignalNotice";
import PublicDestinationSubnav from "../../../src/components/PublicDestinationSubnav";
import Footer from "../../../src/components/Footer";
import { Badge } from "../../../src/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../src/components/ui/card";
import {
  formatPublicDestinationMoney,
  getPublicDestinationCurrencyMeta,
} from "../../../src/lib/publicDestinationPresentation";
import type { PublicDestinationAccommodationInsights } from "../../../src/types/publicDestinations";

interface DestinationAccommodationPageProps {
  destination: PublicDestinationAccommodationInsights;
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
    (left, right) => right.count - left.count || left.type.localeCompare(right.type),
  );
  const sortedDifficulty = [...destination.difficulty].sort(
    (left, right) =>
      right.count - left.count || left.level.localeCompare(right.level),
  );
  const sortedAreas = [...destination.commonAreas].sort(
    (left, right) => right.count - left.count || left.name.localeCompare(right.name),
  );

  const topType = sortedTypes[0] ?? null;
  const topDifficulty = sortedDifficulty[0] ?? null;
  const topArea = sortedAreas[0] ?? null;
  const rentEvidenceLine =
    destination.rentSampleSize === 0
      ? "Average rent is not available yet."
      : `Average rent is based on ${destination.rentSampleSize} ${
          destination.rentSampleSize === 1 ? "report" : "reports"
        }.`;
  const areaEvidenceLine = topArea
    ? `Generalized area mentions most often point to ${topArea.name} (${topArea.count} ${
        topArea.count === 1 ? "mention" : "mentions"
      }).`
    : "Area labels are still too limited to suggest a recurring neighborhood pattern.";

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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-8">
        <section className="space-y-3">
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
          <Badge variant="secondary">Accommodation insights</Badge>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
            Accommodation in {destination.city}, {destination.country}
          </h1>
          <p className="max-w-3xl text-sm text-slate-600">
            This page uses approved submissions only. Data is aggregated and
            anonymized, and exact addresses or identity details are not shown.
          </p>
          <PublicDestinationSignalNotice
            submissionCount={destination.submissionCount}
            hostUniversityCount={destination.hostUniversityCount}
          />
          {currencyMeta.isMixed ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Students reported more than one currency here. Rent figures below
              should be treated as directional guidance rather than exact
              comparisons.
            </div>
          ) : null}
          <PublicDestinationSubnav
            slug={destination.slug}
            active="accommodation"
          />
          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <Card>
              <CardContent className="pt-5">
                <p className="text-slate-500">Host universities</p>
                <p className="font-semibold text-slate-900">
                  {destination.hostUniversityCount}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <p className="text-slate-500">Approved submissions</p>
                <p className="font-semibold text-slate-900">
                  {destination.submissionCount}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <p className="text-slate-500">Accommodation entries</p>
                <p className="font-semibold text-slate-900">
                  {destination.sampleSize}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <p className="text-slate-500">Recommendation rate</p>
                <p className="font-semibold text-slate-900">
                  {destination.recommendationRate === null
                    ? "N/A"
                    : `${destination.recommendationRate}%`}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {!hasAccommodationData ? (
          <Card>
            <CardHeader>
              <CardTitle>No approved accommodation insights yet</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              Approved submissions exist for this destination, but none of them
              currently include public accommodation data that can be shown
              safely here.
            </CardContent>
          </Card>
        ) : (
          <>
            <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <Card>
                <CardHeader className="space-y-3">
                  <CardTitle>Housing snapshot</CardTitle>
                  <CardDescription className="text-slate-600">
                    Use these signals to compare the typical housing experience
                    in this city, not to copy one student&apos;s exact setup.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="rounded-xl border border-slate-200 bg-white px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Average reported rent
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">
                      {formatPublicDestinationMoney(
                        destination.averageRent,
                        destination.currency,
                      )}
                    </p>
                    <p className="mt-2 text-slate-600">{rentEvidenceLine}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium text-slate-900">
                      What approved students most often report
                    </p>
                    <ul className="space-y-2 text-slate-700">
                      <li>
                        {getAccommodationRecommendationLine(
                          destination.recommendationYesCount,
                          destination.recommendationSampleSize,
                          destination.recommendationRate,
                        )}
                      </li>
                      {topType ? (
                        <li>
                          Most reported housing type:{" "}
                          <span className="font-medium text-slate-900">
                            {topType.type}
                          </span>{" "}
                          ({topType.count} of {destination.sampleSize} entries).
                        </li>
                      ) : null}
                      {topDifficulty ? (
                        <li>
                          Most common search difficulty:{" "}
                          <span className="font-medium text-slate-900">
                            {topDifficulty.level}
                          </span>{" "}
                          ({topDifficulty.count} reports).
                        </li>
                      ) : null}
                      <li>{areaEvidenceLine}</li>
                    </ul>
                  </div>

                  <p className="text-slate-600">
                    Neighborhood labels and snippets are shortened and filtered
                    before publication.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="space-y-3">
                  <CardTitle>Accommodation type distribution</CardTitle>
                  <CardDescription className="text-slate-600">
                    Percentages refer to published accommodation entries for
                    this destination.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {sortedTypes.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No accommodation type data yet.
                    </p>
                  ) : (
                    <ul className="space-y-3 text-sm">
                      {sortedTypes.map((item) => {
                        const share =
                          destination.sampleSize > 0
                            ? Math.round((item.count / destination.sampleSize) * 100)
                            : null;

                        return (
                          <li
                            key={item.type}
                            className="flex items-start justify-between gap-4"
                          >
                            <div className="space-y-1">
                              <p className="font-medium text-slate-900">
                                {item.type}
                              </p>
                              <p className="text-slate-500">
                                {item.count} reports
                                {share === null ? "" : ` | ${share}%`}
                              </p>
                            </div>
                            <p className="font-medium text-slate-900">
                              {formatPublicDestinationMoney(
                                item.averageRent,
                                destination.currency,
                              )}
                            </p>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </section>

            <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <Card>
                <CardHeader className="space-y-3">
                  <CardTitle>Difficulty finding accommodation</CardTitle>
                  <CardDescription className="text-slate-600">
                    Counts show how often students described the housing search
                    with each difficulty level.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {sortedDifficulty.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No difficulty signals yet.
                    </p>
                  ) : (
                    <ul className="space-y-2 text-sm">
                      {sortedDifficulty.map((item) => (
                        <li
                          key={item.level}
                          className="flex items-center justify-between gap-4"
                        >
                          <span className="text-slate-700">{item.level}</span>
                          <span className="font-medium text-slate-900">
                            {item.count}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="space-y-3">
                  <CardTitle>Common areas and neighborhood labels</CardTitle>
                  <CardDescription className="text-slate-600">
                    These are generalized area mentions only. Exact addresses
                    are removed before publication.
                  </CardDescription>
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
                          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700"
                        >
                          {area.name} ({area.count})
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            <section>
              <Card>
                <CardHeader className="space-y-3">
                  <CardTitle>Sanitized student review snippets</CardTitle>
                  <CardDescription className="text-slate-600">
                    Shortened comments help surface recurring themes without
                    exposing personal details or exact property locations.
                  </CardDescription>
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
                          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                        >
                          "{snippet}"
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

  if (recommendationRate >= 70) {
    return `${recommendationYesCount} of ${recommendationSampleSize} students would recommend their accommodation setup here, so overall sentiment leans positive.`;
  }

  if (recommendationRate >= 50) {
    return `${recommendationYesCount} of ${recommendationSampleSize} students would recommend their accommodation setup here, so sentiment is mixed rather than clearly positive or negative.`;
  }

  return `Only ${recommendationYesCount} of ${recommendationSampleSize} students would recommend their accommodation setup here, so compare the difficulty and snippet sections carefully.`;
}

export const getServerSideProps: GetServerSideProps<
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

  const destination = await getPublicAccommodationInsightsByDestinationSlug(
    slug,
  );

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
  };
};
