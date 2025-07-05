import { useEffect, useState } from "react";

type Submission = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  course: string;
  createdAt: string;
};

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Once authenticated, fetch
    fetch("/api/submissions")
      .then((res) => res.json())
      .then(({ submissions }) => setSubmissions(submissions))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="ml-2">Loading submissions…</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Erasmus Submissions</h1>

      {submissions.length === 0 ? (
        <p>No submissions found.</p>
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
  );
}
