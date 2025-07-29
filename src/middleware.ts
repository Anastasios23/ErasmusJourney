import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const formSteps = [
  "/basic-information",
  "/course-matching",
  "/accommodation",
  "/living-expenses",
  "/help-future-students",
];

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });

  // Check if it's a form step
  const isFormStep = formSteps.some((step) =>
    request.nextUrl.pathname.startsWith(step),
  );

  if (isFormStep) {
    // If not authenticated, redirect to login
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Get current step index
    const currentStepIndex = formSteps.findIndex((step) =>
      request.nextUrl.pathname.startsWith(step),
    );

    // If trying to access a step other than first or previous step completed
    if (currentStepIndex > 0) {
      const previousStep = formSteps[currentStepIndex - 1];
      // Check if previous step is completed (you'll need to implement this check)
      // For now, we'll use localStorage/cookies to track progress
      const completedSteps = request.cookies.get("completedSteps")?.value || "";

      if (!completedSteps.includes(previousStep)) {
        return NextResponse.redirect(new URL(previousStep, request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/basic-information/:path*",
    "/course-matching/:path*",
    "/accommodation/:path*",
    "/living-expenses/:path*",
    "/help-future-students/:path*",
  ],
};
