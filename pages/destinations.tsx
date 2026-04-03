import Head from "next/head";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { useRouter } from "next/router";
import type { GetStaticProps } from "next";
import Header from "../components/Header";
import Footer from "../src/components/Footer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import { Badge } from "../src/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../src/components/ui/select";
import { Input } from "../src/components/ui/input";
import PublicDestinationSignalNotice from "../src/components/PublicDestinationSignalNotice";
import { PUBLIC_DESTINATION_PAGE_REVALIDATE_SECONDS } from "../src/lib/publicDestinationCache";
import { formatPublicDestinationListAmount } from "../src/lib/publicDestinationPresentation";
import type { PublicDestinationListItem } from "../src/types/publicDestinations";

interface DestinationsPageProps {
  destinations: PublicDestinationListItem[];
}

type DestinationsFocus = "accommodation" | "courses" | null;

export default function DestinationsPage({ destinations }: DestinationsPageProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState<string>("__all");
  const [sortBy, setSortBy] = useState<
    "submission_desc" | "cost_asc" | "city_asc"
  >("submission_desc");
  const focusParam = router.query.focus;
  const focus =
    focusParam === "accommodation" || focusParam === "courses"
      ? focusParam
      : null;

  const countries = useMemo(
    () =>
      Array.from(
        new Set(destinations.map((destination) => destination.country)),
      )
        .filter(Boolean)
        .sort((left, right) => left.localeCompare(right)),
    [destinations],
  );

  const filteredAndSortedDestinations = useMemo(() => {
    const normalizedSearchQuery = searchQuery.trim().toLowerCase();
    const filtered = destinations.filter((destination) => {
      const matchesCountry =
        countryFilter === "__all" || destination.country === countryFilter;
      const matchesSearch =
        !normalizedSearchQuery ||
        [destination.city, destination.country, destination.slug]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearchQuery);

      if (!matchesCountry) {
        return false;
      }

      return matchesSearch;
    });

    const sorted = [...filtered].sort((left, right) => {
      if (sortBy === "submission_desc") {
        return right.submissionCount - left.submissionCount;
      }

      if (sortBy === "cost_asc") {
        const leftCost = left.averageMonthlyCost ?? Number.POSITIVE_INFINITY;
        const rightCost = right.averageMonthlyCost ?? Number.POSITIVE_INFINITY;
        return leftCost - rightCost;
      }

      return left.city.localeCompare(right.city);
    });

    return sorted;
  }, [countryFilter, destinations, searchQuery, sortBy]);

  const focusGuidance = getDestinationsFocusGuidance(focus);

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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-8">
        <section className="space-y-3">
          <Badge variant="secondary">Public Destination Data</Badge>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
            Destination list from approved submissions
          </h1>
          <p className="text-slate-600 max-w-3xl">
            Only approved, complete submissions are included here. Cost figures
            on this list intentionally omit a currency symbol because each
            destination can report a different local currency or mixed
            currencies.
          </p>
          <p className="text-sm text-slate-500 max-w-3xl">
            Use this list to compare cities quickly, then open a destination to
            inspect accommodation and course detail with the right level of
            confidence.
          </p>
        </section>

        {focusGuidance ? (
          <Card className="border-sky-200 bg-sky-50">
            <CardContent className="space-y-2 py-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="info">{focusGuidance.badge}</Badge>
                <p className="text-sm font-medium text-sky-950">
                  {focusGuidance.title}
                </p>
              </div>
              <p className="text-sm text-sky-900/80 max-w-3xl">
                {focusGuidance.description}
              </p>
            </CardContent>
          </Card>
        ) : null}

        <section className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <Badge variant="outline">
              Showing {filteredAndSortedDestinations.length} /{" "}
              {destinations.length}
            </Badge>
            {searchQuery.trim() ? (
              <Badge variant="outline">Search: {searchQuery.trim()}</Badge>
            ) : null}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end w-full sm:w-auto">
            <div className="w-full sm:w-72">
              <label htmlFor="destination-search" className="sr-only">
                Search destinations
              </label>
              <Input
                id="destination-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by city, country, or slug"
                aria-describedby="destination-search-help"
              />
              <p
                id="destination-search-help"
                className="mt-1 text-xs text-slate-500"
              >
                Search by city, country, or slug.
              </p>
            </div>

            <div className="w-full sm:w-52">
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

            <div className="w-full sm:w-56">
              <Select
                value={sortBy}
                onValueChange={(value) =>
                  setSortBy(
                    value as "submission_desc" | "cost_asc" | "city_asc",
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="submission_desc">
                    Most submissions
                  </SelectItem>
                  <SelectItem value="cost_asc">Lowest monthly cost</SelectItem>
                  <SelectItem value="city_asc">City A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {destinations.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-slate-600">
              No approved destination data available yet.
            </CardContent>
          </Card>
        ) : filteredAndSortedDestinations.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-slate-600">
              No destinations match the current search and filter selection.
            </CardContent>
          </Card>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredAndSortedDestinations.map((destination) => (
              <Link
                key={destination.slug}
                href={`/destinations/${destination.slug}`}
                className="block"
              >
                <Card className="h-full hover:border-slate-400 transition-colors">
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-xl text-slate-900">
                      {destination.city}, {destination.country}
                    </CardTitle>
                    <p className="text-sm text-slate-500">
                      /{destination.slug}
                    </p>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">Host universities</p>
                      <p className="font-semibold text-slate-900">
                        {destination.hostUniversityCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Approved submissions</p>
                      <p className="font-semibold text-slate-900">
                        {destination.submissionCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Average rent</p>
                      <p className="font-semibold text-slate-900">
                        {formatPublicDestinationListAmount(
                          destination.averageRent,
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Average monthly cost</p>
                      <p className="font-semibold text-slate-900">
                        {formatPublicDestinationListAmount(
                          destination.averageMonthlyCost,
                        )}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <PublicDestinationSignalNotice
                        submissionCount={destination.submissionCount}
                        hostUniversityCount={destination.hostUniversityCount}
                        compact
                      />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

export const getStaticProps: GetStaticProps<DestinationsPageProps> = async () => {
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

function getDestinationsFocusGuidance(focus: DestinationsFocus) {
  if (focus === "accommodation") {
    return {
      badge: "Accommodation Flow",
      title: "Housing insights live inside each destination page.",
      description:
        "Open a city first, then use its accommodation tab to compare rent signals, neighborhood patterns, and anonymized student reviews.",
    };
  }

  if (focus === "courses") {
    return {
      badge: "Courses Flow",
      title: "Course examples live inside each destination page.",
      description:
        "Open a city first, then use its courses tab to inspect published equivalence examples grouped by home university and department.",
    };
  }

  return null;
}
