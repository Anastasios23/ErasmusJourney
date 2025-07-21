// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

// Declare a global variable to hold the Prisma client.
// This is necessary because in a serverless environment (like Next.js API routes),
// a new instance of the application is created for each request. We want to
// reuse the same Prisma client instance across requests to avoid exhausting
// the database connection limit.
declare global {
  var prisma: PrismaClient | undefined;
}

// Create a new Prisma client instance if one doesn't already exist in the
// global scope. Otherwise, use the existing one.
const prisma = global.prisma || new PrismaClient();

// In a development environment, assign the Prisma client to the global scope
// so that it can be reused on subsequent hot reloads.
if (process.env.NODE_ENV === "development") {
  global.prisma = prisma;
}

export default prisma;
