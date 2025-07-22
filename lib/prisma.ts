// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

// This logic ensures that in a development environment, where the module is reloaded on every change,
// a new PrismaClient is not created on every reload. Instead, the same instance is reused.
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  // Ensure the prisma instance is re-used during hot-reloading
  // @ts-ignore
  if (!global.prisma) {
    // @ts-ignore
    global.prisma = new PrismaClient();
  }
  // @ts-ignore
  prisma = global.prisma;
}

export { prisma };
