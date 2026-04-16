import Head from "next/head";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import type { GetStaticProps } from "next";

import Header from "../components/Header";
import Footer from "../src/components/Footer";
import { Badge } from "../src/components/ui/badge";
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

const COURSE_MATCHING_REVALIDATE_SECONDS = 3600;

type CourseExampleRow = {
  homeUniversity: string;
  homeCourseName: string;
  hostUniversity: string | null;
  hostCity: string;
  hostCourseName: string;
  credits: number | null;
  recognitionType: string;
};

interface CourseMatchingExperiencesPageProps {
  examples: CourseExampleRow[];
}

function formatCredits(value: number | null): string {
  if (typeof value !== "number") {
    return "Not enough data";
  }

  return `${value} ECTS`;
}

export default function CourseMatchingExperiencesPage({
  examples,
}: CourseMatchingExperiencesPageProps) {
  const [homeUniversityFilter, setHomeUniversityFilter] = useState("__all");

  const homeUniversities = useMemo(
    () =>
      Array.from(new Set(examples.map((example) => example.homeUniversity)))
        .filter(Boolean)
        .sort((left, right) => left.localeCompare(right)),
    [examples],
  );

  const filteredExamples = useMemo(() => {
    return [...examples]
      .filter(
        (example) =>
          homeUniversityFilter === "__all" ||
          example.homeUniversity === homeUniversityFilter,
      )
      .sort((left, right) => {
        if (left.homeUniversity !== right.homeUniversity) {
          return left.homeUniversity.localeCompare(right.homeUniversity);
        }

        if (left.hostCity !== right.hostCity) {
          return left.hostCity.localeCompare(right.hostCity);
        }

        if (left.homeCourseName !== right.homeCourseName) {
          return left.homeCourseName.localeCompare(right.homeCourseName);
        }

        return left.hostCourseName.localeCompare(right.hostCourseName);
      });
  }, [examples, homeUniversityFilter]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Head>
        <title>Course Matching Experiences | Erasmus Journey</title>
        <meta
          name="description"
          content="Browse peer Erasmus course equivalency examples shared by Cyprus university students."
        />
      </Head>

      <Header />

      <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <section className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Public Course Equivalency Examples
          </h1>
          <p className="max-w-3xl text-base leading-8 text-slate-600">
            Review approved peer examples of course matching outcomes reported
            by Erasmus students from Cyprus universities.
          </p>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl text-slate-950">
                Sample size
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600">
              <p className="text-3xl font-semibold tracking-tight text-slate-950">
                {examples.length}
              </p>
              <p>
                Approved peer course equivalency examples available publicly.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardContent className="flex h-full items-center p-5">
              <Badge variant="secondary" className="text-sm">
                n={examples.length}
              </Badge>
            </CardContent>
          </Card>
        </section>

        <section className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 px-5 py-4 text-sm leading-6 text-sky-950">
          These are peer examples only. They are not official recognition
          decisions.
        </section>

        {examples.length < 5 && examples.length > 0 ? (
          <section className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-950">
            Early data — limited examples available
          </section>
        ) : null}

        {examples.length === 0 ? (
          <Card className="mt-8 border-slate-200 shadow-sm">
            <CardContent className="space-y-3 py-10 text-center text-slate-600">
              <p>No course equivalency examples available yet.</p>
              <Link
                href="/share-experience"
                className="inline-flex font-medium text-sky-700 underline underline-offset-4"
              >
                Share your Erasmus experience
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="max-w-sm">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Home university filter
                </label>
                <Select
                  value={homeUniversityFilter}
                  onValueChange={setHomeUniversityFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All home universities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all">All home universities</SelectItem>
                    {homeUniversities.map((university) => (
                      <SelectItem key={university} value={university}>
                        {university}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </section>

            {filteredExamples.length === 0 ? (
              <Card className="mt-8 border-slate-200 shadow-sm">
                <CardContent className="py-10 text-center text-slate-600">
                  No course equivalency examples match the selected home
                  university.
                </CardContent>
              </Card>
            ) : (
              <section className="mt-8">
                <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                      <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                        <tr>
                          <th className="px-4 py-3">Home university</th>
                          <th className="px-4 py-3">Home course</th>
                          <th className="px-4 py-3">Host university</th>
                          <th className="px-4 py-3">Host city</th>
                          <th className="px-4 py-3">Host course</th>
                          <th className="px-4 py-3">ECTS match</th>
                          <th className="px-4 py-3">Recognition type</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {filteredExamples.map((example) => (
                          <tr
                            key={[
                              example.homeUniversity,
                              example.homeCourseName,
                              example.hostCity,
                              example.hostUniversity || "unknown-host",
                              example.hostCourseName,
                              example.recognitionType,
                            ].join("|")}
                          >
                            <td className="px-4 py-4 align-top font-medium text-slate-950">
                              {example.homeUniversity}
                            </td>
                            <td className="px-4 py-4 align-top text-slate-700">
                              {example.homeCourseName}
                            </td>
                            <td className="px-4 py-4 align-top text-slate-700">
                              {example.hostUniversity || "Not specified"}
                            </td>
                            <td className="px-4 py-4 align-top text-slate-700">
                              {example.hostCity}
                            </td>
                            <td className="px-4 py-4 align-top text-slate-700">
                              {example.hostCourseName}
                            </td>
                            <td className="px-4 py-4 align-top text-slate-700">
                              {formatCredits(example.credits)}
                            </td>
                            <td className="px-4 py-4 align-top text-slate-700">
                              {example.recognitionType}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </section>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export const getStaticProps: GetStaticProps<
  CourseMatchingExperiencesPageProps
> = async () => {
  const {
    getPublicCourseEquivalencesByDestinationSlug,
    getPublicDestinationList,
  } = await import("../src/server/publicDestinations");

  const destinations = await getPublicDestinationList();
  const equivalenceGroups = await Promise.all(
    destinations.map(async (destination) => ({
      destination,
      courseEquivalences: await getPublicCourseEquivalencesByDestinationSlug(
        destination.slug,
      ),
    })),
  );

  const examples = equivalenceGroups.flatMap(
    ({ destination, courseEquivalences }) =>
      courseEquivalences?.groups.flatMap((group) =>
        group.examples.map((example) => ({
          homeUniversity: group.homeUniversity,
          homeCourseName: example.homeCourseName,
          hostUniversity: example.hostUniversity || null,
          hostCity: destination.city,
          hostCourseName: example.hostCourseName,
          credits: example.credits ?? null,
          recognitionType: example.recognitionType,
        })),
      ) || [],
  );

  return {
    props: {
      examples,
    },
    revalidate: COURSE_MATCHING_REVALIDATE_SECONDS,
  };
};
