import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { Button } from "../../src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../src/components/ui/card";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

interface AuthErrorProps {
  error?: string;
}

const errorMessages: Record<string, string> = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "You do not have permission to sign in.",
  Verification:
    "The sign in link is no longer valid. It may have been used already or it may have expired.",
  Default: "An error occurred during authentication.",
  Signin: "Try signing in with a different account.",
  OAuthSignin: "Try signing in with a different account.",
  OAuthCallback: "Try signing in with a different account.",
  OAuthCreateAccount: "Try signing in with a different account.",
  EmailCreateAccount: "Try signing in with a different account.",
  Callback: "Try signing in with a different account.",
  OAuthAccountNotLinked:
    "To confirm your identity, sign in with the same account you used originally.",
  EmailSignin: "The e-mail could not be sent.",
  CredentialsSignin:
    "Sign in failed. Check the details you provided are correct.",
  SessionRequired: "Please sign in to access this page.",
  ClientFetchError:
    "Network error occurred. Please check your connection and try again.",
};

export default function AuthError({ error = "Default" }: AuthErrorProps) {
  const errorMessage = errorMessages[error] || errorMessages.Default;

  return (
    <>
      <Head>
        <title>Authentication Error - Erasmus Journey</title>
        <meta name="description" content="Authentication error occurred" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="mt-6 text-2xl font-bold text-gray-900">
                Authentication Error
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">{errorMessage}</p>

                {error === "ClientFetchError" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                    <p className="text-xs text-blue-700">
                      This error is often caused by browser extensions or
                      network issues. Try disabling browser extensions or
                      refreshing the page.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Link href="/login">
                  <Button className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </Link>

                <Link href="/">
                  <Button variant="outline" className="w-full">
                    <Home className="h-4 w-4 mr-2" />
                    Go Home
                  </Button>
                </Link>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  If the problem persists, please contact support or try signing
                  in later.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { error } = context.query;

  return {
    props: {
      error: typeof error === "string" ? error : "Default",
    },
  };
};
