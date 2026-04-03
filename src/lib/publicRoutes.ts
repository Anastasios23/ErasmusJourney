export const PUBLIC_DESTINATIONS_ROUTE = "/destinations";
export const PUBLIC_DESTINATIONS_ACCOMMODATION_FOCUS_ROUTE =
  "/destinations?focus=accommodation";
export const PUBLIC_DESTINATIONS_COURSES_FOCUS_ROUTE =
  "/destinations?focus=courses";

interface PublicDestinationRouteOptions {
  city: string;
  country?: string | null;
  subpage?: "accommodation" | "courses";
}

export function buildPublicDestinationSlug(
  city: string,
  country?: string | null,
): string {
  return slugifyPublicDestinationValue([city, country].filter(Boolean).join("-"));
}

export function buildPublicDestinationRoute({
  city,
  country,
  subpage,
}: PublicDestinationRouteOptions): string {
  const slug = buildPublicDestinationSlug(city, country);
  const baseRoute = `${PUBLIC_DESTINATIONS_ROUTE}/${slug}`;

  return subpage ? `${baseRoute}/${subpage}` : baseRoute;
}

function slugifyPublicDestinationValue(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
