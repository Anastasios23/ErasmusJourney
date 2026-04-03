import React from "react";
import Head from "next/head";
import Link from "next/link";
import type { GetStaticPaths, GetStaticProps } from "next";

import Header from "../../../components/Header";
import PublicDestinationSignalNotice from "../../../src/components/PublicDestinationSignalNotice";
import PublicDestinationSubnav from "../../../src/components/PublicDestinationSubnav";
import Footer from "../../../src/components/Footer";
import { Badge } from "../../../src/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
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

export default function DestinationCoursesPage({
  destination,
}: DestinationCoursesPageProps) {
  const sortedGroups = [...destination.groups].sort(compareCourseGroups);
  const hasMappings =
    destination.totalMappings > 0 && sortedGroups.length > 0;
  const leadingGroup = sortedGroups[0] ?? null;

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
          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
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
          <>
            <section>
              <Card>
                <CardHeader className="space-y-3">
                  <CardTitle>How to read these equivalence examples</CardTitle>
                  <CardDescription className="text-slate-600">
                    Each card starts from the home university and department, so
                    you can scan examples that are closest to the curriculum you
                    already know.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 text-sm md:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 text-slate-700">
                    <p className="font-medium text-slate-900">
                      Grouped by home context
                    </p>
                    <p className="mt-2">
                      Cards are grouped by home university and department before
                      showing published host-side matches.
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 text-slate-700">
                    <p className="font-medium text-slate-900">
                      Counted by approved examples
                    </p>
                    <p className="mt-2">
                      Mapping counts show how many approved public examples are
                      available in each group.
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 text-slate-700">
                    <p className="font-medium text-slate-900">
                      Useful for planning, not guarantees
                    </p>
                    <p className="mt-2">
                      These examples help you prepare before formal academic
                      approval. They do not replace your department&apos;s final
                      decision.
                    </p>
                  </div>
                </CardContent>
                {leadingGroup ? (
                  <CardContent className="pt-0 text-sm text-slate-600">
                    Largest current example set:{" "}
                    <span className="font-medium text-slate-900">
                      {leadingGroup.homeUniversity}
                      {leadingGroup.homeDepartment
                        ? ` (${leadingGroup.homeDepartment})`
                        : ""}
                    </span>
                    .
                  </CardContent>
                ) : null}
              </Card>
            </section>

            <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {sortedGroups.map((group) => (
                <Card
                  key={`${group.homeUniversity}-${group.homeDepartment || "general"}`}
                >
                  <CardHeader className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-xl">
                          {group.homeUniversity}
                        </CardTitle>
                        {group.homeDepartment ? (
                          <Badge variant="outline">{group.homeDepartment}</Badge>
                        ) : (
                          <Badge variant="secondary">
                            General department mix
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-slate-600">
                        Start here if you want published examples from students
                        coming from {group.homeUniversity}
                        {group.homeDepartment
                          ? `, ${group.homeDepartment}`
                          : ""}.
                      </CardDescription>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">
                        {group.mappingCount} published{" "}
                        {group.mappingCount === 1 ? "mapping" : "mappings"}
                      </Badge>
                      <Badge variant="outline">
                        {group.hostUniversities.length} host{" "}
                        {group.hostUniversities.length === 1
                          ? "university"
                          : "universities"}
                      </Badge>
                    </div>

                    {group.hostUniversities.length > 0 ? (
                      <p className="text-sm text-slate-600">
                        Seen at{" "}
                        <span className="font-medium text-slate-900">
                          {group.hostUniversities.join(", ")}
                        </span>
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
                          className="rounded-xl border border-slate-200 bg-white px-4 py-4"
                        >
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Home course
                              </p>
                              <p className="text-sm font-medium text-slate-900">
                                {example.homeCourseName}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Matched host course
                              </p>
                              <p className="text-sm font-medium text-slate-900">
                                {example.hostCourseName}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {example.hostUniversity ? (
                              <Badge variant="secondary">
                                {example.hostUniversity}
                              </Badge>
                            ) : null}
                            <Badge variant="outline">
                              Recognition: {example.recognitionType}
                            </Badge>
                          </div>

                          {example.notes ? (
                            <p className="mt-3 text-sm text-slate-600">
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
          </>
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
