import React from "react";
import type { AdminPublicImpactPreview } from "../../types/adminPublicImpactPreview";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { formatPublicDestinationMoney } from "../../lib/publicDestinationPresentation";

interface PublicImpactPreviewProps {
  preview: AdminPublicImpactPreview;
}

function MetricDelta({
  label,
  before,
  after,
}: {
  label: string;
  before: string;
  after: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-2 flex items-center justify-between gap-4 text-sm">
        <div>
          <p className="text-slate-500">Current</p>
          <p className="font-medium text-slate-900">{before}</p>
        </div>
        <div className="text-slate-400">→</div>
        <div className="text-right">
          <p className="text-slate-500">After approval</p>
          <p className="font-semibold text-slate-900">{after}</p>
        </div>
      </div>
    </div>
  );
}

export default function PublicImpactPreview({
  preview,
}: PublicImpactPreviewProps) {
  const destinationBefore = preview.destination.before;
  const destinationAfter = preview.destination.after;
  const accommodationBefore = preview.accommodation.before;
  const accommodationAfter = preview.accommodation.after;
  const coursesBefore = preview.courses.before;
  const coursesAfter = preview.courses.after;
  const overviewCurrency = destinationAfter.costSummary.currency;
  const accommodationCurrency = accommodationAfter?.currency || overviewCurrency;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Projected public destination impact</CardTitle>
            <Badge variant={preview.destination.isNewDestination ? "info" : "secondary"}>
              {preview.destination.isNewDestination
                ? "New public destination"
                : "Existing public destination"}
            </Badge>
          </div>
          <p className="text-sm text-slate-600">
            Public routes after approval:
            <span className="ml-2 font-mono text-xs text-slate-700">
              /destinations/{preview.slug}
            </span>
            <span className="ml-2 font-mono text-xs text-slate-700">
              /destinations/{preview.slug}/accommodation
            </span>
            <span className="ml-2 font-mono text-xs text-slate-700">
              /destinations/{preview.slug}/courses
            </span>
          </p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <MetricDelta
            label="Submissions"
            before={String(destinationBefore?.submissionCount ?? 0)}
            after={String(destinationAfter.submissionCount)}
          />
          <MetricDelta
            label="Avg rent"
            before={formatPublicDestinationMoney(
              destinationBefore?.averageRent ?? null,
              overviewCurrency,
            )}
            after={formatPublicDestinationMoney(
              destinationAfter.averageRent,
              overviewCurrency,
            )}
          />
          <MetricDelta
            label="Avg monthly cost"
            before={formatPublicDestinationMoney(
              destinationBefore?.averageMonthlyCost ?? null,
              overviewCurrency,
            )}
            after={formatPublicDestinationMoney(
              destinationAfter.averageMonthlyCost,
              overviewCurrency,
            )}
          />
        </CardContent>
        <CardContent className="pt-0">
          <p className="text-sm text-slate-600">
            Monthly rent is the minimum cost signal. Food, transport, social,
            travel, and other living-cost fields expand monthly totals only
            when the submission includes them.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Projected accommodation page impact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {preview.accommodation.contribution ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm space-y-2">
              <p className="font-medium text-slate-900">
                This submission would add the following public accommodation signals:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-700">
                <p>
                  Type:{" "}
                  <span className="font-medium">
                    {preview.accommodation.contribution.type || "N/A"}
                  </span>
                </p>
                <p>
                  Rent:{" "}
                  <span className="font-medium">
                    {typeof preview.accommodation.contribution.rent === "number"
                      ? formatPublicDestinationMoney(
                          preview.accommodation.contribution.rent,
                          preview.accommodation.contribution.currency,
                        )
                      : "N/A"}
                  </span>
                </p>
                <p>
                  Area:{" "}
                  <span className="font-medium">
                    {preview.accommodation.contribution.area || "Not publishable"}
                  </span>
                </p>
                <p>
                  Difficulty:{" "}
                  <span className="font-medium">
                    {preview.accommodation.contribution.difficulty || "N/A"}
                  </span>
                </p>
                <p>
                  Would recommend:{" "}
                  <span className="font-medium">
                    {typeof preview.accommodation.contribution.wouldRecommend ===
                    "boolean"
                      ? preview.accommodation.contribution.wouldRecommend
                        ? "Yes"
                        : "No"
                      : "N/A"}
                  </span>
                </p>
              </div>
              {preview.accommodation.contribution.reviewSnippet ? (
                <p className="text-slate-600">
                  Sanitized snippet: "{preview.accommodation.contribution.reviewSnippet}"
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              This submission does not currently add publishable accommodation
              data beyond the destination overview.
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <MetricDelta
              label="Accommodation entries"
              before={String(accommodationBefore?.sampleSize ?? 0)}
              after={String(accommodationAfter?.sampleSize ?? 0)}
            />
            <MetricDelta
              label="Recommendation responses"
              before={String(accommodationBefore?.recommendationSampleSize ?? 0)}
              after={String(accommodationAfter?.recommendationSampleSize ?? 0)}
            />
            <MetricDelta
              label="Review snippets"
              before={String(accommodationBefore?.reviewSnippets.length ?? 0)}
              after={String(accommodationAfter?.reviewSnippets.length ?? 0)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <MetricDelta
              label="Avg rent"
              before={formatPublicDestinationMoney(
                accommodationBefore?.averageRent ?? null,
                accommodationCurrency,
              )}
              after={formatPublicDestinationMoney(
                accommodationAfter?.averageRent ?? null,
                accommodationCurrency,
              )}
            />
            <MetricDelta
              label="Recommendation rate"
              before={
                accommodationBefore?.recommendationRate == null
                  ? "N/A"
                  : `${accommodationBefore.recommendationRate}%`
              }
              after={
                accommodationAfter?.recommendationRate == null
                  ? "N/A"
                  : `${accommodationAfter.recommendationRate}%`
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Projected course page impact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {preview.courses.contributionExamples.length > 0 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
              <p className="text-sm font-medium text-slate-900">
                This submission would add these public course examples:
              </p>
              <ul className="space-y-3">
                {preview.courses.contributionExamples.map((example, index) => (
                  <li
                    key={[
                      example.homeUniversity,
                      example.homeCourseName,
                      example.hostCourseName,
                      index,
                    ].join("|")}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm"
                  >
                    <p className="font-medium text-slate-900">
                      {example.homeUniversity}
                      {example.homeDepartment ? ` • ${example.homeDepartment}` : ""}
                    </p>
                    <p className="text-slate-700">
                      {example.homeCourseName} → {example.hostCourseName}
                    </p>
                    {example.hostUniversity ? (
                      <p className="text-slate-500">
                        Host university: {example.hostUniversity}
                      </p>
                    ) : null}
                    <p className="text-slate-600">
                      Recognition: {example.recognitionType}
                    </p>
                    {example.notes ? (
                      <p className="text-slate-500">Notes: {example.notes}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              This submission does not currently add publishable course
              equivalence examples.
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <MetricDelta
              label="Course mappings"
              before={String(coursesBefore?.totalMappings ?? 0)}
              after={String(coursesAfter?.totalMappings ?? 0)}
            />
            <MetricDelta
              label="Home universities"
              before={String(coursesBefore?.homeUniversityCount ?? 0)}
              after={String(coursesAfter?.homeUniversityCount ?? 0)}
            />
            <MetricDelta
              label="Visible groups"
              before={String(coursesBefore?.groups.length ?? 0)}
              after={String(coursesAfter?.groups.length ?? 0)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
