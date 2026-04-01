import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

function logStep(message) {
  console.log(`\n[MVP signoff] ${message}`);
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      env: {
        ...process.env,
        ...options.env,
      },
      stdio: "inherit",
      shell: process.platform === "win32",
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          `Command failed (${command} ${args.join(" ")}), exit code: ${code ?? "unknown"}`,
        ),
      );
    });
  });
}

async function waitForUrl(url, timeoutMs = 120_000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(5_000),
      });

      if (response.ok) {
        return;
      }
    } catch {
      // Keep polling until timeout.
    }

    await delay(2_000);
  }

  throw new Error(`Timed out waiting for ${url}`);
}

async function stopServer(child) {
  if (!child || child.killed) {
    return;
  }

  child.kill("SIGTERM");

  await Promise.race([
    new Promise((resolve) => child.once("exit", resolve)),
    delay(10_000),
  ]);

  if (child.exitCode === null) {
    child.kill("SIGKILL");
    await Promise.race([
      new Promise((resolve) => child.once("exit", resolve)),
      delay(5_000),
    ]);
  }
}

async function main() {
  const baseUrl = process.env.MVP_SIGNOFF_BASE_URL || "http://127.0.0.1:3101";
  const liveBaseUrl = process.env.MVP_SIGNOFF_LIVE_BASE_URL;
  const { port } = new URL(baseUrl);

  logStep("Running typecheck");
  await runCommand(npmCommand, ["run", "typecheck:next-only"]);

  logStep("Running test suite");
  await runCommand(npmCommand, ["test", "--", "--run"]);

  logStep("Running preview-to-approval proof");
  await runCommand(npmCommand, ["run", "proof:preview-to-approval"]);

  logStep("Running approved-to-public proof");
  await runCommand(npmCommand, ["run", "proof:approved-to-public"]);

  logStep("Building production app");
  await runCommand(npmCommand, ["run", "build:next-only"]);

  logStep(`Starting production server on ${baseUrl}`);
  const server = spawn(
    process.execPath,
    ["./node_modules/next/dist/bin/next", "start", "-p", port],
    {
      cwd: process.cwd(),
      env: process.env,
      stdio: "inherit",
      shell: false,
    },
  );

  server.on("error", (error) => {
    console.error("[MVP signoff] Failed to start Next server:", error);
  });

  try {
    await waitForUrl(`${baseUrl}/destinations`);
    logStep("Running public destination smoke checks");
    await runCommand(npmCommand, ["run", "smoke:public-destinations"], {
      env: { SMOKE_BASE_URL: baseUrl },
    });

    logStep("Running unauthenticated auth redirect browser smoke");
    await runCommand(
      npmCommand,
      ["run", "e2e:smoke:share-experience:redirect"],
      {
        env: { PLAYWRIGHT_BASE_URL: baseUrl },
      },
    );
  } finally {
    logStep("Stopping production server");
    await stopServer(server);
  }

  if (liveBaseUrl) {
    logStep(`Waiting for live deployment at ${liveBaseUrl}`);
    await waitForUrl(`${liveBaseUrl}/`);

    logStep("Running live public destination smoke checks");
    await runCommand(npmCommand, ["run", "smoke:public-destinations"], {
      env: { SMOKE_BASE_URL: liveBaseUrl },
    });

    logStep("Running live unauthenticated auth redirect browser smoke");
    await runCommand(
      npmCommand,
      ["run", "e2e:smoke:share-experience:redirect"],
      {
        env: { PLAYWRIGHT_BASE_URL: liveBaseUrl },
      },
    );
  }

  logStep("Automated MVP signoff gate passed");
}

main().catch((error) => {
  console.error("[MVP signoff] Automated gate failed:", error);
  process.exitCode = 1;
});
