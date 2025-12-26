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
import {
  AlertCircle,
  Eye,
  EyeOff,
  GraduationCap,
  Sparkles,
  ArrowLeft,
  Mail,
  Lock,
  Loader2,
} from "lucide-react";
import { handleApiError } from "../src/utils/apiErrorHandler";
import { handleForgotPassword as forgotPasswordAPI } from "../src/utils/forgotPasswordHandler";

// Floating orbs component
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-full blur-3xl" />
    </div>
  );
}

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
    if (status === "authenticated") {
      router.push((router.query.callbackUrl as string) || "/dashboard");
    }
  }, [status, router]);

  useEffect(() => {
    if (router.query.error) {
      const errorMsg = router.query.error as string;
      if (errorMsg.includes("restricted") || errorMsg.includes("university")) {
        setError(
          "Access restricted to Cyprus university emails only (@ucy.ac.cy, @cut.ac.cy, etc.).",
        );
      } else {
        setError("Sign-in failed. Please try again or use a different method.");
      }

      const { error: _, ...restQuery } = router.query;
      router.replace(
        { pathname: router.pathname, query: restQuery },
        undefined,
        { shallow: true },
      );
    }
  }, [router.query.error, router]);

  const handleStandardLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: (router.query.callbackUrl as string) || "/",
    });

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    } else if (result?.ok) {
      window.location.href = (router.query.callbackUrl as string) || "/";
    } else {
      setError("Login failed. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 animate-pulse" />
            <Loader2 className="absolute inset-0 m-auto h-8 w-8 animate-spin text-white" />
          </div>
        </div>
      </div>
    );
  }

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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 relative overflow-hidden">
          <FloatingOrbs />

          <div className="relative w-full max-w-md z-10">
            {/* Back Button */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors mb-8 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Home</span>
            </Link>

            {/* Glass Card */}
            <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-gray-700/30 rounded-3xl shadow-2xl shadow-violet-500/10 overflow-hidden">
              {/* Header with gradient */}
              <div className="relative bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 px-8 py-10 text-center overflow-hidden">
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-0 left-0 w-40 h-40 bg-white/20 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl translate-x-1/2 translate-y-1/2" />
                </div>

                <div className="relative">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
                    <GraduationCap className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-2">
                    {showForgotPassword ? "Reset Password" : "Welcome Back"}
                  </h1>
                  <p className="text-white/80 text-sm">
                    {showForgotPassword
                      ? "Enter your email to receive a reset link"
                      : "Sign in to continue your Erasmus journey"}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                {!showForgotPassword ? (
                  <div className="space-y-5">
                    {error && (
                      <Alert
                        variant="destructive"
                        className="rounded-xl border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30"
                      >
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <form onSubmit={handleStandardLogin} className="space-y-5">
                      <div className="space-y-2">
                        <Label
                          htmlFor="email"
                          className="text-gray-700 dark:text-gray-300 font-medium"
                        >
                          Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="name@university.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                            className="pl-12 h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 rounded-xl focus:border-violet-500 focus:ring-violet-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="password"
                          className="text-gray-700 dark:text-gray-300 font-medium"
                        >
                          Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                            className="pl-12 pr-12 h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 rounded-xl focus:border-violet-500 focus:ring-violet-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-sm text-violet-600 dark:text-violet-400 hover:text-fuchsia-600 dark:hover:text-fuchsia-400 transition-colors font-medium"
                          disabled={isLoading}
                        >
                          Forgot Password?
                        </button>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:opacity-90 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25 transition-all"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Signing In...
                          </>
                        ) : (
                          "Sign In"
                        )}
                      </Button>
                    </form>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white/70 dark:bg-gray-900/70 px-4 text-gray-500 dark:text-gray-400 font-medium">
                          Or continue with
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-violet-300 dark:hover:border-violet-700 transition-all"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                    >
                      <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Sign in with Google
                    </Button>
                  </div>
                ) : (
                  <div>
                    {!forgotPasswordSent ? (
                      <form
                        onSubmit={handleForgotPassword}
                        className="space-y-5"
                      >
                        {error && (
                          <Alert variant="destructive" className="rounded-xl">
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}
                        <div className="space-y-2">
                          <Label
                            htmlFor="forgot-email"
                            className="text-gray-700 dark:text-gray-300 font-medium"
                          >
                            Email Address
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                              id="forgot-email"
                              type="email"
                              placeholder="name@university.edu"
                              value={forgotPasswordEmail}
                              onChange={(e) =>
                                setForgotPasswordEmail(e.target.value)
                              }
                              required
                              disabled={isLoading}
                              className="pl-12 h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 rounded-xl focus:border-violet-500 focus:ring-violet-500"
                            />
                          </div>
                        </div>
                        <Button
                          type="submit"
                          className="w-full h-12 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:opacity-90 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            "Send Reset Link"
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setShowForgotPassword(false)}
                          className="w-full rounded-xl text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400"
                        >
                          Back to Sign In
                        </Button>
                      </form>
                    ) : (
                      <div className="text-center space-y-5">
                        <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                            <Sparkles className="w-6 h-6 text-white" />
                          </div>
                          <p className="text-emerald-800 dark:text-emerald-300 font-medium">
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
                          className="w-full rounded-xl"
                        >
                          Back to Sign In
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-8 pb-8 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?{" "}
                  <Link
                    href="/register"
                    className="font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
                  >
                    Register here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
}
