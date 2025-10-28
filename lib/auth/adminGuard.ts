import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { Session } from "next-auth";

/**
 * Higher-order function to protect admin routes
 *
 * Usage:
 * export const getServerSideProps = withAdminAuth();
 *
 * Or with custom logic:
 * export const getServerSideProps = withAdminAuth(async (context, session) => {
 *   const data = await fetchData();
 *   return { props: { data } };
 * });
 */
export function withAdminAuth(
  gssp?: (
    context: GetServerSidePropsContext,
    session: Session,
  ) => Promise<any> | any,
): GetServerSideProps {
  return async (context: GetServerSidePropsContext) => {
    const session = await getServerSession(
      context.req,
      context.res,
      authOptions,
    );

    // Not authenticated
    if (!session) {
      return {
        redirect: {
          destination: `/login?callbackUrl=${encodeURIComponent(context.resolvedUrl)}`,
          permanent: false,
        },
      };
    }

    // Not an admin
    if (session.user.role !== "ADMIN") {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
        // Or return 403 page
        // notFound: true,
      };
    }

    // If custom GSSP provided, call it
    if (gssp) {
      const result = await gssp(context, session);

      // Merge session into props if props exist
      if (result.props) {
        return {
          ...result,
          props: {
            ...result.props,
            session,
          },
        };
      }

      return result;
    }

    // Default: just pass session
    return {
      props: {
        session,
      },
    };
  };
}

/**
 * Similar guard but for regular authenticated users (not just admins)
 */
export function withAuth(
  gssp?: (
    context: GetServerSidePropsContext,
    session: Session,
  ) => Promise<any> | any,
): GetServerSideProps {
  return async (context: GetServerSidePropsContext) => {
    const session = await getServerSession(
      context.req,
      context.res,
      authOptions,
    );

    if (!session) {
      return {
        redirect: {
          destination: `/login?callbackUrl=${encodeURIComponent(context.resolvedUrl)}`,
          permanent: false,
        },
      };
    }

    if (gssp) {
      const result = await gssp(context, session);

      if (result.props) {
        return {
          ...result,
          props: {
            ...result.props,
            session,
          },
        };
      }

      return result;
    }

    return {
      props: {
        session,
      },
    };
  };
}

/**
 * Check if session has admin role (for client-side checks)
 */
export function isAdmin(session: Session | null): boolean {
  return session?.user?.role === "ADMIN";
}

/**
 * API route guard helper
 *
 * Usage in API routes:
 * const session = await requireAdmin(req, res);
 * if (!session) return; // Response already sent
 */
export async function requireAdmin(
  req: any,
  res: any,
): Promise<Session | null> {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }

  if (session.user.role !== "ADMIN") {
    res.status(403).json({ error: "Admin access required" });
    return null;
  }

  return session;
}

/**
 * API route guard for any authenticated user
 */
export async function requireAuth(req: any, res: any): Promise<Session | null> {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }

  return session;
}

/**
 * Examples:
 *
 * // Admin page:
 * export const getServerSideProps = withAdminAuth();
 *
 * // Admin page with data:
 * export const getServerSideProps = withAdminAuth(async (context, session) => {
 *   const stats = await getStats();
 *   return { props: { stats } };
 * });
 *
 * // API route:
 * export default async function handler(req, res) {
 *   const session = await requireAdmin(req, res);
 *   if (!session) return;
 *
 *   // Admin logic here
 * }
 */
