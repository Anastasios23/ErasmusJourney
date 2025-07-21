<<<<<<< HEAD
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
=======
import { useState, useEffect, FormEvent } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";
>>>>>>> origin/main
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
<<<<<<< HEAD
import { Alert, AlertDescription } from "../src/components/ui/alert";
import { Checkbox } from "../src/components/ui/checkbox";
import { Loader2, Eye, EyeOff, Mail, CheckCircle } from "lucide-react";
import PasswordStrength from "../src/components/PasswordStrength";

export default function RegisterPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

=======
import { Checkbox } from "../src/components/ui/checkbox";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../src/components/ui/alert";
import { AlertCircle, Eye, EyeOff, MailCheck, CircleCheck } from "lucide-react";
import { registerUser } from "../src/services/api";
import { z, ZodError } from "zod";
import { handleApiError } from "../src/utils/apiErrorHandler";
import PasswordStrength from "../src/components/PasswordStrength";
import { cn } from "../src/lib/utils";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^a-zA-Z0-9]/,
    "Password must contain at least one special character",
  );

const registrationSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: passwordSchema,
    confirmPassword: z.string(),
    agreedToTerms: z.literal(true, {
      errorMap: () => ({
        message: "You must agree to the terms and conditions",
      }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function Register() {
  const { data: session, status } = useSession();
  const router = useRouter();

>>>>>>> origin/main
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
<<<<<<< HEAD

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
=======

  useEffect(() => {
    // Redirect if already authenticated
    if (status === "authenticated" && session) {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });

    if (id === "password") {
      try {
        passwordSchema.parse(value);
        setPasswordStrength(100);
      } catch (err) {
        if (err instanceof ZodError) {
          const score =
            (Object.keys(err.flatten().fieldErrors).length / 5) * 100;
          setPasswordStrength(100 - score);
        }
      }
>>>>>>> origin/main
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
<<<<<<< HEAD
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

=======
    setFieldErrors({});
>>>>>>> origin/main
    setIsLoading(true);

    try {
<<<<<<< HEAD
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
=======
      registrationSchema.parse({ ...formData, agreedToTerms });

      const result = await registerUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
>>>>>>> origin/main
      });

      if (result.success) {
        setSuccessMessage(result.message);
        setEmailVerificationSent(true); // Show verification message
      } else {
        setError(result.message || "An unknown error occurred.");
      }
<<<<<<< HEAD

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
=======
    } catch (err: any) {
      if (err instanceof ZodError) {
        const errors: Record<string, string> = {};
        err.errors.forEach((e) => {
          if (e.path[0]) {
            errors[e.path[0]] = e.message;
          }
        });
        setFieldErrors(errors);
      } else {
        const errorInfo = handleApiError(err);
        setError(errorInfo.message);
      }
    } finally {
>>>>>>> origin/main
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    // This will redirect the user to the Google sign-in page
    // and then back to the dashboard upon successful authentication.
    await signIn("google", { callbackUrl: "/dashboard" });
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

<<<<<<< HEAD
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
=======
  if (emailVerificationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <MailCheck className="mx-auto h-12 w-12 text-green-500" />
            <CardTitle className="mt-4 text-2xl font-bold">
              Verify Your Email
            </CardTitle>
            <CardDescription className="mt-2 text-gray-600">
              We've sent a verification link to{" "}
              <span className="font-semibold text-gray-800">
                {formData.email}
              </span>
              . Please check your inbox and click the link to complete your
              registration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-center text-gray-500">
              Didn't receive the email? Check your spam folder or{" "}
              <button
                // Add resend logic here if available
                className="text-blue-600 hover:underline"
              >
                request a new link
              </button>
              .
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/login" className="w-full">
              <Button variant="outline" className="w-full">
                Back to Login
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
>>>>>>> origin/main
    );
  }

  return (
    <>
      <Head>
        <title>Register - Erasmus Journey Platform</title>
        <meta
          name="description"
          content="Create your account to start your Erasmus journey."
        />
      </Head>
<<<<<<< HEAD

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
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription className="text-green-800">
                      {successMessage}
                      {emailVerificationSent && (
                        <div className="mt-2 text-sm">
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span>Verification email sent!</span>
                          </div>
                        </div>
                      )}
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

=======
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Create Your Account
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Join the platform to connect with other students.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Registration Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {successMessage && !emailVerificationSent && (
                <Alert className="bg-green-50 border-green-200 text-green-800">
                  <CircleCheck className="h-4 w-4 text-green-600" />
                  <AlertTitle>Success!</AlertTitle>
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
>>>>>>> origin/main
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
<<<<<<< HEAD
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
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                      required
                      disabled={isLoading}
                      className={`pr-10 ${fieldErrors.password ? "border-red-500" : ""}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-sm text-red-600">
                      {fieldErrors.password}
                    </p>
                  )}
                  <PasswordStrength
                    password={formData.password}
                    onStrengthChange={setPasswordStrength}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      autoComplete="new-password"
                      required
                      disabled={isLoading}
                      className={`pr-10 ${
                        fieldErrors.confirmPassword ? "border-red-500" : ""
                      }`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="text-sm text-red-600">
                      {fieldErrors.confirmPassword}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={agreedToTerms}
                      onCheckedChange={setAgreedToTerms}
                      disabled={isLoading}
                    />
                    <Label htmlFor="terms" className="text-sm text-gray-600">
                      I agree to the{" "}
                      <Link
                        href="/terms"
                        className="text-blue-600 hover:underline"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        className="text-blue-600 hover:underline"
                      >
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    isLoading || passwordStrength < 60 || !agreedToTerms
                  }
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
=======
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className={cn(fieldErrors.firstName && "border-red-500")}
                  />
                  {fieldErrors.firstName && (
                    <p className="text-sm text-red-500">
                      {fieldErrors.firstName}
                    </p>
>>>>>>> origin/main
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className={cn(fieldErrors.lastName && "border-red-500")}
                  />
                  {fieldErrors.lastName && (
                    <p className="text-sm text-red-500">
                      {fieldErrors.lastName}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className={cn(fieldErrors.email && "border-red-500")}
                />
                {fieldErrors.email && (
                  <p className="text-sm text-red-500">{fieldErrors.email}</p>
                )}
              </div>
              <div className="space-y-2 relative">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className={cn(
                    "pr-10",
                    fieldErrors.password && "border-red-500",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-500"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
                <PasswordStrength password={formData.password} />
                {fieldErrors.password && (
                  <p className="text-sm text-red-500">{fieldErrors.password}</p>
                )}
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className={cn(
                    "pr-10",
                    fieldErrors.confirmPassword && "border-red-500",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-9 text-gray-500"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
                {fieldErrors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="agreedToTerms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) =>
                    setAgreedToTerms(checked as boolean)
                  }
                />
                <Label htmlFor="agreedToTerms" className="text-sm">
                  I agree to the{" "}
                  <Link
                    href="/terms-of-service"
                    className="text-blue-600 hover:underline"
                  >
                    Terms and Conditions
                  </Link>
                </Label>
              </div>
              {fieldErrors.agreedToTerms && (
                <p className="text-sm text-red-500">
                  {fieldErrors.agreedToTerms}
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !agreedToTerms}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
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
              onClick={handleGoogleSignUp}
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
              Sign up with Google
            </Button>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-blue-600 hover:underline"
              >
                Sign In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
