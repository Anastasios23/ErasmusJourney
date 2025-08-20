import { PrismaClient } from "@prisma/client";

// Use regular JavaScript syntax
const globalForPrisma = global;

// Initialize prisma client
export const prisma = globalForPrisma.prisma || new PrismaClient();

// Save prisma client in development mode
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;