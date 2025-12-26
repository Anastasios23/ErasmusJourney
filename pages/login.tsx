"use client";

import { useState, useEffect, FormEvent } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { Button } from "../src/components/ui/button";
import { Input } from "../src/components/ui/input";
import { Label } from "../src/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../src/components/ui/alert";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { handleApiError } from "../src/utils/apiErrorHandler";
import { handleForgotPassword as forgotPasswordAPI } from "../src/utils/forgotPasswordHandler"; // Make sure path is correct
import BackButton from "../components/BackButton";

export default function Login() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // If the user is already authenticated, redirect them to the dashboard.
    if (status === "authenticated") {
      router.push((router.query.callbackUrl as string) || "/dashboard");
    }
  }, [status, router]);

  // Handle errors from query parameters (e.g., from Google Auth redirects)
  useEffect(() => {
    if (router.query.error) {
      const errorMsg = router.query.error as string;
      if (errorMsg.includes("restricted") || errorMsg.includes("university")) {
        setError("Access restricted to Cyprus university emails only (@ucy.ac.cy, @cut.ac.cy, etc.).");
      } else {
        setError("Sign-in failed. Please try again or use a different method.");
      }
      
      // Clean the URL to avoid showing the error again on refresh
      const { error: _, ...restQuery } = router.query;
      router.replace({ pathname: router.pathname, query: restQuery }, undefined, { shallow: true });
    }
  }, [router.query.error, router]);

  const handleStandardLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    console.log("Attempting login...");

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: (router.query.callbackUrl as string) || "/",
    });

    console.log("Login result:", result);

    if (result?.error) {
      console.error("Login error:", result.error);
      setError(result.error);
      setIsLoading(false);
    } else if (result?.ok) {
      console.log("Login successful, redirecting...");
      // Force redirect to home page
      window.location.href = (router.query.callbackUrl as string) || "/";
    } else {
      console.error("Unexpected login result:", result);
      setError("Login failed. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    // Use the callbackUrl from the query parameters, or default to home page
    const callbackUrl = (router.query.callbackUrl as string) || "/";
    await signIn("google", { callbackUrl });
  };

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await forgotPasswordAPI(forgotPasswordEmail);
      setForgotPasswordSent(true);
      setSuccessMessage("Password reset link sent! Check your email.");
    } catch (error) {
      const errorInfo = handleApiError(error);
      setError(errorInfo.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If not loading and not authenticated, show the login form
  if (status !== "authenticated") {
    return (
      <>
        <Head>
          <title>Sign In - Erasmus Journey Platform</title>
          <meta
            name="description"
            content="Sign in to access your Erasmus dashboard."
          />
        </Head>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
          <Card className="w-full max-w-md shadow-xl">
            <div className="flex justify-start p-4">
              <BackButton fallbackUrl="/">← Back to Home</BackButton>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                {showForgotPassword ? "Reset Password" : "Sign In"}
              </CardTitle>
              <CardDescription className="text-center text-gray-600">
                {showForgotPassword
                  ? "Enter your email to receive a reset link."
                  : "Welcome back! Please sign in to continue."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showForgotPassword ? (
                <div className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <form onSubmit={handleStandardLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2 relative">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-9 text-gray-500"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-blue-600 hover:underline"
                        disabled={isLoading}
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing In..." : "Sign In"}
                    </Button>
                  </form>
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">
                        Or continue with
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    <svg
                      className="mr-2 h-4 w-4"
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fab"
                      data-icon="google"
                      role="img"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 488 512"
                    >
                      <path
                        fill="currentColor"
                        d="M488 261.8C488 403.3 381.5 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-65.7 64.9C313.5 99.8 283.3 80 248 80c-82.6 0-150.2 67.6-150.2 150.2s67.6 150.2 150.2 150.2c94.2 0 125.6-72.2 129.2-108.2H248v-85.3h236.1c2.3 12.7 3.9 26.1 3.9 40.2z"
                      ></path>
                    </svg>
                    Sign in with Google
                  </Button>
                </div>
              ) : (
                <div>
                  {!forgotPasswordSent ? (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      {error && (
                        <Alert variant="destructive">
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="forgot-email">Email Address</Label>
                        <Input
                          id="forgot-email"
                          type="email"
                          placeholder="name@example.com"
                          value={forgotPasswordEmail}
                          onChange={(e) =>
                            setForgotPasswordEmail(e.target.value)
                          }
                          required
                          disabled={isLoading}
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? "Sending..." : "Send Password Reset Link"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setShowForgotPassword(false)}
                        className="w-full"
                      >
                        Back to Sign In
                      </Button>
                    </form>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800 text-sm">
                          {successMessage}
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
            </CardContent>
            <CardFooter className="justify-center">
              <p className="text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="font-medium text-blue-600 hover:underline"
                >
                  Register here
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </>
    );
  }

  // If authenticated, this component will not render anything as the useEffect hook will have already initiated a redirect.
  // Returning null is a fallback.
  return null;
}
