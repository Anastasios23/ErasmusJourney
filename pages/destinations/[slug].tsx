import React from "react";
import Head from "next/head";
import Link from "next/link";
import type { GetStaticPaths, GetStaticProps } from "next";

import Header from "../../components/Header";
import Footer from "../../src/components/Footer";
import PublicDestinationSubnav from "../../src/components/PublicDestinationSubnav";
import { Badge } from "../../src/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../src/components/ui/card";
import { getPublicDestinationCurrencyMeta } from "../../src/lib/publicDestinationPresentation";
import type {
  PublicDestinationCourseEquivalenceItem,
  PublicDestinationReadModelDetail,
} from "../../src/types/publicDestinations";

const PAGE_REVALIDATE_SECONDS = 3600;

interface DestinationDetailPageProps {
  destination: PublicDestinationReadModelDetail;
}

type JsonRecord = Record<string, unknown>;

interface ExperiencePreview {
  homeUniversity: string;
  semester: string;
  accommodationSummary: string;
  recommendation: "Yes" | "No" | "Not enough data";
}

interface CourseTableRow {
  homeUniversity: string;
  homeCourseName: string;
  hostCourseName: string;
  credits: number | null;
  status: string | null;
}

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function readStringField(
  record: JsonRecord,
  keys: string[],
  maxLength = 160,
): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value !== "string") {
      continue;
    }

    const normalized = value.trim().replace(/\s+/g, " ");
    if (normalized) {
      return normalized.slice(0, maxLength);
    }
  }

  return null;
}

function readRecommendation(value: unknown): "Yes" | "No" | "Not enough data" {
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value !== "string") {
    return "Not enough data";
  }

  const normalized = value.trim().toLowerCase();
  if (["yes", "true", "recommended", "would recommend"].includes(normalized)) {
    return "Yes";
  }

  if (["no", "false", "not recommended", "would not recommend"].includes(normalized)) {
    return "No";
  }

  return "Not enough data";
}

function formatMonthYear(value: string | null): string {
  if (!value) {
    return "Unknown";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Unknown";
  }

  return parsed.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function formatMoney(value: number | null, currency?: string | null): string {
  if (value === null) {
    return "Not enough data";
  }

  const meta = getPublicDestinationCurrencyMeta(currency);
  const amount = Math.round(value).toLocaleString("en-US");
  return meta.isMixed
    ? `${amount} (${meta.amountSuffix})`
    : `${amount} ${meta.amountSuffix}`;
}

function formatPercentage(value: number | null): string {
  return value === null ? "Not enough data" : `${value}%`;
}

function formatCredits(value: number | null): string {
  return value === null ? "Not enough data" : `${value} ECTS`;
}

function sampleLabel(sampleSize: number): string {
  return `n=${Math.max(0, Math.trunc(sampleSize))}`;
}

function getCourseRows(
  destination: PublicDestinationReadModelDetail,
): CourseTableRow[] {
  return destination.courseEquivalences.groups.flatMap((group) =>
    group.examples.map((example: PublicDestinationCourseEquivalenceItem) => ({
      homeUniversity: group.homeUniversity,
      homeCourseName: example.homeCourseName,
      hostCourseName: example.hostCourseName,
      credits:
        typeof example.credits === "number" && Number.isFinite(example.credits)
          ? example.credits
          : null,
      status: example.recognitionType || null,
    })),
  );
}

function getExperiencePreviews(
  destination: PublicDestinationReadModelDetail,
): ExperiencePreview[] {
  const detailRecord = isRecord(destination.detail)
    ? (destination.detail as JsonRecord)
    : null;
  if (!detailRecord) {
    return [];
  }

  const candidateKeys = [
    "individualExperienceSummaries",
    "approvedExperienceSummaries",
    "experienceSummaries",
  ];
  const rawSummaries = candidateKeys
    .map((key) => detailRecord[key])
    .find((value): value is unknown[] => Array.isArray(value));

  if (!rawSummaries) {
    return [];
  }

  return rawSummaries
    .filter(isRecord)
    .map((summary) => ({
      homeUniversity:
        readStringField(summary, ["homeUniversity", "homeUniversityName"], 120) ||
        "Anonymous home university",
      semester:
        readStringField(summary, ["semester", "exchangeSemester"], 80) ||
        "Semester not reported",
      accommodationSummary:
        readStringField(
          summary,
          ["accommodationSummary", "housingSummary", "accommodation"],
          140,
        ) || "No accommodation summary reported.",
      recommendation: readRecommendation(
        summary.recommendation ?? summary.wouldRecommend,
      ),
    }))
    .slice(0, 6);
}

function StatCard({
  label,
  value,
  sampleSize,
}: {
  label: string;
  value: React.ReactNode;
  sampleSize: number;
}) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <Badge variant="secondary">{sampleLabel(sampleSize)}</Badge>
        </div>
        <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-sm text-slate-600">
      {children}
    </div>
  );
}

export default function DestinationDetailPage({
  destination,
}: DestinationDetailPageProps) {
  const latestReportMonth = formatMonthYear(
    destination.latestReportSubmittedAt,
  );
  const submissionLabel =
    destination.submissionCount === 1 ? "student report" : "student reports";
  const hasSparseCityData = destination.submissionCount < 3;
  const currency =
    destination.detail.costSummary.currency ||
    destination.accommodation.currency ||
    "EUR";
  const rentSampleSize =
    destination.accommodation.rentSampleSize ||
    destination.detail.costSummary.sampleSize;
  const monthlyCostSampleSize = destination.detail.costSummary.sampleSize;
  const hasAccommodationData =
    destination.accommodation.sampleSize > 0 ||
    destination.accommodation.rentSampleSize > 0 ||
    destination.accommodation.types.length > 0 ||
    destination.accommodation.commonAreas.length > 0 ||
    destination.accommodation.recommendationSampleSize > 0;
  const courseRows = getCourseRows(destination);
  const experiencePreviews = getExperiencePreviews(destination);

  return (
    <div className="min-h-screen bg-slate-50">
      <Head>
        <title>{`${destination.city}, ${destination.country} | Erasmus Journey`}</title>
        <meta
          name="description"
          content={`Student-reported Erasmus costs, accommodation data, and peer course examples for ${destination.city}, ${destination.country}.`}
        />
      </Head>

      <Header />

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <section className="space-y-5">
          <Link
            href="/destinations"
            className="inline-flex text-sm font-medium text-sky-700 underline underline-offset-4"
          >
            Back to destinations
          </Link>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{destination.country}</Badge>
              <Badge variant="secondary">
                {destination.submissionCount} {submissionLabel}
              </Badge>
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              {destination.city}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
              Based on {destination.submissionCount} {submissionLabel} · Last
              updated {latestReportMonth}
            </p>
          </div>
        </section>

        {hasSparseCityData ? (
          <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-950">
            Limited data — fewer than 3 reports available for this city. Figures
            below are early estimates only.
          </section>
        ) : null}

        <div className="mt-8">
          <PublicDestinationSubnav slug={destination.slug} active="overview" />
        </div>

        <section className="mt-10 space-y-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
              Living Cost
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              Student-reported living costs
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard
              label="Average monthly rent"
              sampleSize={rentSampleSize}
              value={formatMoney(destination.averageRent, currency)}
            />
            <StatCard
              label="Average monthly cost"
              sampleSize={monthlyCostSampleSize}
              value={formatMoney(destination.averageMonthlyCost, currency)}
            />
          </div>
        </section>

        <section className="mt-12 space-y-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
              Accommodation Data
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              Where students lived
            </h2>
          </div>

          {!hasAccommodationData ? (
            <EmptyState>No accommodation data reported yet.</EmptyState>
          ) : (
            <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-4">
                <StatCard
                  label="Accommodation average rent"
                  sampleSize={destination.accommodation.rentSampleSize}
                  value={formatMoney(
                    destination.accommodation.averageRent,
                    destination.accommodation.currency,
                  )}
                />
                <StatCard
                  label="Would recommend"
                  sampleSize={destination.accommodation.recommendationSampleSize}
                  value={formatPercentage(
                    destination.accommodation.recommendationRate,
                  )}
                />
              </div>

              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-950">
                    Accommodation breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700">
                      Accommodation types
                    </h3>
                    {destination.accommodation.types.length === 0 ? (
                      <p className="mt-2 text-sm text-slate-500">
                        Not enough data
                      </p>
                    ) : (
                      <div className="mt-3 space-y-2">
                        {destination.accommodation.types.map((type) => (
                          <div
                            key={type.type}
                            className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3 text-sm"
                          >
                            <span className="font-medium text-slate-800">
                              {type.type}
                            </span>
                            <span className="text-slate-600">
                              {sampleLabel(type.count)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-700">
                      Neighborhood / area distribution
                    </h3>
                    {destination.accommodation.commonAreas.length === 0 ? (
                      <p className="mt-2 text-sm text-slate-500">
                        Not enough data
                      </p>
                    ) : (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {destination.accommodation.commonAreas.map((area) => (
                          <Badge key={area.name} variant="secondary">
                            {area.name} ({sampleLabel(area.count)})
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </section>

        <section className="mt-12 space-y-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
              Peer Course Equivalency Examples
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              Course matches students reported
            </h2>
          </div>

          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-5 py-4 text-sm leading-6 text-sky-950">
            These are peer examples shared by previous students.
            <br />
            They are not official recognition decisions.
            <br />
            Contact your home university to confirm equivalency.
          </div>

          {destination.courseEquivalences.totalMappings < 3 &&
          destination.courseEquivalences.totalMappings > 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-950">
              Limited data — fewer than 3 course-match records available. The
              table shows examples only, not summary claims.
            </div>
          ) : null}

          {courseRows.length === 0 ? (
            <EmptyState>No course equivalency examples reported yet.</EmptyState>
          ) : (
            <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    <tr>
                      <th className="px-4 py-3">Home course</th>
                      <th className="px-4 py-3">Host course</th>
                      <th className="px-4 py-3">Credits</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {courseRows.map((row) => (
                      <tr
                        key={`${row.homeUniversity}-${row.homeCourseName}-${row.hostCourseName}-${row.status}`}
                      >
                        <td className="px-4 py-4 align-top">
                          <p className="font-medium text-slate-950">
                            {row.homeCourseName}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {row.homeUniversity}
                          </p>
                        </td>
                        <td className="px-4 py-4 align-top text-slate-700">
                          {row.hostCourseName}
                        </td>
                        <td className="px-4 py-4 align-top text-slate-700">
                          {formatCredits(row.credits)}
                        </td>
                        <td className="px-4 py-4 align-top text-slate-700">
                          {row.status || "Not enough data"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </section>

        {experiencePreviews.length > 0 ? (
          <section className="mt-12 space-y-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
                Anonymous Experience Previews
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Approved individual summaries
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {experiencePreviews.map((preview) => (
                <Card
                  key={`${preview.homeUniversity}-${preview.semester}-${preview.accommodationSummary}`}
                  className="border-slate-200 bg-white shadow-sm"
                >
                  <CardContent className="space-y-3 pt-6 text-sm text-slate-700">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{preview.semester}</Badge>
                      <Badge variant="outline">{preview.homeUniversity}</Badge>
                    </div>
                    <p>{preview.accommodationSummary}</p>
                    <p className="font-medium text-slate-950">
                      Would recommend: {preview.recommendation}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
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

  const { getPublicDestinationList, getPublicDestinationReadModelBySlug } =
    await import("../../src/server/publicDestinations");

  const destination = await getPublicDestinationReadModelBySlug(slug);

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
    revalidate: PAGE_REVALIDATE_SECONDS,
  };
};
