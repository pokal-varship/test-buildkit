#!/usr/bin/env node

/**
 * One-way sync: database.json + database-drafts.json → PATCH /e-commerce/v1/pages
 *
 * Publishes each page sequentially (one API call per page).
 * Payload shape matches the editor publish flow in services/pageManagement.ts.
 *
 * Required env (or CLI flags):
 *   PAGE_SYNC_AUTH_TOKEN  — JWT (with or without "Bearer " prefix)
 *   PAGE_SYNC_TENANT_ID   — e.g. 69084561b45f0ee0c8d905f9
 *
 * Optional:
 *   NEXT_PUBLIC_API_URL   — default https://api.newkommerce.com
 *
 * Usage:
 *   node scripts/sync-pages-to-api.js
 *   node scripts/sync-pages-to-api.js --dry-run
 *   node scripts/sync-pages-to-api.js --published-only
 *   node scripts/sync-pages-to-api.js --drafts-only
 *   node scripts/sync-pages-to-api.js --delay-ms=500
 */

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const PAGES_ENDPOINT = "/e-commerce/v1/pages";
const DEFAULT_API_URL = "https://api.newkommerce.com";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function parseArgs(argv) {
  const flags = {
    dryRun: false,
    publishedOnly: false,
    draftsOnly: false,
    delayMs: 0,
    token: null,
    tenantId: null,
    apiUrl: null,
  };

  for (const arg of argv) {
    if (arg === "--dry-run") flags.dryRun = true;
    else if (arg === "--published-only") flags.publishedOnly = true;
    else if (arg === "--drafts-only") flags.draftsOnly = true;
    else if (arg.startsWith("--delay-ms=")) {
      flags.delayMs = Number(arg.split("=")[1]) || 0;
    } else if (arg.startsWith("--token=")) {
      flags.token = arg.slice("--token=".length);
    } else if (arg.startsWith("--tenant-id=")) {
      flags.tenantId = arg.slice("--tenant-id=".length);
    } else if (arg.startsWith("--api-url=")) {
      flags.apiUrl = arg.slice("--api-url=".length);
    } else if (arg === "--help" || arg === "-h") {
      console.log(fs.readFileSync(__filename, "utf8").match(/\/\*\*([\s\S]*?)\*\//)[1]);
      process.exit(0);
    }
  }

  return flags;
}

function toApiPageSlug(pagePath) {
  return pagePath === "/" ? "home" : pagePath.replace(/^\//, "");
}

function normalizePagePath(rawPath) {
  if (rawPath.startsWith("/puck/")) {
    return rawPath.replace("/puck", "") || "/";
  }
  if (rawPath === "/puck") return "/";
  return rawPath;
}

function shouldSkipRawPath(rawPath, allRawPaths) {
  if (rawPath === "/puck" && allRawPaths.includes("/")) return true;
  if (rawPath.startsWith("/puck/")) {
    const canonical = rawPath.replace("/puck", "");
    if (allRawPaths.includes(canonical)) return true;
  }
  return false;
}

function readJsonFile(filePath, fallback = {}) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

/**
 * @param {Record<string, { content?: unknown[] }>} db
 * @param {boolean} isDraft
 */
function collectPageEntries(db, isDraft) {
  const rawPaths = Object.keys(db);
  const seen = new Set();
  const entries = [];

  for (const rawPath of rawPaths) {
    if (shouldSkipRawPath(rawPath, rawPaths)) {
      console.log(`  skip duplicate: ${rawPath}`);
      continue;
    }

    const pagePath = normalizePagePath(rawPath);
    const dedupeKey = `${isDraft}:${pagePath}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    const puckData = db[rawPath];
    const content = puckData?.content;
    if (!Array.isArray(content) || content.length === 0) {
      console.warn(`  skip empty: ${rawPath} (no content blocks)`);
      continue;
    }

    entries.push({
      rawPath,
      pagePath,
      pageSlug: toApiPageSlug(pagePath),
      content,
      isDraft,
    });
  }

  return entries;
}

function buildPublishPayload(entry) {
  return {
    data: entry.content,
    pageSlug: entry.pageSlug,
    isDraft: entry.isDraft,
  };
}

function normalizeAuthHeader(token) {
  const trimmed = token.trim();
  return trimmed.toLowerCase().startsWith("bearer ")
    ? trimmed
    : `Bearer ${trimmed}`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function publishPage(entry, config) {
  const payload = buildPublishPayload(entry);
  const url = `${config.apiUrl}${PAGES_ENDPOINT}`;

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: config.authHeader,
      "Tenant-Id": config.tenantId,
    },
    body: JSON.stringify(payload),
  });

  let body = null;
  const text = await response.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  return { response, body, payload };
}

async function main() {
  loadEnvFile(path.join(ROOT, ".env.local"));
  loadEnvFile(path.join(ROOT, ".env"));

  const flags = parseArgs(process.argv.slice(2));

  const token =
    flags.token ||
    process.env.PAGE_SYNC_AUTH_TOKEN ||
    process.env.MIGRATION_AUTH_TOKEN;
  const tenantId =
    flags.tenantId ||
    process.env.PAGE_SYNC_TENANT_ID ||
    process.env.TENANT_ID;
  const apiUrl =
    flags.apiUrl ||
    process.env.NEXT_PUBLIC_API_URL ||
    DEFAULT_API_URL;

  if (!flags.dryRun && (!token || !tenantId)) {
    console.error(
      "Missing credentials. Set PAGE_SYNC_AUTH_TOKEN and PAGE_SYNC_TENANT_ID " +
        "(or pass --token= and --tenant-id=).",
    );
    process.exit(1);
  }

  if (flags.publishedOnly && flags.draftsOnly) {
    console.error("Use only one of --published-only or --drafts-only.");
    process.exit(1);
  }

  const config = {
    apiUrl: apiUrl.replace(/\/$/, ""),
    authHeader: token ? normalizeAuthHeader(token) : "",
    tenantId: tenantId || "",
  };

  const entries = [];

  if (!flags.draftsOnly) {
    const publishedDb = readJsonFile(path.join(ROOT, "database.json"));
    console.log("\nPublished pages (database.json):");
    entries.push(...collectPageEntries(publishedDb, false));
  }

  if (!flags.publishedOnly) {
    const draftsDb = readJsonFile(path.join(ROOT, "database-drafts.json"));
    console.log("\nDraft pages (database-drafts.json):");
    entries.push(...collectPageEntries(draftsDb, true));
  }

  if (entries.length === 0) {
    console.log("\nNo pages to sync.");
    process.exit(0);
  }

  console.log(`\n${flags.dryRun ? "[DRY RUN] " : ""}Syncing ${entries.length} page(s) to ${config.apiUrl}${PAGES_ENDPOINT}\n`);

  let succeeded = 0;
  let failed = 0;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const label = `${entry.isDraft ? "draft" : "published"}:${entry.pageSlug}`;

    if (flags.dryRun) {
      const payload = buildPublishPayload(entry);
      console.log(
        `[${i + 1}/${entries.length}] ${label} — would PATCH (${payload.data.length} blocks)`,
      );
      console.log(`  path: ${entry.pagePath} (from ${entry.rawPath})`);
      console.log(
        `  types: ${payload.data.map((b) => b?.type).filter(Boolean).join(", ")}`,
      );
      succeeded++;
      continue;
    }

    try {
      const { response, body, payload } = await publishPage(entry, config);

      if (response.ok) {
        succeeded++;
        const message =
          body && typeof body === "object" && body.message
            ? body.message
            : response.statusText;
        console.log(
          `[${i + 1}/${entries.length}] ✓ ${label} — ${response.status} ${message} (${payload.data.length} blocks)`,
        );
      } else {
        failed++;
        const errMsg =
          body && typeof body === "object"
            ? body.message || body.error || JSON.stringify(body)
            : String(body);
        console.error(
          `[${i + 1}/${entries.length}] ✗ ${label} — ${response.status}: ${errMsg}`,
        );
      }
    } catch (error) {
      failed++;
      console.error(
        `[${i + 1}/${entries.length}] ✗ ${label} — ${error instanceof Error ? error.message : error}`,
      );
    }

    if (flags.delayMs > 0 && i < entries.length - 1) {
      await sleep(flags.delayMs);
    }
  }

  console.log(`\nDone: ${succeeded} succeeded, ${failed} failed.`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
