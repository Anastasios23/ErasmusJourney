import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "../lib/prisma";
import Header from "../components/Header";
import Footer from "../src/components/Footer";
import { Button } from "../src/components/ui/button";
import { Badge } from "../src/components/ui/badge";
import { Card, CardContent, CardFooter } from "../src/components/ui/card";
import {
  ArrowRight,
  BookOpen,
  Home,
  Globe,
  Star,
  CheckCircle,
  MapPin,
  Users,
  Plane,
  Sparkles,
  GraduationCap,
  Building2,
  Heart,
  TrendingUp,
  MessageCircle,
  ChevronRight,
  Compass,
  Shield,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";

interface Story {
  id: string;
  title?: string;
  studentName?: string;
  excerpt?: string | null;
  story?: string;
  imageUrl?: string | null;
  createdAt: string;
  city?: string;
  country?: string;
  university?: string;
  author?: {
    name: string;
  };
  likes?: number;
}

interface HomePageProps {
  totalUniversities: number;
  latestStories: Story[];
}

// Animated counter hook
function useCounter(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [isVisible, end, duration]);

  return { count, ref };
}

// Floating orbs component
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 rounded-full blur-3xl animate-float-slow" />
      <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-float-medium" />
      <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full blur-3xl animate-float-fast" />
    </div>
  );
}

// Animated gradient text
function GradientText({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent animate-gradient-x ${className}`}
    >
      {children}
    </span>
  );
}

// Glass card component
function GlassCard({
  children,
  className = "",
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`
      relative backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 
      border border-white/20 dark:border-gray-700/30 
      rounded-3xl shadow-xl shadow-gray-900/5
      ${hover ? "hover:shadow-2xl hover:shadow-violet-500/10 hover:border-violet-200/50 hover:-translate-y-1 transition-all duration-500" : ""}
      ${className}
    `}
    >
      {children}
    </div>
  );
}

// Animated stat card
function StatCard({
  icon: Icon,
  value,
  label,
  suffix = "",
  color,
}: {
  icon: any;
  value: number;
  label: string;
  suffix?: string;
  color: string;
}) {
  const { count, ref } = useCounter(value);

  return (
    <div ref={ref} className="text-center group">
      <div
        className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${color} mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
      >
        <Icon className="w-8 h-8 text-white" />
      </div>
      <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1 tabular-nums">
        {count.toLocaleString()}
        {suffix}
      </div>
      <div className="text-gray-500 dark:text-gray-400 font-medium">
        {label}
      </div>
    </div>
  );
}

export default function HomePage({
  totalUniversities,
  latestStories,
}: HomePageProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <>
      <Head>
        <title>Erasmus Journey - Share & Discover Student Experiences</title>
        <meta
          name="description"
          content="The easiest way to share your Erasmus experience and help future students. Find accommodation reviews, course matching, and city guides."
        />
        <style>{`
          @keyframes float-slow {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            25% { transform: translate(10px, -20px) rotate(5deg); }
            50% { transform: translate(-5px, -35px) rotate(-5deg); }
            75% { transform: translate(-15px, -15px) rotate(3deg); }
          }
          @keyframes float-medium {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            33% { transform: translate(-20px, 15px) rotate(-3deg); }
            66% { transform: translate(15px, -10px) rotate(5deg); }
          }
          @keyframes float-fast {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(20px, -25px); }
          }
          @keyframes gradient-x {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          @keyframes pulse-ring {
            0% { transform: scale(0.95); opacity: 1; }
            100% { transform: scale(1.3); opacity: 0; }
          }
          @keyframes slide-up {
            0% { transform: translateY(30px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
          .animate-float-slow { animation: float-slow 15s ease-in-out infinite; }
          .animate-float-medium { animation: float-medium 12s ease-in-out infinite; }
          .animate-float-fast { animation: float-fast 8s ease-in-out infinite; }
          .animate-gradient-x { 
            background-size: 200% 200%; 
            animation: gradient-x 3s ease infinite; 
          }
          .animate-shimmer { animation: shimmer 2s infinite; }
          .animate-pulse-ring { animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
          .animate-slide-up { animation: slide-up 0.8s ease-out forwards; }
          .animation-delay-200 { animation-delay: 200ms; }
          .animation-delay-400 { animation-delay: 400ms; }
          .animation-delay-600 { animation-delay: 600ms; }
        `}</style>
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 overflow-hidden">
        <Header />

        {/* ============================================ */}
        {/* HERO SECTION - Immersive & Cinematic */}
        {/* ============================================ */}
        <section className="relative min-h-screen flex items-center justify-center pt-20 pb-32 overflow-hidden">
          <FloatingOrbs />

          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none" />

          {/* Mouse follow gradient */}
          <div
            className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 blur-3xl pointer-events-none transition-all duration-1000 ease-out"
            style={{
              left: mousePosition.x - 192,
              top: mousePosition.y - 192,
            }}
          />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
            {/* Announcement Badge */}
            <div className="inline-flex items-center gap-2 mb-8 animate-slide-up">
              <Badge className="group bg-gradient-to-r from-violet-100 to-fuchsia-100 dark:from-violet-900/50 dark:to-fuchsia-900/50 text-violet-700 dark:text-violet-300 hover:from-violet-200 hover:to-fuchsia-200 px-4 py-2 text-sm font-medium rounded-full border border-violet-200/50 dark:border-violet-700/50 shadow-lg shadow-violet-500/10 cursor-pointer transition-all duration-300">
                <Sparkles className="w-4 h-4 mr-1 group-hover:animate-spin" />
                <span>Join 50,000+ Erasmus Students</span>
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Badge>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-extrabold tracking-tight mb-8 animate-slide-up animation-delay-200">
              <span className="block text-gray-900 dark:text-white">
                Your Erasmus
              </span>
              <span className="block mt-2">
                <GradientText>Adventure Starts Here</GradientText>
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed animate-slide-up animation-delay-400">
              Discover authentic student experiences, find the perfect
              accommodation, and connect with a global community of exchange
              students.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center animate-slide-up animation-delay-600">
              <Link href="/basic-information">
                <Button
                  size="lg"
                  className="relative group bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-pink-700 text-white text-lg px-10 py-7 h-auto rounded-full shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105 transition-all duration-300 font-semibold overflow-hidden"
                >
                  {/* Shimmer effect */}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                  <span className="relative flex items-center gap-2">
                    Start Your Journey
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </Link>

              <Link href="/destinations">
                <Button
                  variant="outline"
                  size="lg"
                  className="group bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-white dark:hover:bg-gray-800 hover:border-violet-300 dark:hover:border-violet-600 text-lg px-10 py-7 h-auto rounded-full font-medium transition-all duration-300"
                >
                  <Compass className="w-5 h-5 mr-2 group-hover:rotate-45 transition-transform duration-300" />
                  Explore Destinations
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm text-gray-500 dark:text-gray-400 animate-slide-up animation-delay-600">
              <div className="flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm px-4 py-2 rounded-full">
                <div className="relative">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <span className="absolute inset-0 bg-emerald-400 rounded-full animate-pulse-ring opacity-30" />
                </div>
                <span className="font-medium">500+ Partner Universities</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm px-4 py-2 rounded-full">
                <Shield className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Verified Student Reviews</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm px-4 py-2 rounded-full">
                <Heart className="h-5 w-5 text-rose-500" />
                <span className="font-medium">100% Free Platform</span>
              </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-400 animate-bounce">
              <span className="text-xs uppercase tracking-widest">
                Scroll to explore
              </span>
              <div className="w-6 h-10 border-2 border-gray-300 dark:border-gray-600 rounded-full flex justify-center pt-2">
                <div className="w-1.5 h-3 bg-gray-400 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* STATS SECTION - Impressive Numbers */}
        {/* ============================================ */}
        <section className="relative py-24 -mt-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <GlassCard className="p-12" hover={false}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <StatCard
                  icon={GraduationCap}
                  value={50000}
                  label="Students Helped"
                  suffix="+"
                  color="from-violet-500 to-purple-600"
                />
                <StatCard
                  icon={Building2}
                  value={totalUniversities || 500}
                  label="Universities"
                  suffix="+"
                  color="from-blue-500 to-cyan-600"
                />
                <StatCard
                  icon={Globe}
                  value={40}
                  label="Countries"
                  suffix="+"
                  color="from-emerald-500 to-teal-600"
                />
                <StatCard
                  icon={MessageCircle}
                  value={15000}
                  label="Reviews Shared"
                  suffix="+"
                  color="from-amber-500 to-orange-600"
                />
              </div>
            </GlassCard>
          </div>
        </section>

        {/* ============================================ */}
        {/* BENTO GRID FEATURES */}
        {/* ============================================ */}
        <section className="py-24 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 px-4 py-1.5 rounded-full">
                Features
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Everything You Need for
                <br />
                <GradientText>Your Exchange Journey</GradientText>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                From planning to sharing — we've got you covered every step of
                the way.
              </p>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Large Feature Card */}
              <Link href="/basic-information" className="lg:col-span-2 group">
                <GlassCard className="h-full p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <Plane className="w-8 h-8 text-white" />
                      </div>
                      <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-violet-500 group-hover:translate-x-2 transition-all duration-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      Share Your Experience
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
                      Help future students by sharing insights about your
                      courses, accommodation, living costs, and city life. Your
                      experience matters.
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-3">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 bg-gradient-to-br ${
                              i === 1
                                ? "from-pink-400 to-rose-500"
                                : i === 2
                                  ? "from-violet-400 to-purple-500"
                                  : i === 3
                                    ? "from-blue-400 to-cyan-500"
                                    : "from-amber-400 to-orange-500"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        <strong className="text-gray-900 dark:text-white">
                          2,500+
                        </strong>{" "}
                        students shared this month
                      </span>
                    </div>
                  </div>
                </GlassCard>
              </Link>

              {/* Housing Card */}
              <Link href="/student-accommodations" className="group">
                <GlassCard className="h-full p-8 relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative z-10 h-full flex flex-col">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
                      <Home className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Find Housing
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 flex-1">
                      Discover verified student accommodations with honest
                      reviews from previous tenants.
                    </p>
                    <div className="mt-6 flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
                      Browse listings{" "}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </GlassCard>
              </Link>

              {/* Course Matching Card */}
              <Link href="/university-exchanges" className="group">
                <GlassCard className="h-full p-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full blur-2xl -translate-y-1/2 -translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative z-10 h-full flex flex-col">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                      <BookOpen className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Match Courses
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 flex-1">
                      See which courses get approved for credit transfer at your
                      host university.
                    </p>
                    <div className="mt-6 flex items-center text-blue-600 dark:text-blue-400 font-medium">
                      Check courses{" "}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </GlassCard>
              </Link>

              {/* Destinations Card */}
              <Link href="/destinations" className="lg:col-span-2 group">
                <GlassCard className="h-full p-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5" />
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
                    <div className="flex-1">
                      <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform duration-300">
                        <Globe className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                        Explore Destinations
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-lg mb-6">
                        Discover cities across Europe with detailed guides,
                        student tips, and local insights.
                      </p>
                      <div className="flex items-center text-amber-600 dark:text-amber-400 font-medium">
                        View all destinations{" "}
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      {["🇪🇸", "🇩🇪", "🇫🇷", "🇮🇹", "🇳🇱"].map((flag, i) => (
                        <div
                          key={i}
                          className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300"
                          style={{ transitionDelay: `${i * 50}ms` }}
                        >
                          {flag}
                        </div>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              </Link>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* HOW IT WORKS - Minimalist Timeline */}
        {/* ============================================ */}
        <section className="py-24 bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white relative overflow-hidden">
          {/* Background elements */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl" />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <Badge className="mb-4 bg-white/10 text-white/90 border border-white/20 px-4 py-1.5 rounded-full">
                Simple Process
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                Start Sharing in
                <span className="block mt-2 bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  Three Easy Steps
                </span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connecting line */}
              <div className="hidden md:block absolute top-16 left-[16%] w-[68%] h-0.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 opacity-30" />

              {/* Step 1 */}
              <div className="relative text-center group">
                <div className="relative inline-block mb-8">
                  <div className="w-32 h-32 bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-violet-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <span className="text-5xl font-bold text-white">1</span>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3">Create Account</h3>
                <p className="text-gray-400 text-lg max-w-xs mx-auto">
                  Sign up for free in seconds and join our global community of
                  students.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative text-center group">
                <div className="relative inline-block mb-8">
                  <div className="w-32 h-32 bg-gradient-to-br from-fuchsia-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-fuchsia-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <span className="text-5xl font-bold text-white">2</span>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3">Share Details</h3>
                <p className="text-gray-400 text-lg max-w-xs mx-auto">
                  Complete our guided form about your university, housing, and
                  costs.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative text-center group">
                <div className="relative inline-block mb-8">
                  <div className="w-32 h-32 bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-pink-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <span className="text-5xl font-bold text-white">3</span>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3">Help Others</h3>
                <p className="text-gray-400 text-lg max-w-xs mx-auto">
                  Your experience helps thousands of future students make better
                  decisions.
                </p>
              </div>
            </div>

            <div className="text-center mt-16">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-white text-gray-900 hover:bg-gray-100 rounded-full px-10 py-7 h-auto text-lg font-semibold shadow-2xl shadow-white/20 hover:scale-105 transition-all duration-300"
                >
                  Create Free Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* STUDENT STORIES - Modern Cards */}
        {/* ============================================ */}
        {latestStories && latestStories.length > 0 && (
          <section className="py-24 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                <div>
                  <Badge className="mb-4 bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 px-4 py-1.5 rounded-full">
                    Student Stories
                  </Badge>
                  <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                    Real Experiences,
                    <br />
                    <GradientText>Real Students</GradientText>
                  </h2>
                </div>
                <Link
                  href="/student-stories"
                  className="group inline-flex items-center text-violet-600 dark:text-violet-400 font-semibold hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
                >
                  View all stories
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {latestStories.map((story, index) => (
                  <Link
                    key={story.id}
                    href={`/stories/${story.id}`}
                    className="group"
                  >
                    <GlassCard className="h-full overflow-hidden">
                      <div className="aspect-[4/3] relative overflow-hidden">
                        <Image
                          src={
                            story.imageUrl ||
                            `https://images.unsplash.com/photo-${["1523050854058-8df90110c9f1", "1498243691581-b145c3f54a5a", "1541339907198-e08756dedf3f"][index]}?w=600&h=450&fit=crop`
                          }
                          alt={story.title || "Student story"}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex items-center gap-2 text-white/90 text-sm font-medium">
                            <MapPin className="w-4 h-4" />
                            {story.city}, {story.country}
                          </div>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-3 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-2">
                          {story.title || `${story.studentName}'s Experience`}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
                          {story.excerpt ||
                            story.story ||
                            "Read about this amazing experience..."}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-white font-bold">
                              {story.studentName?.[0] || "S"}
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {story.studentName}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-amber-500">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="font-medium">
                              {story.likes || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ============================================ */}
        {/* FINAL CTA - Immersive */}
        {/* ============================================ */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600" />
          {/* Subtle pattern overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 25px 25px, white 2px, transparent 0)",
              backgroundSize: "50px 50px",
            }}
          />

          <FloatingOrbs />

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full text-white/90 font-medium mb-8">
              <Users className="w-5 h-5" />
              Join 50,000+ students worldwide
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8">
              Ready to Start Your
              <br />
              <span className="text-white/90">Erasmus Adventure?</span>
            </h2>

            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-12">
              Whether you're planning your trip or just returned, your
              experience can help thousands of students make the most of their
              exchange.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Link href="/basic-information">
                <Button
                  size="lg"
                  className="bg-white text-violet-700 hover:bg-gray-100 hover:text-violet-800 text-lg px-10 py-7 h-auto rounded-full font-semibold shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  Start Sharing Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/destinations">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-transparent border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 text-lg px-10 py-7 h-auto rounded-full font-medium transition-all duration-300"
                >
                  Browse Experiences
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<
  HomePageProps
> = async () => {
  try {
    if (!prisma) {
      return { props: { totalUniversities: 0, latestStories: [] } };
    }

    const totalUniversities = await prisma.universities.count();

    // Fetch stories from ErasmusExperience (new unified model)
    const storySubmissions = await prisma.erasmusExperience.findMany({
      where: {
        status: { in: ["submitted", "approved", "published"] },
        experience: { not: null },
      },
      orderBy: { updatedAt: "desc" },
      take: 3,
      include: {
        users: {
          select: { firstName: true },
        },
      },
    });

    const latestStories = storySubmissions.map((submission) => {
      const experienceData = submission.experience as any;
      const basicInfo = submission.basicInfo as any;

      return {
        id: submission.id,
        studentName:
          experienceData?.nickname || submission.users?.firstName || "Student",
        university: basicInfo?.hostUniversity || "University",
        city: basicInfo?.hostCity || submission.hostCity || "City",
        country: basicInfo?.hostCountry || submission.hostCountry || "Country",
        story:
          experienceData?.personalExperience ||
          experienceData?.adviceForFutureStudents ||
          "",
        createdAt: submission.createdAt.toISOString(),
        likes: 0,
      };
    });

    return {
      props: {
        totalUniversities,
        latestStories,
      },
    };
  } catch (error) {
    console.error("Error fetching home page data:", error);
    return {
      props: {
        totalUniversities: 0,
        latestStories: [],
      },
    };
  }
};
