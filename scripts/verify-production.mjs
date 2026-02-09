import { setTimeout as delay } from "node:timers/promises";

const REQUEST_TIMEOUT_MS = 15_000;
const DEFAULT_ATTEMPTS = 4;
const DEFAULT_RETRY_DELAY_MS = 5_000;
const DEFAULT_INITIAL_DELAY_MS = 0;

const routes = [
  {
    path: "/",
    contentTypes: ["text/html"],
    mustInclude: ["SHEVAS"],
  },
  {
    path: "/projects/crypto-dashboard",
    contentTypes: ["text/html"],
    mustInclude: ["Crypto Dashboard"],
  },
  {
    path: "/projects/ai-chat",
    contentTypes: ["text/html"],
    mustInclude: ["AI Chat Interface"],
  },
  {
    path: "/projects/defi-analytics",
    contentTypes: ["text/html"],
    mustInclude: ["DeFi Analytics"],
  },
  {
    path: "/projects/farcaster-widget",
    contentTypes: ["text/html"],
    mustInclude: ["Farcaster"],
  },
  {
    path: "/projects/telegram-bot",
    contentTypes: ["text/html"],
    mustInclude: ["Telegram Bot"],
  },
  {
    path: "/api/health",
    contentTypes: ["application/json"],
    mustInclude: ['"status":"ok"', '"service":"shevas-portfolio"'],
  },
  {
    path: "/sitemap.xml",
    contentTypes: ["application/xml", "text/xml"],
    mustInclude: ["<urlset", "/projects/telegram-bot"],
  },
  {
    path: "/robots.txt",
    contentTypes: ["text/plain"],
    mustInclude: ["Sitemap:"],
  },
  {
    path: "/opengraph-image",
    contentTypes: ["image/png"],
  },
  {
    path: "/twitter-image",
    contentTypes: ["image/png"],
  },
];

const helpMessage = `Production verification for deployed portfolio

Usage:
  npm run verify:production -- --url=https://shevas.vercel.app
  npm run verify:production -- https://shevas.vercel.app

Optional retry controls:
  npm run verify:production -- --url=https://shevas.vercel.app --attempts=5 --retry-delay-ms=6000 --initial-delay-ms=15000

Options:
  --url=<https://...>          Deployment URL
  --attempts=<number>          Route check attempts before failing (default: ${DEFAULT_ATTEMPTS})
  --retry-delay-ms=<number>    Delay between attempts in milliseconds (default: ${DEFAULT_RETRY_DELAY_MS})
  --initial-delay-ms=<number>  Delay before checks start, useful right after deploy (default: ${DEFAULT_INITIAL_DELAY_MS})

Environment fallbacks:
  PRODUCTION_URL
  VERIFY_ATTEMPTS
  VERIFY_RETRY_DELAY_MS
  VERIFY_INITIAL_DELAY_MS
`;

const parseIntegerOption = ({ value, label, defaultValue, min = 0 }) => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < min) {
    throw new Error(`${label} must be an integer >= ${min}. Received: ${value}`);
  }

  return parsed;
};

const parseCliOptions = () => {
  const args = process.argv.slice(2);

  if (args.some((arg) => arg === "-h" || arg === "--help")) {
    console.log(helpMessage);
    process.exit(0);
  }

  const options = {
    url: "",
    attempts: parseIntegerOption({
      value: process.env.VERIFY_ATTEMPTS,
      label: "VERIFY_ATTEMPTS",
      defaultValue: DEFAULT_ATTEMPTS,
      min: 1,
    }),
    retryDelayMs: parseIntegerOption({
      value: process.env.VERIFY_RETRY_DELAY_MS,
      label: "VERIFY_RETRY_DELAY_MS",
      defaultValue: DEFAULT_RETRY_DELAY_MS,
      min: 0,
    }),
    initialDelayMs: parseIntegerOption({
      value: process.env.VERIFY_INITIAL_DELAY_MS,
      label: "VERIFY_INITIAL_DELAY_MS",
      defaultValue: DEFAULT_INITIAL_DELAY_MS,
      min: 0,
    }),
  };

  for (const arg of args) {
    if (arg.startsWith("--url=")) {
      options.url = arg.slice("--url=".length);
      continue;
    }

    if (arg.startsWith("--attempts=")) {
      options.attempts = parseIntegerOption({
        value: arg.slice("--attempts=".length),
        label: "--attempts",
        defaultValue: DEFAULT_ATTEMPTS,
        min: 1,
      });
      continue;
    }

    if (arg.startsWith("--retry-delay-ms=")) {
      options.retryDelayMs = parseIntegerOption({
        value: arg.slice("--retry-delay-ms=".length),
        label: "--retry-delay-ms",
        defaultValue: DEFAULT_RETRY_DELAY_MS,
        min: 0,
      });
      continue;
    }

    if (arg.startsWith("--retry-delay=")) {
      options.retryDelayMs = parseIntegerOption({
        value: arg.slice("--retry-delay=".length),
        label: "--retry-delay",
        defaultValue: DEFAULT_RETRY_DELAY_MS,
        min: 0,
      });
      continue;
    }

    if (arg.startsWith("--initial-delay-ms=")) {
      options.initialDelayMs = parseIntegerOption({
        value: arg.slice("--initial-delay-ms=".length),
        label: "--initial-delay-ms",
        defaultValue: DEFAULT_INITIAL_DELAY_MS,
        min: 0,
      });
      continue;
    }

    if (arg.startsWith("--initial-delay=")) {
      options.initialDelayMs = parseIntegerOption({
        value: arg.slice("--initial-delay=".length),
        label: "--initial-delay",
        defaultValue: DEFAULT_INITIAL_DELAY_MS,
        min: 0,
      });
      continue;
    }

    if (arg.startsWith("-")) {
      throw new Error(`Unknown argument: ${arg}\n\n${helpMessage}`);
    }

    if (!options.url) {
      options.url = arg;
      continue;
    }

    throw new Error(`Unexpected positional argument: ${arg}\n\n${helpMessage}`);
  }

  return options;
};

const normalizeBaseUrl = (input) => {
  if (!input) {
    throw new Error(
      "Missing deployment URL. Pass --url=<https://...> or set PRODUCTION_URL.\n\n" + helpMessage,
    );
  }

  const withProtocol = /^https?:\/\//i.test(input) ? input : `https://${input}`;
  const parsed = new URL(withProtocol);

  if (!["https:", "http:"].includes(parsed.protocol)) {
    throw new Error(`Unsupported protocol: ${parsed.protocol}`);
  }

  parsed.pathname = parsed.pathname.replace(/\/$/, "");

  return parsed.toString().replace(/\/$/, "");
};

const assertContentType = (path, contentType, expectedContentTypes) => {
  if (!expectedContentTypes.some((expected) => contentType.includes(expected))) {
    throw new Error(
      `Unexpected content-type for ${path}: "${contentType || "<empty>"}". Expected one of: ${expectedContentTypes.join(", ")}`,
    );
  }
};

const assertBodyMarkers = (path, body, markers) => {
  if (!markers || markers.length === 0) {
    return;
  }

  const missing = markers.filter((marker) => !body.includes(marker));

  if (missing.length > 0) {
    throw new Error(`Response for ${path} is missing expected text marker(s): ${missing.join(", ")}`);
  }
};

const formatError = (error) => {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
};

const checkRoute = async (baseUrl, route) => {
  const url = `${baseUrl}${route.path}`;
  const response = await fetch(url, {
    redirect: "follow",
    headers: {
      "user-agent": "shevas-portfolio-production-verifier",
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    const preview = await response.text().then((text) => text.slice(0, 220)).catch(() => "");
    throw new Error(`${route.path} returned ${response.status} ${response.statusText}. ${preview}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  assertContentType(route.path, contentType, route.contentTypes);

  if (route.mustInclude?.length) {
    const body = await response.text();
    assertBodyMarkers(route.path, body, route.mustInclude);
  } else {
    await response.arrayBuffer();
  }

  console.log(`✓ ${route.path} [${response.status}] (${contentType || "no content-type"})`);
};

const checkRouteWithRetry = async ({ baseUrl, route, attempts, retryDelayMs }) => {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await checkRoute(baseUrl, route);
      return;
    } catch (error) {
      lastError = error;

      if (attempt === attempts) {
        break;
      }

      console.warn(
        `⚠ ${route.path} attempt ${attempt}/${attempts} failed. Retrying in ${retryDelayMs}ms.\n  ↳ ${formatError(error)}`,
      );

      await delay(retryDelayMs);
    }
  }

  throw new Error(
    `Route verification failed after ${attempts} attempt(s): ${route.path}\n${formatError(lastError)}`,
  );
};

const main = async () => {
  try {
    const options = parseCliOptions();
    const baseUrl = normalizeBaseUrl(options.url || process.env.PRODUCTION_URL || "");

    console.log(`Running production verification for ${baseUrl}`);
    console.log(
      `Retry policy: attempts=${options.attempts}, retryDelayMs=${options.retryDelayMs}, initialDelayMs=${options.initialDelayMs}`,
    );

    if (options.initialDelayMs > 0) {
      console.log(`Waiting ${options.initialDelayMs}ms before route checks...`);
      await delay(options.initialDelayMs);
    }

    for (const route of routes) {
      await checkRouteWithRetry({
        baseUrl,
        route,
        attempts: options.attempts,
        retryDelayMs: options.retryDelayMs,
      });
    }

    console.log("Production verification passed.");
  } catch (error) {
    console.error(formatError(error));
    process.exitCode = 1;
  }
};

await main();
