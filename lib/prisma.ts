// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

// Use the constructor type, which avoids "Cannot use namespace 'PrismaClient' as a type"
type PrismaClientInstance = InstanceType<typeof PrismaClient>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientInstance | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
