import { TelegramBotLandingView } from "@/components/projects/telegram-bot/TelegramBotLandingView";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Telegram Bot Landing — SHEVAS",
  description:
    "Interactive Telegram bot landing page showcasing automation workflows, command UX, and DeFi/AI assistant capabilities.",
  path: "/projects/telegram-bot",
  keywords: ["Telegram bot", "automation workflows", "AI assistant"],
});

export default function TelegramBotLandingPage() {
  return <TelegramBotLandingView />;
}
