import { existsSync, rmSync } from "node:fs";
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

  console.log("[clean:next] Removed existing .next directory.");
} else {
  console.log("[clean:next] No .next directory to clean.");
}
