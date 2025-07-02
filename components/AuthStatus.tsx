import { useSession } from "next-auth/react";
import { Badge } from "../src/components/ui/badge";
import { Card, CardContent } from "../src/components/ui/card";

export default function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <Badge variant="outline" className="bg-yellow-100">
            Loading...
          </Badge>
          <p className="text-sm text-yellow-700 mt-2">
            Checking authentication status
          </p>
        </CardContent>
      </Card>
    );
  }

  if (status === "unauthenticated") {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <Badge variant="destructive">Not Authenticated</Badge>
          <p className="text-sm text-red-700 mt-2">
            You need to log in to access protected features
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="p-4">
        <Badge variant="secondary" className="bg-green-100">
          ✅ Authenticated
        </Badge>
        <div className="text-sm text-green-700 mt-2">
          <p>
            <strong>User:</strong> {session?.user?.firstName}{" "}
            {session?.user?.lastName}
          </p>
          <p>
            <strong>Email:</strong> {session?.user?.email}
          </p>
          <p>
            <strong>Role:</strong>{" "}
            <Badge
              variant={
                (session?.user as any)?.role === "ADMIN"
                  ? "default"
                  : "secondary"
              }
            >
              {(session?.user as any)?.role || "USER"}
            </Badge>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
