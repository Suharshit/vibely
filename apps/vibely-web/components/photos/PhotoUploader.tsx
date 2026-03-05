"use client";

// ============================================================
// apps/web/components/photos/PhotoUploader.tsx
// ============================================================
// Drag-and-drop + click-to-upload component.
// Shows per-file upload progress bars.
// Validates file type and size before initiating upload.
// ============================================================

import { useRef, useState, useCallback } from "react";
import {
  validateImageFile,
  MAX_FILE_SIZE_BYTES,
  ALLOWED_MIME_TYPES,
} from "@shared/utils/storage";
import type { UploadItem } from "@/hooks/usePhotos";

interface PhotoUploaderProps {
  eventId: string;
  onUpload: (files: File[], eventId: string, guestToken?: string) => void;
  uploads: UploadItem[];
  guestToken?: string;
  disabled?: boolean;
}

export function PhotoUploader({
  eventId,
  onUpload,
  uploads,
  guestToken,
  disabled = false,
}: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const processFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;

      const valid: File[] = [];
      const errors: string[] = [];

      Array.from(fileList).forEach((file) => {
        const result = validateImageFile({ type: file.type, size: file.size });
        if (result.valid) {
          valid.push(file);
        } else {
          errors.push(`${file.name}: ${result.error}`);
        }
      });

      setValidationErrors(errors);

      if (valid.length > 0) {
        onUpload(valid, eventId, guestToken);
      }
    },
    [eventId, guestToken, onUpload]
  );

  // ── Drag handlers ─────────────────────────────────────────

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;
    processFiles(e.dataTransfer.files);
  };

  // Active uploads (not done/error)
  const activeUploads = uploads.filter((u) => u.status !== "done");
  const hasActiveUploads = activeUploads.length > 0;

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer
          ${
            isDragging
              ? "border-violet-400 bg-violet-50"
              : "border-gray-200 bg-gray-50 hover:border-violet-300 hover:bg-violet-50/50"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ALLOWED_MIME_TYPES.join(",")}
          className="sr-only"
          onChange={(e) => processFiles(e.target.files)}
          disabled={disabled}
        />

        <div className="flex flex-col items-center gap-3">
          {/* Upload icon */}
          <div
            className={`p-3 rounded-full transition-colors ${isDragging ? "bg-violet-100" : "bg-white border border-gray-100"}`}
          >
            <svg
              className={`w-6 h-6 ${isDragging ? "text-violet-600" : "text-gray-400"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700">
              {isDragging ? "Drop photos here" : "Upload photos"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Drag & drop or click to browse · JPEG, PNG, WebP, HEIC · Max 10MB
              each
            </p>
          </div>
        </div>
      </div>

      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl space-y-1">
          {validationErrors.map((err, i) => (
            <p key={i} className="text-xs text-red-600">
              {err}
            </p>
          ))}
        </div>
      )}

      {/* Upload progress list */}
      {hasActiveUploads && (
        <div className="space-y-2">
          {activeUploads.map((upload, i) => (
            <UploadProgressItem key={i} upload={upload} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Upload progress item ──────────────────────────────────────

function UploadProgressItem({ upload }: { upload: UploadItem }) {
  const isError = upload.status === "error";
  const isDone = upload.status === "done";

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl border ${
        isError ? "bg-red-50 border-red-100" : "bg-white border-gray-100"
      }`}
    >
      {/* File icon */}
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-700 truncate">
          {upload.file.name}
        </p>

        {isError ? (
          <p className="text-xs text-red-500 mt-0.5">{upload.error}</p>
        ) : (
          <div className="mt-1.5">
            {/* Progress bar */}
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isDone ? "bg-emerald-500" : "bg-violet-500"
                }`}
                style={{ width: `${upload.progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {upload.status === "completing"
                ? "Finishing…"
                : isDone
                  ? "Uploaded!"
                  : `${upload.progress}%`}
            </p>
          </div>
        )}
      </div>

      {/* Status icon */}
      <div className="shrink-0">
        {isDone && (
          <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
            <svg
              className="w-3 h-3 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}
        {isError && (
          <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="w-3 h-3 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
