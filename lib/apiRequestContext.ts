import { randomUUID } from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";

import { getErrorMessage } from "./databaseErrors";

export const REQUEST_ID_HEADER = "x-request-id";
const REQUEST_ID_KEY = Symbol.for("erasmusJourney.requestId");

type RequestWithId = NextApiRequest & {
  [REQUEST_ID_KEY]?: string;
};

function getErrorName(error: unknown): string {
  return error instanceof Error ? error.name : "UnknownError";
}

function getErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== "object" || !("code" in error)) {
    return undefined;
  }

  const code = (error as { code?: unknown }).code;
  return typeof code === "string" && code ? code : undefined;
}

function normalizeRequestId(
  value: string | string[] | undefined,
): string | null {
  const candidate = Array.isArray(value) ? value[0] : value;

  if (!candidate) {
    return null;
  }

  const trimmed = candidate.trim();
  if (!trimmed || trimmed.length > 128) {
    return null;
  }

  return /^[A-Za-z0-9._:-]+$/.test(trimmed) ? trimmed : null;
}

function getRequestPath(req: NextApiRequest): string {
  return req.url?.split("?")[0] || "unknown";
}

export function ensureRequestId(
  req: NextApiRequest,
  res: NextApiResponse,
): string {
  const request = req as RequestWithId;

  if (request[REQUEST_ID_KEY]) {
    res.setHeader(REQUEST_ID_HEADER, request[REQUEST_ID_KEY]!);
    return request[REQUEST_ID_KEY]!;
  }

  const requestId =
    normalizeRequestId(req.headers[REQUEST_ID_HEADER]) || randomUUID();

  request[REQUEST_ID_KEY] = requestId;
  res.setHeader(REQUEST_ID_HEADER, requestId);
  return requestId;
}

export function withRequestId<T extends Record<string, unknown>>(
  req: NextApiRequest,
  res: NextApiResponse,
  payload: T,
): T & { requestId: string } {
  return {
    ...payload,
    requestId: ensureRequestId(req, res),
  };
}

export function logApiError(
  req: NextApiRequest,
  res: NextApiResponse,
  message: string,
  error: unknown,
  context?: Record<string, unknown>,
): string {
  const requestId = ensureRequestId(req, res);
  const errorCode = getErrorCode(error);

  console.error(message, {
    requestId,
    method: req.method || "UNKNOWN",
    path: getRequestPath(req),
    ...(context ? { context } : {}),
    errorName: getErrorName(error),
    errorMessage: getErrorMessage(error),
    ...(errorCode ? { errorCode } : {}),
    ...(process.env.NODE_ENV === "development" && error instanceof Error
      ? { stack: error.stack }
      : {}),
  });

  return requestId;
}
