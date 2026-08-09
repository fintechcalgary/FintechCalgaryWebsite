"use client";

import { FiEdit2, FiUpload } from "react-icons/fi";
import Image from "next/image";
import {
  displayColorValue,
  normalizeHexColor,
} from "@/features/partners/admin/displayPartnerFormFields";

export default function DisplayPartnerForm({
  formData,
  setFormData,
  logoFile,
  logoPreview,
  uploadingLogo,
  submitting,
  onLogoChange,
  onSubmit,
  onCancel,
  submitLabel,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            placeholder="Partner name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Accent color
          </label>
          <p className="text-xs text-gray-400 mb-2">
            Used for the partner card highlight on the public page. Pick a color
            or enter a hex code.
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="color"
              value={displayColorValue(formData.color)}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, color: e.target.value }))
              }
              className="w-10 h-10 min-w-[2.5rem] rounded border border-gray-700 cursor-pointer bg-transparent flex-shrink-0"
              title="Pick color"
            />
            <input
              type="text"
              value={displayColorValue(formData.color)}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  color: normalizeHexColor(e.target.value),
                }))
              }
              className="w-full min-w-[11rem] sm:min-w-[14rem] max-w-xs px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-gray-500 text-sm sm:text-base"
              placeholder="Hexcode"
              aria-label="Accent color hex code"
            />
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Website
        </label>
        <input
          type="url"
          value={formData.website}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, website: e.target.value }))
          }
          className="w-full px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          placeholder="https://..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          rows={4}
          className="w-full px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          placeholder="Short description of the partner"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Logo
        </label>
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          {(logoPreview || formData.logo) && (
            <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-800 border border-gray-700 flex-shrink-0">
              <Image
                src={logoPreview || formData.logo}
                alt="Logo preview"
                fill
                sizes="128px"
                className="object-contain"
              />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <label className="px-4 py-2 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-300 hover:bg-gray-700/50 cursor-pointer transition-all inline-flex items-center gap-2 w-fit">
              <FiUpload className="w-4 h-4" />
              {logoFile ? "Change image" : "Upload image"}
              <input
                type="file"
                accept="image/*"
                onChange={onLogoChange}
                className="hidden"
              />
            </label>
            {uploadingLogo && (
              <span className="text-sm text-primary">Uploading...</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600 text-white transition-all text-sm sm:text-base"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || uploadingLogo}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <FiEdit2 className="w-4 h-4 flex-shrink-0" />
          {submitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
