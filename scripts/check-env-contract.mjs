import { readdir, readFile } from "node:fs/promises";
import { extname, join } from "node:path";

const SOURCE_DIR = join(process.cwd(), "src");
const ENV_TEMPLATE_PATH = join(process.cwd(), ".env.example");

const SUPPORTED_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);

const IGNORE_ENV_KEYS = new Set([
  "NODE_ENV",
  "VERCEL_ENV",
  "VERCEL_GIT_COMMIT_SHA",
  "GIT_COMMIT_SHA",
  "NEXT_RUNTIME",
]);

const ENV_ACCESS_REGEX = /process\.env\.([A-Z][A-Z0-9_]*)/g;
const ENV_DECLARATION_REGEX = /^\s*(?:export\s+)?([A-Z][A-Z0-9_]*)\s*=/;

/**
 * @param {string} dir
 * @returns {Promise<string[]>}
 */
const walkDirectory = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        return walkDirectory(fullPath);
      }

      return [fullPath];
    }),
  );

  return nested.flat();
};

/**
 * @param {string[]} values
 */
const uniqueSorted = (values) => [...new Set(values)].sort((left, right) => left.localeCompare(right));

const formatList = (values) => (values.length > 0 ? values.join(", ") : "(none)");

const main = async () => {
  console.log("SHEVAS environment contract check");
  console.log("");

  const allSourceFiles = await walkDirectory(SOURCE_DIR);
  const scanTargets = allSourceFiles.filter((filePath) => SUPPORTED_EXTENSIONS.has(extname(filePath)));

  const referencedEnvKeys = [];

  for (const filePath of scanTargets) {
    const source = await readFile(filePath, "utf8");

    for (const match of source.matchAll(ENV_ACCESS_REGEX)) {
      const envKey = match[1];

      if (envKey) {
        referencedEnvKeys.push(envKey);
      }
    }
  }

  const referencedKeys = uniqueSorted(referencedEnvKeys);
  const requiredCustomKeys = referencedKeys.filter((envKey) => !IGNORE_ENV_KEYS.has(envKey));

  const envTemplate = await readFile(ENV_TEMPLATE_PATH, "utf8");
  const declaredEnvKeys = uniqueSorted(
    envTemplate
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith("#"))
      .map((line) => ENV_DECLARATION_REGEX.exec(line)?.[1] ?? "")
      .filter((value) => value.length > 0),
  );

  const missingKeys = requiredCustomKeys.filter((key) => !declaredEnvKeys.includes(key));
  const extraDeclaredKeys = declaredEnvKeys.filter((key) => !requiredCustomKeys.includes(key));

  console.log(`Scanned source files: ${scanTargets.length}`);
  console.log(`Referenced process.env keys: ${formatList(referencedKeys)}`);
  console.log(`Custom runtime keys: ${formatList(requiredCustomKeys)}`);
  console.log(`.env.example keys: ${formatList(declaredEnvKeys)}`);
  console.log("");

  if (missingKeys.length > 0) {
    console.error(`❌ Missing key${missingKeys.length === 1 ? "" : "s"} in .env.example: ${missingKeys.join(", ")}`);
    process.exitCode = 1;
    return;
  }

  console.log("✅ .env.example covers all custom runtime env keys");

  if (extraDeclaredKeys.length > 0) {
    console.log(`ℹ️ Extra keys declared in .env.example (not referenced in src): ${extraDeclaredKeys.join(", ")}`);
  }
};

await main();
