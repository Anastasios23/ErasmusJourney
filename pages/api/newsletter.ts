import type { NextApiRequest, NextApiResponse } from "next";

type NewsletterResponse = {
  success: boolean;
  message: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 5;

const requestTracker = new Map<string, number[]>();

function getClientKey(req: NextApiRequest): string {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }

  if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    return forwardedFor[0];
  }

  return req.socket.remoteAddress || "unknown";
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (requestTracker.get(key) || []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS,
  );

  recent.push(now);
  requestTracker.set(key, recent);

  return recent.length > MAX_REQUESTS_PER_WINDOW;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<NewsletterResponse>,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res
      .status(405)
      .json({ success: false, message: "Method Not Allowed" });
  }

  const clientKey = getClientKey(req);
  if (isRateLimited(clientKey)) {
    return res.status(429).json({
      success: false,
      message: "Too many subscription attempts. Please try again shortly.",
    });
  }

  const email =
    typeof req.body?.email === "string" ? req.body.email.trim() : "";

  if (!email || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email address.",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Thanks for subscribing! We will keep you updated.",
  });
}
