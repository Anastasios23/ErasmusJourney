import Head from "next/head";
import Link from "next/link";
import type { GetServerSideProps } from "next";

import Header from "../../../components/Header";
import PublicDestinationSubnav from "../../../src/components/PublicDestinationSubnav";
import Footer from "../../../src/components/Footer";
import { Badge } from "../../../src/components/ui/badge";
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
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card>
                <CardHeader>
                  <CardTitle>Snapshot</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="text-slate-700">
                    Average rent:{" "}
                    <span className="font-semibold text-slate-900">
                      {formatPublicDestinationMoney(
                        destination.averageRent,
                        destination.currency,
                      )}
                    </span>
                  </p>
                  <p className="text-slate-700">
                    Rent sample size:{" "}
                    <span className="font-semibold text-slate-900">
                      {destination.rentSampleSize}
                    </span>
                  </p>
                  <p className="text-slate-700">
                    Positive recommendations:{" "}
                    <span className="font-semibold text-slate-900">
                      {destination.recommendationYesCount}/
                      {destination.recommendationSampleSize}
                    </span>
                  </p>
                  <p className="text-slate-600">
                    Neighborhood labels and snippets are shortened and filtered
                    before publication.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Accommodation type distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  {destination.types.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No accommodation type data yet.
                    </p>
                  ) : (
                    <ul className="space-y-3 text-sm">
                      {destination.types.map((item) => {
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
                                {share === null ? "" : ` • ${share}%`}
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

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card>
                <CardHeader>
                  <CardTitle>Difficulty finding accommodation</CardTitle>
                </CardHeader>
                <CardContent>
                  {destination.difficulty.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No difficulty signals yet.
                    </p>
                  ) : (
                    <ul className="space-y-2 text-sm">
                      {destination.difficulty.map((item) => (
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
                <CardHeader>
                  <CardTitle>Common areas and neighborhoods</CardTitle>
                </CardHeader>
                <CardContent>
                  {destination.commonAreas.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No neighborhood data yet.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {destination.commonAreas.map((area) => (
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
                <CardHeader>
                  <CardTitle>Sanitized student review snippets</CardTitle>
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
