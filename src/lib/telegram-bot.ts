export type BotMessageRole = "user" | "bot" | "system";

export interface TelegramBotScenarioMessage {
  id: string;
  role: BotMessageRole;
  text: string;
  time: string;
  tag?: string;
}

export interface TelegramBotScenario {
  id: string;
  title: string;
  summary: string;
  outcome: string;
  accent: "cyan" | "purple";
  latencyMs: number;
  automationsTriggered: number;
  messages: TelegramBotScenarioMessage[];
}

export interface TelegramBotMetric {
  label: string;
  value: string;
  hint: string;
  accent: "cyan" | "purple" | "white";
}

export interface TelegramBotCommand {
  command: string;
  purpose: string;
  category: "Trading" | "Security" | "Automation" | "Analytics";
  responseTime: string;
}

export interface TelegramAutomationFlow {
  id: string;
  title: string;
  trigger: string;
  steps: string[];
  output: string;
}

export const TELEGRAM_BOT_METRICS: TelegramBotMetric[] = [
  {
    label: "Monthly active users",
    value: "2.4K",
    hint: "Retail + power users",
    accent: "cyan",
  },
  {
    label: "Median response time",
    value: "420 ms",
    hint: "Cached command pipeline",
    accent: "purple",
  },
  {
    label: "Automation workflows",
    value: "18",
    hint: "Alerts, reports, copy actions",
    accent: "white",
  },
  {
    label: "Bot uptime",
    value: "99.96%",
    hint: "Rolling 30-day window",
    accent: "cyan",
  },
];

export const TELEGRAM_BOT_COMMANDS: TelegramBotCommand[] = [
  {
    command: "/wallet",
    purpose: "Track selected wallets and mirror activity into a private watchlist.",
    category: "Analytics",
    responseTime: "~0.6s",
  },
  {
    command: "/alert",
    purpose: "Create price, volatility, and liquidation alerts with custom thresholds.",
    category: "Automation",
    responseTime: "~0.4s",
  },
  {
    command: "/yield",
    purpose: "Scan top APY opportunities across chains with risk-scored filters.",
    category: "Trading",
    responseTime: "~0.9s",
  },
  {
    command: "/guard",
    purpose: "Run contract risk checks before token approvals or LP deposits.",
    category: "Security",
    responseTime: "~1.2s",
  },
  {
    command: "/report",
    purpose: "Generate daily portfolio PnL digest with short AI commentary.",
    category: "Analytics",
    responseTime: "~0.8s",
  },
];

export const TELEGRAM_AUTOMATION_FLOWS: TelegramAutomationFlow[] = [
  {
    id: "whale-watch",
    title: "Whale Watch",
    trigger: "Wallet transfer > $250k",
    steps: [
      "Ingest on-chain transaction in real time",
      "Classify counterparty + token context",
      "Send Telegram alert with confidence score",
      "Offer one-tap follow-up actions",
    ],
    output: "Actionable whale notification in <5 seconds.",
  },
  {
    id: "yield-rotation",
    title: "Yield Rotation",
    trigger: "Daily 08:00 UTC cron",
    steps: [
      "Pull fresh APY + TVL from protocol adapters",
      "Filter by chain, lock duration, and risk",
      "Rank opportunities via weighted score",
      "Deliver digest with direct links",
    ],
    output: "Daily strategy brief for DeFi allocation.",
  },
  {
    id: "approval-guard",
    title: "Approval Guard",
    trigger: "User asks bot to verify a contract",
    steps: [
      "Fetch bytecode + owner metadata",
      "Check tax logic, blacklist, and proxy patterns",
      "Map findings to simple risk level",
      "Return recommendation + safer alternatives",
    ],
    output: "Fast pre-trade risk screening in chat.",
  },
];

export const TELEGRAM_BOT_SCENARIOS: TelegramBotScenario[] = [
  {
    id: "wallet-watch",
    title: "Wallet Watch Scenario",
    summary:
      "A user tracks a smart-money wallet and receives instant context when a large move happens.",
    outcome: "Alert delivered with token context + suggested actions.",
    accent: "cyan",
    latencyMs: 370,
    automationsTriggered: 3,
    messages: [
      {
        id: "wallet-watch-user-1",
        role: "user",
        text: "/wallet add 0x4b1f...a91c",
        time: "09:41",
      },
      {
        id: "wallet-watch-bot-1",
        role: "bot",
        text: "Tracking enabled. I will notify you for transfers above $100k and major DEX swaps.",
        time: "09:41",
        tag: "watchlist",
      },
      {
        id: "wallet-watch-system-1",
        role: "system",
        text: "Event detected: $684k USDC moved from tracked wallet to Base DEX router.",
        time: "11:06",
      },
      {
        id: "wallet-watch-bot-2",
        role: "bot",
        text: "Signal: probable accumulation. 5 similar wallets increased exposure to $AERO in the past 30m.",
        time: "11:06",
        tag: "insight",
      },
      {
        id: "wallet-watch-bot-3",
        role: "bot",
        text: "Quick actions: /chart aero · /set alert aero -4% · /copy position",
        time: "11:06",
      },
    ],
  },
  {
    id: "yield-scan",
    title: "Yield Scan Scenario",
    summary:
      "A user requests low-risk opportunities and receives ranked pools with APY and drawdown context.",
    outcome: "Bot returns top opportunities and sends a follow-up report automatically.",
    accent: "purple",
    latencyMs: 640,
    automationsTriggered: 4,
    messages: [
      {
        id: "yield-scan-user-1",
        role: "user",
        text: "/yield stablecoin base risk<medium",
        time: "14:18",
      },
      {
        id: "yield-scan-bot-1",
        role: "bot",
        text: "Scanning 22 pools on Base + Arbitrum. Applying TVL floor, audit score, and utilization filters…",
        time: "14:18",
        tag: "query",
      },
      {
        id: "yield-scan-bot-2",
        role: "bot",
        text: "Top match: Moonwell USDC (9.3% APY, $52M TVL, low utilization volatility).",
        time: "14:19",
        tag: "rank #1",
      },
      {
        id: "yield-scan-bot-3",
        role: "bot",
        text: "Second: Aave v3 USDC (7.1% APY, $410M TVL, highest safety score).",
        time: "14:19",
      },
      {
        id: "yield-scan-system-1",
        role: "system",
        text: "Daily digest scheduled for 08:00 tomorrow with updated APY deltas.",
        time: "14:19",
      },
    ],
  },
  {
    id: "security-guard",
    title: "Security Guard Scenario",
    summary:
      "Before approving a token contract, the user asks for a quick risk assessment directly in Telegram.",
    outcome: "Potential honeypot risk detected and safer alternatives suggested.",
    accent: "cyan",
    latencyMs: 910,
    automationsTriggered: 2,
    messages: [
      {
        id: "security-guard-user-1",
        role: "user",
        text: "/guard 0x98ab...32de",
        time: "21:52",
      },
      {
        id: "security-guard-bot-1",
        role: "bot",
        text: "Running risk scan: owner permissions, transfer tax, blacklist logic, and proxy upgradeability.",
        time: "21:52",
      },
      {
        id: "security-guard-system-1",
        role: "system",
        text: "Warning: transfer tax can spike to 35% and owner wallet retains blacklist authority.",
        time: "21:53",
      },
      {
        id: "security-guard-bot-2",
        role: "bot",
        text: "Risk level: HIGH. Recommendation: skip this token. Safer alternatives: /watchlist bluechips",
        time: "21:53",
        tag: "risk",
      },
    ],
  },
];
