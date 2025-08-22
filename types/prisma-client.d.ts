import { PrismaClient as BasePrismaClient } from '@prisma/client/runtime';

declare global {
  namespace PrismaClient {
    interface PrismaClient extends BasePrismaClient {}
  }
}

declare module '@prisma/client' {
  export interface Destination {
    id: string;
    name: string;
    city: string;
    country: string;
    description?: string | null;
    imageUrl?: string | null;
    featured: boolean;
    status: string;
    source: string;
    climate?: string | null;
    costOfLiving?: any;
    highlights?: string | null;
    photos?: any;
    generalInfo?: any;
    aggregatedData?: any;
    adminOverrides?: any;
    submissionCount: number;
    lastDataUpdate: Date;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export namespace Prisma {
    export type DestinationWhereInput = any;
    export type StringFilter = any;
    export type BooleanFilter = any;
  }
}