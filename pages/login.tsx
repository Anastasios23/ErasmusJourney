"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/router";
import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import BackButton from "../components/BackButton";
import { Button } from "../src/components/ui/button";
import { Input } from "../src/components/ui/input";
import { Alert } from "../src/components/ui/alert";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { message } = router.query as { message?: string };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // Field validation functions
  const validateEmail = (value: string) => {
    if (!value) return "Email is required";
    if (!value.includes("@")) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (value: string) => {
    if (!value) return "Password is required";
    if (value.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    const error = validateEmail(value);
    setFieldErrors((prev) => ({ ...prev, email: error }));
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    const error = validatePassword(value);
    setFieldErrors((prev) => ({ ...prev, password: error }));
  };

  useEffect(() => {
    // Redirect if already authenticated
    if (status === "authenticated" && session) {
      const callbackUrl = (router.query.callbackUrl as string) || "/dashboard";
      router.push(callbackUrl);
      return;
    }

    // Show success banner if coming from registration
    if (message === "account_created") {
      setSuccessMessage("Account created! Please sign in.");
    }
  }, [message, session, status, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    // Client-side validation
    if (!email || !password) {
      setErrorMessage("Please fill in all fields.");
      setLoading(false);
      return;
    }

    if (!email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      // Attempt sign in
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false, // Don't auto-redirect, handle manually
      });

      if (result?.error) {
        setErrorMessage("Invalid email or password. Please try again.");
        setLoading(false);
      } else if (result?.ok) {
        // Show success message briefly before redirect
        setSuccessMessage("Login successful! Redirecting...");
        setTimeout(() => {
          const callbackUrl =
            (router.query.callbackUrl as string) || "/dashboard";
          window.location.href = callbackUrl;
        }, 1000);
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <>
        <Head>
          <title>Login - Erasmus Journey</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking authentication...</p>
          </div>
        </div>
      </>
    );
  }

  // Show already logged in message if authenticated
  if (status === "authenticated" && session) {
    return (
      <>
        <Head>
          <title>Already Logged In - Erasmus Journey</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="w-full max-w-md space-y-6 text-center">
            <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
              <h2 className="text-xl font-semibold text-green-800 mb-2">
                You're already logged in!
              </h2>
              <p className="text-green-700 mb-4">
                Welcome back, {session.user?.name || session.user?.email}
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="w-full"
                >
                  Go to Dashboard
                </Button>
                <Button
                  onClick={() => router.push("/")}
                  variant="outline"
                  className="w-full"
                >
                  Go to Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Login - Erasmus Journey</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md space-y-6">
          {/* Back Button */}
          <div className="flex justify-start">
            <BackButton fallbackUrl="/">← Back to Home</BackButton>
          </div>
          {successMessage && (
            <Alert variant="default">
              <p>{successMessage}</p>
            </Alert>
          )}
          {errorMessage && (
            <Alert variant="destructive">
              <p>{errorMessage}</p>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                disabled={loading}
                autoComplete="email"
                className={fieldErrors.email ? "border-red-500" : ""}
              />
              {fieldErrors.email && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
                className={fieldErrors.password ? "border-red-500" : ""}
              />
              {fieldErrors.password && (
                <p className="text-sm text-red-600 mt-1">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-blue-600 hover:underline"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
