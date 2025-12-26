import Link from "next/link";
import {
  Heart,
  Mail,
  MessageCircle,
  FileText,
  Globe,
  ExternalLink,
  Users,
  MapPin,
  GraduationCap,
  ArrowRight,
  Sparkles,
  Twitter,
  Instagram,
  Linkedin,
  Github,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Destinations", href: "/destinations", icon: MapPin },
    { name: "Universities", href: "/university-exchanges", icon: Globe },
    { name: "Student Stories", href: "/student-stories", icon: Users },
    { name: "Housing Reviews", href: "/student-accommodations", icon: Heart },
    { name: "FAQ", href: "/faq", icon: MessageCircle },
  ];

  const applicationLinks = [
    { name: "Basic Information", href: "/basic-information" },
    { name: "Course Matching", href: "/course-matching" },
    { name: "Accommodation", href: "/accommodation" },
    { name: "Living Expenses", href: "/living-expenses" },
  ];

  const supportLinks = [
    {
      name: "Email Support",
      href: "mailto:support@erasmusjourney.com",
      icon: Mail,
    },
    { name: "Student Stories", href: "/student-stories", icon: MessageCircle },
    { name: "FAQ", href: "/faq", icon: FileText },
  ];

  const legalLinks = [
    { name: "Terms of Service", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Cookie Policy", href: "/cookies" },
  ];

  const socialLinks = [
    { name: "Twitter", href: "https://x.com/erasmusjourney", icon: Twitter },
    {
      name: "Instagram",
      href: "https://instagram.com/erasmusjourney",
      icon: Instagram,
    },
    {
      name: "LinkedIn",
      href: "https://linkedin.com/company/erasmusjourney",
      icon: Linkedin,
    },
    { name: "GitHub", href: "https://github.com/erasmusjourney", icon: Github },
  ];

  return (
    <footer className="relative bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Section */}
        <div className="py-16 border-b border-white/10">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white/80 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Join Our Community
            </div>
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Stay Updated on Your
              <span className="block bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                Erasmus Journey
              </span>
            </h3>
            <p className="text-gray-400 mb-8 text-lg">
              Get tips, guides, and exclusive insights for your exchange
              experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-5 py-3.5 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              />
              <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-full px-8 py-3.5 font-semibold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all">
                Subscribe
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 group mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
                <div className="relative w-12 h-12 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  Erasmus
                </span>
                <span className="text-2xl font-bold text-white">Journey</span>
              </div>
            </Link>
            <p className="text-gray-400 leading-relaxed mb-6 max-w-sm">
              Empowering students to make the most of their Erasmus experience
              through comprehensive guidance, community support, and seamless
              application processes.
            </p>

            {/* Status indicator */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-emerald-400 text-sm font-medium">
                  Platform Online
                </span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-500/50 rounded-xl flex items-center justify-center text-gray-400 hover:text-violet-400 transition-all duration-300"
                >
                  <social.icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-6 uppercase tracking-wider">
              Explore
            </h3>
            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-3 text-gray-400 hover:text-violet-400 transition-colors group"
                  >
                    <link.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Application Steps */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-6 uppercase tracking-wider">
              Application
            </h3>
            <ul className="space-y-4">
              {applicationLinks.map((link, index) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-3 text-gray-400 hover:text-violet-400 transition-colors group"
                  >
                    <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 group-hover:border-violet-500/50 group-hover:bg-violet-500/10 flex items-center justify-center transition-all">
                      <span className="text-xs font-semibold">{index + 1}</span>
                    </div>
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-6 uppercase tracking-wider">
              Support
            </h3>
            <ul className="space-y-4">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-3 text-gray-400 hover:text-violet-400 transition-colors group"
                  >
                    <link.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Official Resources */}
            <div className="mt-8">
              <h4 className="text-xs font-medium text-gray-500 mb-4 uppercase tracking-wider">
                Official Resources
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="https://erasmus-plus.ec.europa.eu/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-violet-400 transition-colors"
                  >
                    Erasmus+ Programme
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://ec.europa.eu/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-violet-400 transition-colors"
                  >
                    European Commission
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="py-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <div className="text-sm text-gray-500">
              © {currentYear} Erasmus Journey. All rights reserved.
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap items-center gap-6">
              {legalLinks.map((link, index) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm text-gray-500 hover:text-violet-400 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* EU Programme Badge */}
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
              <div className="w-6 h-4 bg-blue-600 rounded flex items-center justify-center">
                <div className="flex gap-px">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-0.5 h-2 bg-yellow-400 rounded-full"
                    />
                  ))}
                </div>
              </div>
              <span className="text-xs font-medium text-gray-400">
                EU Programme
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
