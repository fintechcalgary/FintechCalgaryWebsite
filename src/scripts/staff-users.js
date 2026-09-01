/**
 * Staff users for each RBAC role.
 * Used by seed-staff-roles.js
 */
const STAFF_USERS = [
  {
    username: "fintechcalgary",
    password: "ucalgary$210",
    role: "admin",
  },
  {
    username: "outreach",
    password: "outreach123",
    role: "outreach",
  },
  {
    username: "finance",
    password: "finance123",
    role: "finance",
  },
  {
    username: "events",
    password: "events123",
    role: "events",
  },
  {
    username: "marketing",
    password: "marketing123",
    role: "marketing",
  },
];

module.exports = { STAFF_USERS };
