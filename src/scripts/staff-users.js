/**
 * Staff users for each RBAC role.
 * Passwords come from env (see passwordEnv) — never commit secrets here.
 * Used by seed-staff-roles.js
 */
const STAFF_USERS = [
  {
    username: "fintechcalgary",
    role: "admin",
    passwordEnv: "SEED_ADMIN_PASSWORD",
  },
  {
    username: "outreach",
    role: "outreach",
    passwordEnv: "SEED_OUTREACH_PASSWORD",
  },
  {
    username: "finance",
    role: "finance",
    passwordEnv: "SEED_FINANCE_PASSWORD",
  },
  {
    username: "events",
    role: "events",
    passwordEnv: "SEED_EVENTS_PASSWORD",
  },
  {
    username: "marketing",
    role: "marketing",
    passwordEnv: "SEED_MARKETING_PASSWORD",
  },
  {
    username: "projects",
    role: "projects",
    passwordEnv: "SEED_PROJECTS_PASSWORD",
  },
];

function resolveStaffUsersFromEnv(env = process.env) {
  const missing = [];
  const users = STAFF_USERS.map((user) => {
    const password = env[user.passwordEnv];
    if (!password) missing.push(user.passwordEnv);
    return {
      username: user.username,
      role: user.role,
      password,
      passwordEnv: user.passwordEnv,
    };
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing staff seed password env vars: ${missing.join(", ")}. ` +
        "Add them to .env or .env.local before running npm run seed-staff-roles.",
    );
  }

  return users;
}

module.exports = { STAFF_USERS, resolveStaffUsersFromEnv };
