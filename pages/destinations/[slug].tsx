import React from "react";
import Head from "next/head";
import Link from "next/link";
import type { GetStaticPaths, GetStaticProps } from "next";

import Header from "../../components/Header";
import Footer from "../../src/components/Footer";
import PublicDestinationSubnav from "../../src/components/PublicDestinationSubnav";
import PublicDestinationSignalNotice from "../../src/components/PublicDestinationSignalNotice";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../src/components/ui/card";
import {
  formatPublicDestinationFreshness,
  formatPublicDestinationMoney,
  getPublicDestinationCurrencyMeta,
} from "../../src/lib/publicDestinationPresentation";
import { PUBLIC_DESTINATION_PAGE_REVALIDATE_SECONDS } from "../../src/lib/publicDestinationCache";
import type { PublicDestinationDetail } from "../../src/types/publicDestinations";

interface DestinationDetailPageProps {
  destination: PublicDestinationDetail;
}

function DestinationSummaryCard({
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

export default function DestinationDetailPage({
  destination,
}: DestinationDetailPageProps) {
  const currencyMeta = getPublicDestinationCurrencyMeta(
    destination.costSummary.currency,
  );
  const sortedAccommodationTypes = [
    ...destination.accommodationSummary.types,
  ].sort(
    (left, right) =>
      right.count - left.count || left.type.localeCompare(right.type),
  );
  const sortedAccommodationDifficulty = [
    ...destination.accommodationSummary.difficulty,
  ].sort(
    (left, right) =>
      right.count - left.count || left.level.localeCompare(right.level),
  );
  const topAccommodationType = sortedAccommodationTypes[0] ?? null;
  const topAccommodationDifficulty = sortedAccommodationDifficulty[0] ?? null;
  const highlightedCourseExample =
    destination.courseEquivalenceExamples[0] ?? null;
  const highlightedTip = destination.practicalTips[0] ?? null;
  const accommodationPath = `/destinations/${destination.slug}/accommodation`;
  const coursesPath = `/destinations/${destination.slug}/courses`;
  const submissionLabel =
    destination.submissionCount === 1 ? "submission" : "submissions";
  const hostUniversityLabel =
    destination.hostUniversityCount === 1
      ? "host university"
      : "host universities";
  const coursePreviewLine = highlightedCourseExample
    ? `${highlightedCourseExample.homeCourseName} matched to ${highlightedCourseExample.hostCourseName}.`
    : highlightedTip
      ? highlightedTip
      : "No preview has been published yet.";

  return (
    <div className="min-h-screen bg-slate-50">
      <Head>
        <title>{`${destination.city}, ${destination.country} | Erasmus Journey`}</title>
        <meta
          name="description"
          content={`Approved student insights for ${destination.city}, ${destination.country}.`}
        />
      </Head>

      <Header />

      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <section className="space-y-4">
          <Link
            href="/destinations"
            className="inline-flex text-sm font-medium text-sky-700 underline underline-offset-4"
          >
            Back to destinations
          </Link>
          <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Quick overview for {destination.city}, {destination.country}
          </h1>
          <p className="max-w-3xl text-base leading-8 text-slate-600">
            Based on approved student submissions from Cyprus universities.
          </p>
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm leading-6 text-slate-600 shadow-sm">
            Approved student signals from {destination.submissionCount}{" "}
            {submissionLabel}. Helpful for planning, not exact guarantees.
            <span className="block pt-1">
              Latest approved report:{" "}
              {formatPublicDestinationFreshness(
                destination.latestReportSubmittedAt,
              )}
            </span>
            {destination.isLimitedData ? (
              <span className="block pt-1">
                Limited data. City-level averages and summary claims stay
                hidden until at least 5 approved submissions are available.
              </span>
            ) : (
              <span className="block pt-1">
                Monthly rent is the minimum living-cost signal. Food,
                transport, social, travel, and other reported costs deepen the
                estimate when students provide them.
              </span>
            )}
          </div>
          {currencyMeta.isMixed ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900 shadow-sm">
              Some reports use more than one currency. Treat costs as
              directional rather than exact.
            </div>
          ) : null}
          <PublicDestinationSignalNotice
            submissionCount={destination.submissionCount}
            hostUniversityCount={destination.hostUniversityCount}
          />
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <DestinationSummaryCard
            label="Approved submissions"
            value={destination.submissionCount}
          />
          <DestinationSummaryCard
            label="Avg rent"
            value={formatPublicDestinationMoney(
              destination.averageRent,
              destination.costSummary.currency,
            )}
          />
          <DestinationSummaryCard
            label="Avg monthly budget"
            value={formatPublicDestinationMoney(
              destination.averageMonthlyCost,
              destination.costSummary.currency,
            )}
          />
        </section>

        <p className="mt-4 text-sm text-slate-500">
          Reports in this overview cover {destination.hostUniversityCount}{" "}
          {hostUniversityLabel}.
        </p>

        <div className="mt-8">
          <PublicDestinationSubnav slug={destination.slug} active="overview" />
        </div>

        <section className="mt-8 grid gap-5 lg:grid-cols-2">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="space-y-3">
              <CardTitle className="text-2xl text-slate-950">Housing</CardTitle>
              <p className="text-sm leading-6 text-slate-600">
                See the main rent and housing signals before opening the full
                breakdown.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <PreviewItem
                label="Avg rent"
                value={formatPublicDestinationMoney(
                  destination.averageRent,
                  destination.costSummary.currency,
                )}
              />
              <PreviewItem
                label="Most common housing type"
                value={
                  destination.accommodationSummary.isLimitedData
                    ? "Limited data"
                    : topAccommodationType
                    ? topAccommodationType.type
                    : "Not enough data yet"
                }
              />
              <PreviewItem
                label="Most common difficulty"
                value={
                  destination.accommodationSummary.isLimitedData
                    ? "Limited data"
                    : topAccommodationDifficulty
                    ? topAccommodationDifficulty.level
                    : "Not enough data yet"
                }
              />
              <div className="pt-2">
                <Link
                  href={accommodationPath}
                  className="inline-flex text-sm font-medium text-sky-700 underline underline-offset-4"
                >
                  View housing insights
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="space-y-3">
              <CardTitle className="text-2xl text-slate-950">
                Courses & recognition
              </CardTitle>
              <p className="text-sm leading-6 text-slate-600">
                Check whether this destination already has useful course matches
                and practical advice.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <PreviewItem
                label="Approved course examples"
                value={destination.courseSampleSize}
              />
              <PreviewItem
                label="Practical tips"
                value={destination.practicalTips.length}
              />
              {destination.courseIsLimitedData ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                  Limited data. Cross-course summary claims stay hidden until at
                  least 3 approved course examples exist for this destination.
                </div>
              ) : null}
              <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                <p className="font-medium text-slate-950">Preview</p>
                <p className="mt-1">{coursePreviewLine}</p>
              </div>
              <div className="pt-2">
                <Link
                  href={coursesPath}
                  className="inline-flex text-sm font-medium text-sky-700 underline underline-offset-4"
                >
                  View course equivalences
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>

        {highlightedTip ? (
          <section className="mt-8">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="space-y-3">
                <CardTitle className="text-xl text-slate-950">
                  One student tip to know first
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="max-w-3xl text-sm leading-7 text-slate-700">
                  {highlightedTip}
                </p>
              </CardContent>
            </Card>
          </section>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const { getPublicDestinationList } = await import(
      "../../src/server/publicDestinations"
    );
    const destinations = await getPublicDestinationList();

    return {
      paths: destinations.map((destination) => ({
        params: { slug: destination.slug },
      })),
      fallback: "blocking",
    };
  } catch (error) {
    console.error("Failed to build destination detail static paths:", error);

    return {
      paths: [],
      fallback: "blocking",
    };
  }
};

export const getStaticProps: GetStaticProps<
  DestinationDetailPageProps
> = async (context) => {
  const slug = context.params?.slug;

  if (typeof slug !== "string" || !slug.trim()) {
    return { notFound: true };
  }

  const { getPublicDestinationDetailBySlug, getPublicDestinationList } =
    await import("../../src/server/publicDestinations");

  const destination = await getPublicDestinationDetailBySlug(slug);

  if (!destination && !slug.includes("-")) {
    const destinations = await getPublicDestinationList();
    const matchedByCity = destinations.find(
      (item) => item.city.toLowerCase().replace(/\s+/g, "-") === slug,
    );

    if (matchedByCity) {
      return {
        redirect: {
          destination: `/destinations/${matchedByCity.slug}`,
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
