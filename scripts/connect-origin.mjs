import { execFile as execFileCallback, spawn } from "node:child_process";
import { promisify } from "node:util";

const execFile = promisify(execFileCallback);
const DEFAULT_BRANCH = "main";

const helpMessage = `Configure git origin for GitHub + optionally push main

Usage:
  npm run connect:origin -- --url=https://github.com/<user>/<repo>.git
  npm run connect:origin -- --url=https://github.com/<user>/<repo>.git --push

Options:
  --url=<remote-url>       Required. GitHub remote URL (HTTPS or SSH)
  --branch=<name>          Target branch for push (default: ${DEFAULT_BRANCH})
  --push                   Run \`git push -u origin <branch>\` after remote setup
  --force-set-url          Update existing origin when URL differs
  --dry-run                Print actions without modifying git config
  -h, --help               Show this help message
`;

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
 * @param {string[]} args
 */
const runGitInteractive = (args) =>
  new Promise((resolve, reject) => {
    const child = spawn("git", args, {
      env: process.env,
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`git ${args.join(" ")} exited with code ${code ?? "unknown"}`));
    });
  });

/**
 * @param {string} url
 */
const isLikelyGitHubUrl = (url) =>
  /^(https:\/\/github\.com\/[\w.-]+\/[\w.-]+(?:\.git)?|git@github\.com:[\w.-]+\/[\w.-]+(?:\.git)?)$/i.test(
    url,
  );

const parseOptions = () => {
  const args = process.argv.slice(2);

  if (args.some((arg) => arg === "-h" || arg === "--help")) {
    console.log(helpMessage);
    process.exit(0);
  }

  const options = {
    url: "",
    branch: DEFAULT_BRANCH,
    push: false,
    forceSetUrl: false,
    dryRun: false,
  };

  for (const arg of args) {
    if (arg.startsWith("--url=")) {
      options.url = arg.slice("--url=".length).trim();
      continue;
    }

    if (arg.startsWith("--branch=")) {
      options.branch = arg.slice("--branch=".length).trim() || DEFAULT_BRANCH;
      continue;
    }

    if (arg === "--push") {
      options.push = true;
      continue;
    }

    if (arg === "--force-set-url") {
      options.forceSetUrl = true;
      continue;
    }

    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}\n\n${helpMessage}`);
  }

  if (!options.url) {
    throw new Error(`Missing required --url option.\n\n${helpMessage}`);
  }

  return options;
};

const main = async () => {
  const options = parseOptions();

  console.log("SHEVAS git origin connector");
  console.log(`Target branch: ${options.branch}`);
  console.log(`Remote URL: ${options.url}`);
  console.log(`Mode: ${options.dryRun ? "dry-run" : "apply"}`);

  if (!isLikelyGitHubUrl(options.url)) {
    console.warn("⚠ URL does not look like a standard GitHub remote. Continuing anyway.");
  }

  const isGitRepo = await runGit(["rev-parse", "--is-inside-work-tree"]).catch(() => "false");

  if (isGitRepo !== "true") {
    throw new Error("Current directory is not a git repository. Run this script from /site.");
  }

  const activeBranch = await runGit(["rev-parse", "--abbrev-ref", "HEAD"]);

  if (activeBranch !== options.branch) {
    throw new Error(
      `Current branch is ${activeBranch}. Switch to ${options.branch} before configuring origin/push.`,
    );
  }

  const workingTree = await runGit(["status", "--porcelain"]);

  if (workingTree.length > 0) {
    throw new Error("Working tree is not clean. Commit/stash changes before running origin handoff.");
  }

  let currentOrigin = "";

  try {
    currentOrigin = await runGit(["remote", "get-url", "origin"]);
  } catch {
    currentOrigin = "";
  }

  if (!currentOrigin) {
    if (options.dryRun) {
      console.log(`• would run: git remote add origin ${options.url}`);
    } else {
      await runGit(["remote", "add", "origin", options.url]);
      console.log("✅ Added git remote origin");
    }
  } else if (currentOrigin === options.url) {
    console.log("✅ git remote origin already matches target URL");
  } else if (options.forceSetUrl) {
    if (options.dryRun) {
      console.log(`• would run: git remote set-url origin ${options.url}`);
    } else {
      await runGit(["remote", "set-url", "origin", options.url]);
      console.log("✅ Updated git remote origin URL");
    }
  } else {
    throw new Error(
      `Existing origin differs:\n  current: ${currentOrigin}\n  target:  ${options.url}\nUse --force-set-url to replace origin.`,
    );
  }

  if (!options.dryRun) {
    const remoteView = await runGit(["remote", "-v"]);
    console.log("\nCurrent remotes:");
    console.log(remoteView || "(none)");
  }

  if (options.push) {
    if (options.dryRun) {
      console.log(`• would run: git push -u origin ${options.branch}`);
    } else {
      console.log(`\nPushing ${options.branch} to origin...`);
      await runGitInteractive(["push", "-u", "origin", options.branch]);
      console.log("✅ Push completed");
    }
  } else {
    console.log(`\nNext step: git push -u origin ${options.branch}`);
  }

  console.log("\nAfter push: import the repo in Vercel and run production verification.");
};

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
