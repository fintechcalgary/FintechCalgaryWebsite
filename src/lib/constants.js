/**
 * Application-wide constants
 * Centralized constants for better maintainability and DRY principles
 */

// API Endpoints
export const API_ENDPOINTS = {
  CONTACT: "/api/contact",
  SUBSCRIBE: "/api/subscribe",
  EXECUTIVE_APPLICATION: "/api/executive-application",
  PARTNER: "/api/partners",
  PARTNER_APPLICATIONS: "/api/partner-applications",
  PARTNER_APPLICATIONS_ME: "/api/partner-applications/me",
  UPLOAD: "/api/upload",
  SETTINGS: "/api/settings",
  EVENTS: "/api/events",
  EXECUTIVES: "/api/executives",
  EXECUTIVES_ORDER: "/api/executives/order",
  MEMBERS: "/api/members",
  EXECUTIVE_ROLES: "/api/executive-roles",
  CONTRACTS: "/api/contracts",
};

// MongoDB Collection Names
export const COLLECTIONS = {
  USERS: "users",
  EXECUTIVES: "executives",
  PARTNERS: "partners", // display list on public /partners page
  PARTNER_APPLICATIONS: "partnerApplications", // org signup applications
  EVENTS: "events",
  EXECUTIVE_APPLICATIONS: "executiveApplications",
  EXECUTIVE_ROLES: "executiveRoles",
  SETTINGS: "settings",
  MEMBERS: "members",
  LOGS: "logs",
  CONTRACTS: "contracts",
};

// File Upload Folders
export const UPLOAD_FOLDERS = {
  RESUMES: "resumes",
  PARTNER_LOGOS: "partnerLogos", // partner application org logos
  PARTNER_DISPLAY_LOGOS: "partner-logos", // display partners on public page
  EVENT_IMAGES: "eventImages",
  EXECUTIVE_IMAGES: "executiveImages",
  ROLE_IMAGES: "roleImages",
};

// File Type Constants
export const FILE_TYPES = {
  PDF: {
    MIME_TYPES: ["application/pdf"],
    EXTENSIONS: ["pdf"],
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
  },
  IMAGE: {
    MIME_TYPES: ["image/jpeg", "image/jpg", "image/png", "image/svg+xml"],
    EXTENSIONS: ["jpg", "jpeg", "png", "svg"],
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
  },
};

// Validation Constants
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  USERNAME_MIN_LENGTH: 3,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

// Error Messages
export const ERROR_MESSAGES = {
  // General
  GENERIC_ERROR: "An unexpected error occurred. Please try again.",
  NETWORK_ERROR: "Network error. Please check your internet connection and try again.",
  TIMEOUT_ERROR: "Request timed out. Please try again.",
  UPLOAD_FAILED: "Failed to upload file. Please try again with a different file.",
  
  // Validation
  REQUIRED_FIELD: (fieldName) => `${fieldName} is required`,
  EMAIL_REQUIRED: "Email is required",
  EMAIL_INVALID: "Invalid email format",
  PASSWORD_MIN_LENGTH: `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters long`,
  USERNAME_MIN_LENGTH: `Username must be at least ${VALIDATION.USERNAME_MIN_LENGTH} characters long`,
  
  // Duplicate/Exists
  USERNAME_EXISTS: "Username already exists",
  USERNAME_EXISTS_DETAILED: "This username is already taken",
  ORGANIZATION_EXISTS: "Organization already exists",
  ORGANIZATION_EXISTS_DETAILED: "This organization name is already registered",
  
  // File Upload
  FILE_REQUIRED: (fileType) => `${fileType} file is required`,
  FILE_TYPE_INVALID: (allowedTypes) => `File type not allowed. Allowed types: ${allowedTypes.join(", ")}`,
  FILE_SIZE_EXCEEDED: (maxSizeMB) => `File size must be less than ${maxSizeMB}MB`,
  RESUME_UPLOAD_FAILED: "Failed to upload your resume. Please try again with a different file.",
  LOGO_UPLOAD_FAILED: "Failed to upload your logo. Please try again with a different file.",
  
  // Form Submission
  SUBMIT_FAILED: "Failed to submit. Please try again.",
  APPLICATION_SUBMIT_FAILED: "Failed to submit application. Please try again.",
  UPDATE_FAILED: "Failed to update. Please try again.",
  DELETE_FAILED: "Failed to delete. Please try again.",
  LOAD_FAILED: "Failed to load data. Please try again.",
  
  // API Specific
  CONTACT_FAILED: "Failed to send message. Please try again.",
  SUBSCRIBE_FAILED: "Failed to subscribe",
  REGISTER_FAILED: "Failed to register for event",
};

// Success Messages
export const SUCCESS_MESSAGES = {
  CONTACT_SENT: "Message sent successfully!",
  SUBSCRIBED: "Thank you for joining!",
  APPLICATION_SUBMITTED: "Application submitted successfully!",
  UPDATED: "Updated successfully!",
  DELETED: "Deleted successfully!",
};

// Email Constants
export const EMAIL = {
  CONTACT_FROM: (domain) => `FinTech Calgary <contact@${domain}>`,
  CONTACT_TO: ["rojnovyotam@gmail.com", "fintech.calgary@gmail.com"],
  SENDGRID_FROM: "rojnovyotam@gmail.com",
  SUBJECTS: {
    CONTACT_FORM: (subject) => `New Contact Form Submission: ${subject}`,
    WELCOME: "Welcome to FinTech Calgary!",
    REGISTRATION_CONFIRMED: (eventTitle) => `Registration Confirmed: ${eventTitle}`,
  },
};

// HTTP Methods
export const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
  PATCH: "PATCH",
};

// Content Types
export const CONTENT_TYPES = {
  JSON: "application/json",
  FORM_DATA: "multipart/form-data",
};

// Status Types
export const STATUS = {
  SUCCESS: "success",
  ERROR: "error",
  LOADING: "loading",
  IDLE: "idle",
};

// User Roles
export const USER_ROLES = {
  ADMIN: "admin",
  MEMBER: "member",
  ASSOCIATE: "associate",
};

// Application Status
export const APPLICATION_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

// Contract Pipeline Stages (in order, from the contract approvals process flow)
export const CONTRACT_STAGES = [
  {
    id: "outreach-meetings",
    label: "Outreach Meetings",
    role: "Advisors / Outreach Manager",
    description:
      "Advisors / Outreach Manager conduct meetings with potential partners.",
  },
  {
    id: "eoi-submission",
    label: "EOI Submission",
    role: "Advisors / Outreach Manager",
    description:
      "Outreach team fills out and submits the EOI (Expression of Interest) form.",
  },
  {
    id: "eoi-review",
    label: "EOI Review",
    role: "Operations Manager",
    description:
      "Operations Manager reviews the EOI and decides whether to proceed.",
  },
  {
    id: "legal-team-draft",
    label: "Assign to Legal Team & Draft",
    role: "Legal Manager",
    description:
      "Legal Manager assigns the matter to the legal team to draft the contract.",
  },
  {
    id: "legal-review",
    label: "Legal Review",
    role: "Legal Manager",
    description: "Legal Manager reviews the drafted contract.",
  },
  {
    id: "ops-director-approval",
    label: "Operations Director Approval",
    role: "Operations Director",
    description: "Contract is sent to the Operations Director for approval.",
  },
  {
    id: "ceo-approval",
    label: "CEO Approval",
    role: "CEO",
    description: "Contract is sent to the CEO for final approval.",
  },
  {
    id: "execution-signature",
    label: "Send for Execution & Signature",
    role: "Outreach Team",
    description:
      "Once approved, Outreach team sends the contract out for execution and signature.",
  },
];

// Index of the stage that requires the EOI PDF to be attached before advancing
export const CONTRACT_EOI_STAGE_INDEX = 1;

// Contract Status
export const CONTRACT_STATUS = {
  ACTIVE: "active",
  DO_NOT_PROCEED: "do-not-proceed",
  COMPLETED: "completed",
};

// Contract Stage Actions
export const CONTRACT_STAGE_ACTIONS = {
  APPROVE: "approve",
  DO_NOT_PROCEED: "do-not-proceed",
};

