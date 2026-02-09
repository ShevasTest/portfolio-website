import { execFile as execFileCallback } from "node:child_process";
import { constants } from "node:fs";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";

const execFile = promisify(execFileCallback);

/** @typedef {"pass" | "warn" | "fail" | "info"} ResultStatus */

/**
 * @param {string[]} args
 */
const runGit = async (args) => {
  const { stdout } = await execFile("git", args, {
    env: process.env,
    maxBuffer: 1024 * 1024,
  });

  return stdout.trim();
};

/**
 * @param {string} path
 */
const fileExists = async (path) => {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

/**
 * @param {number} value
 */
const pluralize = (value, singular, plural) => (value === 1 ? singular : plural);

const results = [];

/**
 * @param {ResultStatus} status
 * @param {string} title
 * @param {string} [details]
 */
const pushResult = (status, title, details = "") => {
  results.push({ status, title, details });
};

const cwd = process.cwd();
const requiredFiles = [
  { path: "vercel.json", label: "Vercel config" },
  { path: ".env.example", label: "Environment template" },
  { path: "DEPLOYMENT.md", label: "Deployment runbook" },
  { path: ".github/workflows/deploy-preflight.yml", label: "Preflight workflow" },
  { path: ".github/workflows/production-verify.yml", label: "Production verify workflow" },
  { path: "scripts/connect-origin.mjs", label: "Origin connector script" },
  { path: "scripts/check-env-contract.mjs", label: "Environment contract script" },
  { path: "scripts/smoke-routes.mjs", label: "Smoke routes script" },
  { path: "scripts/verify-production.mjs", label: "Production verifier script" },
];

const recommendations = [];

const main = async () => {
  console.log("SHEVAS deploy readiness report");
  console.log(`Workspace: ${cwd}`);
  console.log("");

  let isGitRepo = false;

  try {
    const gitRepoFlag = await runGit(["rev-parse", "--is-inside-work-tree"]);
    isGitRepo = gitRepoFlag === "true";

    if (isGitRepo) {
      pushResult("pass", "Git repository detected");
    } else {
      pushResult("fail", "Current directory is not a git repository");
      recommendations.push("Run `git init -b main` before deployment handoff.");
    }
  } catch {
    pushResult("fail", "Git repository check failed");
    recommendations.push("Ensure git is installed and this folder is a repository.");
  }

  if (isGitRepo) {
    let currentBranch = "";

    try {
      currentBranch = await runGit(["rev-parse", "--abbrev-ref", "HEAD"]);
      if (currentBranch === "main") {
        pushResult("pass", "Active branch is main");
      } else {
        pushResult("warn", `Active branch is ${currentBranch}`);
        recommendations.push("Switch to main before production push: `git checkout main`.");
      }
    } catch {
      pushResult("fail", "Failed to resolve active git branch");
    }

    try {
      const latestCommit = await runGit(["rev-parse", "--short", "HEAD"]);
      pushResult("info", "Latest commit", latestCommit);
    } catch {
      pushResult("warn", "No commits found yet");
      recommendations.push("Create at least one commit before connecting Vercel.");
    }

    try {
      const porcelain = await runGit(["status", "--porcelain"]);
      if (porcelain.length === 0) {
        pushResult("pass", "Working tree is clean");
      } else {
        const changedCount = porcelain
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.length > 0).length;

        pushResult(
          "warn",
          "Working tree has uncommitted changes",
          `${changedCount} ${pluralize(changedCount, "entry", "entries")} in git status`,
        );
        recommendations.push("Commit or stash local changes before final deployment push.");
      }
    } catch {
      pushResult("fail", "Unable to read git status");
    }

    let originUrl = "";

    try {
      originUrl = await runGit(["remote", "get-url", "origin"]);
      pushResult("pass", "Git remote origin configured", originUrl);
    } catch {
      pushResult("warn", "Git remote origin is missing");
      recommendations.push(
        "Add remote and push main: `npm run connect:origin -- --url=<repo-url> --push`.",
      );
    }

    if (originUrl) {
      try {
        const upstream = await runGit(["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"]);
        pushResult("pass", "Upstream tracking branch set", upstream);

        try {
          const divergence = await runGit(["rev-list", "--left-right", "--count", `${upstream}...HEAD`]);
          const [behindRaw, aheadRaw] = divergence.split(/\s+/);
          const behind = Number.parseInt(behindRaw ?? "0", 10) || 0;
          const ahead = Number.parseInt(aheadRaw ?? "0", 10) || 0;

          if (ahead === 0 && behind === 0) {
            pushResult("pass", "Local branch is in sync with upstream");
          } else if (behind > 0 && ahead > 0) {
            pushResult("warn", "Local branch diverged from upstream", `ahead ${ahead}, behind ${behind}`);
            recommendations.push("Reconcile divergence before deploy (pull/rebase and re-run checks).");
          } else if (behind > 0) {
            pushResult("warn", "Local branch is behind upstream", `behind ${behind}`);
            recommendations.push("Pull latest upstream commits before deployment.");
          } else {
            pushResult("info", "Local branch has commits not pushed yet", `ahead ${ahead}`);
          }
        } catch {
          pushResult("warn", "Failed to compute ahead/behind status");
        }
      } catch {
        pushResult("warn", "Upstream tracking branch is not set");
        recommendations.push("Set upstream for main: `git push -u origin main`.");
      }
    }
  }

  for (const requiredFile of requiredFiles) {
    const fullPath = join(cwd, requiredFile.path);
    const exists = await fileExists(fullPath);

    if (exists) {
      pushResult("pass", `${requiredFile.label} present`, requiredFile.path);
    } else {
      pushResult("fail", `${requiredFile.label} missing`, requiredFile.path);
    }
  }

  try {
    const packageJsonPath = join(cwd, "package.json");
    const packageRaw = await readFile(packageJsonPath, "utf8");
    const packageData = JSON.parse(packageRaw);
    const scripts = packageData.scripts ?? {};

    const requiredScripts = [
      "check:deploy",
      "connect:origin",
      "env:contract",
      "smoke:routes",
      "verify:production",
    ];
    const missingScripts = requiredScripts.filter((scriptName) => typeof scripts[scriptName] !== "string");

    if (missingScripts.length === 0) {
      pushResult("pass", "Deployment scripts are registered in package.json");
    } else {
      pushResult("fail", "Missing deployment script(s)", missingScripts.join(", "));
    }
  } catch {
    pushResult("fail", "Unable to parse package.json");
  }

  try {
    const envTemplatePath = join(cwd, ".env.example");
    const envTemplate = await readFile(envTemplatePath, "utf8");

    if (envTemplate.includes("NEYNAR_API_KEY")) {
      pushResult("pass", "Environment template includes NEYNAR_API_KEY");
    } else {
      pushResult("warn", "Environment template does not mention NEYNAR_API_KEY");
    }
  } catch {
    pushResult("warn", "Unable to inspect .env.example");
  }

  const iconByStatus = {
    pass: "✅",
    warn: "⚠️",
    fail: "❌",
    info: "ℹ️",
  };

  for (const result of results) {
    console.log(`${iconByStatus[result.status]} ${result.title}`);
    if (result.details) {
      console.log(`   ${result.details}`);
    }
  }

  console.log("");

  const counts = {
    pass: results.filter((result) => result.status === "pass").length,
    warn: results.filter((result) => result.status === "warn").length,
    fail: results.filter((result) => result.status === "fail").length,
    info: results.filter((result) => result.status === "info").length,
  };

  console.log(
    `Summary: ${counts.pass} pass, ${counts.warn} warning${counts.warn === 1 ? "" : "s"}, ${counts.fail} failure${counts.fail === 1 ? "" : "s"}, ${counts.info} info`,
  );

  if (recommendations.length > 0) {
    const uniqueRecommendations = [...new Set(recommendations)];
    console.log("\nRecommended next actions:");

    for (const recommendation of uniqueRecommendations) {
      console.log(`- ${recommendation}`);
    }
  }

  if (counts.fail > 0) {
    process.exitCode = 1;
  }
};

await main();
