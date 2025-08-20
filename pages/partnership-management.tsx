import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import { Button } from "../src/components/ui/button";
import { Badge } from "../src/components/ui/badge";
import { Input } from "../src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../src/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../src/components/ui/dialog";
import { PartnershipListSkeleton } from "../src/components/ui/skeleton";
import { ErrorBoundary } from "../src/components/ui/error-boundary";
import { LoadingButton } from "../src/components/ui/loading-provider";
import {
  useSuccessToast,
  useErrorToast,
} from "../src/components/ui/toast-provider";
import {
  Loader2,
  Plus,
  Building,
  MapPin,
  Users,
  Star,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
} from "lucide-react";

interface Partnership {
  id: string;
  homeUniversityName: string;
  partnerUniversityName: string;
  partnerCity: string;
  partnerCountry: string;
  agreementType: string;
  fieldOfStudy?: string;
  isActive: boolean;
  totalSubmissions: number;
  averageRating?: number;
  averageAcademicRating?: number;
  lastSubmissionDate?: Date;
  needsAttention: boolean;
}

function usePartnerships() {
  return useQuery<Partnership[]>({
    queryKey: ["partnerships"],
    queryFn: async () => {
      const response = await fetch("/api/admin/partnerships");
      if (!response.ok) {
        throw new Error("Failed to fetch partnerships");
      }
      return response.json();
    },
  });
}

function useCreatePartnership() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (partnershipData: Partial<Partnership>) => {
      const response = await fetch("/api/admin/partnerships", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(partnershipData),
      });

      if (!response.ok) {
        throw new Error("Failed to create partnership");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partnerships"] });
      toast({
        title: "Success",
        description: "Partnership created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create partnership",
        variant: "destructive",
      });
    },
  });
}

function useToast() {
  const showSuccessToast = useSuccessToast();
  const showErrorToast = useErrorToast();

  return {
    toast: ({
      title,
      description,
      variant,
    }: {
      title: string;
      description: string;
      variant?: "destructive" | "default";
    }) => {
      if (variant === "destructive") {
        showErrorToast(description);
      } else {
        showSuccessToast(description);
      }
    },
  };
}

// Add default export for Next.js page
export default function PartnershipManagement() {
  return (
    <div className="container mx-auto py-10">
      {/* TODO: Implement PartnershipManagementContent or use correct component */}
      {/* <PartnershipManagementContent /> */}
    </div>
  );
}
