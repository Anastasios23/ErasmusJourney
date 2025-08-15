import { useEffect } from "react";
import { useRouter } from "next/router";

export default function AdminRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to new unified admin interface
    router.replace("/admin");
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Redirecting to Admin Dashboard...
        </h2>
        <p className="text-gray-600">
          Please wait while we redirect you to the new admin interface.
        </p>
      </div>
    </div>
  );
}
