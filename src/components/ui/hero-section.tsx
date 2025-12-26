"use client";

import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { ReactNode } from "react";

interface HeroStat {
  icon: string;
  value: string | number;
  label: string;
}

interface HeroSectionProps {
  badge?: string;
  badgeIcon?: string;
  title: string;
  subtitle?: string;
  description?: string;
  stats?: HeroStat[];
  backLink?: {
    href: string;
    label: string;
  };
  children?: ReactNode;
  gradient?: "blue" | "purple" | "emerald" | "amber";
  size?: "sm" | "md" | "lg";
}

const gradientClasses = {
  blue: "from-blue-600 via-indigo-600 to-violet-600",
  purple: "from-violet-600 via-purple-600 to-fuchsia-600",
  emerald: "from-emerald-600 via-teal-600 to-cyan-600",
  amber: "from-amber-500 via-orange-500 to-red-500",
};

export function HeroSection({
  badge,
  badgeIcon,
  title,
  subtitle,
  description,
  stats,
  backLink,
  children,
  gradient = "blue",
  size = "md",
}: HeroSectionProps) {
  const paddingClasses = {
    sm: "py-8 md:py-12",
    md: "py-12 md:py-16",
    lg: "py-16 md:py-24",
  };

  return (
    <div
      className={`relative bg-gradient-to-r ${gradientClasses[gradient]} overflow-hidden`}
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]" />

        {/* Blur Orbs */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />

        {/* Vertical Container Lines */}
        <div className="absolute inset-0 max-w-7xl mx-auto">
          <div className="absolute left-4 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
          <div className="absolute right-4 md:right-8 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
        </div>
      </div>

      <div
        className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${paddingClasses[size]}`}
      >
        {/* Back Link */}
        {backLink && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <Link
              href={backLink.href}
              className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors group"
            >
              <Icon
                icon="solar:arrow-left-linear"
                className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
              />
              <span className="text-sm font-medium">{backLink.label}</span>
            </Link>
          </motion.div>
        )}

        {/* Badge */}
        {badge && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-4"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium border border-white/20">
              {badgeIcon && <Icon icon={badgeIcon} className="w-4 h-4" />}
              {badge}
            </span>
          </motion.div>
        )}

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
        >
          {title}
        </motion.h1>

        {/* Subtitle */}
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
            className="text-xl md:text-2xl text-white/90 font-medium mb-2"
          >
            {subtitle}
          </motion.p>
        )}

        {/* Description */}
        {description && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
            className="text-base md:text-lg text-white/70 max-w-3xl mb-8"
          >
            {description}
          </motion.p>
        )}

        {/* Stats Grid */}
        {stats && stats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.4,
                  ease: "easeOut",
                  delay: 0.4 + index * 0.1,
                }}
                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 cursor-default"
              >
                <Icon icon={stat.icon} className="w-6 h-6 text-white/80 mb-2" />
                <div className="text-2xl md:text-3xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-white/70">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Custom Children */}
        {children && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.25 }}
          >
            {children}
          </motion.div>
        )}
      </div>
    </div>
  );
}

interface NumberedStepProps {
  number: string;
  title: string;
  description?: string;
  icon?: string;
  isLast?: boolean;
}

export function NumberedStep({
  number,
  title,
  description,
  icon,
  isLast = false,
}: NumberedStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className="relative flex gap-4 cursor-default"
    >
      {/* Vertical Line */}
      {!isLast && (
        <div className="absolute left-5 top-12 w-px h-full bg-gradient-to-b from-blue-300 to-transparent" />
      )}

      {/* Number Circle */}
      <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-lg">
        {number}
      </div>

      {/* Content */}
      <div className="flex-1 pb-8">
        <div className="flex items-center gap-2 mb-1">
          {icon && <Icon icon={icon} className="w-5 h-5 text-blue-600" />}
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>
    </motion.div>
  );
}

export function ClickableCard({
  children,
  className = "",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`cursor-pointer ${className}`}
    >
      {children}
    </motion.div>
  );
}
