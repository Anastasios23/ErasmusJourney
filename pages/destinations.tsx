import Head from "next/head";
import Link from "next/link";
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
import type { PublicDestinationListItem } from "../src/types/publicDestinations";

interface DestinationsPageProps {
  destinations: PublicDestinationListItem[];
}

function formatCurrency(value: number | null): string {
  if (value === null) {
    return "N/A";
  }

  return `€${Math.round(value).toLocaleString()}`;
}

export default function DestinationsPage({
  destinations,
}: DestinationsPageProps) {
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
            This page consumes approved Erasmus submissions and shows the first
            MVP public metrics for each destination.
          </p>
        </section>

        {destinations.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-slate-600">
              No approved destination data available yet.
            </CardContent>
          </Card>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {destinations.map((destination) => (
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
                      <p className="text-slate-500">Student submissions</p>
                      <p className="font-semibold text-slate-900">
                        {destination.submissionCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Average rent</p>
                      <p className="font-semibold text-slate-900">
                        {formatCurrency(destination.averageRent)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Average monthly cost</p>
                      <p className="font-semibold text-slate-900">
                        {formatCurrency(destination.averageMonthlyCost)}
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
