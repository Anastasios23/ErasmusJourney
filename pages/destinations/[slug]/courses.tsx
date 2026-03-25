import React from "react";
import Head from "next/head";
import Link from "next/link";
import type { GetServerSideProps } from "next";

import Header from "../../../components/Header";
import PublicDestinationSignalNotice from "../../../src/components/PublicDestinationSignalNotice";
import PublicDestinationSubnav from "../../../src/components/PublicDestinationSubnav";
import Footer from "../../../src/components/Footer";
import { Badge } from "../../../src/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../src/components/ui/card";
import type { PublicDestinationCourseEquivalences } from "../../../src/types/publicDestinations";

interface DestinationCoursesPageProps {
  destination: PublicDestinationCourseEquivalences;
}

export default function DestinationCoursesPage({
  destination,
}: DestinationCoursesPageProps) {
  const hasMappings =
    destination.totalMappings > 0 && destination.groups.length > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <Head>
        <title>{`Course equivalences in ${destination.city}, ${destination.country} | Erasmus Journey`}</title>
        <meta
          name="description"
          content={`Approved course equivalence examples for ${destination.city}, ${destination.country}.`}
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
          <Badge variant="secondary">Course equivalences</Badge>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
            Course equivalences in {destination.city}, {destination.country}
          </h1>
          <p className="max-w-3xl text-sm text-slate-600">
            Approved mappings only. Student identities are not shown, and notes
            are shortened before publication.
          </p>
          <PublicDestinationSignalNotice
            submissionCount={destination.submissionCount}
            hostUniversityCount={destination.hostUniversityCount}
          />
          <PublicDestinationSubnav slug={destination.slug} active="courses" />
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
                <p className="text-slate-500">Home universities</p>
                <p className="font-semibold text-slate-900">
                  {destination.homeUniversityCount}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <p className="text-slate-500">Course mappings</p>
                <p className="font-semibold text-slate-900">
                  {destination.totalMappings}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {!hasMappings ? (
          <Card>
            <CardHeader>
              <CardTitle>No approved course mappings yet</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              Approved submissions exist for this destination, but none of them
              currently include public course equivalence examples that can be
              shown here.
            </CardContent>
          </Card>
        ) : (
          <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {destination.groups.map((group) => (
              <Card key={`${group.homeUniversity}-${group.homeDepartment || "general"}`}>
                <CardHeader className="space-y-3">
                  <div className="space-y-2">
                    <CardTitle>{group.homeUniversity}</CardTitle>
                    {group.homeDepartment ? (
                      <Badge variant="outline">{group.homeDepartment}</Badge>
                    ) : null}
                  </div>
                  <div className="text-sm text-slate-600 space-y-1">
                    <p>
                      Mapping count:{" "}
                      <span className="font-medium text-slate-900">
                        {group.mappingCount}
                      </span>
                    </p>
                    {group.hostUniversities.length > 0 ? (
                      <p>
                        Seen at:{" "}
                        <span className="text-slate-700">
                          {group.hostUniversities.join(", ")}
                        </span>
                      </p>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {group.examples.map((example, index) => (
                      <li
                        key={[
                          example.homeCourseName,
                          example.hostCourseName,
                          example.hostUniversity || "",
                          index,
                        ].join("|")}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3"
                      >
                        <p className="text-sm font-medium text-slate-900">
                          {example.homeCourseName}
                        </p>
                        <p className="text-sm text-slate-700">
                          → {example.hostCourseName}
                        </p>
                        {example.hostUniversity ? (
                          <p className="text-sm text-slate-500">
                            Host university: {example.hostUniversity}
                          </p>
                        ) : null}
                        <p className="text-sm text-slate-600">
                          Recognition: {example.recognitionType}
                        </p>
                        {example.notes ? (
                          <p className="text-sm text-slate-500">
                            Notes: {example.notes}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<
  DestinationCoursesPageProps
> = async (context) => {
  const slug = context.params?.slug;

  if (typeof slug !== "string" || !slug.trim()) {
    return { notFound: true };
  }

  const {
    getPublicCourseEquivalencesByDestinationSlug,
    getPublicDestinationList,
  } = await import("../../../src/server/publicDestinations");

  const destination = await getPublicCourseEquivalencesByDestinationSlug(slug);

  if (!destination && !slug.includes("-")) {
    const destinations = await getPublicDestinationList();
    const matchedByCity = destinations.find(
      (item) => item.city.toLowerCase().replace(/\s+/g, "-") === slug,
    );

    if (matchedByCity) {
      return {
        redirect: {
          destination: `/destinations/${matchedByCity.slug}/courses`,
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
