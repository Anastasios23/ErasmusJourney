import React, { useState, useMemo } from "react";
import Head from "next/head";
import Link from "next/link";
import type { GetStaticPaths, GetStaticProps } from "next";

import Header from "../../../components/Header";
import PublicDestinationSubnav from "../../../src/components/PublicDestinationSubnav";
import Footer from "../../../src/components/Footer";
import { Button } from "../../../src/components/ui/button";
import { Icon } from "@iconify/react";
import { PUBLIC_DESTINATION_PAGE_REVALIDATE_SECONDS } from "../../../src/lib/publicDestinationCache";
import type {
  PublicDestinationCourseEquivalenceGroup,
  PublicDestinationCourseEquivalences,
} from "../../../src/types/publicDestinations";

interface DestinationCoursesPageProps {
  destination: PublicDestinationCourseEquivalences;
}

function ExpandableNote({ note }: { note: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className="mt-3 border-t border-slate-200 pt-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
      >
        <Icon
          icon={
            isExpanded ? "solar:chevron-up-bold" : "solar:chevron-down-bold"
          }
          className="w-4 h-4"
        />
        {isExpanded ? "Hide" : "Show"} student note
      </button>
      {isExpanded && (
        <p className="mt-2 text-sm text-slate-600 italic">{note}</p>
      )}
    </div>
  );
}

export default function DestinationCoursesPage({
  destination,
}: DestinationCoursesPageProps) {
  const [homeUniversityFilter, setHomeUniversityFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [courseNameSearch, setCourseNameSearch] = useState("");

  // Get unique universities and departments for filters
  const uniqueUniversities = Array.from(
    new Set(destination.groups.map((g) => g.homeUniversity)),
  ).sort();

  const uniqueDepartments = Array.from(
    new Set(
      destination.groups.flatMap((g) =>
        g.homeDepartment ? [g.homeDepartment] : [],
      ),
    ),
  ).sort();

  // Filter and sort groups
  const filteredAndSortedGroups = useMemo(() => {
    let filtered = destination.groups.filter((group) => {
      const universityMatch =
        !homeUniversityFilter || group.homeUniversity === homeUniversityFilter;
      const departmentMatch =
        !departmentFilter ||
        group.homeDepartment === departmentFilter ||
        (!departmentFilter && !group.homeDepartment);

      const courseMatch = !courseNameSearch
        ? true
        : group.examples.some(
            (ex) =>
              ex.homeCourseName
                .toLowerCase()
                .includes(courseNameSearch.toLowerCase()) ||
              ex.hostCourseName
                .toLowerCase()
                .includes(courseNameSearch.toLowerCase()),
          );

      return universityMatch && departmentMatch && courseMatch;
    });

    // Sort: prioritize student's own university first, then by mapping count
    return filtered.sort((a, b) => {
      // If filters applied, prioritize the filtered university
      if (homeUniversityFilter) {
        const aMatches = a.homeUniversity === homeUniversityFilter ? 1 : 0;
        const bMatches = b.homeUniversity === homeUniversityFilter ? 1 : 0;
        if (aMatches !== bMatches) return bMatches - aMatches;
      }
      // Then sort by mapping count
      return b.mappingCount - a.mappingCount;
    });
  }, [
    destination.groups,
    homeUniversityFilter,
    departmentFilter,
    courseNameSearch,
  ]);

  const hasMappings =
    destination.totalMappings > 0 && filteredAndSortedGroups.length > 0;
  const topUniversities = uniqueUniversities.slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>{`Course examples in ${destination.city}, ${destination.country} | Erasmus Journey`}</title>
        <meta
          name="description"
          content={`Course equivalence examples for ${destination.city}, ${destination.country}.`}
        />
      </Head>

      <Header />

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero section - compact */}
        <section className="mb-8 border-b border-gray-200 pb-8">
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-4">
            <Link href="/destinations" className="hover:text-gray-900">
              Destinations
            </Link>
            <span>/</span>
            <Link
              href={`/destinations/${destination.slug}`}
              className="hover:text-gray-900"
            >
              {destination.city}
            </Link>
            <span>/</span>
            <span>Course examples</span>
          </div>

          <h1 className="text-3xl font-semibold text-gray-900 mb-3">
            Course examples in {destination.city}
          </h1>

          <p className="text-sm text-gray-600 mb-4">
            Published examples help plan before formal academic approval. Useful
            guidance, not final guarantees.
          </p>

          {topUniversities.length > 0 && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Best for students from:</span>{" "}
              {topUniversities.join(", ")}
            </p>
          )}
        </section>

        {/* Stats - 3 simple cards */}
        <section className="mb-8 grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-xs text-gray-600">Published mappings</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {destination.totalMappings}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-xs text-gray-600">Home universities</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {destination.homeUniversityCount}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-xs text-gray-600">Host universities</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {destination.hostUniversityCount}
            </p>
          </div>
        </section>

        <p className="mb-6 text-sm text-gray-600">
          Grouped by home university and department so you can scan examples
          closest to your degree.
        </p>

        {/* Subnav */}
        <div className="mb-8">
          <PublicDestinationSubnav slug={destination.slug} active="courses" />
        </div>

        {/* Filters */}
        <section className="mb-8 space-y-3 p-4 rounded-lg bg-gray-50 border border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Home university
              </label>
              <select
                value={homeUniversityFilter}
                onChange={(e) => setHomeUniversityFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
              >
                <option value="">All universities</option>
                {uniqueUniversities.map((uni) => (
                  <option key={uni} value={uni}>
                    {uni}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Department
              </label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
              >
                <option value="">All departments</option>
                {uniqueDepartments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Course name
              </label>
              <input
                type="text"
                placeholder="Search..."
                value={courseNameSearch}
                onChange={(e) => setCourseNameSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {(homeUniversityFilter || departmentFilter || courseNameSearch) && (
            <button
              onClick={() => {
                setHomeUniversityFilter("");
                setDepartmentFilter("");
                setCourseNameSearch("");
              }}
              className="text-xs font-medium text-blue-700 hover:text-blue-800"
            >
              Clear filters
            </button>
          )}
        </section>

        {/* Course groups */}
        {!hasMappings ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-6 py-8 text-center">
            <p className="text-gray-600">
              {filteredAndSortedGroups.length === 0 &&
              (homeUniversityFilter || departmentFilter || courseNameSearch)
                ? "No course examples match this selection yet. Try another university or department."
                : "No course examples available yet."}
            </p>
          </div>
        ) : (
          <section className="space-y-4">
            {filteredAndSortedGroups.map((group) => (
              <article
                key={`${group.homeUniversity}-${group.homeDepartment || "general"}`}
                className="rounded-lg border border-gray-200 bg-white overflow-hidden"
              >
                {/* Group header */}
                <div className="border-b border-gray-200 px-5 py-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {group.homeUniversity}
                  </h2>
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-gray-600">
                    {group.homeDepartment && (
                      <div>
                        <p className="text-xs text-gray-500">Department</p>
                        <p className="font-medium text-gray-900">
                          {group.homeDepartment}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-500">Examples</p>
                      <p className="font-medium text-gray-900">
                        {group.mappingCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Host universities</p>
                      <p className="font-medium text-gray-900">
                        {group.hostUniversities.length}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mappings list */}
                <div className="divide-y divide-gray-200">
                  {group.examples.map((example, index) => (
                    <div
                      key={[
                        example.homeCourseName,
                        example.hostCourseName,
                        example.hostUniversity || "",
                        index,
                      ].join("|")}
                      className="px-5 py-4"
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Home course
                          </p>
                          <p className="mt-1 font-medium text-gray-900">
                            {example.homeCourseName}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Host course
                          </p>
                          <p className="mt-1 font-medium text-gray-900">
                            {example.hostCourseName}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-2 text-sm text-gray-700">
                        <span className="font-medium">
                          {example.recognitionType}
                        </span>
                        {example.hostUniversity && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-600">
                              {example.hostUniversity}
                            </span>
                          </>
                        )}
                      </div>

                      {example.notes && <ExpandableNote note={example.notes} />}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </section>
        )}

        {/* Bottom CTA */}
        {hasMappings && (
          <section className="mt-12 border-t border-gray-200 pt-8 text-center">
            <p className="mb-4 text-gray-600">
              Next, check housing and budget details for {destination.city}.
            </p>
            <Link href={`/destinations/${destination.slug}/accommodation`}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                See housing insights
              </Button>
            </Link>
          </section>
        )}
      </main>

      <Footer />
    </div>
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
