/**
 * Dev only — exposes Next.js on the local network for phone testing.
 * Do not run on untrusted networks (no auth, full env, source maps).
 *
 * Usage: npm run serve
 * Override: HOST_LAN=192.168.1.42 PORT=8080 npm run serve
 */
const { spawn, spawnSync } = require("child_process");
const os = require("os");

const IPV4 =
  /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/;

/** Ports Safari blocks — useless for on-device testing. */
const IOS_BLOCKED_PORTS = new Set([
  4190, 5060, 5061, 6000, 6566, 6665, 6666, 6667, 6668, 6669, 6679, 6697,
  10080,
]);

function parsePort(raw) {
  const port = Number.parseInt(String(raw ?? "8080"), 10);
  if (!Number.isInteger(port) || port < 1024 || port > 65_535) {
    return null;
  }
  if (IOS_BLOCKED_PORTS.has(port)) {
    return null;
  }
  return port;
}

function resolveLanIp() {
  const fromEnv = process.env.HOST_LAN?.trim();
  if (fromEnv) {
    if (!IPV4.test(fromEnv)) {
      console.error(`HOST_LAN must be a plain IPv4 address, got: ${fromEnv}`);
      process.exit(1);
    }
    return fromEnv;
  }

  for (const interfaces of Object.values(os.networkInterfaces())) {
    if (!interfaces) continue;
    for (const entry of interfaces) {
      if (entry.family === "IPv4" && !entry.internal) {
        return entry.address;
      }
    }
  }
  return null;
}

function copyToClipboard(text) {
  if (process.platform !== "darwin") return;
  try {
    spawnSync("pbcopy", [], { input: text });
  } catch {
    // optional convenience
  }
}

const PORT = parsePort(process.env.PORT);
if (PORT === null) {
  console.error(
    "PORT must be an integer between 1024 and 65535 (and not blocked on iOS Safari).",
  );
  process.exit(1);
}

const ip = resolveLanIp();
if (!ip) {
  console.error(
    "\nCould not detect a LAN IPv4 address.\n" +
      "Connect to Wi‑Fi, or set HOST_LAN=192.168.x.x npm run serve\n",
  );
  process.exit(1);
}

const phoneUrl = `http://${ip}:${PORT}`;

console.log("\n  WARNING: Dev server listens on all interfaces (0.0.0.0).");
console.log("  Anyone on your network can reach it. Use trusted Wi‑Fi only.\n");
console.log("  On your phone (same Wi‑Fi):");
console.log(`  ${phoneUrl}`);
console.log("\n  Do not open http://0.0.0.0 in Safari.\n");

copyToClipboard(phoneUrl);
console.log("  (URL copied to clipboard on macOS)\n");

const child = spawn(
  "npx",
  ["next", "dev", "--webpack", "--hostname", "0.0.0.0", "--port", String(PORT)],
  { stdio: ["inherit", "pipe", "pipe"], env: process.env },
);

/** Rewrite Next's network URL — only substitute a validated LAN IP. */
function rewriteLine(chunk, stream) {
  const text = chunk.toString().replaceAll("0.0.0.0", ip);
  stream.write(text);
}

child.stdout.on("data", (chunk) => rewriteLine(chunk, process.stdout));
child.stderr.on("data", (chunk) => rewriteLine(chunk, process.stderr));

child.on("exit", (code) => process.exit(code ?? 0));