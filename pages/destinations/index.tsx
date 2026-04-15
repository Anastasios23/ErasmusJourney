import Head from "next/head";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import type { GetStaticProps } from "next";

import Header from "../../components/Header";
import Footer from "../../src/components/Footer";
import { Badge } from "../../src/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../src/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../src/components/ui/select";
import type { PublicDestinationListItem } from "../../src/types/publicDestinations";

const DESTINATIONS_REVALIDATE_SECONDS = 3600;

interface DestinationsIndexPageProps {
  destinations: PublicDestinationListItem[];
}

function formatMonthYear(value: string | null): string {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function formatAverageRent(value: number): string {
  return `€${Math.round(value).toLocaleString("en-US")}/mo`;
}

export default function DestinationsIndexPage({
  destinations,
}: DestinationsIndexPageProps) {
  const [countryFilter, setCountryFilter] = useState("__all");

  const countries = useMemo(
    () =>
      Array.from(
        new Set(destinations.map((destination) => destination.country)),
      )
        .filter(Boolean)
        .sort((left, right) => left.localeCompare(right)),
    [destinations],
  );

  const filteredDestinations = useMemo(() => {
    return [...destinations]
      .filter(
        (destination) =>
          countryFilter === "__all" || destination.country === countryFilter,
      )
      .sort(
        (left, right) =>
          right.submissionCount - left.submissionCount ||
          left.city.localeCompare(right.city),
      );
  }, [countryFilter, destinations]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Head>
        <title>Erasmus Destinations | Erasmus Journey</title>
        <meta
          name="description"
          content="Explore Erasmus destination cities based on real student reports from Cyprus universities."
        />
      </Head>

      <Header />

      <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <section className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Erasmus Destinations
          </h1>
          <p className="max-w-3xl text-base leading-8 text-slate-600">
            Explore cities based on real student reports from Cyprus
            universities.
          </p>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="max-w-xs">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Country filter
            </label>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">All countries</SelectItem>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {destinations.length === 0 ? (
          <Card className="mt-8 border-slate-200 shadow-sm">
            <CardContent className="space-y-3 py-10 text-center text-slate-600">
              <p>
                No destinations have been reported yet.
                <br />
                Be the first to share your Erasmus experience.
              </p>
              <Link
                href="/share-experience"
                className="inline-flex font-medium text-sky-700 underline underline-offset-4"
              >
                Share your Erasmus experience
              </Link>
            </CardContent>
          </Card>
        ) : filteredDestinations.length === 0 ? (
          <Card className="mt-8 border-slate-200 shadow-sm">
            <CardContent className="py-10 text-center text-slate-600">
              No destinations match the selected country.
            </CardContent>
          </Card>
        ) : (
          <section className="mt-8 grid gap-5 md:grid-cols-2">
            {filteredDestinations.map((destination) => {
              const reportsLabel =
                destination.submissionCount === 1
                  ? "1 student report"
                  : `${destination.submissionCount} student reports`;

              return (
                <Card
                  key={destination.slug}
                  className="h-full border-slate-200 bg-white shadow-sm"
                >
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-2xl tracking-tight text-slate-950">
                          <Link
                            href={`/destinations/${destination.slug}`}
                            className="underline-offset-4 hover:underline"
                          >
                            {destination.city}
                          </Link>
                        </CardTitle>
                        <p className="mt-1 text-sm text-slate-600">
                          {destination.country}
                        </p>
                      </div>

                      {destination.submissionCount < 3 ? (
                        <Badge variant="secondary">Limited data</Badge>
                      ) : null}
                    </div>

                    <p className="text-sm font-medium text-slate-700">
                      {reportsLabel}
                    </p>
                  </CardHeader>

                  <CardContent className="space-y-2 text-sm text-slate-600">
                    {destination.averageRent !== null ? (
                      <p>
                        Avg rent: {formatAverageRent(destination.averageRent)}
                      </p>
                    ) : null}
                    <p>
                      Last report:{" "}
                      {formatMonthYear(destination.latestReportSubmittedAt)}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

export const getStaticProps: GetStaticProps<
  DestinationsIndexPageProps
> = async () => {
  const { getPublicDestinationList } = await import(
    "../../src/server/publicDestinations"
  );

  const destinations = await getPublicDestinationList();

  return {
    props: {
      destinations,
    },
    revalidate: DESTINATIONS_REVALIDATE_SECONDS,
  };
};
