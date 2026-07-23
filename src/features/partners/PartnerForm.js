"use client";

import FileUploadDropzone from "@/components/ui/FileUploadDropzone";
import Button from "@/components/ui/Button";
import { PARTNER_FORM_INPUT_CLASS } from "@/features/partners/partnerFormFields";

function Field({
  label,
  showLabel,
  error,
  hint,
  children,
  className = "",
}) {
  return (
    <div className={className}>
      {showLabel && label ? (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-sm text-gray-400">{hint}</p>
      ) : null}
    </div>
  );
}

function SectionTitle({ children, mode }) {
  if (mode === "signup") {
    return (
      <>
        <div className="text-xl font-semibold">{children}</div>
        <div className="my-2 border-t-2 border-primary/60 w-full" />
      </>
    );
  }
  return (
    <h3 className="text-lg font-semibold text-white mb-4">{children}</h3>
  );
}

/**
 * Shared partner org form for signup, partner-dashboard edit, and admin edit.
 *
 * @param {"signup"|"partner-edit"|"admin-edit"} mode
 */
export default function PartnerForm({
  mode = "partner-edit",
  values,
  errors = {},
  onChange,
  onSubmit,
  onCancel,
  submitting = false,
  submitLabel,
  // Logo upload (signup / optional edit)
  showLogoUpload = mode === "signup",
  logoRequired = mode === "signup",
  previewUrl,
  isDragOver,
  setIsDragOver,
  onLogoSelect,
  fileError,
  className = "",
  beforeActions = null,
}) {
  const showLabels = mode !== "signup";
  const showPassword = mode === "signup";
  const inputClass = PARTNER_FORM_INPUT_CLASS;

  const set = (field) => (e) => onChange(field, e.target.value);

  const errClass = (field) =>
    errors[field]
      ? `${inputClass} border-red-500 focus:border-red-500 focus:ring-red-500/20`
      : inputClass;

  const defaultSubmit =
    mode === "signup" ? "Submit Application" : "Save Changes";

  return (
    <form onSubmit={onSubmit} className={`space-y-6 ${className}`.trim()}>
      {showLogoUpload ? (
        <div>
          {mode === "signup" ? (
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Upload your Logo
            </label>
          ) : null}
          <FileUploadDropzone
            id="partner-logo-upload"
            accept=".jpg,.jpeg,.png,.svg,image/jpeg,image/png,image/svg+xml"
            required={logoRequired}
            isDragOver={isDragOver}
            setIsDragOver={setIsDragOver}
            onFileSelect={onLogoSelect}
            previewUrl={previewUrl}
            previewAlt="Logo preview"
            emptyLabel="Click to upload your logo or drag and drop"
            hint="JPG, PNG, or SVG only"
            error={fileError}
          />
        </div>
      ) : null}

      <div>
        <SectionTitle mode={mode}>
          {mode === "signup" ? "Organization Information" : "Organization Information"}
        </SectionTitle>
        <div className="space-y-4">
          <Field
            label="Organization Name"
            showLabel={showLabels}
            error={errors.organizationName}
          >
            <input
              type="text"
              placeholder={showLabels ? undefined : "Organization Name"}
              value={values.organizationName}
              onChange={set("organizationName")}
              required
              data-error="organizationName"
              className={errClass("organizationName")}
            />
          </Field>

          <Field
            label="Username"
            showLabel={showLabels}
            error={errors.username}
            hint={
              !errors.username && mode === "signup"
                ? "Choose a unique username for your account"
                : undefined
            }
          >
            <input
              type="text"
              placeholder={showLabels ? undefined : "Username"}
              value={values.username}
              onChange={set("username")}
              required
              data-error="username"
              className={errClass("username")}
            />
          </Field>

          {showPassword ? (
            <Field
              label="Password"
              showLabel={false}
              error={errors.password}
              hint={
                !errors.password
                  ? "Password must be at least 6 characters long"
                  : undefined
              }
            >
              <input
                type="password"
                placeholder="Password"
                value={values.password}
                onChange={set("password")}
                required
                data-error="password"
                className={errClass("password")}
              />
            </Field>
          ) : null}

          {mode !== "signup" ? (
            <Field label="Website" showLabel>
              <input
                type="url"
                value={values.website}
                onChange={set("website")}
                required
                className={inputClass}
              />
            </Field>
          ) : null}
        </div>
      </div>

      <div>
        <SectionTitle mode={mode}>
          {mode === "signup" ? "Contacts" : "Contact Information"}
        </SectionTitle>
        {mode === "signup" ? (
          <div className="mb-2 text-gray-200 text-md">
            <p>
              Please enter the information for the Main Contact of your
              organization.
            </p>
          </div>
        ) : null}
        <div className="space-y-4">
          <Field label="Title" showLabel={showLabels}>
            <input
              type="text"
              placeholder={showLabels ? undefined : "Title / Position"}
              value={values.title}
              onChange={set("title")}
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="First Name" showLabel={showLabels}>
              <input
                type="text"
                placeholder={showLabels ? undefined : "First Name"}
                value={values.firstName}
                onChange={set("firstName")}
                required
                className={inputClass}
              />
            </Field>
            <Field label="Last Name" showLabel={showLabels}>
              <input
                type="text"
                placeholder={showLabels ? undefined : "Last Name"}
                value={values.lastName}
                onChange={set("lastName")}
                required
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field
              label={showLabels ? "Contact Email" : undefined}
              showLabel={showLabels}
            >
              <input
                type={showLabels ? "email" : "text"}
                placeholder={showLabels ? undefined : "Email"}
                value={values.contactEmail}
                onChange={set("contactEmail")}
                required
                className={inputClass}
              />
            </Field>
            <Field
              label={showLabels ? "Contact Phone" : undefined}
              showLabel={showLabels}
            >
              <input
                type={showLabels ? "tel" : "text"}
                placeholder={showLabels ? undefined : "Phone Number"}
                value={values.contactPhoneNumber}
                onChange={set("contactPhoneNumber")}
                required
                className={inputClass}
              />
            </Field>
          </div>

          {mode !== "signup" ? (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Organization Email" showLabel>
                <input
                  type="email"
                  value={values.organizationEmail}
                  onChange={set("organizationEmail")}
                  required
                  className={inputClass}
                />
              </Field>
              <Field label="Organization Phone" showLabel>
                <input
                  type="tel"
                  value={values.organizationPhoneNumber}
                  onChange={set("organizationPhoneNumber")}
                  required
                  className={inputClass}
                />
              </Field>
            </div>
          ) : null}
        </div>
      </div>

      {mode === "signup" ? (
        <div>
          <SectionTitle mode={mode}>
            Organization Contact Information
          </SectionTitle>
          <div className="space-y-4 mb-5">
            <input
              type="text"
              placeholder="Email"
              value={values.organizationEmail}
              onChange={set("organizationEmail")}
              required
              className={inputClass}
            />
            <input
              type="text"
              placeholder="Website URL"
              value={values.website}
              onChange={set("website")}
              required
              className={inputClass}
            />
            <input
              type="text"
              placeholder="Phone Number"
              value={values.organizationPhoneNumber}
              onChange={set("organizationPhoneNumber")}
              required
              className={inputClass}
            />
          </div>
        </div>
      ) : null}

      <div>
        <SectionTitle mode={mode}>
          {mode === "signup" ? "Social Media" : "Social Media"}
        </SectionTitle>
        <div className="space-y-4">
          <Field label="Facebook URL" showLabel={showLabels}>
            <input
              type={showLabels ? "url" : "text"}
              placeholder={
                showLabels
                  ? "https://facebook.com/yourpage"
                  : "Facebook URL (Leave blank if not applicable)"
              }
              value={values.facebook}
              onChange={set("facebook")}
              className={inputClass}
            />
          </Field>
          <Field label="Twitter URL" showLabel={showLabels}>
            <input
              type={showLabels ? "url" : "text"}
              placeholder={
                showLabels
                  ? "https://twitter.com/yourhandle"
                  : "Twitter URL (Leave blank if not applicable)"
              }
              value={values.twitter}
              onChange={set("twitter")}
              className={inputClass}
            />
          </Field>
          <Field label="LinkedIn URL" showLabel={showLabels}>
            <input
              type={showLabels ? "url" : "text"}
              placeholder={
                showLabels
                  ? "https://linkedin.com/company/yourcompany"
                  : "LinkedIn URL (Leave blank if not applicable)"
              }
              value={values.linkedin}
              onChange={set("linkedin")}
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      <div>
        <SectionTitle mode={mode}>Address</SectionTitle>
        <div className="space-y-4">
          <Field label="Address" showLabel={showLabels}>
            <input
              type="text"
              placeholder={showLabels ? undefined : "Address"}
              value={values.address}
              onChange={set("address")}
              required
              className={inputClass}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Country" showLabel={showLabels}>
              <input
                type="text"
                placeholder={showLabels ? undefined : "Country"}
                value={values.country}
                onChange={set("country")}
                required
                className={inputClass}
              />
            </Field>
            <Field
              label={showLabels ? "Province/State" : undefined}
              showLabel={showLabels}
            >
              <input
                type="text"
                placeholder={showLabels ? undefined : "Province / State"}
                value={values.province}
                onChange={set("province")}
                required
                className={inputClass}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="City" showLabel={showLabels}>
              <input
                type="text"
                placeholder={showLabels ? undefined : "City"}
                value={values.city}
                onChange={set("city")}
                required
                className={inputClass}
              />
            </Field>
            <Field label="Postal Code" showLabel={showLabels}>
              <input
                type="text"
                placeholder={showLabels ? undefined : "Postal Code"}
                value={values.postalCode}
                onChange={set("postalCode")}
                required
                className={inputClass}
              />
            </Field>
          </div>
        </div>
      </div>

      <div>
        <SectionTitle mode={mode}>About Us</SectionTitle>
        <Field
          label={showLabels ? "About Us Section" : undefined}
          showLabel={showLabels}
        >
          <textarea
            value={values.aboutUs}
            onChange={set("aboutUs")}
            className={`${inputClass} min-h-32 resize-none`}
            required
            placeholder={
              showLabels
                ? "Tell us about your organization..."
                : "About Us (Brief description of your organization)"
            }
          />
        </Field>
      </div>

      {beforeActions}

      <div
        className={
          mode === "signup"
            ? "flex justify-center pt-4"
            : "flex justify-end space-x-4 pt-8 border-t border-white/10"
        }
      >
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button
          type="submit"
          variant="primary"
          disabled={submitting}
          className={
            mode === "signup"
              ? "px-8 py-3"
              : "px-8 py-3 bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 border border-primary/30"
          }
        >
          {submitting ? "Saving..." : submitLabel || defaultSubmit}
        </Button>
      </div>
    </form>
  );
}
