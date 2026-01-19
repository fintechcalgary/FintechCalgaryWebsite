/**
 * Frontend utility helpers for React components
 */

import { FILE_TYPES, VALIDATION, ERROR_MESSAGES } from "@/lib/constants";

/**
 * Creates drag and drop handlers for file uploads
 * @param {Function} onFileSelect - Callback when file is selected
 * @param {Function} setIsDragOver - Function to set drag over state
 * @returns {Object} Object with drag event handlers
 */
export function createDragHandlers(onFileSelect, setIsDragOver) {
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  return {
    onDragOver: handleDragOver,
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
  };
}

/**
 * Validates a file based on allowed types and size
 * @param {File} file - The file to validate
 * @param {Object} options - Validation options
 * @param {string[]} options.allowedTypes - Allowed MIME types
 * @param {string[]} options.allowedExtensions - Allowed file extensions (optional)
 * @param {number} options.maxSize - Maximum file size in bytes
 * @returns {Object} { valid: boolean, error: string | null }
 */
export function validateFile(file, options = {}) {
  const {
    allowedTypes = [],
    allowedExtensions = [],
    maxSize = Infinity,
  } = options;

  if (!file) {
    return { valid: false, error: "No file selected" };
  }

  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    // Also check extension if provided
    if (allowedExtensions.length > 0) {
      const fileExtension = file.name.toLowerCase().split(".").pop();
      if (!allowedExtensions.includes(fileExtension)) {
        return {
          valid: false,
          error: ERROR_MESSAGES.FILE_TYPE_INVALID(allowedExtensions),
        };
      }
    } else {
      return {
        valid: false,
        error: ERROR_MESSAGES.FILE_TYPE_INVALID(allowedTypes),
      };
    }
  }

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: ERROR_MESSAGES.FILE_SIZE_EXCEEDED(maxSizeMB),
    };
  }

  return { valid: true, error: null };
}

/**
 * Uploads a file to the server
 * @param {File} file - The file to upload
 * @param {string} folder - The folder to upload to
 * @returns {Promise<string>} The uploaded file URL
 */
export async function uploadFile(file, folder) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(ERROR_MESSAGES.UPLOAD_FAILED);
  }

  const result = await response.json();
  return result.url;
}

/**
 * Scrolls to the first error field in a form
 * @param {Object} errors - Object with error fields
 * @param {number} delay - Delay in milliseconds before scrolling
 */
export function scrollToFirstError(errors, delay = 100) {
  const errorFields = Object.keys(errors);
  if (errorFields.length === 0) return;

  const firstErrorField = errorFields[0];
  setTimeout(() => {
    const errorElement = document.querySelector(
      `[data-error="${firstErrorField}"]`
    );
    if (errorElement) {
      errorElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      errorElement.focus();
    }
  }, delay);
}

/**
 * Creates a generic form change handler
 * @param {Function} setForm - State setter for form
 * @returns {Function} Change handler function
 */
export function createFormChangeHandler(setForm) {
  return (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
}

/**
 * Validates required fields in a form
 * @param {Object} form - Form data object
 * @param {string[]} requiredFields - Array of required field names
 * @returns {Object} Object with validation errors
 */
export function validateRequiredFields(form, requiredFields) {
  const errors = {};
  requiredFields.forEach((field) => {
    if (!form[field]) {
      const fieldName = field.charAt(0).toUpperCase() + field.slice(1);
      errors[field] = ERROR_MESSAGES.REQUIRED_FIELD(fieldName);
    }
  });
  return errors;
}

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {string | null} Error message or null if valid
 */
export function validateEmail(email) {
  if (!email) return ERROR_MESSAGES.EMAIL_REQUIRED;
  if (!VALIDATION.EMAIL_REGEX.test(email)) {
    return ERROR_MESSAGES.EMAIL_INVALID;
  }
  return null;
}

/**
 * Validates minimum length
 * @param {string} value - Value to validate
 * @param {number} minLength - Minimum length required
 * @param {string} fieldName - Name of the field
 * @returns {string | null} Error message or null if valid
 */
export function validateMinLength(value, minLength, fieldName) {
  if (value && value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters long`;
  }
  return null;
}

// Convenience functions for common validations
export function validatePassword(password) {
  return validateMinLength(password, VALIDATION.PASSWORD_MIN_LENGTH, "Password");
}

export function validateUsername(username) {
  return validateMinLength(username, VALIDATION.USERNAME_MIN_LENGTH, "Username");
}

