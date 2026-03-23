import Head from "next/head";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { GetServerSideProps } from "next";
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
import { formatPublicDestinationListAmount } from "../src/lib/publicDestinationPresentation";
import type { PublicDestinationListItem } from "../src/types/publicDestinations";

interface DestinationsPageProps {
  destinations: PublicDestinationListItem[];
}

export default function DestinationsPage({
  destinations,
}: DestinationsPageProps) {
  const [countryFilter, setCountryFilter] = useState<string>("__all");
  const [sortBy, setSortBy] = useState<
    "submission_desc" | "cost_asc" | "city_asc"
  >("submission_desc");

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
    const filtered = destinations.filter((destination) => {
      if (countryFilter === "__all") {
        return true;
      }

      return destination.country === countryFilter;
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
  }, [countryFilter, destinations, sortBy]);

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
        </section>

        <section className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Badge variant="outline">
              Showing {filteredAndSortedDestinations.length} /{" "}
              {destinations.length}
            </Badge>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
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
              No destinations match the selected country filter.
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

export const getServerSideProps: GetServerSideProps<
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
  };
};
