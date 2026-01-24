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
import { Icon } from "@iconify/react";

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
          <Icon
            icon="solar:info-circle-bold-duotone"
            className="h-4 w-4 mr-2"
          />
          View {agreements.length} Agreement{agreements.length > 1 ? "s" : ""}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon icon="solar:document-text-bold-duotone" className="h-5 w-5" />
            Exchange Agreements
          </DialogTitle>
          <div className="text-sm text-gray-600">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1">
                <Icon
                  icon="solar:square-academic-cap-bold-duotone"
                  className="h-4 w-4"
                />
                {cyprusUniversity}
              </div>
              <div className="flex items-center gap-1">
                <Icon
                  icon="solar:users-group-rounded-bold-duotone"
                  className="h-4 w-4"
                />
                {department}
              </div>
              {level && level !== "All Levels" && (
                <Badge variant="outline">{level}</Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-sm text-slate-600 leading-relaxed">
              Official bilateral agreements allowing student exchanges between
              <span className="font-semibold text-slate-900"> Cyprus </span>
              and partner institutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agreements.map((agreement, index) => (
              <Card
                key={index}
                className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 group overflow-hidden"
              >
                <CardContent className="p-5">
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <div className="font-bold text-slate-900 text-lg leading-tight">
                      {agreement.partnerUniversity}
                    </div>
                    <div className="shrink-0">
                      {getAgreementTypeBadge(agreement.agreementType)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                    <div className="p-1.5 bg-blue-50 rounded-full text-blue-600">
                      <Icon
                        icon="solar:map-point-bold-duotone"
                        className="w-3.5 h-3.5"
                      />
                    </div>
                    <span className="font-medium">
                      {agreement.partnerCity}, {agreement.partnerCountry}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                    <div>{getLevelBadge(agreement.academicLevel)}</div>
                    {agreement.notes && (
                      <div
                        className="text-xs text-slate-400 italic max-w-[50%] truncate flex items-center gap-1"
                        title={agreement.notes}
                      >
                        <Icon
                          icon="solar:notes-linear"
                          className="w-3 h-3 shrink-0"
                        />
                        {agreement.notes}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600 shrink-0">
                  <Icon
                    icon="solar:info-circle-bold-duotone"
                    className="h-6 w-6"
                  />
                </div>
                <div className="text-sm">
                  <p className="font-bold text-blue-900 mb-1 text-base">
                    Agreement Information
                  </p>
                  <p className="text-blue-700/80 leading-relaxed">
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
              <Icon
                icon="solar:link-circle-bold-duotone"
                className="h-4 w-4 mr-2"
              />
              Contact International Office
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
