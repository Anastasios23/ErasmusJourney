import React from "react";

interface LivingExpensesStepProps {
  data: any;
  onComplete: (data: any) => void;
  onSave: (data: any) => void;
}

export default function LivingExpensesStep({
  data,
  onComplete,
  onSave,
}: LivingExpensesStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Living Expenses
        </h3>
        <p className="text-gray-600 mb-4">
          This step will contain the living expenses form. Currently under
          development.
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-800">
            <strong>Coming Soon:</strong> Budget breakdown, monthly costs, and
            financial tips.
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={() => onSave({ livingExpenses: { placeholder: true } })}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Save Draft
        </button>
        <button
          onClick={() => onComplete({ livingExpenses: { placeholder: true } })}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Continue to Experience
        </button>
      </div>
    </div>
  );
}
