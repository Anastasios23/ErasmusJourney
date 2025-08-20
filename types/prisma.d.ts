declare module '@prisma/client' {
  import { PrismaClient as OriginalPrismaClient } from '@prisma/client/runtime';
  
  export const PrismaClient: typeof OriginalPrismaClient;
  export * from '@prisma/client/runtime';
  
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
    export type DestinationWhereInput = {
      AND?: DestinationWhereInput | DestinationWhereInput[];
      OR?: DestinationWhereInput[];
      NOT?: DestinationWhereInput | DestinationWhereInput[];
      id?: string | StringFilter;
      name?: string | StringFilter;
      city?: string | StringFilter;
      country?: string | StringFilter;
      status?: string | StringFilter;
      featured?: boolean | BooleanFilter;
    };
    
    export type StringFilter = {
      equals?: string;
      in?: string[];
      notIn?: string[];
      lt?: string;
      lte?: string;
      gt?: string;
      gte?: string;
      contains?: string;
      startsWith?: string;
      endsWith?: string;
      not?: string | StringFilter;
    };
    
    export type BooleanFilter = {
      equals?: boolean;
      not?: boolean | BooleanFilter;
    };
  }
}