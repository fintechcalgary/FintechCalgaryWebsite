"use client";

import { createDragHandlers } from "@/lib/frontend-helpers";

/**
 * Shared drag-and-drop file upload zone.
 */
export default function FileUploadDropzone({
  id = "file-upload",
  accept,
  required = false,
  isDragOver,
  setIsDragOver,
  onFileSelect,
  previewUrl,
  previewAlt = "Preview",
  emptyLabel = "Click to upload or drag and drop",
  hint,
  error,
  className = "",
}) {
  const dragHandlers = createDragHandlers(onFileSelect, setIsDragOver);

  return (
    <div className={className}>
      <input
        id={id}
        type="file"
        accept={accept}
        required={required && !previewUrl}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
        }}
        className="hidden"
      />
      <label
        htmlFor={id}
        className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-primary/60 transition-all duration-200 ${
          isDragOver ? "border-primary/60" : ""
        }`}
        onDragOver={dragHandlers.onDragOver}
        onDragEnter={dragHandlers.onDragEnter}
        onDragLeave={dragHandlers.onDragLeave}
        onDrop={dragHandlers.onDrop}
      >
        {previewUrl ? (
          <div className="relative w-full h-full p-4 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt={previewAlt}
              className="max-h-full max-w-full object-contain"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <p className="text-white">Click to change</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              className="w-8 h-8 mb-4 text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 16"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-400">
              <span className="font-semibold">{emptyLabel}</span>
            </p>
            {hint ? <p className="text-xs text-gray-400">{hint}</p> : null}
          </div>
        )}
      </label>
      {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
    </div>
  );
}
