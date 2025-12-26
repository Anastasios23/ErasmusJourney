import Head from "next/head";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../src/components/Footer";
import { Card, CardContent } from "../src/components/ui/card";
import { Button } from "../src/components/ui/button";
import {
  FileText,
  Shield,
  Users,
  Scale,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Mail,
} from "lucide-react";

export default function TermsOfService() {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: `By accessing and using ErasmusJourney ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.`,
    },
    {
      title: "2. Description of Service",
      content: `ErasmusJourney provides a platform for Erasmus students to share their experiences, find accommodations, match courses, and connect with other students. The service is designed to help students make informed decisions about their exchange programs.`,
    },
    {
      title: "3. User Accounts",
      content: `To access certain features of the Platform, you must register for an account using a valid Cyprus university email address. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.`,
    },
    {
      title: "4. User Content",
      content: `Users may submit content including reviews, experiences, tips, and other information. By submitting content, you grant ErasmusJourney a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content on the Platform.`,
    },
    {
      title: "5. Acceptable Use",
      content: `You agree not to use the Platform to: post false or misleading information; harass, abuse, or harm other users; violate any applicable laws; attempt to gain unauthorized access to the Platform; or engage in any activity that disrupts the Platform's operation.`,
    },
    {
      title: "6. Content Moderation",
      content: `All user-submitted content is subject to review and moderation. We reserve the right to remove any content that violates these terms or is deemed inappropriate, without prior notice.`,
    },
    {
      title: "7. Intellectual Property",
      content: `The Platform and its original content, features, and functionality are owned by ErasmusJourney and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.`,
    },
    {
      title: "8. Disclaimer",
      content: `The information provided on the Platform is for general informational purposes only. While we strive for accuracy, we make no warranties about the completeness, reliability, or accuracy of this information.`,
    },
    {
      title: "9. Limitation of Liability",
      content: `ErasmusJourney shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Platform.`,
    },
    {
      title: "10. Changes to Terms",
      content: `We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new Terms of Service on the Platform.`,
    },
  ];

  return (
    <>
      <Head>
        <title>Terms of Service | ErasmusJourney</title>
        <meta
          name="description"
          content="Read the Terms of Service for ErasmusJourney platform."
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-violet-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-violet-950/20">
        <Header />

        <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-violet-100 dark:bg-violet-900/30 px-4 py-2 rounded-full mb-6">
                <Scale className="w-4 h-4 text-violet-600" />
                <span className="text-sm font-semibold text-violet-700 dark:text-violet-300">
                  Legal
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Terms of Service
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Last updated: December 26, 2025
              </p>
            </div>

            {/* Back Link */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 font-medium mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>

            {/* Content */}
            <Card className="border-0 shadow-xl">
              <CardContent className="p-8 md:p-12">
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                    Welcome to ErasmusJourney. These Terms of Service govern
                    your use of our platform and services. Please read them
                    carefully before using our services.
                  </p>

                  {sections.map((section, idx) => (
                    <div key={idx} className="mb-8">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        {section.title}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300">
                        {section.content}
                      </p>
                    </div>
                  ))}

                  {/* Contact Section */}
                  <div className="mt-12 p-6 bg-violet-50 dark:bg-violet-900/20 rounded-2xl">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Questions about these terms?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      If you have any questions about these Terms of Service,
                      please contact us.
                    </p>
                    <a
                      href="mailto:legal@erasmusjourney.com"
                      className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 font-semibold"
                    >
                      <Mail className="w-4 h-4" />
                      legal@erasmusjourney.com
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
