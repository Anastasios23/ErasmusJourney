import React from "react";
import Head from "next/head";
import Link from "next/link";
import type { GetStaticPaths, GetStaticProps } from "next";

import Header from "../../../components/Header";
import PublicDestinationSubnav from "../../../src/components/PublicDestinationSubnav";
import Footer from "../../../src/components/Footer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../src/components/ui/card";
import { PUBLIC_DESTINATION_PAGE_REVALIDATE_SECONDS } from "../../../src/lib/publicDestinationCache";
import type {
  PublicDestinationCourseEquivalenceGroup,
  PublicDestinationCourseEquivalences,
} from "../../../src/types/publicDestinations";

interface DestinationCoursesPageProps {
  destination: PublicDestinationCourseEquivalences;
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="pt-5">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

export default function DestinationCoursesPage({
  destination,
}: DestinationCoursesPageProps) {
  const sortedGroups = [...destination.groups].sort(compareCourseGroups);
  const hasMappings = destination.totalMappings > 0 && sortedGroups.length > 0;

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

      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <section className="space-y-4">
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
          <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Course equivalences in {destination.city}, {destination.country}
          </h1>
          <p className="max-w-3xl text-base leading-8 text-slate-600">
            Approved course examples from Cyprus university students.
          </p>
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm leading-6 text-slate-600 shadow-sm">
            Published examples help you plan before formal academic approval.
            They are useful guidance, not final guarantees.
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <SummaryCard
            label="Course mappings"
            value={destination.totalMappings}
          />
          <SummaryCard
            label="Home universities"
            value={destination.homeUniversityCount}
          />
          <SummaryCard
            label="Approved submissions"
            value={destination.submissionCount}
          />
        </section>

        <p className="mt-4 text-sm text-slate-500">
          Examples in this page span {destination.hostUniversityCount} host{" "}
          {destination.hostUniversityCount === 1
            ? "university"
            : "universities"}
          .
        </p>

        <div className="mt-8">
          <PublicDestinationSubnav slug={destination.slug} active="courses" />
        </div>

        {!hasMappings ? (
          <Card className="mt-8 border-slate-200 shadow-sm">
            <CardContent className="py-10 text-center text-slate-600">
              Approved submissions exist for this destination, but no public
              course mappings can be shown yet.
            </CardContent>
          </Card>
        ) : (
          <section className="mt-8 grid grid-cols-1 gap-5">
            {sortedGroups.map((group) => (
              <Card
                key={`${group.homeUniversity}-${group.homeDepartment || "general"}`}
                className="border-slate-200 shadow-sm"
              >
                <CardHeader className="space-y-3">
                  <CardTitle className="text-2xl text-slate-950">
                    {group.homeUniversity}
                  </CardTitle>
                  <p className="text-sm leading-6 text-slate-600">
                    {group.homeDepartment
                      ? `${group.homeDepartment}.`
                      : "Mixed department examples."}{" "}
                    {group.mappingCount} published{" "}
                    {group.mappingCount === 1 ? "mapping" : "mappings"} across{" "}
                    {group.hostUniversities.length} host{" "}
                    {group.hostUniversities.length === 1
                      ? "university"
                      : "universities"}
                    .
                  </p>
                  {group.hostUniversities.length > 0 ? (
                    <p className="text-sm text-slate-500">
                      Host universities: {group.hostUniversities.join(", ")}
                    </p>
                  ) : null}
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
                        className="rounded-xl bg-slate-50 px-4 py-4"
                      >
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                              Home course
                            </p>
                            <p className="mt-2 text-sm font-medium text-slate-950">
                              {example.homeCourseName}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                              Matched host course
                            </p>
                            <p className="mt-2 text-sm font-medium text-slate-950">
                              {example.hostCourseName}
                            </p>
                          </div>
                        </div>

                        <p className="mt-4 text-sm text-slate-600">
                          Recognition:{" "}
                          <span className="font-medium text-slate-900">
                            {example.recognitionType}
                          </span>
                          {example.hostUniversity
                            ? ` | Host university: ${example.hostUniversity}`
                            : ""}
                        </p>

                        {example.notes ? (
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            Student note: {example.notes}
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

function compareCourseGroups(
  left: PublicDestinationCourseEquivalenceGroup,
  right: PublicDestinationCourseEquivalenceGroup,
) {
  return (
    right.mappingCount - left.mappingCount ||
    left.homeUniversity.localeCompare(right.homeUniversity) ||
    (left.homeDepartment || "").localeCompare(right.homeDepartment || "")
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const { getPublicDestinationList } = await import(
      "../../../src/server/publicDestinations"
    );
    const destinations = await getPublicDestinationList();

    return {
      paths: destinations.map((destination) => ({
        params: { slug: destination.slug },
      })),
      fallback: "blocking",
    };
  } catch (error) {
    console.error("Failed to build destination courses static paths:", error);

    return {
      paths: [],
      fallback: "blocking",
    };
  }
};

export const getStaticProps: GetStaticProps<
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
    revalidate: PUBLIC_DESTINATION_PAGE_REVALIDATE_SECONDS,
  };
};
