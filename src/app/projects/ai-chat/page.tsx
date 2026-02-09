import { AIChatInterfaceView } from "@/components/projects/ai-chat/AIChatInterfaceView";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "AI Chat Interface — SHEVAS",
  description:
    "Interactive AI chat interface with token streaming, markdown rendering, and syntax-highlighted code responses.",
  path: "/projects/ai-chat",
  keywords: ["AI chat UI", "streaming responses", "markdown renderer"],
});

export default function AIChatInterfacePage() {
  return <AIChatInterfaceView />;
}
