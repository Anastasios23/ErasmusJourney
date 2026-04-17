import Link from "next/link";
import { Icon } from "@iconify/react";
import React from "react";
import {
  PUBLIC_DESTINATIONS_ACCOMMODATION_FOCUS_ROUTE,
  PUBLIC_DESTINATIONS_ROUTE,
} from "@/lib/publicRoutes";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    {
      name: "Destinations",
      href: PUBLIC_DESTINATIONS_ROUTE,
      icon: "solar:map-point-bold-duotone",
    },
    {
      name: "Housing Insights",
      href: PUBLIC_DESTINATIONS_ACCOMMODATION_FOCUS_ROUTE,
      icon: "solar:home-bold-duotone",
    },
    {
      name: "Course Examples",
      href: "/course-matching-experiences",
      icon: "solar:notebook-bold-duotone",
    },
    {
      name: "Share Experience",
      href: "/share-experience",
      icon: "solar:pen-new-square-bold-duotone",
    },
  ];

  const applicationLinks = [
    { name: "Share Your Experience", href: "/share-experience" },
    { name: "My Dashboard", href: "/dashboard" },
  ];

  const supportLinks = [
    {
      name: "Email Support",
      href: "mailto:anastasiosandreou1@gmail.com",
      icon: "solar:letter-bold-duotone",
    },
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: "solar:widget-2-bold-duotone",
    },
  ];

  const legalLinks = [
    { name: "Privacy Policy", href: "/privacy-policy" },
  ];

  return (
    <footer className="relative z-20 bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 group mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
                <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <Icon
                    icon="solar:square-academic-cap-bold-duotone"
                    className="w-7 h-7 text-white"
                  />
                </div>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Erasmus
                </span>
                <span className="text-2xl font-bold text-white">Journey</span>
              </div>
            </Link>
            <p className="text-gray-400 leading-relaxed mb-6 max-w-sm">
              Approved destination insights, housing summaries, and course
              examples to help Cyprus students plan smarter exchanges.
            </p>


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
                    className="flex items-center gap-3 text-gray-400 hover:text-blue-400 transition-colors group"
                  >
                    <Icon
                      icon={link.icon}
                      className="w-4 h-4 group-hover:scale-110 transition-transform"
                    />
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
                    className="flex items-center gap-3 text-gray-400 hover:text-blue-400 transition-colors group"
                  >
                    <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 group-hover:border-blue-500/50 group-hover:bg-blue-500/10 flex items-center justify-center transition-all">
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
                    className="flex items-center gap-3 text-gray-400 hover:text-blue-400 transition-colors group"
                  >
                    <Icon
                      icon={link.icon}
                      className="w-4 h-4 group-hover:scale-110 transition-transform"
                    />
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
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-400 transition-colors"
                  >
                    Erasmus+ Programme
                    <Icon
                      icon="solar:square-arrow-right-up-bold-duotone"
                      className="w-3 h-3"
                    />
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://ec.europa.eu/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-400 transition-colors"
                  >
                    European Commission
                    <Icon
                      icon="solar:square-arrow-right-up-bold-duotone"
                      className="w-3 h-3"
                    />
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
                  className="text-sm text-gray-500 hover:text-blue-400 transition-colors"
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
