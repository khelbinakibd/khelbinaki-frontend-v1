// Image Utilities for Optimization and Loading
import { APP_CONFIG } from "../Config/constants";

export interface ImageLoadOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

// Validate image file
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  const allowedTypes: string[] = [...APP_CONFIG.ALLOWED_IMAGE_TYPES];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedTypes.join(", ")}`,
    };
  }

  // Check file size
  if (file.size > APP_CONFIG.MAX_IMAGE_SIZE) {
    const maxSizeMB = APP_CONFIG.MAX_IMAGE_SIZE / (1024 * 1024);
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
}

// Convert file to base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

// Compress image
export function compressImage(
  file: File,
  options: ImageLoadOptions = {}
): Promise<File> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        // Calculate new dimensions maintaining aspect ratio
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Image compression failed"));
              return;
            }

            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

// Generate image preview URL
export function getImagePreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

// Clean up preview URL
export function revokeImagePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}

// Get optimized image URL with Cloudinary or similar CDN transformations
export function getOptimizedImageUrl(url: string): string {
  // If it's a data URL or blob, return as is
  if (url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }

  // If using a CDN like Cloudinary, you can add transformations here
  // For now, return original URL
  return url;
}

// Lazy load image with IntersectionObserver
export function lazyLoadImage(
  img: HTMLImageElement,
  src: string,
  onLoad?: () => void,
  onError?: () => void
): () => void {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        img.src = src;
        img.onload = () => {
          img.classList.add("loaded");
          onLoad?.();
        };
        img.onerror = () => onError?.();
        observer.disconnect();
      }
    });
  });

  observer.observe(img);

  // Return cleanup function
  return () => observer.disconnect();
}

// Get image dimensions
export function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.width,
        height: img.height,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// Check if image exists at URL
export async function checkImageExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
}

// Placeholder image data URL (1x1 transparent pixel)
export const PLACEHOLDER_IMAGE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

// Default fallback image for missing images
export const FALLBACK_IMAGE = "/images/placeholder-turf.jpg";
