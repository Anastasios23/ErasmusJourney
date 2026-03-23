import Head from "next/head";
import Link from "next/link";
import type { GetServerSideProps } from "next";
import Header from "../../components/Header";
import Footer from "../../src/components/Footer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../src/components/ui/card";
import { Badge } from "../../src/components/ui/badge";
import type { PublicDestinationDetail } from "../../src/types/publicDestinations";

interface DestinationDetailPageProps {
  destination: PublicDestinationDetail;
}

function formatMoney(value: number | null, currency: string): string {
  if (value === null) {
    return "N/A";
  }

  return `${Math.round(value).toLocaleString()} ${currency}`;
}

export default function DestinationDetailPage({
  destination,
}: DestinationDetailPageProps) {
  const currencyLabel = destination.costSummary.currency || "EUR";

  return (
    <div className="min-h-screen bg-slate-50">
      <Head>
        <title>
          {destination.city}, {destination.country} | Erasmus Journey
        </title>
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
                  {formatMoney(destination.averageRent, currencyLabel)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <p className="text-slate-500">Avg monthly cost</p>
                <p className="font-semibold text-slate-900">
                  {formatMoney(destination.averageMonthlyCost, currencyLabel)}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-1">
          <h2 className="text-xl font-semibold text-slate-900">
            Accommodation & Cost Insights
          </h2>
          <p className="text-sm text-slate-600">
            Core living and housing signals extracted from approved submissions.
          </p>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Accommodation summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="text-slate-600">
                Sample size:{" "}
                <span className="font-semibold">
                  {destination.accommodationSummary.sampleSize}
                </span>
              </p>
              <p className="text-slate-600">
                Average rent:{" "}
                <span className="font-semibold">
                  {formatMoney(
                    destination.accommodationSummary.averageRent,
                    currencyLabel,
                  )}
                </span>
              </p>

              <div>
                <p className="font-medium text-slate-800 mb-2">Types</p>
                {destination.accommodationSummary.types.length === 0 ? (
                  <p className="text-slate-500">
                    No accommodation type data yet.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {destination.accommodationSummary.types.map((item) => (
                      <li
                        key={item.type}
                        className="flex justify-between gap-3"
                      >
                        <span className="text-slate-700">
                          {item.type} ({item.count})
                        </span>
                        <span className="font-medium text-slate-900">
                          {formatMoney(item.averageRent, currencyLabel)}
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
                {destination.accommodationSummary.difficulty.length === 0 ? (
                  <p className="text-slate-500">No difficulty signals yet.</p>
                ) : (
                  <ul className="space-y-1">
                    {destination.accommodationSummary.difficulty.map((item) => (
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
                Currency:{" "}
                <span className="font-semibold">
                  {destination.costSummary.currency}
                </span>
              </p>
              <p className="text-slate-600">
                Cost sample size:{" "}
                <span className="font-semibold">
                  {destination.costSummary.sampleSize}
                </span>
              </p>
              <p className="text-slate-700">
                Rent:{" "}
                <span className="font-medium">
                  {formatMoney(
                    destination.costSummary.averageRent,
                    currencyLabel,
                  )}
                </span>
              </p>
              <p className="text-slate-700">
                Food:{" "}
                <span className="font-medium">
                  {formatMoney(
                    destination.costSummary.averageFood,
                    currencyLabel,
                  )}
                </span>
              </p>
              <p className="text-slate-700">
                Transport:{" "}
                <span className="font-medium">
                  {formatMoney(
                    destination.costSummary.averageTransport,
                    currencyLabel,
                  )}
                </span>
              </p>
              <p className="text-slate-700">
                Social:{" "}
                <span className="font-medium">
                  {formatMoney(
                    destination.costSummary.averageSocial,
                    currencyLabel,
                  )}
                </span>
              </p>
              <p className="text-slate-700">
                Travel:{" "}
                <span className="font-medium">
                  {formatMoney(
                    destination.costSummary.averageTravel,
                    currencyLabel,
                  )}
                </span>
              </p>
              <p className="text-slate-700">
                Other:{" "}
                <span className="font-medium">
                  {formatMoney(
                    destination.costSummary.averageOther,
                    currencyLabel,
                  )}
                </span>
              </p>
              <p className="text-slate-800 font-semibold pt-2 border-t">
                Average monthly total:{" "}
                {formatMoney(
                  destination.costSummary.averageMonthlyCost,
                  currencyLabel,
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
            Course mapping examples and real student tips for this destination.
          </p>
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
                        <p className="text-slate-900 font-medium">
                          {example.homeCourseName}
                        </p>
                        <p className="text-slate-700">
                          ↔ {example.hostCourseName}
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

export const getServerSideProps: GetServerSideProps<
  DestinationDetailPageProps
> = async (context) => {
  const slug = context.params?.slug;

  if (typeof slug !== "string" || !slug.trim()) {
    return { notFound: true };
  }

  const { getPublicDestinationDetailBySlug } = await import(
    "../../src/server/publicDestinations"
  );

  const destination = await getPublicDestinationDetailBySlug(slug);

  if (!destination) {
    return { notFound: true };
  }

  return {
    props: {
      destination,
    },
  };
};
