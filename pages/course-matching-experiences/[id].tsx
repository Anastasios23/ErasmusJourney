import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Star,
  Calendar,
  MapPin,
  Building2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Users,
  Award,
  TrendingUp,
  Lightbulb,
  MessageSquare,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import Header from "../../components/Header";
import Footer from "../../src/components/Footer";

interface HostCourse {
  name: string;
  credits: number;
  difficulty: string;
  workload: string;
  professorRating: number;
  materialsQuality: string;
  tips: string;
}

interface EquivalentCourse {
  hostCourse: string;
  homeCourse: string;
  creditsTransferred: number;
  recognitionStatus: string;
}

interface CourseMatchingExperience {
  id: string;
  submittedAt: string;
  hostUniversity: string;
  hostCountry: string;
  hostCity: string;
  homeUniversity: string;
  homeCountry: string;
  studyField: string;
  academicYear: string;
  semester: string;
  exchangeDuration: string;
  totalCreditsAttempted: number;
  totalCreditsTransferred: number;
  overallAcademicExperience: number;
  courseMatchingDifficulty: string;
  recommendationScore: number;
  hostCourses: HostCourse[];
  equivalentCourses: EquivalentCourse[];
  biggestChallenges: string[];
  mostHelpfulResources: string[];
  adviceForFutureStudents: string;
  additionalComments: string;
  anonymousName: string;
}

interface Props {
  experience: CourseMatchingExperience | null;
  error?: string;
}

export default function CourseMatchingExperienceDetail({
  experience,
  error,
}: Props) {
  const router = useRouter();

  if (error || !experience) {
    return (
      <>
        <Head>
          <title>Experience Not Found | Erasmus Journey</title>
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <Header />
          <div className="container mx-auto px-4 py-16">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Experience Not Found
              </h1>
              <p className="text-gray-600 mb-6">
                {error || "This experience could not be found."}
              </p>
              <Link
                href="/course-matching-experiences"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to All Experiences
              </Link>
            </div>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  const successRate =
    experience.totalCreditsAttempted > 0
      ? Math.round(
          (experience.totalCreditsTransferred /
            experience.totalCreditsAttempted) *
            100,
        )
      : 0;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "moderate":
        return "bg-yellow-100 text-yellow-800";
      case "challenging":
        return "bg-orange-100 text-orange-800";
      case "very challenging":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getWorkloadColor = (workload: string) => {
    switch (workload?.toLowerCase()) {
      case "light":
        return "bg-blue-100 text-blue-800";
      case "moderate":
        return "bg-indigo-100 text-indigo-800";
      case "heavy":
        return "bg-purple-100 text-purple-800";
      case "very heavy":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRecognitionColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "fully recognized":
      case "approved":
        return "text-green-600";
      case "partially recognized":
      case "pending":
        return "text-yellow-600";
      case "not recognized":
      case "rejected":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getRecognitionIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "fully recognized":
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "partially recognized":
      case "pending":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case "not recognized":
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <>
      <Head>
        <title>{experience.hostUniversity} Experience | Erasmus Journey</title>
        <meta
          name="description"
          content={`Course matching experience at ${experience.hostUniversity} in ${experience.hostCity}, ${experience.hostCountry}`}
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Header />

        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]" />
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

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            {/* Back Link */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Link
                href="/course-matching-experiences"
                className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors group"
              >
                <Icon
                  icon="solar:arrow-left-linear"
                  className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
                />
                <span className="text-sm font-medium">
                  Back to All Experiences
                </span>
              </Link>
            </motion.div>

            {/* Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex flex-wrap items-center gap-3 mb-4"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium border border-white/20">
                <Icon icon="solar:calendar-linear" className="w-4 h-4" />
                {experience.academicYear}
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium border border-white/20">
                <Icon icon="solar:clock-circle-linear" className="w-4 h-4" />
                {experience.semester}
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium border border-white/20">
                <Icon icon="solar:hourglass-linear" className="w-4 h-4" />
                {experience.exchangeDuration}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
            >
              {experience.hostUniversity}
            </motion.h1>

            {/* Meta Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
              className="flex flex-wrap items-center gap-6 text-white/80 mb-8"
            >
              <div className="flex items-center gap-2">
                <Icon icon="solar:map-point-linear" className="w-5 h-5" />
                <span>
                  {experience.hostCity}, {experience.hostCountry}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Icon icon="solar:book-2-linear" className="w-5 h-5" />
                <span>{experience.studyField}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon icon="solar:user-circle-linear" className="w-5 h-5" />
                <span>Shared by {experience.anonymousName}</span>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.25 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 cursor-default"
              >
                <Icon
                  icon="solar:notebook-linear"
                  className="w-6 h-6 text-white/80 mb-2"
                />
                <div className="text-2xl md:text-3xl font-bold text-white">
                  {experience.hostCourses?.length || 0}
                </div>
                <div className="text-sm text-white/70">Courses Taken</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 cursor-default"
              >
                <Icon
                  icon="solar:diploma-linear"
                  className="w-6 h-6 text-white/80 mb-2"
                />
                <div className="text-2xl md:text-3xl font-bold text-white">
                  {experience.totalCreditsTransferred}
                </div>
                <div className="text-sm text-white/70">Credits Transferred</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 cursor-default"
              >
                <Icon
                  icon="solar:graph-up-linear"
                  className="w-6 h-6 text-white/80 mb-2"
                />
                <div className="text-2xl md:text-3xl font-bold text-white">
                  {successRate}%
                </div>
                <div className="text-sm text-white/70">Success Rate</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 cursor-default"
              >
                <Icon
                  icon="solar:star-linear"
                  className="w-6 h-6 text-white/80 mb-2"
                />
                <div className="text-2xl md:text-3xl font-bold text-white flex items-center gap-1">
                  {experience.overallAcademicExperience}
                  <span className="text-lg text-white/60">/5</span>
                </div>
                <div className="text-sm text-white/70">Overall Rating</div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Stats Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Icon
                    icon="solar:chart-2-linear"
                    className="w-6 h-6 text-blue-600"
                  />
                  Academic Overview
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="text-center p-4 bg-blue-50 rounded-xl cursor-default"
                  >
                    <div className="text-3xl font-bold text-blue-600">
                      {experience.hostCourses?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Courses Taken</div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="text-center p-4 bg-green-50 rounded-xl cursor-default"
                  >
                    <div className="text-3xl font-bold text-green-600">
                      {experience.totalCreditsTransferred}
                    </div>
                    <div className="text-sm text-gray-600">
                      Credits Transferred
                    </div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="text-center p-4 bg-purple-50 rounded-xl cursor-default"
                  >
                    <div className="text-3xl font-bold text-purple-600">
                      {successRate}%
                    </div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="text-center p-4 bg-amber-50 rounded-xl cursor-default"
                  >
                    <div className="flex items-center justify-center gap-1 text-3xl font-bold text-amber-600">
                      {experience.overallAcademicExperience}
                      <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                    </div>
                    <div className="text-sm text-gray-600">Overall Rating</div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Host Courses */}
              {experience.hostCourses && experience.hostCourses.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-white rounded-2xl shadow-lg p-6"
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Icon
                      icon="solar:book-2-linear"
                      className="w-6 h-6 text-indigo-600"
                    />
                    Courses at Host University
                  </h2>
                  <div className="space-y-4">
                    {experience.hostCourses.map((course, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                        whileHover={{
                          scale: 1.01,
                          transition: { duration: 0.2 },
                        }}
                        className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow cursor-default"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {course.name}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                              {course.credits} ECTS
                            </span>
                            {course.difficulty && (
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(course.difficulty)}`}
                              >
                                {course.difficulty}
                              </span>
                            )}
                            {course.workload && (
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${getWorkloadColor(course.workload)}`}
                              >
                                {course.workload} workload
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mt-4">
                          {course.professorRating > 0 && (
                            <div className="flex items-center gap-2">
                              <Icon
                                icon="solar:square-academic-cap-linear"
                                className="w-5 h-5 text-gray-400"
                              />
                              <span className="text-sm text-gray-600">
                                Professor Rating:
                              </span>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < course.professorRating ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                          {course.materialsQuality && (
                            <div className="flex items-center gap-2">
                              <Icon
                                icon="solar:medal-ribbon-linear"
                                className="w-5 h-5 text-gray-400"
                              />
                              <span className="text-sm text-gray-600">
                                Materials:
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                {course.materialsQuality}
                              </span>
                            </div>
                          )}
                        </div>

                        {course.tips && (
                          <div className="mt-4 p-4 bg-amber-50 rounded-lg">
                            <div className="flex items-start gap-2">
                              <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="font-medium text-amber-800">
                                  Tip:{" "}
                                </span>
                                <span className="text-amber-700">
                                  {course.tips}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Course Equivalencies */}
              {experience.equivalentCourses &&
                experience.equivalentCourses.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      Course Equivalencies
                    </h2>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">
                              Host Course
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">
                              Home Equivalent
                            </th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-700">
                              Credits
                            </th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-700">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {experience.equivalentCourses.map((equiv, index) => (
                            <tr
                              key={index}
                              className="border-b border-gray-100 hover:bg-gray-50"
                            >
                              <td className="py-4 px-4">
                                <span className="font-medium text-gray-900">
                                  {equiv.hostCourse}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <span className="text-gray-700">
                                  {equiv.homeCourse}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                  {equiv.creditsTransferred} ECTS
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center justify-center gap-2">
                                  {getRecognitionIcon(equiv.recognitionStatus)}
                                  <span
                                    className={`font-medium ${getRecognitionColor(equiv.recognitionStatus)}`}
                                  >
                                    {equiv.recognitionStatus}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              {/* Challenges & Advice */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                  Challenges & Advice
                </h2>

                {experience.biggestChallenges &&
                  experience.biggestChallenges.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-800 mb-3">
                        Biggest Challenges
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {experience.biggestChallenges.map(
                          (challenge, index) => (
                            <span
                              key={index}
                              className="px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm"
                            >
                              {challenge}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                {experience.mostHelpfulResources &&
                  experience.mostHelpfulResources.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-800 mb-3">
                        Most Helpful Resources
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {experience.mostHelpfulResources.map(
                          (resource, index) => (
                            <span
                              key={index}
                              className="px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm"
                            >
                              {resource}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                {experience.adviceForFutureStudents && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-3">
                      Advice for Future Students
                    </h3>
                    <div className="p-4 bg-blue-50 rounded-xl border-l-4 border-blue-500">
                      <p className="text-gray-700 italic">
                        "{experience.adviceForFutureStudents}"
                      </p>
                    </div>
                  </div>
                )}

                {experience.additionalComments && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">
                      Additional Comments
                    </h3>
                    <p className="text-gray-600">
                      {experience.additionalComments}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Info Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                <h3 className="font-bold text-gray-900 mb-4">Quick Info</h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-500">
                        Home University
                      </div>
                      <div className="font-medium text-gray-900">
                        {experience.homeUniversity}
                      </div>
                      <div className="text-sm text-gray-500">
                        {experience.homeCountry}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-indigo-600 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-500">
                        Exchange Period
                      </div>
                      <div className="font-medium text-gray-900">
                        {experience.semester} {experience.academicYear}
                      </div>
                      <div className="text-sm text-gray-500">
                        {experience.exchangeDuration}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-500">Submitted</div>
                      <div className="font-medium text-gray-900">
                        {new Date(experience.submittedAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="my-6" />

                {/* Ratings Summary */}
                <h3 className="font-bold text-gray-900 mb-4">Ratings</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Overall Experience</span>
                      <span className="font-medium">
                        {experience.overallAcademicExperience}/5
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${(experience.overallAcademicExperience / 5) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Recommendation</span>
                      <span className="font-medium">
                        {experience.recommendationScore}/10
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${(experience.recommendationScore / 10) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Course Matching</span>
                      <span className="font-medium capitalize">
                        {experience.courseMatchingDifficulty}
                      </span>
                    </div>
                  </div>
                </div>

                <hr className="my-6" />

                {/* Course Tips */}
                {experience.hostCourses?.some((c) => c.tips) && (
                  <>
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-amber-500" />
                      Quick Tips
                    </h3>
                    <div className="space-y-2">
                      {experience.hostCourses
                        .filter((c) => c.tips)
                        .slice(0, 3)
                        .map((course, index) => (
                          <div
                            key={index}
                            className="p-3 bg-amber-50 rounded-lg text-sm"
                          >
                            <div className="font-medium text-amber-800 mb-1">
                              {course.name}
                            </div>
                            <div className="text-amber-700">{course.tips}</div>
                          </div>
                        ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id as string;

  if (!id) {
    return {
      props: {
        experience: null,
        error: "No experience ID provided",
      },
    };
  }

  try {
    const submission = await prisma.form_submissions.findUnique({
      where: { id },
    });

    if (!submission || submission.type !== "COURSE_MATCHING") {
      return {
        props: {
          experience: null,
          error: "Experience not found",
        },
      };
    }

    const data = submission.data as Record<string, unknown>;

    // Generate anonymous name
    const adjectives = [
      "Adventurous",
      "Brilliant",
      "Curious",
      "Dynamic",
      "Eager",
      "Friendly",
      "Global",
      "Happy",
    ];
    const nouns = [
      "Explorer",
      "Scholar",
      "Traveler",
      "Student",
      "Learner",
      "Pioneer",
      "Voyager",
      "Seeker",
    ];
    const hashCode = id
      .split("")
      .reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0);
    const adjIndex = Math.abs(hashCode) % adjectives.length;
    const nounIndex = Math.abs(hashCode >> 8) % nouns.length;
    const anonymousName = `${adjectives[adjIndex]} ${nouns[nounIndex]}`;

    const experience: CourseMatchingExperience = {
      id: submission.id,
      submittedAt: submission.createdAt.toISOString(),
      hostUniversity: (data.hostUniversity as string) || "Unknown University",
      hostCountry: (data.hostCountry as string) || "Unknown Country",
      hostCity: (data.hostCity as string) || "Unknown City",
      homeUniversity: (data.homeUniversity as string) || "Unknown University",
      homeCountry: (data.homeCountry as string) || "Unknown Country",
      studyField: (data.studyField as string) || "Not specified",
      academicYear: (data.academicYear as string) || "Not specified",
      semester: (data.semester as string) || "Not specified",
      exchangeDuration: (data.exchangeDuration as string) || "Not specified",
      totalCreditsAttempted: Number(data.totalCreditsAttempted) || 0,
      totalCreditsTransferred: Number(data.totalCreditsTransferred) || 0,
      overallAcademicExperience: Number(data.overallAcademicExperience) || 0,
      courseMatchingDifficulty:
        (data.courseMatchingDifficulty as string) || "Not specified",
      recommendationScore: Number(data.recommendationScore) || 0,
      hostCourses: (data.hostCourses as HostCourse[]) || [],
      equivalentCourses: (data.equivalentCourses as EquivalentCourse[]) || [],
      biggestChallenges: (data.biggestChallenges as string[]) || [],
      mostHelpfulResources: (data.mostHelpfulResources as string[]) || [],
      adviceForFutureStudents: (data.adviceForFutureStudents as string) || "",
      additionalComments: (data.additionalComments as string) || "",
      anonymousName,
    };

    return {
      props: {
        experience,
      },
    };
  } catch (error) {
    console.error("Error fetching experience:", error);
    return {
      props: {
        experience: null,
        error: "Failed to load experience",
      },
    };
  }
};
