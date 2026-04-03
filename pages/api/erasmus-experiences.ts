import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

import { authOptions } from "./auth/[...nextauth]";
import {
  getClientSafeDatabaseUnavailableCause,
  getClientSafeDatabaseUnavailableDetails,
  getClientSafeErrorMessage,
  getDatabaseUnavailableCause,
  getErrorMessage,
  isDatabaseConnectionError,
} from "../../lib/databaseErrors";
import { ensureRequestId, withRequestId } from "../../lib/apiRequestContext";
import { serializeErasmusExperienceForClient } from "../../src/server/serializeErasmusExperience";
import {
  createDraft,
  getExperienceByIdForUser,
  isErasmusExperienceHttpError,
  listExperiencesForUser,
  saveDraft,
  submitExperience,
  type AuthenticatedExperienceUser,
} from "../../src/server/erasmusExperience";

function getRequestFailureContext(req: NextApiRequest): string {
  const action =
    req.body &&
    typeof req.body === "object" &&
    "action" in req.body &&
    typeof req.body.action === "string"
      ? req.body.action
      : null;

  if (req.method === "POST" && action === "create") {
    return "create action";
  }

  if (req.method === "PUT" && action === "submit") {
    return "submit action";
  }

  if (req.method === "PUT") {
    return "update action";
  }

  if (req.method === "GET") {
    return "read action";
  }

  return `${req.method || "unknown"} request`;
}

function logRequestFailure(
  message: string,
  error: unknown,
  requestId?: string,
  context?: Record<string, unknown>,
) {
  console.error(`[erasmus-experiences] ${message}`, {
    ...(requestId ? { requestId } : {}),
    ...(context ? { context } : {}),
    errorName: error instanceof Error ? error.name : "UnknownError",
    errorMessage: getErrorMessage(error),
    ...(process.env.NODE_ENV === "development" && error instanceof Error
      ? { stack: error.stack }
      : {}),
  });
}

function logDatabaseUnavailable(
  context: string,
  error: unknown,
  requestId?: string,
) {
  console.error(`[erasmus-experiences] Database unavailable during ${context}`, {
    ...(requestId ? { requestId } : {}),
    cause: getDatabaseUnavailableCause(error) || "unknown",
    error: getErrorMessage(error),
  });
}

async function getAuthenticatedUser(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<AuthenticatedExperienceUser | null> {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const requestId = ensureRequestId(req, res);
  const { method } = req;

  try {
    switch (method) {
      case "GET":
        return await handleGet(req, res);
      case "POST":
        return await handlePost(req, res);
      case "PUT":
        return await handlePut(req, res);
      default:
        res.setHeader("Allow", ["GET", "POST", "PUT"]);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      const failureContext = getRequestFailureContext(req);
      logDatabaseUnavailable(failureContext, error, requestId);
      const cause = getClientSafeDatabaseUnavailableCause(error);

      return res.status(503).json(
        withRequestId(req, res, {
          error: "Database unavailable",
          details: getClientSafeDatabaseUnavailableDetails(),
          ...(cause ? { cause } : {}),
        }),
      );
    }

    if (isErasmusExperienceHttpError(error)) {
      return res.status(error.statusCode).json(error.body);
    }

    logRequestFailure(
      `${getRequestFailureContext(req)} failed`,
      error,
      requestId,
    );

    return res.status(500).json(
      withRequestId(req, res, {
        error: "Internal server error",
        details: getClientSafeErrorMessage(error),
      }),
    );
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const user = await getAuthenticatedUser(req, res);

  if (!user?.id) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const { id } = req.query;

  if (typeof id === "string" && id) {
    const experience = await getExperienceByIdForUser(id, user.id);
    return res
      .status(200)
      .json(serializeErasmusExperienceForClient(experience as any));
  }

  const experiences = await listExperiencesForUser(user.id);

  return res.status(200).json(
    experiences.map((experience) =>
      serializeErasmusExperienceForClient(experience as any),
    ),
  );
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { action } =
    req.body && typeof req.body === "object" ? req.body : { action: null };

  if (action !== "create") {
    return res.status(400).json({ error: "Invalid action" });
  }

  const user = await getAuthenticatedUser(req, res);

  if (!user?.id) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const result = await createDraft(user);

  return res
    .status(result.created ? 201 : 200)
    .json(serializeErasmusExperienceForClient(result.experience as any));
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const body =
    req.body && typeof req.body === "object"
      ? (req.body as Record<string, unknown>)
      : {};
  const { id, action, ...updateData } = body;

  if (typeof id !== "string" || !id) {
    return res.status(400).json({ error: "Experience ID is required" });
  }

  const user = await getAuthenticatedUser(req, res);

  if (!user?.id) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const requestId = ensureRequestId(req, res);
  const experience =
    action === "submit"
      ? await submitExperience(id, user, updateData, (error, context) =>
          logRequestFailure(
            "failed to update city statistics after submit",
            error,
            requestId,
            context,
          ),
        )
      : await saveDraft(id, user, updateData);

  return res
    .status(200)
    .json(serializeErasmusExperienceForClient(experience as any));
}
