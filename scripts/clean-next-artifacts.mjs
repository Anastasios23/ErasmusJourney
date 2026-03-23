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

console.log("[clean:next] Prepared .next/routes-manifest.json.");
