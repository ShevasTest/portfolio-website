import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const DEFAULT_PORT = 4173;
const STARTUP_TIMEOUT_MS = 30_000;
const RETRY_INTERVAL_MS = 500;

const port = Number.parseInt(process.env.SMOKE_PORT ?? "", 10) || DEFAULT_PORT;
const baseUrl = `http://127.0.0.1:${port}`;

const routes = [
  { path: "/", contentTypes: ["text/html"], mustInclude: ["SHEVAS"] },
  { path: "/projects/crypto-dashboard", contentTypes: ["text/html"], mustInclude: ["Crypto Dashboard"] },
  { path: "/projects/ai-chat", contentTypes: ["text/html"], mustInclude: ["AI Chat Interface"] },
  { path: "/projects/defi-analytics", contentTypes: ["text/html"], mustInclude: ["DeFi Analytics"] },
  { path: "/projects/farcaster-widget", contentTypes: ["text/html"], mustInclude: ["Farcaster"] },
  { path: "/projects/telegram-bot", contentTypes: ["text/html"], mustInclude: ["Telegram Bot"] },
  { path: "/api/health", contentTypes: ["application/json"], mustInclude: ['"status":"ok"', '"service":"shevas-portfolio"'] },
  { path: "/sitemap.xml", contentTypes: ["application/xml", "text/xml"], mustInclude: ["<urlset", "/projects/telegram-bot"] },
  { path: "/robots.txt", contentTypes: ["text/plain"], mustInclude: ["Sitemap:"] },
  { path: "/opengraph-image", contentTypes: ["image/png"] },
  { path: "/twitter-image", contentTypes: ["image/png"] },
];

const nextBinary = process.platform === "win32" ? "node_modules/.bin/next.cmd" : "node_modules/.bin/next";

const server = spawn(nextBinary, ["start", "-H", "127.0.0.1", "-p", String(port)], {
  env: { ...process.env, NODE_ENV: "production" },
  stdio: ["ignore", "pipe", "pipe"],
});

let logs = "";

server.stdout.on("data", (chunk) => {
  logs += chunk.toString();
});

server.stderr.on("data", (chunk) => {
  logs += chunk.toString();
});

server.on("error", (error) => {
  console.error("Failed to start Next.js server:", error);
});

const waitForServer = async () => {
  const deadline = Date.now() + STARTUP_TIMEOUT_MS;

  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`next start exited early with code ${server.exitCode}.\n${logs}`);
    }

    try {
      const response = await fetch(baseUrl, { redirect: "manual" });

      if (response.status < 500) {
        return;
      }
    } catch {
      // Server is not ready yet.
    }

    await delay(RETRY_INTERVAL_MS);
  }

  throw new Error(`Timed out waiting for Next.js server at ${baseUrl}.\n${logs}`);
};

const assertRoute = async ({ path, contentTypes, mustInclude = [] }) => {
  const url = `${baseUrl}${path}`;
  const response = await fetch(url, { redirect: "follow" });

  if (!response.ok) {
    const preview = await response.text().then((text) => text.slice(0, 240)).catch(() => "");
    throw new Error(`Route check failed for ${path}: ${response.status} ${response.statusText}\n${preview}`);
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (!contentTypes.some((expected) => contentType.includes(expected))) {
    throw new Error(
      `Unexpected content-type for ${path}: "${contentType}". Expected one of: ${contentTypes.join(", ")}`,
    );
  }

  if (mustInclude.length > 0) {
    const body = await response.text();
    const missingMarkers = mustInclude.filter((marker) => !body.includes(marker));

    if (missingMarkers.length > 0) {
      throw new Error(
        `Response for ${path} is missing expected text marker(s): ${missingMarkers.join(", ")}`,
      );
    }
  } else {
    await response.arrayBuffer();
  }

  console.log(`✓ ${path} [${contentType}]`);
};

const waitForExit = () =>
  new Promise((resolve) => {
    server.once("exit", resolve);
  });

const shutdown = async () => {
  if (server.exitCode !== null) {
    return;
  }

  server.kill("SIGTERM");

  const exitedAfterTerm = await Promise.race([
    waitForExit().then(() => true),
    delay(5_000).then(() => false),
  ]);

  if (!exitedAfterTerm && server.exitCode === null) {
    server.kill("SIGKILL");

    if (server.exitCode === null) {
      await waitForExit();
    }
  }
};

try {
  await waitForServer();

  console.log(`Running deployment smoke checks against ${baseUrl}`);

  for (const route of routes) {
    await assertRoute(route);
  }

  console.log("Smoke checks passed.");
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
} finally {
  await shutdown();
}
