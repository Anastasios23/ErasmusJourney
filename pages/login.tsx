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
import { Checkbox } from "../src/components/ui/checkbox";
import { Label } from "../src/components/ui/label";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);

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

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setForgotPasswordSent(true);
        setSuccessMessage(data.message);
        setErrorMessage(null);
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Redirect if already authenticated
    if (status === "authenticated" && session) {
      const callbackUrl = (router.query.callbackUrl as string) || "/dashboard";
      console.log("User already authenticated, redirecting to:", callbackUrl);
      router.push(callbackUrl);
      return;
    }

    // Show success banner if coming from registration
    if (message === "account_created") {
      setSuccessMessage("Account created! Please sign in.");
    }
  }, [message, session, status, router]);

  // Handle session changes after successful login
  useEffect(() => {
    if (status === "authenticated" && loading) {
      console.log("Authentication successful, session established");
      setLoading(false);
      setSuccessMessage("Login successful! Redirecting...");

      const callbackUrl = (router.query.callbackUrl as string) || "/dashboard";
      setTimeout(() => {
        router.push(callbackUrl);
      }, 500);
    }
  }, [status, loading, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Prevent double submission
    if (loading) {
      console.log("Form submission already in progress, ignoring...");
      return;
    }

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
      console.log("Attempting sign in for:", email);

      // Attempt sign in
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false, // Don't auto-redirect, handle manually
      });

      console.log("Sign in result:", result);

      if (result?.error) {
        console.error("Sign in error:", result.error);
        if (result.error === "CredentialsSignin") {
          setErrorMessage(
            "Invalid email or password. Please check your credentials and try again.",
          );
        } else {
          setErrorMessage(`Authentication error: ${result.error}`);
        }
        setLoading(false);
      } else if (result?.ok) {
        console.log("Sign in successful");
        // Show success message briefly before redirect
        setSuccessMessage("Login successful! Redirecting...");

        // Use Next.js router instead of window.location for better handling
        const callbackUrl =
          (router.query.callbackUrl as string) || "/dashboard";
        console.log("Redirecting to:", callbackUrl);

        // Set loading to false before redirect
        setLoading(false);

        // Small delay for user feedback, then redirect
        setTimeout(() => {
          router.push(callbackUrl);
        }, 800);
      } else {
        console.error("Unexpected sign in result:", result);
        setErrorMessage("Unexpected error during login. Please try again.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage(
        "Network error. Please check your connection and try again.",
      );
      setLoading(false);
    } finally {
      // Ensure loading state is always reset (except for successful login)
      if (!successMessage) {
        setTimeout(() => setLoading(false), 100);
      }
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

          {!showForgotPassword ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    disabled={loading}
                    autoComplete="email"
                    className={`pl-10 ${fieldErrors.email ? "border-red-500" : ""}`}
                    placeholder="Enter your email address"
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-sm text-red-600">{fieldErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    disabled={loading}
                    autoComplete="current-password"
                    className={`pl-10 pr-10 ${fieldErrors.password ? "border-red-500" : ""}`}
                    placeholder="Enter your password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                {fieldErrors.password && (
                  <p className="text-sm text-red-600">{fieldErrors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={setRememberMe}
                    disabled={loading}
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-600">
                    Remember me
                  </Label>
                </div>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:underline"
                  onClick={() => {
                    setShowForgotPassword(true);
                    setForgotPasswordEmail(email);
                  }}
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !email || !password}
              >
                {loading ? "Signing in…" : "Sign In"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-medium">Reset Password</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Enter your email and we'll send you a reset link
                </p>
              </div>

              {!forgotPasswordSent ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgotEmail">Email Address</Label>
                    <Input
                      id="forgotEmail"
                      type="email"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      disabled={loading}
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={loading || !forgotPasswordEmail}
                      className="flex-1"
                    >
                      {loading ? "Sending..." : "Send Reset Link"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setForgotPasswordSent(false);
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 text-sm">
                      Password reset instructions have been sent to your email.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotPasswordSent(false);
                      setSuccessMessage(null);
                    }}
                    className="w-full"
                  >
                    Back to Sign In
                  </Button>
                </div>
              )}
            </div>
          )}

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
