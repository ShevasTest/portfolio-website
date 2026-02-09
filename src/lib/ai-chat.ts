export interface QuickPrompt {
  id: string;
  label: string;
  prompt: string;
}

export interface AssistantReply {
  markdown: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
}

interface ReplyTemplate {
  test: (normalizedPrompt: string) => boolean;
  markdown: string;
}

const MODEL_NAME = "SHEVAS Copilot v2 (mock stream)";

export const AI_CHAT_QUICK_PROMPTS: QuickPrompt[] = [
  {
    id: "defi-explain",
    label: "Explain DeFi yield",
    prompt: "Explain DeFi yield strategy for a beginner, include a safe checklist.",
  },
  {
    id: "stream-code",
    label: "Build streaming UI",
    prompt: "Show a React pattern for streaming assistant tokens in a chat UI.",
  },
  {
    id: "telegram-flow",
    label: "Telegram bot flow",
    prompt: "Design Telegram bot command flow with AI + wallet alerts.",
  },
  {
    id: "contract-risk",
    label: "Contract risk review",
    prompt: "Give me a smart contract risk review checklist in markdown.",
  },
];

function estimateTokens(text: string): number {
  return Math.max(8, Math.round(text.trim().length / 4));
}

const REPLY_TEMPLATES: ReplyTemplate[] = [
  {
    test: (prompt) =>
      prompt.includes("defi") || prompt.includes("yield") || prompt.includes("liquidity"),
    markdown: `### DeFi yield in plain English

DeFi yield is the return you earn by **deploying crypto capital** into on-chain protocols. Think of it as programmable finance with transparent rules.

| Layer | What generates yield | Main risk |
| --- | --- | --- |
| Lending | Borrowers pay interest | Liquidation cascades |
| LP / AMM | Trading fees + incentives | Impermanent loss |
| Staking / Restaking | Network rewards | Slashing / smart contract risk |

#### Safe execution checklist
- Start with blue-chip protocols (Aave, Uniswap, Lido).
- Cap allocation per strategy (example: max 20%).
- Track \`TVL\`, oracle dependencies, and unlock schedules.
- Set automated alerts for APY collapse and volatility spikes.

~~~ts
interface YieldPosition {
  protocol: "Aave" | "Uniswap" | "Lido";
  allocationUsd: number;
  estApy: number;
  maxDrawdownPct: number;
}

export function estimateNetYield(position: YieldPosition): number {
  const riskBuffer = position.maxDrawdownPct * 0.25;
  return Math.max(position.estApy - riskBuffer, 0);
}
~~~

Want me to format this as a weekly monitoring playbook?`,
  },
  {
    test: (prompt) =>
      prompt.includes("stream") ||
      prompt.includes("chat ui") ||
      prompt.includes("react") ||
      prompt.includes("interface"),
    markdown: `### Streaming chat UI pattern (React)

For a premium chat experience, split the flow into **3 steps**:
1. Submit user prompt immediately.
2. Create empty assistant message placeholder.
3. Append chunks into the placeholder while data streams.

~~~tsx
type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
};

function applyChunk(messages: ChatMessage[], id: string, chunk: string): ChatMessage[] {
  return messages.map((message) =>
    message.id === id
      ? {
          ...message,
          content: message.content + chunk,
        }
      : message
  );
}
~~~

#### UX details that make it feel premium
- Keep the composer active while streaming, but disable duplicate submits.
- Auto-scroll only if user is near the bottom (avoid scroll hijack).
- Render markdown + syntax-highlighted code blocks.
- Show a tiny latency stat (users trust responsive systems).

If you want, I can also sketch an SSE endpoint contract for the backend.`,
  },
  {
    test: (prompt) =>
      prompt.includes("telegram") ||
      prompt.includes("bot") ||
      prompt.includes("wallet") ||
      prompt.includes("alert"),
    markdown: `### Telegram bot command architecture

Use a **command-first** flow with fast ACK + async jobs.

~~~bash
# Example stack
actions: /track /alert /portfolio /defi /help
runtime: node + grammy + redis queue + webhook
~~~

#### Suggested command map
- **/track** — add wallet to watchlist.
- **/alert** — create threshold (price, volume, whale tx).
- **/portfolio** — show PnL snapshot and allocation drift.
- **/defi** — summarize TVL shifts and opportunities.

~~~ts
export async function handleAlert(symbol: string, threshold: number) {
  return {
    kind: "price-alert",
    symbol,
    threshold,
    delivery: "telegram",
  } as const;
}
~~~

Focus on delivering **actionable cards** instead of long text walls.`,
  },
  {
    test: (prompt) =>
      prompt.includes("smart contract") ||
      prompt.includes("solidity") ||
      prompt.includes("audit") ||
      prompt.includes("risk"),
    markdown: `### Smart contract risk review checklist

#### 1) Access control
- Owner-only functions are minimized and time-locked.
- Emergency pause cannot lock user funds forever.

#### 2) Value movement
- Every external call follows checks-effects-interactions.
- Slippage and oracle freshness checks are enforced.

#### 3) Upgradeability
- Proxy admin keys are multisig-managed.
- Upgrade path has rollback and event logging.

~~~solidity
function withdraw(uint256 amount) external nonReentrant {
  uint256 balance = userBalance[msg.sender];
  require(amount > 0 && amount <= balance, "invalid amount");

  userBalance[msg.sender] = balance - amount;
  token.safeTransfer(msg.sender, amount);
}
~~~

Run static analysis + fuzzing before mainnet release.`,
  },
];

const FALLBACK_REPLY = `### Product blueprint for your request

Great prompt. I would structure it in three layers:

- **Interface layer**: responsive chat surface with typing/stream states.
- **Inference layer**: API route that supports token streaming.
- **Ops layer**: logging, retries, guardrails, and analytics.

~~~json
{
  "ui": ["message list", "composer", "prompt presets"],
  "api": ["/api/chat", "stream chunks", "error fallback"],
  "ops": ["rate limit", "audit log", "latency metrics"]
}
~~~

If you share your exact constraint (speed, budget, model), I can optimize the architecture.`;

export function buildAssistantReply(prompt: string): AssistantReply {
  const normalizedPrompt = prompt.trim().toLowerCase();
  const template =
    REPLY_TEMPLATES.find((entry) => entry.test(normalizedPrompt))?.markdown ??
    FALLBACK_REPLY;

  const promptTokens = estimateTokens(prompt);
  const completionTokens = estimateTokens(template);
  const latencyMs = Math.min(2800, 820 + completionTokens * 7);

  return {
    markdown: template,
    model: MODEL_NAME,
    promptTokens,
    completionTokens,
    latencyMs,
  };
}
