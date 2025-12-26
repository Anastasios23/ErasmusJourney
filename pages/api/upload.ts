import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

interface UploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UploadResponse>,
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res
        .status(401)
        .json({ success: false, error: "Authentication required" });
    }

    const { image, filename } = req.body;

    if (!image) {
      return res
        .status(400)
        .json({ success: false, error: "No image provided" });
    }

    // Validate base64 image
    const matches = image.match(
      /^data:image\/(png|jpeg|jpg|gif|webp);base64,(.+)$/,
    );
    if (!matches) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid image format" });
    }

    const imageType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    // Validate file size (max 5MB)
    if (buffer.length > 5 * 1024 * 1024) {
      return res
        .status(400)
        .json({ success: false, error: "Image too large (max 5MB)" });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      session.user.id,
    );
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const uniqueFilename = `${uuidv4()}.${imageType}`;
    const filePath = path.join(uploadsDir, uniqueFilename);

    // Write file
    await writeFile(filePath, buffer);

    // Return the public URL
    const url = `/uploads/${session.user.id}/${uniqueFilename}`;

    return res.status(200).json({ success: true, url });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload image",
    });
  }
}
