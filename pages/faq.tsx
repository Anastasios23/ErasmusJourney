import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../src/components/Footer";
import { Card, CardContent } from "../src/components/ui/card";
import { Input } from "../src/components/ui/input";
import { Button } from "../src/components/ui/button";
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Mail,
  MessageCircle,
  GraduationCap,
  Home,
  CreditCard,
  BookOpen,
  Users,
  Shield,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  icon: any;
  title: string;
  color: string;
  faqs: FAQItem[];
}

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState("");
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories: FAQCategory[] = [
    {
      id: "general",
      icon: HelpCircle,
      title: "General",
      color: "from-violet-500 to-purple-600",
      faqs: [
        {
          question: "What is ErasmusJourney?",
          answer:
            "ErasmusJourney is a platform designed to help Erasmus students share their experiences, find accommodations, match courses, and connect with other students. Our goal is to make the Erasmus exchange process easier and more informed.",
        },
        {
          question: "Who can use ErasmusJourney?",
          answer:
            "ErasmusJourney is primarily designed for students from Cyprus universities who are participating in the Erasmus+ exchange program. You need a valid Cyprus university email address to register.",
        },
        {
          question: "Is ErasmusJourney free to use?",
          answer:
            "Yes! ErasmusJourney is completely free for all students. Our mission is to support the Erasmus community without any financial barriers.",
        },
      ],
    },
    {
      id: "account",
      icon: Users,
      title: "Account & Registration",
      color: "from-blue-500 to-indigo-600",
      faqs: [
        {
          question: "How do I create an account?",
          answer:
            "Click the 'Get Started' button and register using your Cyprus university email address. You'll receive a verification email to confirm your account.",
        },
        {
          question: "Why do I need a Cyprus university email?",
          answer:
            "To ensure the authenticity of our community and protect against spam, we require registration with a valid Cyprus university email. This helps maintain the quality and relevance of shared experiences.",
        },
        {
          question: "I forgot my password. What should I do?",
          answer:
            "Click on 'Sign In' and then 'Forgot Password'. Enter your registered email address, and we'll send you instructions to reset your password.",
        },
      ],
    },
    {
      id: "destinations",
      icon: GraduationCap,
      title: "Destinations & Universities",
      color: "from-emerald-500 to-teal-600",
      faqs: [
        {
          question: "How many destinations are available?",
          answer:
            "We feature over 150 European cities and 80+ partner universities. Our database is constantly growing as more students share their experiences.",
        },
        {
          question: "How do I find information about a specific city?",
          answer:
            "Use the search bar on the Destinations page or browse by country. Each destination page includes reviews, cost of living information, and tips from previous students.",
        },
        {
          question: "Can I filter destinations by my preferences?",
          answer:
            "Yes! You can filter destinations by country, cost of living, language, climate, and student ratings to find the perfect match for your exchange.",
        },
      ],
    },
    {
      id: "courses",
      icon: BookOpen,
      title: "Course Matching",
      color: "from-amber-500 to-orange-600",
      faqs: [
        {
          question: "What is course matching?",
          answer:
            "Course matching helps you find equivalent courses at host universities that can be credited back to your home university. This ensures you stay on track with your degree requirements.",
        },
        {
          question: "How accurate is the course matching?",
          answer:
            "Our course matching is based on experiences shared by previous students. While it provides a helpful guide, always confirm course equivalencies with your academic advisor.",
        },
        {
          question: "Can I contribute to course matching data?",
          answer:
            "Absolutely! After your exchange, you can share which courses you took and how they were credited. This helps future students make informed decisions.",
        },
      ],
    },
    {
      id: "accommodation",
      icon: Home,
      title: "Accommodation",
      color: "from-pink-500 to-rose-600",
      faqs: [
        {
          question: "Does ErasmusJourney help find accommodation?",
          answer:
            "We provide reviews and tips from students about different accommodation options in each city. While we don't directly book accommodations, we help you make informed decisions.",
        },
        {
          question: "What types of accommodation are reviewed?",
          answer:
            "Students share experiences about university dormitories, private rentals, shared apartments, and student residences. Each review includes pricing, location, and quality ratings.",
        },
        {
          question: "When should I start looking for accommodation?",
          answer:
            "We recommend starting your search 3-6 months before your exchange begins. Popular cities fill up quickly, especially during peak periods.",
        },
      ],
    },
    {
      id: "costs",
      icon: CreditCard,
      title: "Costs & Budget",
      color: "from-cyan-500 to-blue-600",
      faqs: [
        {
          question: "How do I estimate living costs?",
          answer:
            "Our Living Expenses tool provides average monthly costs for each destination, including rent, food, transportation, and entertainment based on student reports.",
        },
        {
          question: "Are the cost estimates accurate?",
          answer:
            "Cost estimates are based on aggregated data from real student experiences. Actual costs may vary depending on your lifestyle and specific circumstances.",
        },
        {
          question: "Does ErasmusJourney provide financial aid information?",
          answer:
            "We provide general information about Erasmus+ grants and scholarships. For specific financial aid, contact your home university's international office.",
        },
      ],
    },
  ];

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  const filteredCategories = categories
    .map((category) => ({
      ...category,
      faqs: category.faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    }))
    .filter(
      (category) =>
        (activeCategory === "all" || category.id === activeCategory) &&
        (searchTerm === "" || category.faqs.length > 0),
    );

  return (
    <>
      <Head>
        <title>FAQ | ErasmusJourney</title>
        <meta
          name="description"
          content="Find answers to frequently asked questions about ErasmusJourney and the Erasmus exchange program."
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-cyan-950/20">
        <Header />

        {/* Hero Section */}
        <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-400/20 rounded-full blur-3xl" />
          </div>

          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-cyan-100 dark:bg-cyan-900/30 px-4 py-2 rounded-full mb-6">
              <HelpCircle className="w-4 h-4 text-cyan-600" />
              <span className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">
                Help Center
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Find answers to common questions about ErasmusJourney
            </p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search for answers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 rounded-2xl text-base shadow-lg border-gray-200 dark:border-gray-700"
              />
            </div>
          </div>
        </section>

        {/* Back Link */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {/* Category Filter */}
        <section className="px-4 sm:px-6 lg:px-8 mb-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setActiveCategory("all")}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  activeCategory === "all"
                    ? "bg-cyan-600 text-white shadow-lg"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700",
                )}
              >
                All Topics
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                    activeCategory === category.id
                      ? "bg-cyan-600 text-white shadow-lg"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700",
                  )}
                >
                  <category.icon className="w-4 h-4" />
                  {category.title}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="px-4 sm:px-6 lg:px-8 pb-20">
          <div className="max-w-4xl mx-auto space-y-8">
            {filteredCategories.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No results found
                  </h3>
                  <p className="text-gray-500">
                    Try searching with different keywords or browse all
                    categories.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredCategories.map((category) => (
                <div key={category.id}>
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={cn(
                        "p-2 rounded-xl bg-gradient-to-br",
                        category.color,
                      )}
                    >
                      <category.icon className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {category.title}
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {category.faqs.map((faq, idx) => {
                      const itemId = `${category.id}-${idx}`;
                      const isOpen = openItems.has(itemId);

                      return (
                        <Card
                          key={idx}
                          className="border-0 shadow-md hover:shadow-lg transition-shadow"
                        >
                          <button
                            onClick={() => toggleItem(itemId)}
                            className="w-full text-left p-6"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {faq.question}
                              </h3>
                              {isOpen ? (
                                <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                              )}
                            </div>
                            {isOpen && (
                              <p className="mt-4 text-gray-600 dark:text-gray-300">
                                {faq.answer}
                              </p>
                            )}
                          </button>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="px-4 sm:px-6 lg:px-8 pb-20">
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-cyan-600 to-blue-700 text-white overflow-hidden relative">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:30px_30px]" />
              <CardContent className="relative p-12 text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-90" />
                <h2 className="text-2xl font-bold mb-3">
                  Still have questions?
                </h2>
                <p className="text-cyan-100 mb-6 max-w-lg mx-auto">
                  Can&apos;t find what you&apos;re looking for? Our support team
                  is here to help you with any questions about your Erasmus
                  journey.
                </p>
                <a href="mailto:support@erasmusjourney.com">
                  <Button className="rounded-2xl px-8 py-6 text-lg bg-white text-cyan-700 hover:bg-cyan-50 shadow-xl">
                    <Mail className="w-5 h-5 mr-2" />
                    Contact Support
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
