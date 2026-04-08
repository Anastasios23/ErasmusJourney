import Head from "next/head";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import type { GetStaticProps } from "next";

import Header from "../components/Header";
import Footer from "../src/components/Footer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../src/components/ui/select";
import { Input } from "../src/components/ui/input";
import { PUBLIC_DESTINATION_PAGE_REVALIDATE_SECONDS } from "../src/lib/publicDestinationCache";
import {
  formatPublicDestinationFreshness,
  formatPublicDestinationListAmount,
  getPublicDestinationSignalSummary,
} from "../src/lib/publicDestinationPresentation";
import type { PublicDestinationListItem } from "../src/types/publicDestinations";

interface DestinationsPageProps {
  destinations: PublicDestinationListItem[];
}

function DestinationListCard({
  destination,
}: {
  destination: PublicDestinationListItem;
}) {
  const signal = getPublicDestinationSignalSummary(
    destination.submissionCount,
    destination.hostUniversityCount,
  );

  return (
    <Link href={`/destinations/${destination.slug}`} className="block h-full">
      <Card className="h-full border-slate-200 shadow-sm transition-shadow hover:shadow-md">
        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl tracking-tight text-slate-950">
            {destination.city}, {destination.country}
          </CardTitle>
          <p className="text-sm font-medium text-slate-700">
            Based on {destination.submissionCount} approved{" "}
            {destination.submissionCount === 1 ? "submission" : "submissions"}
          </p>
          <p className="text-sm leading-6 text-slate-500">
            {getDestinationSignalLine(signal.tone)}
          </p>
          <p className="text-xs text-slate-500">
            Latest approved report:{" "}
            {formatPublicDestinationFreshness(
              destination.latestReportSubmittedAt,
            )}
          </p>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
              <span className="text-slate-600">Avg rent</span>
              <span className="font-semibold text-slate-950">
                {formatPublicDestinationListAmount(destination.averageRent)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
              <span className="text-slate-600">Avg monthly budget</span>
              <span className="font-semibold text-slate-950">
                {formatPublicDestinationListAmount(
                  destination.averageMonthlyCost,
                )}
              </span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <span className="text-sm font-medium text-sky-700">
              View destination
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function DestinationsPage({
  destinations,
}: DestinationsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState<string>("__all");

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
    const normalizedSearchQuery = searchQuery.trim().toLowerCase();

    return [...destinations]
      .filter((destination) => {
        const matchesCountry =
          countryFilter === "__all" || destination.country === countryFilter;
        const matchesSearch =
          !normalizedSearchQuery ||
          [destination.city, destination.country, destination.slug]
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearchQuery);

        return matchesCountry && matchesSearch;
      })
      .sort((left, right) => right.submissionCount - left.submissionCount);
  }, [countryFilter, destinations, searchQuery]);

  const normalizedSearchQuery = searchQuery.trim();

  return (
    <div className="min-h-screen bg-slate-50">
      <Head>
        <title>Destinations | Erasmus Journey</title>
        <meta
          name="description"
          content="Approved Erasmus submissions grouped by destination with core city-level stats."
        />
      </Head>

      <Header />

      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <section className="space-y-4">
          <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Explore Erasmus destinations
          </h1>
          <p className="max-w-3xl text-base leading-8 text-slate-600">
            Compare cities using approved student submissions from Cyprus
            universities.
          </p>
          <p className="max-w-3xl text-sm leading-7 text-slate-500">
            Monthly rent is the minimum cost signal. Food, transport, social,
            travel, and other student-reported costs expand the monthly
            estimate when available, and mixed currencies remain directional.
          </p>
          <p className="max-w-3xl text-sm leading-7 text-slate-500">
            Trust signals include sample size and the latest approved report
            date for each destination.
          </p>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[1fr_220px]">
            <div>
              <label htmlFor="destination-search" className="sr-only">
                Search destinations
              </label>
              <Input
                id="destination-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by city or country"
              />
            </div>

            <div>
              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by country" />
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
          </div>

          <p className="mt-4 text-sm text-slate-500">
            Showing {filteredDestinations.length} of {destinations.length}{" "}
            destinations
            {normalizedSearchQuery ? ` for "${normalizedSearchQuery}"` : ""}.
          </p>
        </section>

        {destinations.length === 0 ? (
          <Card className="mt-8 border-slate-200 shadow-sm">
            <CardContent className="py-10 text-center text-slate-600">
              No approved destination data available yet.
            </CardContent>
          </Card>
        ) : filteredDestinations.length === 0 ? (
          <Card className="mt-8 border-slate-200 shadow-sm">
            <CardContent className="py-10 text-center text-slate-600">
              No destinations match the current search and filter selection.
            </CardContent>
          </Card>
        ) : (
          <section className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
            {filteredDestinations.map((destination) => (
              <DestinationListCard
                key={destination.slug}
                destination={destination}
              />
            ))}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

export const getStaticProps: GetStaticProps<
  DestinationsPageProps
> = async () => {
  const { getPublicDestinationList } = await import(
    "../src/server/publicDestinations"
  );

  const destinations = await getPublicDestinationList();

  return {
    props: {
      destinations,
    },
    revalidate: PUBLIC_DESTINATION_PAGE_REVALIDATE_SECONDS,
  };
};

function getDestinationSignalLine(tone: "warning" | "info" | "success") {
  if (tone === "warning") {
    return "Limited data. Use this as guidance.";
  }

  if (tone === "info") {
    return "A useful amount of student data is available.";
  }

  return "Good amount of student data.";
}
