import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

export default function LoginPage() {
  const router = useRouter();
  const { error: errorCode, message } = router.query as {
    error?: string;
    message?: string;
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Success banner after registration
    if (message === "account_created") {
      setSuccessMessage("Account created! Please sign in.");
    }

    // NextAuth errors
    if (errorCode) {
      switch (errorCode) {
        case "CredentialsSignin":
          setErrorMessage("Invalid email or password.");
          break;
        case "OAuthAccountNotLinked":
          setErrorMessage("This email is already linked to another provider.");
          break;
        case "OAuthSignin":
        case "OAuthCallback":
          setErrorMessage("OAuth error. Please try again.");
          break;
        default:
          setErrorMessage("Sign-in error: " + errorCode);
      }
    }
  }, [errorCode, message]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // This will redirect automatically:
    await signIn("credentials", {
      email,
      password,
      callbackUrl: (router.query.callbackUrl as string) || "/basic-information",
    });
    // no need to handle the result here — NextAuth will redirect back to /login?error=… on failure
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto py-12">
      {successMessage && (
        <Alert variant="success" className="mb-4">
          {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert variant="destructive" className="mb-4">
          {errorMessage}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
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
            autoComplete="current-password"
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign In"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm">
        Don’t have an account?{" "}
        <Link href="/register" className="text-blue-600 hover:underline">
          Register here
        </Link>
      </p>
    </div>
  );
}
