import { PrismaClient } from "@prisma/client";

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

// Initialize prisma client only on server-side
let prisma;

if (!isBrowser) {
  // Use regular JavaScript syntax for server-side
  const globalForPrisma = global;

  // Initialize prisma client
  prisma = globalForPrisma.prisma || new PrismaClient();

  // Save prisma client in development mode
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
} else {
  // In browser environment, create a mock object to prevent errors
  prisma = {
    // Add mock methods that might be called
    destination: {
      findMany: () => Promise.resolve([]),
      findFirst: () => Promise.resolve(null),
      findUnique: () => Promise.resolve(null),
      create: () => Promise.resolve({}),
      update: () => Promise.resolve({}),
      delete: () => Promise.resolve({}),
    },
    formSubmission: {
      findMany: () => Promise.resolve([]),
      findFirst: () => Promise.resolve(null),
      findUnique: () => Promise.resolve(null),
      create: () => Promise.resolve({}),
      update: () => Promise.resolve({}),
      delete: () => Promise.resolve({}),
    },
    // Add other models as needed
  };
}

export { prisma };
