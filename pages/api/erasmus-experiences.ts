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
import { erasmusExperienceDraftSchema } from "../../src/lib/schemas";
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
import { ErasmusExperienceHttpError } from "../../src/server/erasmusExperience/errors";

type MutationRateLimitAction = "create" | "save" | "submit";

type MutationRateLimitBucket = {
  count: number;
  resetAt: number;
};

const MUTATION_RATE_LIMIT_WINDOW_MS = 60_000;
const MUTATION_RATE_LIMITS: Record<MutationRateLimitAction, number> = {
  create: 10,
  save: 60,
  submit: 5,
};
const mutationRateLimitBuckets = new Map<string, MutationRateLimitBucket>();

function asRequestBodyRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function getOptionalSessionString(value: unknown): string | null | undefined {
  if (typeof value === "string") {
    return value;
  }

  if (value === null || value === undefined) {
    return value === null ? null : undefined;
  }

  return undefined;
}

function assertWithinMutationRateLimit(
  userId: string,
  action: MutationRateLimitAction,
): void {
  const now = Date.now();

  for (const [key, bucket] of mutationRateLimitBuckets.entries()) {
    if (bucket.resetAt <= now) {
      mutationRateLimitBuckets.delete(key);
    }
  }

  const key = `${action}:${userId}`;
  const existingBucket = mutationRateLimitBuckets.get(key);

  if (!existingBucket || existingBucket.resetAt <= now) {
    mutationRateLimitBuckets.set(key, {
      count: 1,
      resetAt: now + MUTATION_RATE_LIMIT_WINDOW_MS,
    });
    return;
  }

  const maxRequests = MUTATION_RATE_LIMITS[action];
  if (existingBucket.count >= maxRequests) {
    throw new ErasmusExperienceHttpError(429, {
      error: "Too many requests",
      details: `Too many ${action} requests. Please wait a minute and try again.`,
    });
  }

  existingBucket.count += 1;
}

function parseDraftUpdateData(
  updateData: Record<string, unknown>,
): Record<string, unknown> {
  const result = erasmusExperienceDraftSchema.safeParse(updateData);

  if (result.success) {
    return result.data;
  }

  throw new ErasmusExperienceHttpError(400, {
    error: "Invalid request body",
    details: "The submitted draft payload is not valid.",
    fieldErrors: result.error.flatten().fieldErrors,
  });
}

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
  console.error(
    `[erasmus-experiences] Database unavailable during ${context}`,
    {
      ...(requestId ? { requestId } : {}),
      cause: getDatabaseUnavailableCause(error) || "unknown",
      error: getErrorMessage(error),
    },
  );
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
    email: getOptionalSessionString(session.user.email),
    name: getOptionalSessionString(session.user.name),
    image: getOptionalSessionString(session.user.image),
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

  // Prevent aggressive polling of draft data
  assertWithinMutationRateLimit(user.id, "save");

  const { id } = req.query;

  if (typeof id === "string" && id) {
    const experience = await getExperienceByIdForUser(id, user.id);
    return res.status(200).json(serializeErasmusExperienceForClient(experience));
  }

  const experiences = await listExperiencesForUser(user.id);

  return res
    .status(200)
    .json(
      experiences.map((experience) =>
        serializeErasmusExperienceForClient(experience),
      ),
    );
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const user = await getAuthenticatedUser(req, res);

  if (!user?.id) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const { action } = asRequestBodyRecord(req.body);

  if (action !== "create") {
    return res.status(400).json({ error: "Invalid action" });
  }

  assertWithinMutationRateLimit(user.id, "create");

  const result = await createDraft(user);

  return res
    .status(result.created ? 201 : 200)
    .json(serializeErasmusExperienceForClient(result.experience));
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const user = await getAuthenticatedUser(req, res);

  if (!user?.id) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const body = asRequestBodyRecord(req.body);
  const { id, action, ...rawUpdateData } = body;

  if (typeof id !== "string" || !id) {
    return res.status(400).json({ error: "Experience ID is required" });
  }

  const updateData = parseDraftUpdateData(rawUpdateData);
  assertWithinMutationRateLimit(user.id, action === "submit" ? "submit" : "save");

  const requestId = ensureRequestId(req, res);
  const experience =
    action === "submit"
      ? await submitExperience(id, user, updateData, (error, context) =>
          logRequestFailure(
            "failed to refresh derived aggregates after submit",
            error,
            requestId,
            context,
          ),
        )
      : await saveDraft(id, user, updateData);

  return res
    .status(200)
    .json(serializeErasmusExperienceForClient(experience));
}
