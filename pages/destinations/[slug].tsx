import React from "react";
import Head from "next/head";
import Link from "next/link";
import type { GetStaticPaths, GetStaticProps } from "next";
import Header from "../../components/Header";
import Footer from "../../src/components/Footer";
import PublicDestinationSignalNotice from "../../src/components/PublicDestinationSignalNotice";
import PublicDestinationSubnav from "../../src/components/PublicDestinationSubnav";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../src/components/ui/card";
import { Badge } from "../../src/components/ui/badge";
import {
  formatPublicDestinationMoney,
  getPublicDestinationCurrencyMeta,
} from "../../src/lib/publicDestinationPresentation";
import { PUBLIC_DESTINATION_PAGE_REVALIDATE_SECONDS } from "../../src/lib/publicDestinationCache";
import type { PublicDestinationDetail } from "../../src/types/publicDestinations";

interface DestinationDetailPageProps {
  destination: PublicDestinationDetail;
}

export default function DestinationDetailPage({
  destination,
}: DestinationDetailPageProps) {
  const currencyMeta = getPublicDestinationCurrencyMeta(
    destination.costSummary.currency,
  );
  const sortedAccommodationTypes = [...destination.accommodationSummary.types].sort(
    (left, right) => right.count - left.count || left.type.localeCompare(right.type),
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-8">
        <section className="space-y-3">
          <Link
            href="/destinations"
            className="text-sm text-slate-600 underline"
          >
            Back to destinations
          </Link>
          <Badge variant="secondary">Destination detail</Badge>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
            {destination.city}, {destination.country}
          </h1>
          <p className="max-w-3xl text-sm text-slate-600">
            This public snapshot uses approved, complete submissions only. Costs
            are shown exactly as reported by students for this destination.
          </p>
          <PublicDestinationSignalNotice
            submissionCount={destination.submissionCount}
            hostUniversityCount={destination.hostUniversityCount}
          />
          {currencyMeta.isMixed ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Students reported more than one currency here. Amounts below are
              shown as mixed-currency averages, so use them as directional
              guidance rather than exact comparisons.
            </div>
          ) : null}
          <PublicDestinationSubnav
            slug={destination.slug}
            active="overview"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                <p className="text-slate-500">Submissions</p>
                <p className="font-semibold text-slate-900">
                  {destination.submissionCount}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <p className="text-slate-500">Avg rent</p>
                <p className="font-semibold text-slate-900">
                  {formatPublicDestinationMoney(
                    destination.averageRent,
                    destination.costSummary.currency,
                  )}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <p className="text-slate-500">Avg monthly cost</p>
                <p className="font-semibold text-slate-900">
                  {formatPublicDestinationMoney(
                    destination.averageMonthlyCost,
                    destination.costSummary.currency,
                  )}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader className="space-y-3">
              <CardTitle>Start with housing and budget</CardTitle>
              <CardDescription className="text-slate-600">
                Open this path first if your main question is whether this city
                feels financially realistic and manageable for day-to-day
                living.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <ul className="space-y-2 text-slate-700">
                <li>
                  Average rent:{" "}
                  <span className="font-medium text-slate-900">
                    {formatPublicDestinationMoney(
                      destination.averageRent,
                      destination.costSummary.currency,
                    )}
                  </span>
                  .
                </li>
                <li>
                  Average monthly total:{" "}
                  <span className="font-medium text-slate-900">
                    {formatPublicDestinationMoney(
                      destination.averageMonthlyCost,
                      destination.costSummary.currency,
                    )}
                  </span>{" "}
                  from {destination.costSummary.sampleSize} published budget
                  {destination.costSummary.sampleSize === 1 ? " report" : " reports"}.
                </li>
                <li>
                  {topAccommodationType
                    ? `Most reported housing type: ${topAccommodationType.type} (${topAccommodationType.count} reports).`
                    : "No accommodation-type pattern is strong enough to summarize yet."}
                </li>
                <li>
                  {topAccommodationDifficulty
                    ? `Most common housing-search difficulty: ${topAccommodationDifficulty.level} (${topAccommodationDifficulty.count} reports).`
                    : "No recurring housing-search difficulty pattern is available yet."}
                </li>
              </ul>
              <Link
                href={`/destinations/${destination.slug}/accommodation`}
                className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
              >
                Open accommodation insights
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-3">
              <CardTitle>Start with academics and practical tips</CardTitle>
              <CardDescription className="text-slate-600">
                Open this path first if you want to judge academic fit and
                gather concrete student advice before nomination or approval.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <ul className="space-y-2 text-slate-700">
                <li>
                  {destination.courseEquivalenceExamples.length} published course
                  {destination.courseEquivalenceExamples.length === 1
                    ? " example"
                    : " examples"}{" "}
                  are available in this overview.
                </li>
                <li>
                  {highlightedCourseExample
                    ? `Preview example: ${highlightedCourseExample.homeCourseName} to ${highlightedCourseExample.hostCourseName}.`
                    : "No course example preview is available yet."}
                </li>
                <li>
                  {destination.practicalTips.length} practical{" "}
                  {destination.practicalTips.length === 1 ? "tip" : "tips"}{" "}
                  published for this destination.
                </li>
                <li>
                  {highlightedTip
                    ? `First practical signal: ${highlightedTip}`
                    : "No practical tip preview is available yet."}
                </li>
              </ul>
              <Link
                href={`/destinations/${destination.slug}/courses`}
                className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
              >
                Open course equivalence page
              </Link>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-1">
          <h2 className="text-xl font-semibold text-slate-900">
            Accommodation & Cost Insights
          </h2>
          <p className="text-sm text-slate-600">
            Quick housing and cost snapshot. Open the accommodation page when
            you need fuller evidence and neighborhood context.
          </p>
          <Link
            href={`/destinations/${destination.slug}/accommodation`}
            className="inline-flex text-sm font-medium text-slate-700 underline underline-offset-4"
          >
            See the full accommodation breakdown
          </Link>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Accommodation summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="text-slate-600">
                Rent sample size:{" "}
                <span className="font-semibold">
                  {destination.accommodationSummary.sampleSize}
                </span>
              </p>
              <p className="text-slate-600">
                Average rent:{" "}
                <span className="font-semibold">
                  {formatPublicDestinationMoney(
                    destination.accommodationSummary.averageRent,
                    destination.costSummary.currency,
                  )}
                </span>
              </p>

              <div>
                <p className="font-medium text-slate-800 mb-2">Types</p>
                {sortedAccommodationTypes.length === 0 ? (
                  <p className="text-slate-500">
                    No accommodation type data yet.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {sortedAccommodationTypes.map((item) => (
                      <li
                        key={item.type}
                        className="flex justify-between gap-3"
                      >
                        <span className="text-slate-700">
                          {item.type} ({item.count})
                        </span>
                        <span className="font-medium text-slate-900">
                          {formatPublicDestinationMoney(
                            item.averageRent,
                            destination.costSummary.currency,
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <p className="font-medium text-slate-800 mb-2">
                  Difficulty finding accommodation
                </p>
                {sortedAccommodationDifficulty.length === 0 ? (
                  <p className="text-slate-500">No difficulty signals yet.</p>
                ) : (
                  <ul className="space-y-1">
                    {sortedAccommodationDifficulty.map((item) => (
                      <li key={item.level} className="text-slate-700">
                        {item.level}:{" "}
                        <span className="font-medium">{item.count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cost summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-slate-600">
                Currency context:{" "}
                <span className="font-semibold">{currencyMeta.label}</span>
              </p>
              <p className="text-slate-600">
                Monthly cost sample size:{" "}
                <span className="font-semibold">
                  {destination.costSummary.sampleSize}
                </span>
              </p>
              <p className="text-slate-700">
                Rent:{" "}
                <span className="font-medium">
                  {formatPublicDestinationMoney(
                    destination.costSummary.averageRent,
                    destination.costSummary.currency,
                  )}
                </span>
              </p>
              <p className="text-slate-700">
                Food:{" "}
                <span className="font-medium">
                  {formatPublicDestinationMoney(
                    destination.costSummary.averageFood,
                    destination.costSummary.currency,
                  )}
                </span>
              </p>
              <p className="text-slate-700">
                Transport:{" "}
                <span className="font-medium">
                  {formatPublicDestinationMoney(
                    destination.costSummary.averageTransport,
                    destination.costSummary.currency,
                  )}
                </span>
              </p>
              <p className="text-slate-700">
                Social:{" "}
                <span className="font-medium">
                  {formatPublicDestinationMoney(
                    destination.costSummary.averageSocial,
                    destination.costSummary.currency,
                  )}
                </span>
              </p>
              <p className="text-slate-700">
                Travel:{" "}
                <span className="font-medium">
                  {formatPublicDestinationMoney(
                    destination.costSummary.averageTravel,
                    destination.costSummary.currency,
                  )}
                </span>
              </p>
              <p className="text-slate-700">
                Other:{" "}
                <span className="font-medium">
                  {formatPublicDestinationMoney(
                    destination.costSummary.averageOther,
                    destination.costSummary.currency,
                  )}
                </span>
              </p>
              <p className="text-slate-800 font-semibold pt-2 border-t">
                Average monthly total:{" "}
                {formatPublicDestinationMoney(
                  destination.costSummary.averageMonthlyCost,
                  destination.costSummary.currency,
                )}
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-1">
          <h2 className="text-xl font-semibold text-slate-900">
            Equivalence & Practical Guidance
          </h2>
          <p className="text-sm text-slate-600">
            Quick academic-fit snapshot. Open the dedicated courses page for the
            clearer grouped view by home university and department.
          </p>
          <Link
            href={`/destinations/${destination.slug}/courses`}
            className="inline-flex text-sm font-medium text-slate-700 underline underline-offset-4"
          >
            See the full grouped course view
          </Link>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Course equivalence examples</CardTitle>
            </CardHeader>
            <CardContent>
              {destination.courseEquivalenceExamples.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No course mapping examples yet.
                </p>
              ) : (
                <ul className="space-y-4">
                  {destination.courseEquivalenceExamples.map(
                    (example, index) => (
                      <li
                        key={`${example.homeCourseName}-${example.hostCourseName}-${index}`}
                        className="text-sm space-y-1"
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Home course
                        </p>
                        <p className="text-slate-900 font-medium">
                          {example.homeCourseName}
                        </p>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 pt-1">
                          Matched host course
                        </p>
                        <p className="text-slate-700 font-medium">
                          {example.hostCourseName}
                        </p>
                        <p className="text-slate-600">
                          Recognition: {example.recognitionType}
                        </p>
                        {example.notes ? (
                          <p className="text-slate-500">
                            Notes: {example.notes}
                          </p>
                        ) : null}
                      </li>
                    ),
                  )}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Practical tips</CardTitle>
            </CardHeader>
            <CardContent>
              {destination.practicalTips.length === 0 ? (
                <p className="text-sm text-slate-500">No practical tips yet.</p>
              ) : (
                <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
                  {destination.practicalTips.map((tip, index) => (
                    <li key={`${tip.slice(0, 24)}-${index}`}>{tip}</li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>
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

  const { getPublicDestinationDetailBySlug, getPublicDestinationList } = await import(
    "../../src/server/publicDestinations"
  );

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
