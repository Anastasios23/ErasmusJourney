import { PrismaClient } from '@prisma/client';

// Use regular JavaScript syntax to avoid TypeScript parsing issues
let prismaClient;

// Initialize prisma client
if (process.env.NODE_ENV === 'production') {
  prismaClient = new PrismaClient();
} else {
  // In development, reuse the existing connection
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prismaClient = global.prisma;
}

export const prisma = prismaClient;