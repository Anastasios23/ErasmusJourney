import { prisma } from "../../lib/prisma";
import { aggregateCityData } from "./cityAggregationService";
import { CityAggregatedData } from "../types/cityData";

// Admin-managed destination interface
export interface AdminDestinationData {
  id: string;
  name: string;
  city: string;
  country: string;

  // Admin-curated content
  description: string;
  imageUrl?: string;
  climate?: string;
  highlights?: string[];

  // Official information
  officialUniversities?: Array<{
    name: string;
    website: string;
    programs: string[];
  }>;
  generalInfo?: {
    language: string;
    currency: string;
    timeZone: string;
    publicTransport: string;
  };

  // Admin settings
  featured: boolean;
  active: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Combined destination with student data
export interface CompleteDestinationData extends AdminDestinationData {
  studentData?: CityAggregatedData;
  hasStudentData: boolean;
  lastDataUpdate?: Date;
}

/**
 * Destination Data Service
 * Manages admin destinations and automatically updates student data
 */
export class DestinationDataService {
  /**
   * Create a new admin destination
   */
  static async createDestination(data: {
    name: string;
    city: string;
    country: string;
    description: string;
    imageUrl?: string;
    climate?: string;
    highlights?: string[];
    officialUniversities?: Array<{
      name: string;
      website: string;
      programs: string[];
    }>;
    generalInfo?: {
      language: string;
      currency: string;
      timeZone: string;
      publicTransport: string;
    };
    featured?: boolean;
    createdBy: string;
  }): Promise<AdminDestinationData> {
    const destination = await prisma.adminDestination.create({
      data: {
        name: data.name,
        city: data.city,
        country: data.country,
        description: data.description,
        imageUrl: data.imageUrl,
        climate: data.climate,
        highlights: data.highlights || [],
        officialUniversities: data.officialUniversities || [],
        generalInfo: data.generalInfo || {},
        featured: data.featured || false,
        createdBy: data.createdBy,
        active: true,
      },
    });

    // Immediately try to populate student data if available
    await this.updateDestinationStudentData(destination.id);

    return this.formatAdminDestination(destination);
  }

  /**
   * Update admin destination content
   */
  static async updateDestination(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      imageUrl: string;
      climate: string;
      highlights: string[];
      officialUniversities: Array<{
        name: string;
        website: string;
        programs: string[];
      }>;
      generalInfo: {
        language: string;
        currency: string;
        timeZone: string;
        publicTransport: string;
      };
      featured: boolean;
      active: boolean;
    }>,
  ): Promise<AdminDestinationData> {
    const destination = await prisma.adminDestination.update({
      where: { id },
      data,
    });

    return this.formatAdminDestination(destination);
  }

  /**
   * Get complete destination with student data
   */
  static async getCompleteDestination(
    id: string,
  ): Promise<CompleteDestinationData | null> {
    const destination = await prisma.adminDestination.findUnique({
      where: { id },
    });

    if (!destination) return null;

    const adminData = this.formatAdminDestination(destination);
    let studentData = null;

    // Get fresh student data or use cached
    if (destination.studentDataCache) {
      studentData =
        destination.studentDataCache as unknown as CityAggregatedData;
    }

    // Update student data if cache is old (older than 24 hours) or missing
    const shouldRefresh =
      !destination.lastDataUpdate ||
      Date.now() - destination.lastDataUpdate.getTime() > 24 * 60 * 60 * 1000;

    if (shouldRefresh) {
      try {
        const freshStudentData = await aggregateCityData(
          destination.city,
          destination.country,
        );
        if (freshStudentData.totalSubmissions > 0) {
          studentData = freshStudentData;
          await this.cacheStudentData(id, freshStudentData);
        }
      } catch (error) {
        console.error(
          `Error refreshing student data for destination ${id}:`,
          error,
        );
      }
    }

    return {
      ...adminData,
      studentData: studentData || undefined,
      hasStudentData: destination.hasStudentData,
      lastDataUpdate: destination.lastDataUpdate || undefined,
    };
  }

  /**
   * Get all active destinations with basic info
   */
  static async getAllDestinations(options?: {
    featured?: boolean;
    withStudentData?: boolean;
  }): Promise<CompleteDestinationData[]> {
    const where: any = { active: true };

    if (options?.featured !== undefined) {
      where.featured = options.featured;
    }

    const destinations = await prisma.adminDestination.findMany({
      where,
      orderBy: [{ featured: "desc" }, { name: "asc" }],
    });

    const results = await Promise.all(
      destinations.map(async (dest) => {
        const adminData = this.formatAdminDestination(dest);
        let studentData = null;

        if (options?.withStudentData && dest.studentDataCache) {
          studentData = dest.studentDataCache as unknown as CityAggregatedData;
        }

        return {
          ...adminData,
          studentData: studentData || undefined,
          hasStudentData: dest.hasStudentData,
          lastDataUpdate: dest.lastDataUpdate || undefined,
        };
      }),
    );

    return results;
  }

  /**
   * Find destination by city and country
   */
  static async findDestinationByLocation(
    city: string,
    country: string,
  ): Promise<CompleteDestinationData | null> {
    const destination = await prisma.adminDestination.findUnique({
      where: {
        city_country: {
          city,
          country,
        },
      },
    });

    if (!destination) return null;

    return this.getCompleteDestination(destination.id);
  }

  /**
   * Update student data for a specific destination
   */
  static async updateDestinationStudentData(
    destinationId: string,
  ): Promise<void> {
    const destination = await prisma.adminDestination.findUnique({
      where: { id: destinationId },
    });

    if (!destination) return;

    try {
      console.log(`Updating student data for ${destination.name}`);

      // Calculate fresh student data
      const studentData = await aggregateCityData(
        destination.city,
        destination.country,
      );

      // Cache the results
      await this.cacheStudentData(destinationId, studentData);

      console.log(
        `Successfully updated student data for ${destination.name}: ${studentData.totalSubmissions} submissions`,
      );
    } catch (error) {
      console.error(
        `Error updating student data for destination ${destinationId}:`,
        error,
      );
    }
  }

  /**
   * Cache student data for destination
   */
  private static async cacheStudentData(
    destinationId: string,
    studentData: CityAggregatedData,
  ): Promise<void> {
    await prisma.adminDestination.update({
      where: { id: destinationId },
      data: {
        studentDataCache: studentData as any,
        hasStudentData: studentData.totalSubmissions > 0,
        lastDataUpdate: new Date(),
      },
    });
  }

  /**
   * Refresh all destination student data
   */
  static async refreshAllDestinationData(): Promise<void> {
    const destinations = await prisma.adminDestination.findMany({
      where: { active: true },
    });

    console.log(
      `Refreshing student data for ${destinations.length} destinations`,
    );

    for (const dest of destinations) {
      await this.updateDestinationStudentData(dest.id);
      // Add small delay to prevent overwhelming the database
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log("Finished refreshing all destination data");
  }

  /**
   * Auto-update triggered when student submissions are approved
   */
  static async onStudentSubmissionApproved(
    city: string,
    country: string,
  ): Promise<void> {
    const destination = await this.findDestinationByLocation(city, country);

    if (destination) {
      await this.updateDestinationStudentData(destination.id);
    }
  }

  private static formatAdminDestination(
    destination: any,
  ): AdminDestinationData {
    return {
      id: destination.id,
      name: destination.name,
      city: destination.city,
      country: destination.country,
      description: destination.description,
      imageUrl: destination.imageUrl,
      climate: destination.climate,
      highlights: destination.highlights || [],
      officialUniversities: destination.officialUniversities || [],
      generalInfo: destination.generalInfo || {},
      featured: destination.featured,
      active: destination.active,
      createdBy: destination.createdBy,
      createdAt: destination.createdAt,
      updatedAt: destination.updatedAt,
    };
  }

  /**
   * Delete destination (soft delete by setting active to false)
   */
  static async deleteDestination(id: string): Promise<boolean> {
    try {
      await prisma.adminDestination.update({
        where: { id },
        data: { active: false },
      });
      return true;
    } catch (error) {
      console.error(`Error deleting destination ${id}:`, error);
      return false;
    }
  }

  /**
   * Search destinations by name or city
   */
  static async searchDestinations(
    query: string,
  ): Promise<AdminDestinationData[]> {
    const destinations = await prisma.adminDestination.findMany({
      where: {
        active: true,
        OR: [
          { name: { contains: query } },
          { city: { contains: query } },
          { country: { contains: query } },
        ],
      },
      orderBy: { name: "asc" },
    });

    return destinations.map(this.formatAdminDestination);
  }

  /**
   * Get featured destinations for homepage
   */
  static async getFeaturedDestinations(): Promise<CompleteDestinationData[]> {
    return this.getAllDestinations({ featured: true, withStudentData: true });
  }
}

export default DestinationDataService;
