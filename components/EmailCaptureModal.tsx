"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { Card, CardContent } from "../src/components/ui/card";
import { Button } from "../src/components/ui/button";
import { X } from "lucide-react";

interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

const EmailCaptureModal = ({
  isOpen,
  onClose,
  title = "Join Our Community",
  description = "Get access to hundreds of authentic student experiences and accommodation reviews.",
}: EmailCaptureModalProps) => {
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLInputElement>(null);
  const lastFocusableRef = useRef<HTMLButtonElement>(null);

  // Handle escape key and focus trapping
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      // Focus trapping
      if (event.key === "Tab") {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );

        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        if (event.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Focus the first focusable element when modal opens
    setTimeout(() => {
      firstFocusableRef.current?.focus();
    }, 100);

    // Prevent background scrolling
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleSignUpContinue = () => {
    onClose();
    router.push("/login");
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Card className="w-full max-w-md mx-4" ref={modalRef}>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 id="modal-title" className="text-xl font-bold text-gray-900">
              {title}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
              aria-label="Close modal"
              ref={lastFocusableRef}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          <p id="modal-description" className="text-gray-600 mb-6">
            {description}
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="email-input" className="sr-only">
                Email address
              </label>
              <input
                id="email-input"
                ref={firstFocusableRef}
                type="email"
                placeholder="Your email address"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-describedby="email-help"
              />
              <p id="email-help" className="sr-only">
                Enter your email address to join our community
              </p>
            </div>

            <div>
              <label htmlFor="university-select" className="sr-only">
                Select your university
              </label>
              <select
                id="university-select"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select your university</option>
                <option value="ucy">University of Cyprus</option>
                <option value="cut">Cyprus University of Technology</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex space-x-3">
              <Button onClick={handleSignUpContinue} className="flex-1">
                Sign Up & Continue
              </Button>
              <Button variant="outline" onClick={onClose} className="flex-1">
                Maybe Later
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailCaptureModal;
