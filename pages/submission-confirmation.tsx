import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Header from "../components/Header";
import { Button } from "../src/components/ui/button";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { HeroSection } from "@/components/ui/hero-section";

export default function SubmissionConfirmation() {
  const router = useRouter();
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);

  useEffect(() => {
    // Check if user was redirected here after submission
    const submitted = router.query.submitted;
    const timestamp = router.query.timestamp;

    if (submitted === "true" && timestamp) {
      setSubmittedAt(timestamp as string);
    } else {
      // If no submission data, redirect to dashboard
      // router.push("/dashboard");
    }
  }, [router]);

  const formatDate = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return "Just now";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Head>
        <title>Submission Confirmed | Erasmus Journey</title>
      </Head>

      <Header />

      <main className="pb-20">
        <HeroSection
          title="Submission Successful!"
          subtitle="Thank you for sharing your journey. Your experience will help thousands of future Erasmus students."
          icon="solar:check-circle-bold-duotone"
          theme="emerald"
        />

        <div className="max-w-3xl mx-auto px-4 -mt-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100 dark:border-slate-800 text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 mb-8">
              <Icon icon="solar:verified-check-bold" className="w-10 h-10" />
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              You're all set!
            </h2>
            
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto">
              Your Erasmus experience has been successfully recorded. Our team will review it shortly to ensure it meets our community guidelines.
            </p>

            {submittedAt && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-full text-sm text-slate-500 dark:text-slate-400 mb-12">
                <Icon icon="solar:calendar-minimalistic-linear" className="w-4 h-4" />
                <span>Submitted on {formatDate(submittedAt)}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
              <Link href="/dashboard" className="w-full">
                <Button className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 dark:shadow-none transition-all duration-200">
                  <Icon icon="solar:home-2-linear" className="mr-2 h-5 w-5" />
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="/my-submissions" className="w-full">
                <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200">
                  <Icon icon="solar:document-text-linear" className="mr-2 h-5 w-5" />
                  View My Submissions
                </Button>
              </Link>
            </div>

            <div className="mt-16 pt-8 border-t border-slate-100 dark:border-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Want to help even more? Share your story on social media!
              </p>
              <div className="flex justify-center gap-4">
                <button className="p-3 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                  <Icon icon="solar:share-circle-linear" className="w-6 h-6" />
                </button>
                <button className="p-3 rounded-full bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors">
                  <Icon icon="logos:twitter" className="w-5 h-5" />
                </button>
                <button className="p-3 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors">
                  <Icon icon="logos:facebook" className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
