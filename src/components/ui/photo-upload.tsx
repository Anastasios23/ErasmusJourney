import React, { useCallback, useRef, useState } from "react";
import { Camera, Loader2, Plus, X } from "lucide-react";

import { cn } from "../../lib/utils";

interface PhotoUploadProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
  className?: string;
  compact?: boolean;
}

export function PhotoUpload({
  photos,
  onPhotosChange,
  maxPhotos = 5,
  className,
  compact = false,
}: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) {
        return;
      }

      const remainingSlots = maxPhotos - photos.length;
      if (remainingSlots <= 0) {
        setError(`Maximum ${maxPhotos} photos allowed`);
        return;
      }

      const filesToProcess = Array.from(files).slice(0, remainingSlots);
      setIsUploading(true);
      setError(null);

      const newPhotoUrls: string[] = [];

      for (const file of filesToProcess) {
        if (!file.type.startsWith("image/")) {
          setError("Only image files are allowed");
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          setError("Each image must be less than 5MB");
          continue;
        }

        try {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          const response = await fetch("/api/upload", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              image: base64,
              filename: file.name,
            }),
          });

          const data = await response
            .json()
            .catch(() => ({ success: false, error: "Failed to upload image" }));

          if (response.ok && data.success && data.url) {
            newPhotoUrls.push(data.url);
          } else {
            setError(
              response.status === 401
                ? "Please sign in again to upload photos."
                : data.error || "Failed to upload image",
            );
          }
        } catch (err) {
          console.error("Upload error:", err);
          setError("Failed to upload image");
        }
      }

      if (newPhotoUrls.length > 0) {
        onPhotosChange([...photos, ...newPhotoUrls]);
      }

      setIsUploading(false);
    },
    [maxPhotos, onPhotosChange, photos],
  );

  const handleInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      await handleFiles(event.target.files);
      event.target.value = "";
    },
    [handleFiles],
  );

  const handlePickerKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (isUploading) {
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        fileInputRef.current?.click();
      }
    },
    [isUploading],
  );

  const openFilePicker = useCallback(() => {
    if (isUploading) {
      return;
    }

    fileInputRef.current?.click();
  }, [isUploading]);

  const handleDrag = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.type === "dragenter" || event.type === "dragover") {
      setDragActive(true);
    } else if (event.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setDragActive(false);
      void handleFiles(event.dataTransfer.files);
    },
    [handleFiles],
  );

  const removePhoto = useCallback(
    (index: number) => {
      const newPhotos = photos.filter((_, i) => i !== index);
      onPhotosChange(newPhotos);
    },
    [onPhotosChange, photos],
  );

  const canAddMore = photos.length < maxPhotos;

  return (
    <div className={cn("space-y-4", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleInputChange}
        className="sr-only"
      />

      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((photo, index) => (
            <div
              key={photo}
              className="group relative aspect-square overflow-hidden rounded-xl border-2 border-gray-200 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700"
            >
              <img
                src={photo}
                alt={`Upload ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="rounded-full bg-red-500 p-2 text-white shadow-lg transition-transform hover:scale-110 hover:bg-red-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}

          {canAddMore && (
            <button
              type="button"
              onClick={openFilePicker}
              disabled={isUploading}
              className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 transition-colors hover:border-violet-400 hover:text-violet-500 dark:border-gray-600 dark:hover:border-violet-500"
            >
              {isUploading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <>
                  <Plus className="h-8 w-8" />
                  <span className="text-xs font-medium">Add Photo</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {photos.length === 0 && (
        <div
          role="button"
          tabIndex={isUploading ? -1 : 0}
          aria-label="Select photos"
          onClick={openFilePicker}
          onKeyDown={handlePickerKeyDown}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            "relative block cursor-pointer border-2 border-dashed transition-all duration-300",
            compact ? "rounded-xl p-6 text-left" : "rounded-2xl p-8 text-center",
            dragActive
              ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
              : "border-gray-300 hover:border-violet-400 dark:border-gray-600 dark:hover:border-violet-500",
            isUploading && "pointer-events-none opacity-50",
          )}
        >
          <div
            className={cn(
              "flex gap-4",
              compact
                ? "flex-col sm:flex-row sm:items-center sm:justify-between"
                : "flex-col items-center",
            )}
          >
            <div
              className={cn(
                "rounded-full p-4 transition-colors",
                dragActive
                  ? "bg-violet-100 dark:bg-violet-900/30"
                  : "bg-gray-100 dark:bg-gray-800",
              )}
            >
              {isUploading ? (
                <Loader2
                  className={cn(
                    "animate-spin text-violet-500",
                    compact ? "h-8 w-8" : "h-10 w-10",
                  )}
                />
              ) : (
                <Camera
                  className={cn(
                    "transition-colors",
                    compact ? "h-8 w-8" : "h-10 w-10",
                    dragActive ? "text-violet-500" : "text-gray-400",
                  )}
                />
              )}
            </div>

            <div className={cn("space-y-2", compact && "sm:flex-1")}>
              {compact ? (
                <>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Upload up to {maxPhotos} photos
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    PNG, JPG, GIF up to 5MB each.
                  </p>
                </>
              ) : (
                <>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Share Your Erasmus Memories
                  </h4>
                  <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400">
                    Drag and drop photos here, or click to browse. Share
                    moments from your trip to help future students!
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    PNG, JPG, GIF up to 5MB • Max {maxPhotos} photos
                  </p>
                </>
              )}
            </div>

            <span
              className={cn(
                "inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
                compact
                  ? "border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
                  : "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg hover:from-violet-700 hover:to-fuchsia-700",
              )}
            >
              {isUploading ? "Uploading..." : "Select Photos"}
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <p
        className={cn(
          "text-xs text-gray-400",
          compact ? "text-left" : "text-center",
        )}
      >
        {photos.length} of {maxPhotos} photos uploaded
      </p>
    </div>
  );
}
