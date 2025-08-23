import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

import Head from "next/head";
import { useRouter } from "next/router";
import Header from "../components/Header";
import { Button } from "../src/components/ui/button";
import { Input } from "../src/components/ui/input";
import { Label } from "../src/components/ui/label";
import { Switch } from "../src/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../src/components/ui/select";
import { Separator } from "../src/components/ui/separator";
import {
  Settings,
  Bell,
  Shield,
  User,
  Mail,
  Trash2,
  Download,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  // AUTHENTICATION DISABLED - Comment out to re-enable
  // const { data: session, status } = useSession();
  const session = { user: { id: 'anonymous', name: 'Anonymous User', email: 'anonymous@example.com' } };
  const status = 'authenticated';
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // AUTHENTICATION DISABLED - Comment out to re-enable
  // Redirect to login if not authenticated
  // useEffect(() => {
  //   if (status === "unauthenticated") {
  //     router.push("/login?callbackUrl=/settings");
  //   }
  // }, [status, router]);

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    applicationReminders: true,
    marketingEmails: false,
    language: "en",
    timezone: "Europe/Nicosia",
    twoFactorAuth: false,
  });

  // Load user settings from API or local storage
  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      // In a real app, you'd fetch from your API
      const savedSettings = localStorage.getItem("userSettings");
      if (savedSettings) {
        setSettings({ ...settings, ...JSON.parse(savedSettings) });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  // Authentication temporarily disabled

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    // Save to localStorage (in a real app, you'd save to your API)
    localStorage.setItem("userSettings", JSON.stringify(newSettings));
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // In a real app, you'd save to your API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      // In a real app, you'd fetch user data from your API
      const userData = {
        profile: session.user,
        settings: settings,
        exportDate: new Date().toISOString(),
      };

      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `erasmus-journey-data-${new Date().toISOString().split("T")[0]}.json`;
      link.click();

      URL.revokeObjectURL(url);
      toast.success("Data exported successfully!");
    } catch (error) {
      toast.error("Failed to export data. Please try again.");
    }
  };

  const handleDeleteAccount = async () => {
    if (
      confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      )
    ) {
      try {
        // In a real app, you'd call your API to delete the account
        toast.success(
          "Account deletion requested. You will receive a confirmation email.",
        );
        await signOut({ callbackUrl: "/" });
      } catch (error) {
        toast.error("Failed to delete account. Please try again.");
      }
    }
  };

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <>
        <Head>
          <title>Settings - Erasmus Journey Platform</title>
          <meta
            name="description"
            content="Manage your account settings and preferences"
          />
        </Head>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="pt-20 pb-16 px-4">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="space-y-8">
                  <div className="h-64 bg-gray-200 rounded"></div>
                  <div className="h-48 bg-gray-200 rounded"></div>
                  <div className="h-48 bg-gray-200 rounded"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // AUTHENTICATION DISABLED - Comment out to re-enable
  // Don't render if not authenticated (will redirect)
  // if (!session) {
  //   return null;
  // }

  return (
    <>
      <Head>
        <title>Settings - Erasmus Journey Platform</title>
        <meta
          name="description"
          content="Manage your account settings and preferences"
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="pt-20 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Settings
              </h1>
              <p className="text-gray-600">
                Manage your account settings and preferences
              </p>
            </div>

            <div className="space-y-8">
              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="emailNotifications">
                        Email Notifications
                      </Label>
                      <p className="text-sm text-gray-600">
                        Receive important updates and reminders via email
                      </p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) =>
                        handleSettingChange("emailNotifications", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="pushNotifications">
                        Push Notifications
                      </Label>
                      <p className="text-sm text-gray-600">
                        Receive push notifications in your browser
                      </p>
                    </div>
                    <Switch
                      id="pushNotifications"
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) =>
                        handleSettingChange("pushNotifications", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="applicationReminders">
                        Application Reminders
                      </Label>
                      <p className="text-sm text-gray-600">
                        Get reminders about application deadlines and progress
                      </p>
                    </div>
                    <Switch
                      id="applicationReminders"
                      checked={settings.applicationReminders}
                      onCheckedChange={(checked) =>
                        handleSettingChange("applicationReminders", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="marketingEmails">Marketing Emails</Label>
                      <p className="text-sm text-gray-600">
                        Receive promotional emails and program updates
                      </p>
                    </div>
                    <Switch
                      id="marketingEmails"
                      checked={settings.marketingEmails}
                      onCheckedChange={(checked) =>
                        handleSettingChange("marketingEmails", checked)
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select
                        value={settings.language}
                        onValueChange={(value) =>
                          handleSettingChange("language", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="el">Greek</SelectItem>
                          <SelectItem value="tr">Turkish</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select
                        value={settings.timezone}
                        onValueChange={(value) =>
                          handleSettingChange("timezone", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Europe/Nicosia">
                            Europe/Nicosia
                          </SelectItem>
                          <SelectItem value="Europe/Athens">
                            Europe/Athens
                          </SelectItem>
                          <SelectItem value="Europe/Istanbul">
                            Europe/Istanbul
                          </SelectItem>
                          <SelectItem value="Europe/London">
                            Europe/London
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="twoFactorAuth">
                        Two-Factor Authentication
                      </Label>
                      <p className="text-sm text-gray-600">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch
                      id="twoFactorAuth"
                      checked={settings.twoFactorAuth}
                      onCheckedChange={(checked) =>
                        handleSettingChange("twoFactorAuth", checked)
                      }
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div>
                      <Label>Change Password</Label>
                      <p className="text-sm text-gray-600 mb-3">
                        Update your password to keep your account secure
                      </p>
                      <Button variant="outline">Change Password</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Data & Privacy */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Data & Privacy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Export Your Data</Label>
                      <p className="text-sm text-gray-600 mb-3">
                        Download a copy of all your data stored in our platform
                      </p>
                      <Button variant="outline" onClick={handleExportData}>
                        <Download className="h-4 w-4 mr-2" />
                        Export Data
                      </Button>
                    </div>

                    <Separator />

                    <div>
                      <Label className="text-red-600">Delete Account</Label>
                      <p className="text-sm text-gray-600 mb-3">
                        Permanently delete your account and all associated data
                      </p>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Save Settings */}
              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={() => router.push("/profile")}
                >
                  Back to Profile
                </Button>
                <Button onClick={handleSaveSettings} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
