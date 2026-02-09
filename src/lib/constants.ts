export const SITE = {
  name: "SHEVAS",
  tagline: "AI-Powered Web3 Builder",
  description:
    "Building products at the intersection of AI, Web3, and DeFi. From smart contracts to full-stack apps — I ship things that work.",
  url: "https://shevas.vercel.app",
  locale: "en_US",
  social: {
    telegram: "@Shevas_o",
    farcaster: "@shevas",
  },
  links: {
    telegram: "https://t.me/Shevas_o",
    farcaster: "https://warpcast.com/shevas",
    github: "https://github.com/ShevasTest",
  },
} as const;

export const NAV_ITEMS = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
] as const;

export const TECH_STACK = [
  { name: "TypeScript", category: "frontend" },
  { name: "React", category: "frontend" },
  { name: "Next.js", category: "frontend" },
  { name: "Node.js", category: "backend" },
  { name: "Python", category: "backend" },
  { name: "Solidity", category: "web3" },
  { name: "Ethereum", category: "web3" },
  { name: "Base", category: "web3" },
  { name: "Claude AI", category: "ai" },
  { name: "OpenAI", category: "ai" },
  { name: "Tailwind CSS", category: "frontend" },
  { name: "Three.js", category: "frontend" },
  { name: "PostgreSQL", category: "backend" },
  { name: "Docker", category: "tools" },
  { name: "Vercel", category: "tools" },
  { name: "Git", category: "tools" },
] as const;

export const PROJECTS = [
  {
    id: "crypto-dashboard",
    title: "Crypto Dashboard",
    description:
      "Real-time cryptocurrency dashboard with live prices, whale alerts, and portfolio tracking.",
    tags: ["Next.js", "CoinGecko API", "WebSocket", "Web3"],
    emoji: "🔥",
    href: "/projects/crypto-dashboard",
    cover: "/images/project-covers/crypto-dashboard.webp",
    color: "cyan" as const,
    size: "large" as const,
  },
  {
    id: "ai-chat",
    title: "AI Chat Interface",
    description:
      "Beautiful chat interface with streaming AI responses, markdown rendering, and code highlighting.",
    tags: ["React", "AI API", "Streaming", "UI/UX"],
    emoji: "🤖",
    href: "/projects/ai-chat",
    cover: "/images/project-covers/ai-chat.webp",
    color: "purple" as const,
    size: "medium" as const,
  },
  {
    id: "defi-analytics",
    title: "DeFi Analytics",
    description:
      "TVL dashboard with protocol comparison and on-chain analytics powered by DeFiLlama.",
    tags: ["DeFiLlama API", "Charts", "DeFi"],
    emoji: "📊",
    href: "/projects/defi-analytics",
    cover: "/images/project-covers/defi-analytics.webp",
    color: "cyan" as const,
    size: "medium" as const,
  },
  {
    id: "farcaster-widget",
    title: "Farcaster Social",
    description:
      "Social graph visualization and feed viewer for the Farcaster protocol.",
    tags: ["Neynar API", "Farcaster", "Social Graph"],
    emoji: "🟣",
    href: "/projects/farcaster-widget",
    cover: "/images/project-covers/farcaster-widget.webp",
    color: "purple" as const,
    size: "small" as const,
  },
  {
    id: "telegram-bot",
    title: "Telegram Bot",
    description:
      "Automated Telegram bot with AI capabilities and DeFi integrations.",
    tags: ["Telegram API", "Automation", "Bot"],
    emoji: "⚡",
    href: "/projects/telegram-bot",
    cover: "/images/project-covers/telegram-bot.webp",
    color: "cyan" as const,
    size: "small" as const,
  },
] as const;
