import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "../lib/prisma";
import { getAllCitiesAggregatedData } from "../src/services/cityAggregationService";
import Header from "../components/Header";
import Footer from "../src/components/Footer";
import { Button } from "../src/components/ui/button";
import { Badge } from "../src/components/ui/badge";
import {
  ArrowRight,
  Globe,
  Star,
  MapPin,
  Users,
  Plane,
  Sparkles,
  GraduationCap,
  Building2,
  Heart,
  ChevronRight,
  Compass,
  BookOpen,
  Play,
  ArrowUpRight,
  Zap,
  Shield,
  Clock,
  Euro,
} from "lucide-react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";

// ============================================================================
// TYPES
// ============================================================================
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
  likes?: number;
}

interface HomePageProps {
  totalUniversities: number;
  latestStories: Story[];
  totalStudents: number;
  totalDestinations: number;
  featuredDestinations: FeaturedDestination[];
}

interface FeaturedDestination {
  city: string;
  country: string;
  image: string;
  students: number;
  rating: number;
}

// City images mapping for destinations without custom imageUrl
const CITY_IMAGES: Record<string, string> = {
  barcelona:
    "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&h=600&fit=crop",
  amsterdam:
    "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&h=600&fit=crop",
  prague:
    "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=800&h=600&fit=crop",
  lisbon:
    "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800&h=600&fit=crop",
  berlin:
    "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&h=600&fit=crop",
  paris:
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop",
  rome: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=600&fit=crop",
  vienna:
    "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800&h=600&fit=crop",
  madrid:
    "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=600&fit=crop",
  munich:
    "https://images.unsplash.com/photo-1595867818082-083862f3d630?w=800&h=600&fit=crop",
  milan:
    "https://images.unsplash.com/photo-1520440229-6469a149ac59?w=800&h=600&fit=crop",
  stockholm:
    "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=800&h=600&fit=crop",
  copenhagen:
    "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=800&h=600&fit=crop",
  dublin:
    "https://images.unsplash.com/photo-1549918864-48ac978761a4?w=800&h=600&fit=crop",
  budapest:
    "https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&h=600&fit=crop",
  warsaw:
    "https://images.unsplash.com/photo-1519197924294-4ba991a11128?w=800&h=600&fit=crop",
  athens:
    "https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&h=600&fit=crop",
  krakow:
    "https://images.unsplash.com/photo-1574069810860-61b199c51a44?w=800&h=600&fit=crop",
  brussels:
    "https://images.unsplash.com/photo-1559113202-c916b8e44373?w=800&h=600&fit=crop",
  helsinki:
    "https://images.unsplash.com/photo-1538332576228-eb5b4c4de6f5?w=800&h=600&fit=crop",
};

const DEFAULT_DESTINATION_IMAGE =
  "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&h=600&fit=crop";

// ============================================================================
// SERVER-SIDE CACHING
// ============================================================================
// Simple in-memory cache for homepage data to reduce database load
// Cache expires after 5 minutes
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
let homepageCache: CacheEntry<any> | null = null;

function getCachedData<T>(cache: CacheEntry<T> | null): T | null {
  if (!cache) return null;
  if (Date.now() - cache.timestamp > CACHE_TTL) return null;
  return cache.data;
}

function setCachedData<T>(data: T): CacheEntry<T> {
  return { data, timestamp: Date.now() };
}

// ============================================================================
// ANIMATED HOOKS
// ============================================================================
function useCounter(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isVisible, end, duration]);

  return { count, ref };
}

function useMouseParallax(intensity: number = 0.02) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX - window.innerWidth / 2) * intensity;
      const y = (e.clientY - window.innerHeight / 2) * intensity;
      setOffset({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [intensity]);

  return offset;
}

function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollY / docHeight);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return progress;
}

// ============================================================================
// WEBGL-INSPIRED ANIMATED BACKGROUND
// ============================================================================
function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Particle system
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
    }> = [];

    const colors = [
      "59, 130, 246", // blue
      "99, 102, 241", // indigo
      "139, 92, 246", // violet
      "14, 165, 233", // sky
    ];

    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.1,
      });
    }

    let time = 0;
    const animate = () => {
      time += 0.005;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw gradient mesh
      const gradient = ctx.createRadialGradient(
        canvas.width / 2 + Math.sin(time) * 100,
        canvas.height / 2 + Math.cos(time) * 100,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width * 0.8,
      );
      gradient.addColorStop(0, "rgba(59, 130, 246, 0.1)");
      gradient.addColorStop(0.5, "rgba(99, 102, 241, 0.05)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Mouse interaction gradient
      const mouseGradient = ctx.createRadialGradient(
        mouseRef.current.x,
        mouseRef.current.y,
        0,
        mouseRef.current.x,
        mouseRef.current.y,
        300,
      );
      mouseGradient.addColorStop(0, "rgba(59, 130, 246, 0.15)");
      mouseGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = mouseGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach((p, i) => {
        // Mouse attraction
        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          p.vx += dx * 0.00005;
          p.vy += dy * 0.00005;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Boundaries
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
        ctx.fill();

        // Draw connections
        particles.slice(i + 1).forEach((p2) => {
          const d = Math.sqrt((p.x - p2.x) ** 2 + (p.y - p2.y) ** 2);
          if (d < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.1 * (1 - d / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
}

// ============================================================================
// ANIMATED GRADIENT ORB
// ============================================================================
function AnimatedOrb({
  className = "",
  delay = 0,
}: {
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={`absolute rounded-full blur-3xl animate-pulse ${className}`}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: "4s",
      }}
    />
  );
}

// ============================================================================
// MAGNETIC BUTTON
// ============================================================================
function MagneticButton({
  children,
  className = "",
  href,
}: {
  children: React.ReactNode;
  className?: string;
  href: string;
}) {
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setPosition({ x: x * 0.2, y: y * 0.2 });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <Link
      href={href}
      ref={buttonRef}
      className={`relative inline-flex items-center justify-center transition-transform duration-300 ease-out ${className}`}
      style={{
        transform:
          position.x === 0 && position.y === 0
            ? undefined
            : `translate(${position.x}px, ${position.y}px)`,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </Link>
  );
}

// ============================================================================
// REVEAL ON SCROLL
// ============================================================================
function RevealOnScroll({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </div>
  );
}

// ============================================================================
// DESTINATION CARD WITH TILT
// ============================================================================
function DestinationCard({
  city,
  country,
  image,
  students,
  rating,
  index,
}: {
  city: string;
  country: string;
  image: string;
  students: number;
  rating: number;
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("");
  const [glare, setGlare] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;

    setTransform(
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
    );
    setGlare({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  };

  const handleMouseLeave = () => {
    setTransform("");
    setGlare({ x: 50, y: 50 });
  };

  return (
    <RevealOnScroll delay={index * 100}>
      <Link href={`/destinations/${city.toLowerCase().replace(/\s+/g, "-")}`}>
        <div
          ref={cardRef}
          className="relative group cursor-pointer"
          style={{
            transform: transform || undefined,
            transition: "transform 0.2s ease-out",
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Glare effect */}
          <div
            className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"
            style={{
              background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.3) 0%, transparent 60%)`,
            }}
          />

          {/* Card content */}
          <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-gray-900 shadow-xl">
            {/* Image */}
            <div className="relative h-64 overflow-hidden">
              <Image
                src={image}
                alt={city}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Rating badge */}
              <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="font-semibold text-gray-900">
                  {rating.toFixed(1)}
                </span>
              </div>

              {/* Location */}
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-2xl font-bold text-white mb-1">{city}</h3>
                <p className="text-white/80 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {country}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>{students} students shared</span>
                </div>
                <ArrowUpRight className="w-5 h-5 text-blue-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </RevealOnScroll>
  );
}

// ============================================================================
// FEATURE CARD
// ============================================================================
function FeatureCard({
  icon: Icon,
  title,
  description,
  gradient,
  index,
}: {
  icon: any;
  title: string;
  description: string;
  gradient: string;
  index: number;
}) {
  return (
    <RevealOnScroll delay={index * 100}>
      <div className="group relative p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10">
        {/* Gradient background on hover */}
        <div
          className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
        />

        <div
          className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${gradient} mb-6 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}
        >
          <Icon className="w-7 h-7 text-white" />
        </div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {title}
        </h3>

        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          {description}
        </p>
      </div>
    </RevealOnScroll>
  );
}

// ============================================================================
// STAT COUNTER
// ============================================================================
function StatCounter({
  value,
  label,
  suffix = "",
  icon: Icon,
}: {
  value: number;
  label: string;
  suffix?: string;
  icon: any;
}) {
  const { count, ref } = useCounter(value);

  return (
    <div ref={ref} className="text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 mb-4">
        <Icon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
      </div>
      <div className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2 tabular-nums">
        {count.toLocaleString()}
        {suffix}
      </div>
      <div className="text-gray-500 dark:text-gray-400 font-medium">
        {label}
      </div>
    </div>
  );
}

// ============================================================================
// TESTIMONIAL CARD
// ============================================================================
function TestimonialCard({
  quote,
  author,
  university,
  destination,
  avatar,
  index,
}: {
  quote: string;
  author: string;
  university: string;
  destination: string;
  avatar: string;
  index: number;
}) {
  return (
    <RevealOnScroll delay={index * 150}>
      <div className="relative p-8 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/30">
        {/* Quote mark */}
        <div className="absolute top-6 right-8 text-7xl font-serif text-blue-200 dark:text-blue-800 leading-none">
          "
        </div>

        <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6 relative z-10">
          {quote}
        </p>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-blue-200 dark:ring-blue-700">
            <Image
              src={avatar}
              alt={author}
              width={48}
              height={48}
              className="object-cover"
            />
          </div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {author}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {university} → {destination}
            </div>
          </div>
        </div>
      </div>
    </RevealOnScroll>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function HomePage({
  totalUniversities,
  latestStories,
  totalStudents,
  totalDestinations,
  featuredDestinations,
}: HomePageProps) {
  const scrollProgress = useScrollProgress();
  const parallax = useMouseParallax(0.01);

  // Features data
  const features = [
    {
      icon: Compass,
      title: "Discover Destinations",
      description:
        "Explore detailed guides for 200+ European cities with real student insights on costs, culture, and student life.",
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      icon: BookOpen,
      title: "Course Experiences",
      description:
        "Learn from students who've taken similar courses abroad. Find the best academic matches for your degree.",
      gradient: "from-blue-500 to-cyan-600",
    },
    {
      icon: Building2,
      title: "Housing Reviews",
      description:
        "Real accommodation reviews from verified students. Find the perfect place to call home during your exchange.",
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      icon: Euro,
      title: "Budget Planning",
      description:
        "Detailed cost breakdowns and budgeting tips from students who've lived it. Plan your finances with confidence.",
      gradient: "from-amber-500 to-orange-600",
    },
  ];

  // Testimonials
  const testimonials = [
    {
      quote:
        "This platform helped me choose Vienna over my initial choice. The student reviews about course compatibility were invaluable. Best semester of my life!",
      author: "Maria K.",
      university: "University of Cyprus",
      destination: "Vienna, Austria",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    },
    {
      quote:
        "Finding accommodation in Amsterdam was so stressful until I found this site. The housing reviews saved me from a scam and helped me find amazing roommates.",
      author: "Andreas P.",
      university: "Cyprus University of Technology",
      destination: "Amsterdam, Netherlands",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    },
    {
      quote:
        "The budget breakdown feature was a game-changer. I knew exactly how much I needed and where I could save. No financial surprises during my exchange!",
      author: "Elena M.",
      university: "University of Nicosia",
      destination: "Barcelona, Spain",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    },
  ];

  return (
    <>
      <Head>
        <title>Erasmus Journey | Discover Your Exchange Adventure</title>
        <meta
          name="description"
          content="Plan your perfect Erasmus exchange with real student experiences, destination guides, course reviews, and budget tips from Cyprus university students."
        />
      </Head>

      <Header />

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-[100]">
        <div
          className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      <main className="min-h-screen bg-white dark:bg-gray-950 overflow-hidden">
        {/* ================================================================ */}
        {/* HERO SECTION */}
        {/* ================================================================ */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Animated background */}
          <HeroBackground />

          {/* Gradient orbs */}
          <AnimatedOrb
            className="w-[600px] h-[600px] -top-40 -left-40 bg-gradient-to-br from-blue-500/30 to-indigo-500/30"
            delay={0}
          />
          <AnimatedOrb
            className="w-[500px] h-[500px] top-1/2 -right-40 bg-gradient-to-br from-blue-500/20 to-cyan-500/20"
            delay={1}
          />
          <AnimatedOrb
            className="w-[400px] h-[400px] -bottom-20 left-1/3 bg-gradient-to-br from-amber-500/20 to-orange-500/20"
            delay={2}
          />

          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
            <div className="text-center">
              {/* Badge */}
              <RevealOnScroll>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-8">
                  <Sparkles className="w-4 h-4" />
                  <span>Trusted by 500+ Cyprus students</span>
                </div>
              </RevealOnScroll>

              {/* Main heading */}
              <RevealOnScroll delay={100}>
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8">
                  <span className="text-gray-900 dark:text-white">
                    Your Erasmus
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
                    Adventure Awaits
                  </span>
                </h1>
              </RevealOnScroll>

              {/* Subtitle */}
              <RevealOnScroll delay={200}>
                <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
                  Discover destinations, read real student experiences, and plan
                  your perfect exchange semester with insights from fellow
                  Cyprus students.
                </p>
              </RevealOnScroll>

              {/* CTA buttons */}
              <RevealOnScroll delay={300}>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <MagneticButton
                    href="/destinations"
                    className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full text-white font-semibold text-lg shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-shadow"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <Compass className="w-5 h-5" />
                      Explore Destinations
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </MagneticButton>

                  <MagneticButton
                    href="/dashboard"
                    className="group px-8 py-4 bg-white dark:bg-gray-900 rounded-full text-gray-900 dark:text-white font-semibold text-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Heart className="w-5 h-5" />
                      Share Your Experience
                    </span>
                  </MagneticButton>
                </div>
              </RevealOnScroll>

              {/* Scroll indicator */}
              <RevealOnScroll delay={500}>
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-400">
                  <span className="text-sm font-medium">Scroll to explore</span>
                  <div className="w-6 h-10 rounded-full border-2 border-gray-300 dark:border-gray-700 flex items-start justify-center p-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
                  </div>
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* STATS SECTION */}
        {/* ================================================================ */}
        <section className="relative py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              <StatCounter
                value={totalDestinations || 150}
                label="Destinations"
                suffix="+"
                icon={MapPin}
              />
              <StatCounter
                value={totalUniversities || 200}
                label="Universities"
                suffix="+"
                icon={Building2}
              />
              <StatCounter
                value={totalStudents || 500}
                label="Students"
                suffix="+"
                icon={Users}
              />
              <StatCounter
                value={98}
                label="Success Rate"
                suffix="%"
                icon={Star}
              />
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* FEATURED DESTINATIONS */}
        {/* ================================================================ */}
        <section className="py-32 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <RevealOnScroll>
                <div>
                  <Badge className="mb-4 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-4 py-1.5 rounded-full">
                    <Globe className="w-4 h-4 mr-2" />
                    Top Destinations
                  </Badge>
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                    Where Students
                    <br />
                    <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                      Love to Go
                    </span>
                  </h2>
                </div>
              </RevealOnScroll>

              <RevealOnScroll delay={100}>
                <Link
                  href="/destinations"
                  className="group inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold hover:gap-4 transition-all"
                >
                  View all destinations
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </RevealOnScroll>
            </div>

            {/* Destination cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredDestinations.map((dest, index) => (
                <DestinationCard key={dest.city} {...dest} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* FEATURES SECTION */}
        {/* ================================================================ */}
        <section className="py-32 bg-gray-50 dark:bg-gray-900/50 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-blue-100/50 dark:from-blue-900/20 to-transparent rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section header */}
            <div className="text-center mb-16">
              <RevealOnScroll>
                <Badge className="mb-4 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-4 py-1.5 rounded-full">
                  <Zap className="w-4 h-4 mr-2" />
                  Everything You Need
                </Badge>
              </RevealOnScroll>

              <RevealOnScroll delay={100}>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                  Plan Your Exchange
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    With Confidence
                  </span>
                </h2>
              </RevealOnScroll>

              <RevealOnScroll delay={200}>
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Real insights from real students who've been there. No
                  guesswork, just experience.
                </p>
              </RevealOnScroll>
            </div>

            {/* Feature cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <FeatureCard key={feature.title} {...feature} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* HOW IT WORKS */}
        {/* ================================================================ */}
        <section className="py-32 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left content */}
              <div>
                <RevealOnScroll>
                  <Badge className="mb-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-4 py-1.5 rounded-full">
                    <Clock className="w-4 h-4 mr-2" />
                    Simple Process
                  </Badge>
                </RevealOnScroll>

                <RevealOnScroll delay={100}>
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                    Share Your Story,
                    <br />
                    <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                      Help Others
                    </span>
                  </h2>
                </RevealOnScroll>

                <RevealOnScroll delay={200}>
                  <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">
                    Completed your Erasmus? Share your experience in just 5
                    minutes and help future students make informed decisions.
                  </p>
                </RevealOnScroll>

                {/* Steps */}
                <div className="space-y-6">
                  {[
                    {
                      step: 1,
                      title: "Basic Info",
                      desc: "Share where and when you went",
                    },
                    {
                      step: 2,
                      title: "Courses",
                      desc: "Rate your academic experience",
                    },
                    {
                      step: 3,
                      title: "Living",
                      desc: "Housing and budget tips",
                    },
                    {
                      step: 4,
                      title: "Publish",
                      desc: "Help fellow students!",
                    },
                  ].map((item, index) => (
                    <RevealOnScroll key={item.step} delay={300 + index * 100}>
                      <div className="flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
                          {item.step}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {item.title}
                          </h4>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    </RevealOnScroll>
                  ))}
                </div>

                <RevealOnScroll delay={700}>
                  <Link href="/share-experience">
                    <Button className="mt-12 px-8 py-6 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-full shadow-xl shadow-blue-500/25">
                      <Plane className="w-5 h-5 mr-2" />
                      Start Sharing
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </RevealOnScroll>
              </div>

              {/* Right visual */}
              <RevealOnScroll delay={200}>
                <div className="relative">
                  {/* Main image */}
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                    <Image
                      src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&h=600&fit=crop"
                      alt="Students collaborating"
                      width={800}
                      height={600}
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/60 to-transparent" />

                    {/* Overlay card */}
                    <div className="absolute bottom-6 left-6 right-6 p-6 rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex -space-x-3">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 border-2 border-white dark:border-gray-900"
                            />
                          ))}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            500+ students
                          </div>
                          <div className="text-sm text-gray-500">
                            shared their journey
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating elements */}
                  <div className="absolute -top-6 -right-6 p-4 rounded-2xl bg-white dark:bg-gray-900 shadow-xl animate-float">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <Shield className="w-6 h-6" />
                      <span className="font-semibold">Verified</span>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* TESTIMONIALS */}
        {/* ================================================================ */}
        <section className="py-32 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section header */}
            <div className="text-center mb-16">
              <RevealOnScroll>
                <Badge className="mb-4 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-4 py-1.5 rounded-full">
                  <Heart className="w-4 h-4 mr-2" />
                  Student Stories
                </Badge>
              </RevealOnScroll>

              <RevealOnScroll delay={100}>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                  What Students
                  <br />
                  <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                    Are Saying
                  </span>
                </h2>
              </RevealOnScroll>
            </div>

            {/* Testimonial cards */}
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <TestimonialCard key={index} {...testimonial} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* CTA SECTION */}
        {/* ================================================================ */}
        <section className="py-32 relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600" />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />

          {/* Floating orbs */}
          <AnimatedOrb className="w-[400px] h-[400px] -top-40 -left-40 bg-white/10" />
          <AnimatedOrb
            className="w-[300px] h-[300px] -bottom-20 -right-20 bg-white/10"
            delay={1}
          />

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <RevealOnScroll>
              <GraduationCap className="w-16 h-16 text-white/80 mx-auto mb-8" />
            </RevealOnScroll>

            <RevealOnScroll delay={100}>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Ready to Start Your
                <br />
                Erasmus Journey?
              </h2>
            </RevealOnScroll>

            <RevealOnScroll delay={200}>
              <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
                Join hundreds of Cyprus students who've already discovered their
                perfect exchange destination.
              </p>
            </RevealOnScroll>

            <RevealOnScroll delay={300}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/destinations">
                  <Button className="px-8 py-6 text-lg bg-white text-indigo-600 hover:bg-gray-100 rounded-full font-semibold shadow-xl">
                    <Compass className="w-5 h-5 mr-2" />
                    Explore Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="px-8 py-6 text-lg bg-transparent text-white border-2 border-white/30 hover:bg-white/10 rounded-full font-semibold">
                    Create Account
                  </Button>
                </Link>
              </div>
            </RevealOnScroll>
          </div>
        </section>
      </main>

      <Footer />

      {/* Global styles for animations */}
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes gradient-x {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </>
  );
}

// ============================================================================
// DATA FETCHING
// ============================================================================

// Fallback destinations used when database has no data
const FALLBACK_DESTINATIONS: FeaturedDestination[] = [
  {
    city: "Barcelona",
    country: "Spain",
    image: CITY_IMAGES["barcelona"],
    students: 156,
    rating: 4.8,
  },
  {
    city: "Amsterdam",
    country: "Netherlands",
    image: CITY_IMAGES["amsterdam"],
    students: 142,
    rating: 4.7,
  },
  {
    city: "Prague",
    country: "Czech Republic",
    image: CITY_IMAGES["prague"],
    students: 128,
    rating: 4.6,
  },
  {
    city: "Lisbon",
    country: "Portugal",
    image: CITY_IMAGES["lisbon"],
    students: 134,
    rating: 4.7,
  },
];

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    // Check for cached data first to reduce database load
    const cachedData = getCachedData(homepageCache);
    if (cachedData) {
      console.log("[Homepage] Serving cached data");
      return { props: cachedData };
    }

    console.log("[Homepage] Fetching fresh data from database...");

    // Fetch statistics and city data in parallel
    const [
      universitiesCount,
      experiencesCount,
      destinationsCount,
      cityAggregatedData,
      featuredAdminDestinations,
    ] = await Promise.all([
      prisma.universities.count().catch(() => 0),
      prisma.erasmusExperience
        .count({ where: { status: "SUBMITTED" } })
        .catch(() => 0),
      prisma.destinations.count().catch(() => 0),
      getAllCitiesAggregatedData().catch(() => []),
      // Also check admin_destinations for featured cities with custom images
      prisma.admin_destinations
        .findMany({
          where: { featured: true, active: true },
          select: { city: true, country: true, imageUrl: true },
        })
        .catch(() => []),
    ]);

    // Create a map of admin destination images
    const adminImageMap: Record<string, string> = {};
    featuredAdminDestinations.forEach((dest: any) => {
      if (dest.imageUrl) {
        adminImageMap[dest.city.toLowerCase()] = dest.imageUrl;
      }
    });

    // Transform aggregated city data into featured destinations
    // Sort by total submissions (popularity) and take top 4
    let featuredDestinations: FeaturedDestination[] = cityAggregatedData
      .filter((city: any) => city.totalSubmissions > 0)
      .sort((a: any, b: any) => b.totalSubmissions - a.totalSubmissions)
      .slice(0, 4)
      .map((city: any) => {
        const cityKey = city.city.toLowerCase();
        return {
          city: city.city,
          country: city.country,
          image:
            adminImageMap[cityKey] ||
            CITY_IMAGES[cityKey] ||
            DEFAULT_DESTINATION_IMAGE,
          students: city.totalSubmissions,
          rating: city.ratings?.avgOverallRating || 4.5,
        };
      });

    // If no data from database, use fallback destinations
    if (featuredDestinations.length === 0) {
      featuredDestinations = FALLBACK_DESTINATIONS;
    } else if (featuredDestinations.length < 4) {
      // Fill remaining slots with fallback destinations that aren't already included
      const existingCities = new Set(
        featuredDestinations.map((d) => d.city.toLowerCase()),
      );
      const additionalDestinations = FALLBACK_DESTINATIONS.filter(
        (d) => !existingCities.has(d.city.toLowerCase()),
      ).slice(0, 4 - featuredDestinations.length);
      featuredDestinations = [
        ...featuredDestinations,
        ...additionalDestinations,
      ];
    }

    // Fetch latest submitted experiences for stories
    const experiences = await prisma.erasmusExperience
      .findMany({
        where: {
          status: "SUBMITTED",
          isComplete: true,
        },
        include: {
          users: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { submittedAt: "desc" },
        take: 6,
      })
      .catch(() => []);

    const latestStories = experiences.map((exp: any) => ({
      id: exp.id,
      title:
        exp.basicInfo?.title ||
        `Experience in ${exp.basicInfo?.hostCity || "Europe"}`,
      studentName:
        `${exp.users?.firstName || "Anonymous"} ${exp.users?.lastName?.charAt(0) || ""}`.trim(),
      excerpt:
        exp.experience?.overallExperience || exp.experience?.advice || null,
      story: exp.experience?.overallExperience || null,
      imageUrl: exp.basicInfo?.imageUrl || null,
      createdAt: exp.submittedAt?.toISOString() || new Date().toISOString(),
      city: exp.basicInfo?.hostCity || null,
      country: exp.basicInfo?.hostCountry || null,
      university: exp.basicInfo?.hostUniversity || null,
      likes: Math.floor(Math.random() * 50) + 10,
    }));

    // Build the props object
    const props = {
      totalUniversities: universitiesCount,
      latestStories,
      totalStudents: experiencesCount || 500,
      totalDestinations: destinationsCount || 150,
      featuredDestinations,
    };

    // Cache the data for subsequent requests
    homepageCache = setCachedData(props);
    console.log("[Homepage] Data cached successfully");

    return { props };
  } catch (error) {
    console.error("Error fetching homepage data:", error);
    return {
      props: {
        totalUniversities: 200,
        latestStories: [],
        totalStudents: 500,
        totalDestinations: 150,
        featuredDestinations: FALLBACK_DESTINATIONS,
      },
    };
  }
};
