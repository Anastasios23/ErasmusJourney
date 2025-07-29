import React from "react";
import { useFormSubmissions } from "../src/hooks/useFormSubmissions";

interface DebugBasicInfoProps {
  formData: any; // Replace with more specific type if available
  basicInfo: any; // Replace with more specific type if available
  onClose: () => void;
}

export default function DebugBasicInfo({
  formData,
  basicInfo,
  onClose,
}: DebugBasicInfoProps) {
  const { getFormData, getDraftData, getSubmittedData, submissions } =
    useFormSubmissions();

  const basicInfoFormData = getFormData("basic-info");
  const basicInfoDraftData = getDraftData("basic-info");
  const basicInfoSubmittedData = getSubmittedData("basic-info");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Debug: Basic Info Data</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">All Submissions:</h3>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
              {JSON.stringify(submissions, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">
              getFormData('basic-info') Result:
            </h3>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
              {JSON.stringify(basicInfoFormData, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">
              getDraftData('basic-info') Result:
            </h3>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
              {JSON.stringify(basicInfoDraftData, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">
              getSubmittedData('basic-info') Result:
            </h3>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
              {JSON.stringify(basicInfoSubmittedData, null, 2)}
            </pre>
          </div>

          {basicInfoFormData && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Key Fields Check:</h3>
              <div className="bg-yellow-50 p-3 rounded">
                <p>
                  <strong>hostCity:</strong>{" "}
                  {basicInfoFormData.hostCity || "MISSING"}
                </p>
                <p>
                  <strong>hostCountry:</strong>{" "}
                  {basicInfoFormData.hostCountry || "MISSING"}
                </p>
                <p>
                  <strong>hostUniversity:</strong>{" "}
                  {basicInfoFormData.hostUniversity || "MISSING"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
