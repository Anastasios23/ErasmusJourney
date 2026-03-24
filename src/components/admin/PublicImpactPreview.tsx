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
  const overviewCurrency = preview.destination.after.costSummary.currency;
  const accommodationCurrency = preview.accommodation.after.currency;

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
            before={String(preview.destination.before?.submissionCount ?? 0)}
            after={String(preview.destination.after.submissionCount)}
          />
          <MetricDelta
            label="Avg rent"
            before={formatPublicDestinationMoney(
              preview.destination.before?.averageRent ?? null,
              overviewCurrency,
            )}
            after={formatPublicDestinationMoney(
              preview.destination.after.averageRent,
              overviewCurrency,
            )}
          />
          <MetricDelta
            label="Avg monthly cost"
            before={formatPublicDestinationMoney(
              preview.destination.before?.averageMonthlyCost ?? null,
              overviewCurrency,
            )}
            after={formatPublicDestinationMoney(
              preview.destination.after.averageMonthlyCost,
              overviewCurrency,
            )}
          />
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
              before={String(preview.accommodation.before?.sampleSize ?? 0)}
              after={String(preview.accommodation.after.sampleSize)}
            />
            <MetricDelta
              label="Recommendation responses"
              before={String(
                preview.accommodation.before?.recommendationSampleSize ?? 0,
              )}
              after={String(preview.accommodation.after.recommendationSampleSize)}
            />
            <MetricDelta
              label="Review snippets"
              before={String(preview.accommodation.before?.reviewSnippets.length ?? 0)}
              after={String(preview.accommodation.after.reviewSnippets.length)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <MetricDelta
              label="Avg rent"
              before={formatPublicDestinationMoney(
                preview.accommodation.before?.averageRent ?? null,
                accommodationCurrency,
              )}
              after={formatPublicDestinationMoney(
                preview.accommodation.after.averageRent,
                accommodationCurrency,
              )}
            />
            <MetricDelta
              label="Recommendation rate"
              before={
                preview.accommodation.before?.recommendationRate === null
                  ? "N/A"
                  : `${preview.accommodation.before.recommendationRate}%`
              }
              after={
                preview.accommodation.after.recommendationRate === null
                  ? "N/A"
                  : `${preview.accommodation.after.recommendationRate}%`
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
              before={String(preview.courses.before?.totalMappings ?? 0)}
              after={String(preview.courses.after.totalMappings)}
            />
            <MetricDelta
              label="Home universities"
              before={String(preview.courses.before?.homeUniversityCount ?? 0)}
              after={String(preview.courses.after.homeUniversityCount)}
            />
            <MetricDelta
              label="Visible groups"
              before={String(preview.courses.before?.groups.length ?? 0)}
              after={String(preview.courses.after.groups.length)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
