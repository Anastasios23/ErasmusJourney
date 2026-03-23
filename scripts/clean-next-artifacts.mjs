import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const target = resolve(".next");

if (process.env.SKIP_NEXT_CLEAN === "true") {
  console.log("[clean:next] Skipping .next cleanup.");
  process.exit(0);
}

if (existsSync(target)) {
  rmSync(target, {
    recursive: true,
    force: true,
    maxRetries: 5,
    retryDelay: 200,
  });
}

mkdirSync(target, { recursive: true });

const serverPagesDir = resolve(target, "server", "pages");
const fallbackPagesDir = resolve(
  target,
  "static",
  "chunks",
  "fallback",
  "pages",
);
const fallbackChunksDir = resolve(target, "static", "chunks", "fallback");

mkdirSync(serverPagesDir, { recursive: true });
mkdirSync(fallbackPagesDir, { recursive: true });
mkdirSync(fallbackChunksDir, { recursive: true });

const routesManifestPath = resolve(target, "routes-manifest.json");
writeFileSync(
  routesManifestPath,
  JSON.stringify(
    {
      version: 3,
      pages404: true,
      basePath: "",
      redirects: [],
      rewrites: { beforeFiles: [], afterFiles: [], fallback: [] },
      headers: [],
      dynamicRoutes: [],
      staticRoutes: [],
      dataRoutes: [],
      i18n: undefined,
    },
    null,
    2,
  ),
  "utf8",
);

const serverPageStub = `"use strict";
module.exports = {};
module.exports.default = function StubPage() { return null; };
`;

writeFileSync(resolve(serverPagesDir, "_document.js"), serverPageStub, "utf8");
writeFileSync(resolve(serverPagesDir, "_app.js"), serverPageStub, "utf8");
writeFileSync(resolve(serverPagesDir, "_error.js"), serverPageStub, "utf8");

const fallbackChunkStub = "/* placeholder stub for dev startup */\n";
writeFileSync(
  resolve(fallbackChunksDir, "react-refresh.js"),
  fallbackChunkStub,
  "utf8",
);
writeFileSync(resolve(fallbackPagesDir, "_app.js"), fallbackChunkStub, "utf8");
writeFileSync(
  resolve(fallbackPagesDir, "_error.js"),
  fallbackChunkStub,
  "utf8",
);

console.log("[clean:next] Prepared .next startup placeholders.");
