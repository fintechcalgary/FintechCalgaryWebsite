"use client";

import { useState } from "react";
import { uploadFile } from "@/lib/frontend-helpers";

/**
 * Thin wrapper around uploadFile with uploading/error state.
 */
export default function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const upload = async (file, folder) => {
    setUploading(true);
    setError(null);
    try {
      return await uploadFile(file, folder);
    } catch (err) {
      setError(err.message || "Upload failed");
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading, error };
}
