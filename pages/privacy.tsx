import Head from "next/head";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../src/components/Footer";
import { Card, CardContent } from "../src/components/ui/card";
import {
  Shield,
  Eye,
  Database,
  Lock,
  Share2,
  Trash2,
  ArrowLeft,
  Mail,
  CheckCircle2,
} from "lucide-react";

export default function PrivacyPolicy() {
  const sections = [
    {
      icon: Database,
      title: "Information We Collect",
      content: `We collect information you provide directly to us, including: your name, email address (Cyprus university email), and any content you submit such as reviews, experiences, and accommodation information. We also automatically collect certain information when you use the Platform, including your IP address, browser type, and usage patterns.`,
    },
    {
      icon: Eye,
      title: "How We Use Your Information",
      content: `We use the information we collect to: provide, maintain, and improve our services; process and complete transactions; send you technical notices and support messages; respond to your comments and questions; and monitor and analyze trends, usage, and activities.`,
    },
    {
      icon: Share2,
      title: "Information Sharing",
      content: `We do not sell, trade, or rent your personal information to third parties. We may share your information with: service providers who assist in our operations; when required by law or to protect our rights; and with your consent or at your direction.`,
    },
    {
      icon: Lock,
      title: "Data Security",
      content: `We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.`,
    },
    {
      icon: Trash2,
      title: "Data Retention & Deletion",
      content: `We retain your personal information for as long as your account is active or as needed to provide you services. You can request deletion of your account and associated data at any time by contacting us.`,
    },
  ];

  const rights = [
    "Access the personal information we hold about you",
    "Request correction of inaccurate information",
    "Request deletion of your personal information",
    "Object to processing of your personal information",
    "Request restriction of processing your personal information",
    "Request transfer of your personal information",
    "Withdraw consent at any time",
  ];

  return (
    <>
      <Head>
        <title>Privacy Policy | ErasmusJourney</title>
        <meta
          name="description"
          content="Learn how ErasmusJourney collects, uses, and protects your personal information."
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950/20">
        <Header />

        <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 px-4 py-2 rounded-full mb-6">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  Privacy
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Privacy Policy
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Last updated: December 26, 2025
              </p>
            </div>

            {/* Back Link */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>

            {/* Intro Card */}
            <Card className="border-0 shadow-xl mb-8">
              <CardContent className="p-8">
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  At ErasmusJourney, we take your privacy seriously. This
                  Privacy Policy explains how we collect, use, disclose, and
                  safeguard your information when you use our platform. Please
                  read this policy carefully.
                </p>
              </CardContent>
            </Card>

            {/* Sections */}
            <div className="space-y-6 mb-12">
              {sections.map((section, idx) => (
                <Card key={idx} className="border-0 shadow-lg">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl shrink-0">
                        <section.icon className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                          {section.title}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">
                          {section.content}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Your Rights */}
            <Card className="border-0 shadow-xl mb-8">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Your Rights
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Under the General Data Protection Regulation (GDPR), you have
                  the following rights regarding your personal data:
                </p>
                <ul className="space-y-3">
                  {rights.map((right, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-gray-600 dark:text-gray-300">
                        {right}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Contact Section */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-3">Contact Us</h3>
                <p className="text-emerald-100 mb-4">
                  If you have any questions about this Privacy Policy or wish to
                  exercise your rights, please contact our Data Protection
                  Officer.
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
