import { NextApiRequest, NextApiResponse } from "next";
import { TEST_FORM_SUBMISSIONS } from "../../test-data/form-submissions";

interface UniversitySubmissionsResponse {
  submissions: Array<{
    id: string;
    userId: string;
    type: string;
    title: string;
    data: any; // Filtered data without sensitive information
    status: string;
    createdAt: string;
    updatedAt: string;
  }>;
  university: {
    id: string;
    name: string;
    city?: string;
    country?: string;
  };
  totalSubmissions: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UniversitySubmissionsResponse | { error: string }>,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Missing or invalid university ID" });
  }

  try {
    // For now, we'll use the test data and filter by host university
    // In production, this would query the database by university ID

    // Filter submissions for this university
    const universitySubmissions = TEST_FORM_SUBMISSIONS.filter((submission) => {
      // Match by university name for test data compatibility
      // In production, you would match by universityId field in the data
      const hostUniversity = submission.data.hostUniversity;
      if (!hostUniversity) return false;

      // Exact match first
      if (hostUniversity === id) return true;

      // Partial match (case insensitive)
      if (hostUniversity.toLowerCase().includes(id.toLowerCase())) return true;

      // Reverse partial match (id contains university name)
      if (id.toLowerCase().includes(hostUniversity.toLowerCase())) return true;

      return false;
    });

    // Remove sensitive data from all submissions
    const cleanedSubmissions = universitySubmissions.map((submission) => {
      const { data, ...rest } = submission;

      // Remove sensitive fields from data
      const {
        grades,
        studentId,
        emergencyContact,
        phoneNumber,
        address,
        passportNumber,
        personalDocument,
        ...cleanData
      } = data || {};

      return {
        ...rest,
        data: cleanData,
      };
    });

    // Get university info from the first submission or create default
    const firstSubmission = universitySubmissions[0];
    const universityInfo = {
      id,
      name: firstSubmission?.data.hostUniversity || id,
      city: firstSubmission?.data.hostCity,
      country: firstSubmission?.data.hostCountry,
    };

    const response: UniversitySubmissionsResponse = {
      submissions: cleanedSubmissions,
      university: universityInfo,
      totalSubmissions: cleanedSubmissions.length,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching university submissions:", error);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
}
