import Head from "next/head";
import Link from "next/link";
import { Button } from "../src/components/ui/button";

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Erasmus Journey Platform - Connect, Share, Explore</title>
        <meta
          name="description"
          content="Connect with fellow Erasmus students, share your experiences, and explore partnership opportunities across Cyprus universities."
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Simple Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">EJ</span>
                </div>
                <span className="font-bold text-xl text-gray-900">
                  Erasmus Journey
                </span>
              </Link>
              <nav className="flex space-x-4">
                <Link
                  href="/universities"
                  className="text-gray-700 hover:text-blue-600"
                >
                  Universities
                </Link>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-blue-600"
                >
                  Login
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="pt-20 pb-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-6xl font-bold text-gray-900 mb-6">
              Your <span className="text-blue-600">Erasmus Journey</span> Starts
              Here
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Connect with fellow students, share your experiences, and discover
              partnership opportunities across Cyprus universities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/universities">
                <Button size="lg" className="text-lg px-8 py-3">
                  Explore Universities
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-3"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">5</div>
                <div className="text-gray-600">Partner Universities</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">
                  1000+
                </div>
                <div className="text-gray-600">Active Partnerships</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  50+
                </div>
                <div className="text-gray-600">Student Stories</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of students exploring educational opportunities
              across Europe.
            </p>
            <Link href="/login">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-3"
              >
                Get Started Today
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
