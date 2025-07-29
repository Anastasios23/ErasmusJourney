import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle } from "lucide-react";

interface FormErrorSummaryProps {
  formError: string | null;
  fieldErrors: Record<string, string>;
}

export function FormErrorSummary({
  formError,
  fieldErrors,
}: FormErrorSummaryProps) {
  const hasErrors = formError || Object.keys(fieldErrors).length > 0;

  if (!hasErrors) return null;

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        {formError && <p className="font-medium mb-2">{formError}</p>}
        {Object.keys(fieldErrors).length > 0 && (
          <>
            <p className="font-medium mb-2">Please correct the following:</p>
            <ul className="list-disc pl-4 space-y-1">
              {Object.entries(fieldErrors).map(([field, error]) => (
                <li key={field}>
                  <button
                    type="button"
                    onClick={() => document.getElementById(field)?.focus()}
                    className="text-left hover:underline"
                  >
                    {error}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </AlertDescription>
    </Alert>
  );
}
