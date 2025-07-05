import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import BackButton from "../components/BackButton";
import SimpleBackButton from "../components/SimpleBackButton";
import { Button } from "../src/components/ui/button";
import { Input } from "../src/components/ui/input";
import { Alert } from "../src/components/ui/alert";

export default function LoginPage() {
  const router = useRouter();
  const { message } = router.query as { message?: string };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Show success banner if coming from registration
    if (message === "account_created") {
      setSuccessMessage("Account created! Please sign in.");
    }
  }, [message]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    // Attempt sign in without redirect
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (result?.error) {
      // Map known error codes
      if (result.error === "CredentialsSignin") {
        setErrorMessage("Invalid email or password.");
      } else {
        setErrorMessage(`Sign-in error: ${result.error}`);
      }
      return;
    }

    // On success, redirect to callbackUrl or to home page '/'
    const callbackUrl = (router.query.callbackUrl as string) || "/";
    router.push(callbackUrl);
  };

  return (
    <>
      <Head>
        <title>Login - Erasmus Journey</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md space-y-6">
          {/* Back Buttons */}
          <div className="flex justify-start gap-4">
            <BackButton fallbackUrl="/" variant="outline" />
            <SimpleBackButton fallbackUrl="/" />
          </div>
          {successMessage && (
            <Alert variant="success">
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
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
              />
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
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
              />
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
