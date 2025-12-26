import Head from "next/head";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../src/components/Footer";
import { Card, CardContent } from "../src/components/ui/card";
import { Button } from "../src/components/ui/button";
import {
  Cookie,
  Settings,
  BarChart3,
  Target,
  Shield,
  ArrowLeft,
  Mail,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function CookiePolicy() {
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: true,
    functional: true,
    marketing: false,
  });

  const cookieTypes = [
    {
      id: "essential",
      icon: Shield,
      title: "Essential Cookies",
      description:
        "These cookies are necessary for the website to function and cannot be switched off. They are usually set in response to actions you take such as logging in or filling in forms.",
      required: true,
      color: "from-violet-500 to-purple-600",
    },
    {
      id: "analytics",
      icon: BarChart3,
      title: "Analytics Cookies",
      description:
        "These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our services.",
      required: false,
      color: "from-blue-500 to-indigo-600",
    },
    {
      id: "functional",
      icon: Settings,
      title: "Functional Cookies",
      description:
        "These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings across sessions.",
      required: false,
      color: "from-emerald-500 to-teal-600",
    },
    {
      id: "marketing",
      icon: Target,
      title: "Marketing Cookies",
      description:
        "These cookies may be set by our advertising partners to build a profile of your interests and show you relevant content on other sites. Currently not used.",
      required: false,
      color: "from-amber-500 to-orange-600",
    },
  ];

  const togglePreference = (id: string) => {
    if (id === "essential") return; // Cannot toggle essential cookies
    setPreferences((prev) => ({
      ...prev,
      [id]: !prev[id as keyof typeof prev],
    }));
  };

  const savePreferences = () => {
    // In a real app, this would save to localStorage/cookies
    localStorage.setItem("cookiePreferences", JSON.stringify(preferences));
    alert("Cookie preferences saved!");
  };

  return (
    <>
      <Head>
        <title>Cookie Policy | ErasmusJourney</title>
        <meta
          name="description"
          content="Learn about how ErasmusJourney uses cookies and manage your preferences."
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-amber-950/20">
        <Header />

        <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 px-4 py-2 rounded-full mb-6">
                <Cookie className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                  Cookies
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Cookie Policy
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Last updated: December 26, 2025
              </p>
            </div>

            {/* Back Link */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>

            {/* Intro */}
            <Card className="border-0 shadow-xl mb-8">
              <CardContent className="p-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  What are cookies?
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Cookies are small text files that are placed on your computer
                  or mobile device when you visit a website. They are widely
                  used to make websites work more efficiently and provide
                  information to the owners of the site.
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  ErasmusJourney uses cookies to enhance your experience,
                  remember your preferences, and understand how you use our
                  platform so we can improve our services.
                </p>
              </CardContent>
            </Card>

            {/* Cookie Types & Preferences */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Cookie Preferences
            </h2>
            <div className="space-y-4 mb-8">
              {cookieTypes.map((cookie) => {
                const Icon = cookie.icon;
                const isEnabled =
                  preferences[cookie.id as keyof typeof preferences];

                return (
                  <Card
                    key={cookie.id}
                    className={cn(
                      "border-0 shadow-lg transition-all",
                      isEnabled ? "ring-2 ring-amber-400/50" : "opacity-75",
                    )}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            "p-3 rounded-2xl bg-gradient-to-br shrink-0",
                            cookie.color,
                          )}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-4 mb-2">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                              {cookie.title}
                            </h3>
                            <button
                              onClick={() => togglePreference(cookie.id)}
                              disabled={cookie.required}
                              className={cn(
                                "relative w-14 h-8 rounded-full transition-colors",
                                isEnabled
                                  ? "bg-amber-500"
                                  : "bg-gray-300 dark:bg-gray-600",
                                cookie.required &&
                                  "opacity-50 cursor-not-allowed",
                              )}
                            >
                              <span
                                className={cn(
                                  "absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform",
                                  isEnabled ? "left-7" : "left-1",
                                )}
                              />
                            </button>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">
                            {cookie.description}
                          </p>
                          {cookie.required && (
                            <span className="inline-block mt-2 text-xs font-medium text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-full">
                              Always active
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Save Button */}
            <div className="flex justify-center mb-12">
              <Button
                onClick={savePreferences}
                className="rounded-2xl px-8 py-6 text-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Save Preferences
              </Button>
            </div>

            {/* How to Manage */}
            <Card className="border-0 shadow-xl mb-8">
              <CardContent className="p-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Managing Cookies in Your Browser
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Most web browsers allow you to control cookies through their
                  settings. You can usually find these in the
                  &quot;Options&quot; or &quot;Preferences&quot; menu of your
                  browser.
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Please note that disabling cookies may affect the
                  functionality of this and many other websites that you visit.
                  Therefore, it is recommended that you do not disable cookies.
                </p>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-3">Questions?</h3>
                <p className="text-amber-100 mb-4">
                  If you have any questions about our use of cookies, please
                  contact us.
                </p>
                <a
                  href="mailto:privacy@erasmusjourney.com"
                  className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  privacy@erasmusjourney.com
                </a>
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
