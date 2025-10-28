/**
 * Middleware to enforce status filtering on public queries
 *
 * Ensures ONLY approved and public submissions are visible to end users
 */

export type QueryFilter = {
  where?: any;
  [key: string]: any;
};

/**
 * Enforces that only APPROVED and isPublic=true items are returned
 * Use this on ALL public-facing queries
 */
export function enforceApprovedOnly<T extends QueryFilter>(query: T): T {
  return {
    ...query,
    where: {
      ...(query.where || {}),
      status: "APPROVED",
      isPublic: true,
    },
  };
}

/**
 * For admin views - shows all statuses but respects filters
 */
export function adminStatusFilter<T extends QueryFilter>(
  query: T,
  status?: string,
): T {
  if (!status) {
    return query;
  }

  return {
    ...query,
    where: {
      ...(query.where || {}),
      status,
    },
  };
}

/**
 * Common filter for location-based queries
 */
export function filterByLocation<T extends QueryFilter>(
  query: T,
  city?: string,
  country?: string,
): T {
  const locationFilter: any = {};

  if (city) {
    locationFilter.hostCity = {
      equals: city,
      mode: "insensitive",
    };
  }

  if (country) {
    locationFilter.hostCountry = {
      equals: country,
      mode: "insensitive",
    };
  }

  if (Object.keys(locationFilter).length === 0) {
    return query;
  }

  return {
    ...query,
    where: {
      ...(query.where || {}),
      ...locationFilter,
    },
  };
}

/**
 * Apply multiple filters in sequence
 */
export function applyFilters<T extends QueryFilter>(
  query: T,
  ...filters: Array<(q: T) => T>
): T {
  return filters.reduce((acc, filter) => filter(acc), query);
}

/**
 * Pagination helper
 */
export function applyPagination<T extends QueryFilter>(
  query: T,
  limit: number = 50,
  offset: number = 0,
): T {
  return {
    ...query,
    take: Math.min(limit, 100), // Max 100 items
    skip: Math.max(offset, 0),
  };
}

/**
 * Sorting helper
 */
export function applySorting<T extends QueryFilter>(
  query: T,
  sortBy: string = "createdAt",
  sortOrder: "asc" | "desc" = "desc",
): T {
  return {
    ...query,
    orderBy: {
      [sortBy]: sortOrder,
    },
  };
}

/**
 * Example usage:
 *
 * // Public query (enforces APPROVED only)
 * const accommodations = await prisma.accommodation_views.findMany(
 *   enforceApprovedOnly({ where: { city: 'Paris' } })
 * );
 *
 * // Admin query with filters
 * const submissions = await prisma.student_submissions.findMany(
 *   applyFilters(
 *     { where: {} },
 *     (q) => adminStatusFilter(q, 'PENDING'),
 *     (q) => filterByLocation(q, 'Paris', 'France'),
 *     (q) => applyPagination(q, 50, 0),
 *     (q) => applySorting(q, 'createdAt', 'desc')
 *   )
 * );
 *
 * // Combined filters
 * const parisAccommodations = await prisma.accommodation_views.findMany(
 *   applyFilters(
 *     { where: {} },
 *     enforceApprovedOnly,
 *     (q) => filterByLocation(q, 'Paris'),
 *     (q) => applySorting(q, 'pricePerMonth', 'asc')
 *   )
 * );
 */
