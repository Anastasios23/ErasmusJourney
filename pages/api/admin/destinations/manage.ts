import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";

/**
 * Enhanced Admin Destinations API
 * Supports CRUD operations, batch updates, and advanced filtering
 */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const session = await getServerSession(req, res, authOptions);

    // Check admin authentication
    if (!session?.user || session.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" });
    }

    switch (req.method) {
      case "GET":
        return handleGet(req, res);
      case "POST":
        return handlePost(req, res);
      case "PUT":
        return handlePut(req, res);
      case "DELETE":
        return handleDelete(req, res);
      case "PATCH":
        return handlePatch(req, res);
      default:
        res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE", "PATCH"]);
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Admin destinations API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const {
    status = "all",
    featured,
    country,
    search,
    sortBy = "updatedAt",
    sortOrder = "desc",
    page = "1",
    limit = "50",
  } = req.query;

  const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

  // Build filter conditions
  const where: any = {};

  if (status !== "all") {
    where.featured = status === "featured";
  }

  if (featured !== undefined) {
    where.featured = featured === "true";
  }

  if (country) {
    where.country = { contains: country as string, mode: "insensitive" };
  }

  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: "insensitive" } },
      { country: { contains: search as string, mode: "insensitive" } },
      { description: { contains: search as string, mode: "insensitive" } },
    ];
  }

  const [destinations, total] = await Promise.all([
    prisma.destination.findMany({
      where,
      orderBy: { [sortBy as string]: sortOrder },
      skip: offset,
      take: parseInt(limit as string),
    }),
    prisma.destination.count({ where }),
  ]);

  return res.status(200).json({
    destinations,
    pagination: {
      total,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      totalPages: Math.ceil(total / parseInt(limit as string)),
    },
  });
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const {
    name,
    city,
    country,
    description,
    imageUrl,
    featured = false,
    climate,
    costOfLiving,
    highlights,
    photos,
    generalInfo,
  } = req.body;

  // Validation
  if (!name || !city || !country) {
    return res
      .status(400)
      .json({ error: "Name, city, and country are required" });
  }

  const destination = await prisma.destination.create({
    data: {
      name,
      city,
      country,
      description,
      imageUrl,
      featured,
      climate,
      costOfLiving,
      highlights,
      photos,
      generalInfo,
    },
  });

  return res.status(201).json(destination);
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Destination ID is required" });
  }

  const {
    name,
    country,
    description,
    imageUrl,
    featured,
    climate,
    costOfLiving,
    highlights,
    photos,
    generalInfo,
  } = req.body;

  const destination = await prisma.destination.update({
    where: { id: id as string },
    data: {
      name,
      country,
      description,
      imageUrl,
      featured,
      climate,
      costOfLiving,
      highlights,
      photos,
      generalInfo,
      updatedAt: new Date(),
    },
  });

  return res.status(200).json(destination);
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Destination ID is required" });
  }

  await prisma.destination.delete({
    where: { id: id as string },
  });

  return res.status(204).end();
}

async function handlePatch(req: NextApiRequest, res: NextApiResponse) {
  const { action, ids, updates } = req.body;

  switch (action) {
    case "batchUpdate":
      if (!ids || !Array.isArray(ids)) {
        return res
          .status(400)
          .json({ error: "IDs array is required for batch update" });
      }

      const results = await prisma.destination.updateMany({
        where: { id: { in: ids } },
        data: { ...updates, updatedAt: new Date() },
      });

      return res.status(200).json({ updated: results.count });

    case "toggleFeatured":
      if (!ids || !Array.isArray(ids)) {
        return res.status(400).json({ error: "IDs array is required" });
      }

      // Get current states
      const destinations = await prisma.destination.findMany({
        where: { id: { in: ids } },
        select: { id: true, featured: true },
      });

      // Toggle each destination
      const togglePromises = destinations.map((dest) =>
        prisma.destination.update({
          where: { id: dest.id },
          data: { featured: !dest.featured, updatedAt: new Date() },
        }),
      );

      await Promise.all(togglePromises);

      return res.status(200).json({ toggled: destinations.length });

    default:
      return res.status(400).json({ error: "Invalid action" });
  }
}
