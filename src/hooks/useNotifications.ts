import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "info",
    title: "Welcome to Erasmus Journey!",
    message: "Complete your profile to get personalized recommendations.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    read: false,
    actionUrl: "/profile",
    actionLabel: "Complete Profile",
  },
  {
    id: "2",
    type: "success",
    title: "Application Progress",
    message: "Your basic information has been saved successfully.",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    read: false,
    actionUrl: "/dashboard",
    actionLabel: "View Progress",
  },
  {
    id: "3",
    type: "warning",
    title: "Action Required",
    message: "Don't forget to submit your course matching preferences.",
    timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
    read: false,
    actionUrl: "/course-matching",
    actionLabel: "Continue Application",
  },
];

export function useNotifications() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Load notifications
  useEffect(() => {
    if (session?.user) {
      // In a real app, fetch from API
      // For now, use mock data
      setTimeout(() => {
        setNotifications(mockNotifications);
        setLoading(false);
      }, 500);
    } else {
      setNotifications([]);
      setLoading(false);
    }
  }, [session]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification,
      ),
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true })),
    );
  }, []);

  const removeNotification = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId),
    );
  }, []);

  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "timestamp">) => {
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString(),
        timestamp: new Date(),
      };
      setNotifications((prev) => [newNotification, ...prev]);
    },
    [],
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    addNotification,
  };
}
