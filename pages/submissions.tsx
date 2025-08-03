import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Header from "../components/Header";
import LoginPrompt from "../src/components/LoginPrompt";
import Breadcrumb from "../components/Breadcrumb";

type Submission = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  course: string;
  createdAt: string;
};

export default function SubmissionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "loading") return; // Still loading
    if (!session) {
      router.push("/login?callbackUrl=/submissions");
      return;
    }

    // Check if user is admin
    const user = session.user as any;
    if (user.role !== "ADMIN") {
      router.push("/dashboard"); // Redirect non-admin users
      return;
    }
  }, [session, status, router]);

  useEffect(() => {
    if (!session) return;

    // Once authenticated, fetch
    fetch("/api/submissions")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then(({ submissions }) => setSubmissions(submissions))
      .catch((err) => {
        console.error(err);
        setError("Failed to load submissions");
      })
      .finally(() => setLoading(false));
  }, [session]);

  // Show loading while checking authentication
  if (status === "loading" || loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <Breadcrumb
              items={[
                { label: "Home", href: "/" },
                { label: "Admin", href: "/admin" },
                { label: "Submissions", href: "/submissions" },
              ]}
            />

            <div className="mt-8">
              <LoginPrompt
                title="Admin Access Required"
                description="You need to be logged in as an administrator to view submissions."
                currentPath="/submissions"
              />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Admin: Erasmus Submissions
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {submissions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No submissions found.</p>
              <p className="text-gray-400 text-sm mt-2">
                Applications will appear here once students submit them.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Course</th>
                    <th className="px-4 py-2 text-left">Submitted</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y">
                  {submissions.map((s) => (
                    <tr key={s.id}>
                      <td className="px-4 py-2">{s.id}</td>
                      <td className="px-4 py-2">{`${s.firstName} ${s.lastName}`}</td>
                      <td className="px-4 py-2">{s.email}</td>
                      <td className="px-4 py-2">{s.course}</td>
                      <td className="px-4 py-2">
                        {new Date(s.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
