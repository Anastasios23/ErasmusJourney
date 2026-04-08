interface RequestChangesEmailInput {
  studentEmail: string;
  studentName?: string | null;
  reviewFeedback: string;
  hostCity?: string | null;
  hostCountry?: string | null;
  hostUniversity?: string | null;
}

export interface ModerationEmailResult {
  status: "sent" | "skipped" | "failed";
  reason?: string;
}

function normalizeOptionalString(value: string | null | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildDestinationLine(input: RequestChangesEmailInput): string {
  const parts = [
    normalizeOptionalString(input.hostUniversity),
    normalizeOptionalString(input.hostCity),
    normalizeOptionalString(input.hostCountry),
  ].filter(Boolean);

  if (parts.length === 0) {
    return "your Erasmus Journey submission";
  }

  return `your submission for ${parts.join(", ")}`;
}

function buildMySubmissionsUrl(): string {
  const appUrl = normalizeOptionalString(process.env.NEXTAUTH_URL);
  return `${appUrl || "http://localhost:3000"}/my-submissions`;
}

function buildHtmlEmail(input: RequestChangesEmailInput): string {
  const studentName = normalizeOptionalString(input.studentName) || "student";
  const submissionLabel = buildDestinationLine(input);
  const mySubmissionsUrl = buildMySubmissionsUrl();

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <p>Hello ${escapeHtml(studentName)},</p>
      <p>
        An Erasmus Journey moderator has requested changes for ${escapeHtml(
          submissionLabel,
        )}.
      </p>
      <p>
        Your submission is now back in an editable revision state. Review the
        feedback below, update the saved draft, and resubmit when ready.
      </p>
      <div style="margin: 16px 0; padding: 12px 16px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px;">
        <p style="margin: 0 0 8px; font-weight: 600;">Moderator feedback</p>
        <p style="margin: 0; white-space: pre-wrap;">${escapeHtml(
          input.reviewFeedback,
        )}</p>
      </div>
      <p>
        Open your submission here:
        <a href="${escapeHtml(mySubmissionsUrl)}">${escapeHtml(
          mySubmissionsUrl,
        )}</a>
      </p>
      <p>Erasmus Journey</p>
    </div>
  `.trim();
}

function buildTextEmail(input: RequestChangesEmailInput): string {
  return [
    `Hello ${normalizeOptionalString(input.studentName) || "student"},`,
    "",
    `An Erasmus Journey moderator has requested changes for ${buildDestinationLine(
      input,
    )}.`,
    "Your submission is back in an editable revision state. Review the feedback below, update the saved draft, and resubmit when ready.",
    "",
    "Moderator feedback:",
    input.reviewFeedback,
    "",
    `Open your submission here: ${buildMySubmissionsUrl()}`,
    "",
    "Erasmus Journey",
  ].join("\n");
}

export async function sendRequestChangesEmail(
  input: RequestChangesEmailInput,
): Promise<ModerationEmailResult> {
  const apiKey = normalizeOptionalString(process.env.RESEND_API_KEY);
  const from = normalizeOptionalString(process.env.MODERATION_EMAIL_FROM);
  const to = normalizeOptionalString(input.studentEmail);

  if (!to) {
    return {
      status: "skipped",
      reason: "student email is missing",
    };
  }

  if (!apiKey || !from) {
    return {
      status: "skipped",
      reason:
        "moderation email is not configured; set RESEND_API_KEY and MODERATION_EMAIL_FROM",
    };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: "Erasmus Journey: changes requested for your submission",
        html: buildHtmlEmail(input),
        text: buildTextEmail(input),
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return {
        status: "failed",
        reason: `email provider rejected the request (${response.status}): ${errorBody}`,
      };
    }

    return {
      status: "sent",
    };
  } catch (error) {
    return {
      status: "failed",
      reason: error instanceof Error ? error.message : "unknown email failure",
    };
  }
}

