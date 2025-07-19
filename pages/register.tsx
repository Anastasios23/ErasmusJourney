"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import BackButton from "../components/BackButton";
import { Button } from "../src/components/ui/button";
import { Input } from "../src/components/ui/input";
import { Label } from "../src/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import { Alert, AlertDescription } from "../src/components/ui/alert";
import { Checkbox } from "../src/components/ui/checkbox";
import { Loader2, Eye, EyeOff, Mail, CheckCircle } from "lucide-react";
import PasswordStrength from "../src/components/PasswordStrength";

export default function RegisterPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);

  useEffect(() => {
    // Redirect if already authenticated
    if (status === "authenticated" && session) {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  // Field validation functions
  const validateField = (name: string, value: string) => {
    switch (name) {
      case "firstName":
        return !value ? "First name is required" : "";
      case "lastName":
        return !value ? "Last name is required" : "";
      case "email":
        if (!value) return "Email is required";
        if (!value.includes("@")) return "Please enter a valid email address";
        return "";
      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        if (!/(?=.*[a-z])/.test(value))
          return "Password must contain a lowercase letter";
        if (!/(?=.*[A-Z])/.test(value))
          return "Password must contain an uppercase letter";
        if (!/(?=.*\d)/.test(value)) return "Password must contain a number";
        return "";
      case "confirmPassword":
        if (!value) return "Please confirm your password";
        if (value !== formData.password) return "Passwords do not match";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Real-time validation
    const fieldError = validateField(name, value);
    setFieldErrors((prev) => ({ ...prev, [name]: fieldError }));

    // Also validate confirm password when password changes
    if (name === "password" && formData.confirmPassword) {
      const confirmError = validateField(
        "confirmPassword",
        formData.confirmPassword,
      );
      setFieldErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // Validate all fields
    const errors: Record<string, string> = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) errors[key] = error;
    });

    // Check for validation errors
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fix the errors below and try again.");
      return;
    }

    // Check password strength
    if (passwordStrength < 60) {
      setError("Please choose a stronger password.");
      return;
    }

    // Check terms agreement
    if (!agreedToTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Include cookies for session handling
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed");
        setIsLoading(false);
        return;
      }

      // Show success message and send verification email
      setSuccessMessage(
        "Account created successfully! Please check your email for verification.",
      );

      // Send verification email
      try {
        await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email }),
        });
        setEmailVerificationSent(true);
      } catch (err) {
        console.warn("Could not send verification email:", err);
      }

      setTimeout(() => {
        router.push("/login?message=account_created");
      }, 3000);
    } catch (err) {
      console.error("Registration error:", err);
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    // Temporarily disabled - needs real Google OAuth credentials
    setError(
      "Google OAuth is currently unavailable. Please use email registration instead.",
    );
  };

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <>
        <Head>
          <title>Register - Erasmus Journey Platform</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
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
          <title>Already Logged In - Erasmus Journey Platform</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
          <div className="w-full max-w-md space-y-6 text-center">
            <Card className="w-full">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    You're already registered!
                  </h2>
                  <p className="text-gray-600">
                    Welcome back, {session.user?.name || session.user?.email}
                  </p>
                  <div className="space-y-2 pt-4">
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
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Register - Erasmus Journey Platform</title>
        <meta
          name="description"
          content="Create your Erasmus Journey account"
        />
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="w-full max-w-md space-y-4">
          {/* Back Button */}
          <div className="flex justify-start">
            <BackButton fallbackUrl="/">← Back to Home</BackButton>
          </div>
          <Card className="w-full">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">
                Join Erasmus Journey
              </CardTitle>
              <CardDescription>
                Create your account to start your exchange journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {successMessage && (
                  <Alert
                    variant="default"
                    className="border-green-200 bg-green-50"
                  >
                    <AlertDescription className="text-green-800">
                      {successMessage}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleChange}
                      autoComplete="given-name"
                      required
                      disabled={isLoading}
                      className={fieldErrors.firstName ? "border-red-500" : ""}
                    />
                    {fieldErrors.firstName && (
                      <p className="text-sm text-red-600">
                        {fieldErrors.firstName}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleChange}
                      autoComplete="family-name"
                      required
                      disabled={isLoading}
                      className={fieldErrors.lastName ? "border-red-500" : ""}
                    />
                    {fieldErrors.lastName && (
                      <p className="text-sm text-red-600">
                        {fieldErrors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                    disabled={isLoading}
                    className={fieldErrors.email ? "border-red-500" : ""}
                  />
                  {fieldErrors.email && (
                    <p className="text-sm text-red-600">{fieldErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password (min 6 characters)"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                    disabled={isLoading}
                    className={fieldErrors.password ? "border-red-500" : ""}
                  />
                  {fieldErrors.password && (
                    <p className="text-sm text-red-600">
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                    disabled={isLoading}
                    className={
                      fieldErrors.confirmPassword ? "border-red-500" : ""
                    }
                  />
                  {fieldErrors.confirmPassword && (
                    <p className="text-sm text-red-600">
                      {fieldErrors.confirmPassword}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>

              <div className="mt-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-4 opacity-50"
                  onClick={handleGoogleSignUp}
                  disabled={true}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Sign up with Google (Coming Soon)
                </Button>
                <p className="text-xs text-center text-gray-500 mt-2">
                  Google OAuth requires production credentials
                </p>
              </div>

              <div className="mt-6 text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Sign in
                  </Link>
                </p>
                <p className="text-sm text-gray-600">
                  <Link
                    href="/"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Back to Home
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
