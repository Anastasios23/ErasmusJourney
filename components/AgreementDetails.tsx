import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import { Button } from "../src/components/ui/button";
import { Badge } from "../src/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../src/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../src/components/ui/table";
import {
  Info,
  MapPin,
  GraduationCap,
  Users,
  FileText,
  ExternalLink,
} from "lucide-react";

interface Agreement {
  homeUniversity: string;
  homeDepartment: string;
  partnerUniversity: string;
  partnerCity: string;
  partnerCountry: string;
  academicLevel?: string;
  agreementType?: string;
  notes?: string;
}

interface AgreementDetailsProps {
  agreements: Agreement[];
  cyprusUniversity: string;
  department: string;
  level?: string;
}

export default function AgreementDetails({
  agreements,
  cyprusUniversity,
  department,
  level,
}: AgreementDetailsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getAgreementTypeBadge = (type?: string) => {
    switch (type) {
      case "student":
        return (
          <Badge className="bg-blue-100 text-blue-800">Student Exchange</Badge>
        );
      case "staff":
        return (
          <Badge className="bg-green-100 text-green-800">Staff Exchange</Badge>
        );
      case "both":
        return (
          <Badge className="bg-purple-100 text-purple-800">
            Student & Staff
          </Badge>
        );
      case "traineeship":
        return (
          <Badge className="bg-orange-100 text-orange-800">Traineeship</Badge>
        );
      default:
        return <Badge variant="secondary">Exchange</Badge>;
    }
  };

  const getLevelBadge = (academicLevel?: string) => {
    if (!academicLevel || academicLevel === "all") return null;

    const colors = {
      bachelor: "bg-green-100 text-green-800",
      master: "bg-blue-100 text-blue-800",
      phd: "bg-purple-100 text-purple-800",
    };

    return (
      <Badge
        className={
          colors[academicLevel as keyof typeof colors] ||
          "bg-gray-100 text-gray-800"
        }
      >
        {academicLevel.toUpperCase()}
      </Badge>
    );
  };

  if (agreements.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Info className="h-4 w-4 mr-2" />
          View {agreements.length} Agreement{agreements.length > 1 ? "s" : ""}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Exchange Agreements
          </DialogTitle>
          <div className="text-sm text-gray-600">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1">
                <GraduationCap className="h-4 w-4" />
                {cyprusUniversity}
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {department}
              </div>
              {level && level !== "All Levels" && (
                <Badge variant="outline">{level}</Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Official bilateral agreements allowing student exchanges between
            Cyprus and partner institutions.
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner University</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agreements.map((agreement, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {agreement.partnerUniversity}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      {agreement.partnerCity}, {agreement.partnerCountry}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getAgreementTypeBadge(agreement.agreementType)}
                  </TableCell>
                  <TableCell>
                    {getLevelBadge(agreement.academicLevel)}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    {agreement.notes && (
                      <div
                        className="text-xs text-gray-600 truncate"
                        title={agreement.notes}
                      >
                        {agreement.notes}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 mb-1">
                    Agreement Information
                  </p>
                  <p className="text-blue-700">
                    These are official bilateral agreements that allow student
                    mobility. Each agreement specifies the terms, duration, and
                    academic levels supported. Contact your international office
                    for specific application procedures and requirements.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
            <Button>
              <ExternalLink className="h-4 w-4 mr-2" />
              Contact International Office
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
