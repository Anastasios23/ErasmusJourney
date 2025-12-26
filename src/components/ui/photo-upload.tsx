import { useState, useCallback, useRef } from "react";
import {
  Camera,
  X,
  Upload,
  Loader2,
  Image as ImageIcon,
  Plus,
} from "lucide-react";
import { Button } from "./button";
import { cn } from "../../lib/utils";

interface PhotoUploadProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
  className?: string;
}

export function PhotoUpload({
  photos,
  onPhotosChange,
  maxPhotos = 5,
  className,
}: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

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
        // Validate file type
        if (!file.type.startsWith("image/")) {
          setError("Only image files are allowed");
          continue;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError("Each image must be less than 5MB");
          continue;
        }

        try {
          // Convert to base64
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          // Upload to server
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

          const data = await response.json();

          if (data.success && data.url) {
            newPhotoUrls.push(data.url);
          } else {
            setError(data.error || "Failed to upload image");
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
    [photos, onPhotosChange, maxPhotos],
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const removePhoto = useCallback(
    (index: number) => {
      const newPhotos = photos.filter((_, i) => i !== index);
      onPhotosChange(newPhotos);
    },
    [photos, onPhotosChange],
  );

  const canAddMore = photos.length < maxPhotos;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <div
              key={photo}
              className="relative group aspect-square rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
            >
              <img
                src={photo}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => removePhoto(index)}
                  className="p-2 bg-red-500 hover:bg-red-600 rounded-full text-white shadow-lg transform hover:scale-110 transition-transform"
                  type="button"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}

          {/* Add More Button */}
          {canAddMore && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              type="button"
              className="aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-violet-400 dark:hover:border-violet-500 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-violet-500 transition-colors"
            >
              {isUploading ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <>
                  <Plus className="w-8 h-8" />
                  <span className="text-xs font-medium">Add Photo</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Upload Zone (shown when no photos) */}
      {photos.length === 0 && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            "relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300",
            dragActive
              ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
              : "border-gray-300 dark:border-gray-600 hover:border-violet-400 dark:hover:border-violet-500",
            isUploading && "opacity-50 pointer-events-none",
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-4">
            <div
              className={cn(
                "p-4 rounded-full transition-colors",
                dragActive
                  ? "bg-violet-100 dark:bg-violet-900/30"
                  : "bg-gray-100 dark:bg-gray-800",
              )}
            >
              {isUploading ? (
                <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
              ) : (
                <Camera
                  className={cn(
                    "w-10 h-10 transition-colors",
                    dragActive ? "text-violet-500" : "text-gray-400",
                  )}
                />
              )}
            </div>

            <div className="space-y-2">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                Share Your Erasmus Memories
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                Drag and drop photos here, or click to browse. Share moments
                from your trip to help future students!
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                PNG, JPG, GIF up to 5MB • Max {maxPhotos} photos
              </p>
            </div>

            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-lg"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? "Uploading..." : "Select Photos"}
            </Button>
          </div>
        </div>
      )}

      {/* Hidden file input for "Add More" button */}
      {photos.length > 0 && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Photo Count */}
      <p className="text-xs text-gray-400 text-center">
        {photos.length} of {maxPhotos} photos uploaded
      </p>
    </div>
  );
}
