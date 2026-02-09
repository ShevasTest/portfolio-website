const REQUEST_TIMEOUT_MS = 15_000;

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

const helpMessage = `Production verification for deployed portfolio\n\nUsage:\n  npm run verify:production -- --url=https://shevas.vercel.app\n  npm run verify:production -- https://shevas.vercel.app\n\nOr set PRODUCTION_URL environment variable:\n  PRODUCTION_URL=https://shevas.vercel.app npm run verify:production\n`;

const getCliUrl = () => {
  const args = process.argv.slice(2);

  if (args.some((arg) => arg === "-h" || arg === "--help")) {
    console.log(helpMessage);
    process.exit(0);
  }

  const flagValue = args.find((arg) => arg.startsWith("--url="));

  if (flagValue) {
    return flagValue.slice("--url=".length);
  }

  const firstPositional = args.find((arg) => !arg.startsWith("-"));

  return firstPositional;
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

const main = async () => {
  try {
    const baseUrl = normalizeBaseUrl(getCliUrl() ?? process.env.PRODUCTION_URL ?? "");

    console.log(`Running production verification for ${baseUrl}`);

    for (const route of routes) {
      await checkRoute(baseUrl, route);
    }

    console.log("Production verification passed.");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  }
};

await main();
