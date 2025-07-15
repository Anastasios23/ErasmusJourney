import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../src/components/ui/card";
import { Button } from "../../src/components/ui/button";
import { Badge } from "../../src/components/ui/badge";
import {
  MessageCircle,
  Phone,
  Mail,
  Users,
  MapPin,
  Clock,
  Globe,
} from "lucide-react";

interface ContactInfo {
  id: string;
  type: "student" | "housing-office" | "emergency";
  name: string;
  role: string;
  city: string;
  country: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  telegram?: string;
  hours?: string;
  languages?: string[];
  description: string;
  verified: boolean;
}

const contacts: ContactInfo[] = [
  {
    id: "student-barcelona-1",
    type: "student",
    name: "Maria S.",
    role: "Current Student",
    city: "Barcelona",
    country: "Spain",
    email: "maria.s@student.com",
    whatsapp: "+34-xxx-xxx-xxx",
    telegram: "@maria_bcn",
    languages: ["English", "Spanish", "Greek"],
    description:
      "UCY student in Barcelona. Happy to help with accommodation questions!",
    verified: true,
  },
  {
    id: "student-prague-1",
    type: "student",
    name: "Dimitris K.",
    role: "Exchange Student",
    city: "Prague",
    country: "Czech Republic",
    email: "dimitris.k@erasmus.cz",
    whatsapp: "+420-xxx-xxx-xxx",
    languages: ["English", "Czech", "Greek"],
    description:
      "CUT student at Charles University. Can help with housing and city info.",
    verified: true,
  },
  {
    id: "housing-barcelona",
    type: "housing-office",
    name: "UPC Housing Office",
    role: "University Housing",
    city: "Barcelona",
    country: "Spain",
    email: "housing@upc.edu",
    phone: "+34 93 401 6200",
    hours: "Mon-Fri 9:00-17:00",
    languages: ["Spanish", "English", "Catalan"],
    description:
      "Official housing office for UPC students. Handles dormitory applications.",
    verified: true,
  },
  {
    id: "housing-prague",
    type: "housing-office",
    name: "Charles University Accommodation",
    role: "Student Services",
    city: "Prague",
    country: "Czech Republic",
    email: "accommodation@cuni.cz",
    phone: "+420 224 491 850",
    hours: "Mon-Fri 8:00-16:00",
    languages: ["Czech", "English"],
    description:
      "Manages student accommodation for Charles University international students.",
    verified: true,
  },
  {
    id: "emergency-spain",
    type: "emergency",
    name: "Spain Emergency Services",
    role: "Emergency Contact",
    city: "Barcelona",
    country: "Spain",
    phone: "112",
    hours: "24/7",
    languages: ["Spanish", "English"],
    description:
      "General emergency number for Spain. Police, fire, medical emergencies.",
    verified: true,
  },
  {
    id: "emergency-czech",
    type: "emergency",
    name: "Czech Emergency Services",
    role: "Emergency Contact",
    city: "Prague",
    country: "Czech Republic",
    phone: "112",
    hours: "24/7",
    languages: ["Czech", "English"],
    description: "General emergency number for Czech Republic.",
    verified: true,
  },
];

interface ContactIntegrationProps {
  userCity?: string;
  userCountry?: string;
}

export default function ContactIntegration({
  userCity,
  userCountry,
}: ContactIntegrationProps) {
  const [selectedTab, setSelectedTab] = useState<
    "students" | "housing" | "emergency"
  >("students");

  const filteredContacts = contacts.filter((contact) => {
    if (userCity && contact.city.toLowerCase() !== userCity.toLowerCase()) {
      return false;
    }
    if (
      userCountry &&
      contact.country.toLowerCase() !== userCountry.toLowerCase()
    ) {
      return false;
    }
    return (
      contact.type === selectedTab ||
      (selectedTab === "students" && contact.type === "student")
    );
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "student":
        return <Users className="h-4 w-4" />;
      case "housing-office":
        return <MapPin className="h-4 w-4" />;
      case "emergency":
        return <Phone className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "student":
        return "bg-blue-100 text-blue-800";
      case "housing-office":
        return "bg-green-100 text-green-800";
      case "emergency":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleContact = (
    contact: ContactInfo,
    method: "email" | "whatsapp" | "telegram" | "phone",
  ) => {
    switch (method) {
      case "email":
        if (contact.email) {
          window.open(
            `mailto:${contact.email}?subject=Accommodation Question&body=Hi ${contact.name},%0A%0AI found your contact through the Erasmus platform and would like to ask about accommodation in ${contact.city}.%0A%0AThank you!`,
          );
        }
        break;
      case "whatsapp":
        if (contact.whatsapp) {
          const phone = contact.whatsapp.replace(/[^0-9]/g, "");
          window.open(
            `https://wa.me/${phone}?text=Hi! I found your contact through the Erasmus platform. I'm looking for accommodation in ${contact.city} and would love to get some advice.`,
          );
        }
        break;
      case "telegram":
        if (contact.telegram) {
          window.open(`https://t.me/${contact.telegram.replace("@", "")}`);
        }
        break;
      case "phone":
        if (contact.phone) {
          window.open(`tel:${contact.phone}`);
        }
        break;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Live Support & Contacts
        </CardTitle>
        <p className="text-sm text-gray-600">
          Connect with current students and official housing services
        </p>
      </CardHeader>
      <CardContent>
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={selectedTab === "students" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTab("students")}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Students
          </Button>
          <Button
            variant={selectedTab === "housing" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTab("housing")}
            className="flex items-center gap-2"
          >
            <MapPin className="h-4 w-4" />
            Housing Offices
          </Button>
          <Button
            variant={selectedTab === "emergency" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTab("emergency")}
            className="flex items-center gap-2"
          >
            <Phone className="h-4 w-4" />
            Emergency
          </Button>
        </div>

        {/* Contact List */}
        <div className="space-y-4">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{contact.name}</h3>
                    {contact.verified && (
                      <Badge variant="secondary" className="text-xs">
                        ✓ Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Badge className={getTypeColor(contact.type)}>
                      {getTypeIcon(contact.type)}
                      <span className="ml-1">{contact.role}</span>
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-3 w-3" />
                    <span>
                      {contact.city}, {contact.country}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-700 mb-3">
                {contact.description}
              </p>

              {/* Contact Methods */}
              <div className="flex flex-wrap gap-2 mb-3">
                {contact.email && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleContact(contact, "email")}
                    className="flex items-center gap-1"
                  >
                    <Mail className="h-3 w-3" />
                    Email
                  </Button>
                )}
                {contact.whatsapp && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleContact(contact, "whatsapp")}
                    className="flex items-center gap-1 text-green-600"
                  >
                    <MessageCircle className="h-3 w-3" />
                    WhatsApp
                  </Button>
                )}
                {contact.telegram && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleContact(contact, "telegram")}
                    className="flex items-center gap-1 text-blue-600"
                  >
                    <MessageCircle className="h-3 w-3" />
                    Telegram
                  </Button>
                )}
                {contact.phone && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleContact(contact, "phone")}
                    className="flex items-center gap-1"
                  >
                    <Phone className="h-3 w-3" />
                    Call
                  </Button>
                )}
              </div>

              {/* Additional Info */}
              <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                {contact.hours && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{contact.hours}</span>
                  </div>
                )}
                {contact.languages && contact.languages.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    <span>{contact.languages.join(", ")}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredContacts.length === 0 && (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {userCity || userCountry
                ? `No contacts available for ${userCity || userCountry} yet.`
                : "Select your destination to see available contacts."}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              We're constantly adding new student contacts and housing offices.
            </p>
          </div>
        )}

        {/* Live Chat CTA */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            <h4 className="font-medium text-blue-900">Need Immediate Help?</h4>
          </div>
          <p className="text-sm text-blue-800 mb-3">
            Our support team is available to help you with accommodation
            questions.
          </p>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            Start Live Chat
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
