import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Types
interface AccommodationListing {
  id: string;
  studentName: string;
  accommodationType: string;
  city: string;
  country: string;
  neighborhood: string;
  monthlyRent: number;
  rating: number;
  datePosted: string;
  description: string;
  highlights: string[];
  contact: {
    email?: string;
    phone?: string;
    allowContact: boolean;
  };
  facilities: string[];
  nearbyAmenities: string[];
  transportLinks: string;
  photos: string[];
  verified: boolean;
  featured: boolean;
}

interface Story {
  id: string;
  title: string;
  excerpt: string;
  author: {
    firstName: string;
    lastName: string;
    avatar: string;
  };
  university: string;
  country: string;
  city: string;
  category: string;
  likes: number;
  views: number;
  createdAt: string;
  image: string;
}

interface University {
  id: string;
  name: string;
  shortName: string;
  type: string;
  country: string;
  city: string;
  _count: {
    faculties: number;
    homeAgreements: number;
  };
}

// Sample data generators (replace with actual API calls)
const generateAccommodations = (filters?: {
  search?: string;
  city?: string;
  country?: string;
  type?: string;
  maxBudget?: number;
  minRating?: number;
}): AccommodationListing[] => {
  const baseAccommodations: AccommodationListing[] = [
    {
      id: "1",
      studentName: "Maria S.",
      accommodationType: "Private Apartment",
      city: "Barcelona",
      country: "Spain",
      neighborhood: "Eixample",
      monthlyRent: 850,
      rating: 5,
      datePosted: "2024-01-15",
      description:
        "Beautiful 1-bedroom apartment in the heart of Barcelona, 10 minutes walk to UPC. Fully furnished with modern amenities.",
      highlights: [
        "Close to university",
        "Modern furnishing",
        "Great location",
      ],
      contact: { email: "maria.s@university.edu", allowContact: true },
      facilities: ["Wifi", "Kitchen", "Washing Machine", "Air Conditioning"],
      nearbyAmenities: ["Supermarket", "Metro", "Restaurants", "Pharmacy"],
      transportLinks: "Metro L2 - 5 min walk, Bus 24 - 2 min walk",
      photos: [
        "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop",
      ],
      verified: true,
      featured: true,
    },
    {
      id: "2",
      studentName: "Andreas M.",
      accommodationType: "Student Residence",
      city: "Prague",
      country: "Czech Republic",
      neighborhood: "New Town",
      monthlyRent: 450,
      rating: 4,
      datePosted: "2024-01-12",
      description:
        "Modern student residence with great facilities and international community.",
      highlights: ["Student community", "Affordable price", "Good facilities"],
      contact: { email: "andreas.m@uni.cz", allowContact: true },
      facilities: ["Wifi", "Shared Kitchen", "Gym", "Study Room", "Laundry"],
      nearbyAmenities: ["Tram Stop", "Shopping Center", "Park", "Library"],
      transportLinks: "Tram 22 - direct to university (15 min)",
      photos: [
        "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop",
      ],
      verified: true,
      featured: false,
    },
    {
      id: "3",
      studentName: "Elena K.",
      accommodationType: "Shared Apartment",
      city: "Paris",
      country: "France",
      neighborhood: "Latin Quarter",
      monthlyRent: 700,
      rating: 4,
      datePosted: "2024-01-10",
      description:
        "Charming shared apartment in the Latin Quarter, walking distance to Sorbonne.",
      highlights: ["Historic location", "Walking to university"],
      contact: { allowContact: false },
      facilities: ["Wifi", "Shared Kitchen", "Shared Bathroom"],
      nearbyAmenities: ["University", "Metro", "Cafes", "Bookshops"],
      transportLinks: "Walking distance to Sorbonne, Metro Saint-Michel",
      photos: [
        "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop",
      ],
      verified: true,
      featured: false,
    },
    {
      id: "4",
      studentName: "Luca R.",
      accommodationType: "Studio Apartment",
      city: "Milan",
      country: "Italy",
      neighborhood: "Brera",
      monthlyRent: 950,
      rating: 5,
      datePosted: "2024-01-08",
      description:
        "Modern studio in the artistic Brera district, close to Bocconi University.",
      highlights: ["Arts district", "Close to university", "Modern"],
      contact: { email: "luca.r@bocconi.it", allowContact: true },
      facilities: ["Wifi", "Kitchen", "Private Bathroom", "AC"],
      nearbyAmenities: ["Art Galleries", "Metro", "Restaurants", "Shopping"],
      transportLinks: "Metro M2 - 8 min walk to Bocconi",
      photos: [
        "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop",
      ],
      verified: true,
      featured: true,
    },
  ];

  if (!filters) return baseAccommodations;

  return baseAccommodations.filter((item) => {
    const matchesSearch =
      !filters.search ||
      item.studentName.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.city.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.neighborhood.toLowerCase().includes(filters.search.toLowerCase());

    const matchesCity =
      !filters.city ||
      filters.city === "all-cities" ||
      item.city === filters.city;

    const matchesCountry =
      !filters.country ||
      filters.country === "all-countries" ||
      item.country === filters.country;

    const matchesType =
      !filters.type ||
      filters.type === "all-types" ||
      item.accommodationType === filters.type;

    const matchesBudget =
      !filters.maxBudget || item.monthlyRent <= filters.maxBudget;

    const matchesRating =
      !filters.minRating || item.rating >= filters.minRating;

    return (
      matchesSearch &&
      matchesCity &&
      matchesCountry &&
      matchesType &&
      matchesBudget &&
      matchesRating
    );
  });
};

const generateStories = (filters?: {
  search?: string;
  category?: string;
}): Story[] => {
  const baseStories: Story[] = [
    {
      id: "1",
      title: "My Amazing Semester in Barcelona",
      excerpt:
        "Studying at UPC Barcelona was a life-changing experience. The city's vibrant culture, amazing architecture, and friendly locals made my Erasmus journey unforgettable.",
      author: {
        firstName: "Maria",
        lastName: "K.",
        avatar:
          "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face",
      },
      university: "Universitat Politècnica de Catalunya",
      country: "Spain",
      city: "Barcelona",
      category: "EXPERIENCE",
      likes: 45,
      views: 230,
      createdAt: "2024-01-15",
      image:
        "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400&h=200&fit=crop",
    },
    {
      id: "2",
      title: "Finding the Perfect Student Accommodation in Prague",
      excerpt:
        "Tips and tricks for finding affordable, comfortable housing in Prague. From dorms to shared apartments, here's what I learned during my search.",
      author: {
        firstName: "Andreas",
        lastName: "M.",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      },
      university: "Charles University",
      country: "Czech Republic",
      city: "Prague",
      category: "ACCOMMODATION",
      likes: 32,
      views: 145,
      createdAt: "2024-01-10",
      image:
        "https://images.unsplash.com/photo-1542324151-ee2b73cb0d95?w=400&h=200&fit=crop",
    },
    {
      id: "3",
      title: "Navigating Academic Life at Sorbonne University",
      excerpt:
        "From enrollment to exams, here's everything you need to know about the academic system in France and how to make the most of your studies.",
      author: {
        firstName: "Elena",
        lastName: "P.",
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
      },
      university: "Sorbonne University",
      country: "France",
      city: "Paris",
      category: "ACADEMICS",
      likes: 28,
      views: 98,
      createdAt: "2024-01-08",
      image:
        "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&h=200&fit=crop",
    },
    {
      id: "4",
      title: "Cultural Adventures in Rome",
      excerpt:
        "Discovering the eternal city while studying at Sapienza University. Art, history, and incredible food at every corner.",
      author: {
        firstName: "Giovanni",
        lastName: "B.",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      },
      university: "Sapienza University",
      country: "Italy",
      city: "Rome",
      category: "CULTURE",
      likes: 38,
      views: 156,
      createdAt: "2024-01-05",
      image:
        "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=400&h=200&fit=crop",
    },
  ];

  if (!filters) return baseStories;

  return baseStories.filter((item) => {
    const matchesSearch =
      !filters.search ||
      item.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.city.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.excerpt.toLowerCase().includes(filters.search.toLowerCase());

    const matchesCategory =
      !filters.category ||
      filters.category === "all" ||
      item.category.toLowerCase() === filters.category.toLowerCase();

    return matchesSearch && matchesCategory;
  });
};

// Query Hooks
export function useAccommodations(filters?: {
  search?: string;
  city?: string;
  country?: string;
  type?: string;
  maxBudget?: number;
  minRating?: number;
}) {
  return useQuery({
    queryKey: ["accommodations", filters],
    queryFn: () => generateAccommodations(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useStories(filters?: { search?: string; category?: string }) {
  return useQuery({
    queryKey: ["stories", filters],
    queryFn: () => generateStories(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUniversities() {
  return useQuery({
    queryKey: ["universities"],
    queryFn: async (): Promise<University[]> => {
      // In a real app, this would be an API call
      // For now, return sample data
      return [
        {
          id: "ucy",
          name: "University of Cyprus",
          shortName: "UCY",
          type: "PUBLIC",
          country: "Cyprus",
          city: "Nicosia",
          _count: { faculties: 8, homeAgreements: 150 },
        },
        {
          id: "unic",
          name: "University of Nicosia",
          shortName: "UNIC",
          type: "PRIVATE",
          country: "Cyprus",
          city: "Nicosia",
          _count: { faculties: 6, homeAgreements: 85 },
        },
        {
          id: "frederick",
          name: "Frederick University",
          shortName: "Frederick",
          type: "PRIVATE",
          country: "Cyprus",
          city: "Nicosia",
          _count: { faculties: 5, homeAgreements: 45 },
        },
        {
          id: "euc",
          name: "European University Cyprus",
          shortName: "EUC",
          type: "PRIVATE",
          country: "Cyprus",
          city: "Nicosia",
          _count: { faculties: 4, homeAgreements: 38 },
        },
      ];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Mutation Hooks
export function useLikeStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ storyId }: { storyId: string }) => {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { success: true };
    },
    onSuccess: () => {
      // Invalidate and refetch stories
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });
}

export function useContactStudent() {
  return useMutation({
    mutationFn: async ({
      studentEmail,
      subject,
      message,
    }: {
      studentEmail: string;
      subject: string;
      message: string;
    }) => {
      // In a real app, this would send an email or message
      window.location.href = `mailto:${studentEmail}?subject=${encodeURIComponent(
        subject,
      )}&body=${encodeURIComponent(message)}`;
      return { success: true };
    },
  });
}
