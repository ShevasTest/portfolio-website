"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import hljs from "highlight.js/lib/core";
import type { LanguageFn } from "highlight.js";
import bash from "highlight.js/lib/languages/bash";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import {
  AI_CHAT_QUICK_PROMPTS,
  buildAssistantReply,
  type AssistantReply,
} from "@/lib/ai-chat";

type ChatRole = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
  streaming: boolean;
}

interface StreamMetrics {
  model: string;
  latencyMs: number;
  promptTokens: number;
  completionTokens: number;
}

const HIGHLIGHT_LANGUAGES: Array<[string, LanguageFn]> = [
  ["bash", bash],
  ["javascript", javascript],
  ["js", javascript],
  ["json", json],
  ["typescript", typescript],
  ["ts", typescript],
  ["tsx", typescript],
  ["xml", xml],
  ["html", xml],
  ["css", css],
];

for (const [name, language] of HIGHLIGHT_LANGUAGES) {
  if (!hljs.getLanguage(name)) {
    hljs.registerLanguage(name, language);
  }
}

const STREAM_INTERVAL_MS = 20;
const STREAM_PATTERN = [1, 2, 2, 3, 1, 3] as const;

const revealTransition = {
  duration: 0.62,
  ease: [0.22, 1, 0.36, 1] as const,
};

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
});

const INITIAL_ASSISTANT_MESSAGE = `### Welcome to the AI Chat Interface

This demo simulates a **streaming LLM chat** in real time.

- Markdown is rendered with headings, lists, and tables.
- Code fences are syntax highlighted by language.
- Responses stream token-by-token for realistic UX.

Try one of the preset prompts below or type your own request.`;

function createMessageId(role: ChatRole): string {
  return `${role}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeLanguage(language?: string): string | undefined {
  if (!language) {
    return undefined;
  }

  const normalized = language.toLowerCase();

  if (normalized === "jsx") {
    return "javascript";
  }

  if (normalized === "ts") {
    return "typescript";
  }

  if (normalized === "sh" || normalized === "shell") {
    return "bash";
  }

  if (normalized === "sol" || normalized === "solidity") {
    return "typescript";
  }

  if (normalized === "html") {
    return "xml";
  }

  return normalized;
}

function highlightCode(source: string, language?: string): string {
  const normalizedLanguage = normalizeLanguage(language);

  if (normalizedLanguage && hljs.getLanguage(normalizedLanguage)) {
    return hljs.highlight(source, {
      language: normalizedLanguage,
      ignoreIllegals: true,
    }).value;
  }

  return hljs.highlightAuto(source).value;
}

const markdownComponents: Components = {
  p: ({ children }) => <p className="mb-3 text-sm leading-relaxed text-text">{children}</p>,
  h3: ({ children }) => <h3 className="mb-2 mt-1 text-base font-semibold text-white">{children}</h3>,
  h4: ({ children }) => (
    <h4 className="mb-1 mt-3 font-mono text-xs uppercase tracking-[0.12em] text-cyan/80">{children}</h4>
  ),
  ul: ({ children }) => <ul className="mb-3 space-y-1.5 pl-4 text-sm text-text-muted">{children}</ul>,
  ol: ({ children }) => <ol className="mb-3 space-y-1.5 pl-4 text-sm text-text-muted">{children}</ol>,
  li: ({ children }) => <li className="list-disc">{children}</li>,
  table: ({ children }) => (
    <div className="mb-3 overflow-x-auto">
      <table className="w-full min-w-[340px] border-collapse text-left text-xs text-text-muted">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="border-b border-white/[0.1] text-text">{children}</thead>,
  th: ({ children }) => <th className="px-2 py-2 font-medium">{children}</th>,
  td: ({ children }) => <td className="border-b border-white/[0.05] px-2 py-2">{children}</td>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-cyan underline decoration-cyan/40 underline-offset-2 transition-colors hover:text-cyan/80"
    >
      {children}
    </a>
  ),
  code: (props) => {
    const { className, children } = props;
    const inline = "inline" in props && Boolean((props as { inline?: boolean }).inline);
    const rawCode = String(children).replace(/\n$/, "");

    if (inline) {
      return (
        <code className="rounded-md border border-white/[0.1] bg-white/[0.05] px-1.5 py-0.5 font-mono text-[12px] text-cyan/90">
          {rawCode}
        </code>
      );
    }

    const languageMatch = /language-([\w-]+)/.exec(className ?? "");
    const language = normalizeLanguage(languageMatch?.[1]) ?? "plaintext";
    const highlighted = highlightCode(rawCode, language);

    return (
      <pre className="mb-3 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0d0d14]">
        <div className="border-b border-white/[0.08] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted">
          {language}
        </div>
        <code
          className="hljs block overflow-x-auto px-3 py-3 font-mono text-xs leading-relaxed"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
    );
  },
};

function MarkdownMessage({ content, streaming }: { content: string; streaming: boolean }) {
  return (
    <div className="text-text-muted">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {content}
      </ReactMarkdown>
      {streaming && <span className="inline-block h-3 w-1 animate-pulse rounded-sm bg-cyan align-middle" />}
    </div>
  );
}

function formatMessageTime(timestamp: number): string {
  return timeFormatter.format(new Date(timestamp));
}

function getStreamRate(metrics: StreamMetrics | null): string {
  if (!metrics || metrics.latencyMs <= 0) {
    return "—";
  }

  const tokensPerSecond = Math.round(metrics.completionTokens / (metrics.latencyMs / 1000));
  return `${tokensPerSecond} tok/s`;
}

export function AIChatInterfaceView() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: createMessageId("assistant"),
      role: "assistant",
      content: INITIAL_ASSISTANT_MESSAGE,
      createdAt: Date.now() - 36_000,
      streaming: false,
    },
  ]);
  const [draft, setDraft] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [lastMetrics, setLastMetrics] = useState<StreamMetrics | null>(null);

  const streamIntervalRef = useRef<number | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);

  const userTurns = useMemo(
    () => messages.reduce((count, message) => count + (message.role === "user" ? 1 : 0), 0),
    [messages]
  );

  const assistantCharacters = useMemo(
    () =>
      messages.reduce(
        (count, message) => count + (message.role === "assistant" ? message.content.length : 0),
        0
      ),
    [messages]
  );

  const stopStream = useCallback(() => {
    if (streamIntervalRef.current !== null) {
      window.clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }
  }, []);

  useEffect(() => stopStream, [stopStream]);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const startStreamingReply = useCallback(
    (reply: AssistantReply) => {
      stopStream();

      const assistantId = createMessageId("assistant");
      const fullText = reply.markdown;

      setMessages((previous) => [
        ...previous,
        {
          id: assistantId,
          role: "assistant",
          content: "",
          createdAt: Date.now(),
          streaming: true,
        },
      ]);
      setIsStreaming(true);

      const startedAt = performance.now();
      let cursor = 0;
      let patternIndex = 0;

      streamIntervalRef.current = window.setInterval(() => {
        const chunkSize = STREAM_PATTERN[patternIndex % STREAM_PATTERN.length];
        patternIndex += 1;

        const nextCursor = Math.min(cursor + chunkSize, fullText.length);
        const chunk = fullText.slice(cursor, nextCursor);
        cursor = nextCursor;

        setMessages((previous) =>
          previous.map((message) =>
            message.id === assistantId
              ? {
                  ...message,
                  content: message.content + chunk,
                }
              : message
          )
        );

        if (cursor >= fullText.length) {
          stopStream();

          const elapsed = Math.round(performance.now() - startedAt);

          setMessages((previous) =>
            previous.map((message) =>
              message.id === assistantId
                ? {
                    ...message,
                    streaming: false,
                  }
                : message
            )
          );

          setLastMetrics({
            model: reply.model,
            promptTokens: reply.promptTokens,
            completionTokens: reply.completionTokens,
            latencyMs: Math.max(reply.latencyMs, elapsed),
          });
          setIsStreaming(false);
        }
      }, STREAM_INTERVAL_MS);
    },
    [stopStream]
  );

  const sendPrompt = useCallback(
    (rawPrompt: string) => {
      const prompt = rawPrompt.trim();

      if (!prompt || isStreaming) {
        return;
      }

      setMessages((previous) => [
        ...previous,
        {
          id: createMessageId("user"),
          role: "user",
          content: prompt,
          createdAt: Date.now(),
          streaming: false,
        },
      ]);

      setDraft("");
      if (composerRef.current) {
        composerRef.current.style.height = "44px";
      }

      const reply = buildAssistantReply(prompt);
      startStreamingReply(reply);
    },
    [isStreaming, startStreamingReply]
  );

  function handleDraftChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setDraft(event.target.value);

    event.target.style.height = "0px";
    event.target.style.height = `${Math.min(event.target.scrollHeight, 160)}px`;
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendPrompt(draft);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg pb-24">
      <div className="pointer-events-none absolute left-1/2 top-[-240px] h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-purple/[0.1] blur-[140px]" />
      <div className="pointer-events-none absolute right-[-180px] top-[38%] h-[420px] w-[420px] rounded-full bg-cyan/[0.08] blur-[120px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:52px_52px]" />

      <header className="relative z-20 border-b border-white/[0.06] bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/#projects"
            className="group inline-flex items-center gap-2 font-mono text-xs text-text-muted transition-colors hover:text-purple"
          >
            <span className="transition-transform group-hover:-translate-x-0.5">←</span>
            Back to portfolio
          </Link>

          <div className="flex items-center gap-2 rounded-full border border-purple/20 bg-purple/10 px-3 py-1 text-[11px] font-medium text-purple/95">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple" />
            Streaming demo online
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-12">
        <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={revealTransition}>
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan/20 bg-cyan/10 px-3 py-1 font-mono text-xs text-cyan/90">
            🤖 Project #2 · AI Chat Interface
          </p>

          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl">
            Conversational UI with <span className="text-gradient">streaming markdown + code intelligence</span>
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-text-muted sm:text-base">
            A polished chat surface built for AI products: token-by-token response streaming, markdown rendering,
            syntax-highlighted code blocks, and responsive interaction patterns for desktop and mobile.
          </p>
        </motion.section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_0.8fr]">
          <motion.article
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...revealTransition, delay: 0.08 }}
            className="overflow-hidden rounded-2xl border border-white/[0.08] bg-bg-glass backdrop-blur-md"
          >
            <div className="border-b border-white/[0.08] px-4 py-3 sm:px-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">Session</p>
                  <h2 className="text-lg font-semibold text-white sm:text-xl">SHEVAS Assistant Sandbox</h2>
                </div>

                <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 font-mono text-[11px] text-text-muted">
                  <span className={`h-1.5 w-1.5 rounded-full ${isStreaming ? "animate-pulse bg-cyan" : "bg-white/30"}`} />
                  {isStreaming ? "Streaming response" : "Idle"}
                </div>
              </div>
            </div>

            <div ref={viewportRef} className="max-h-[62vh] space-y-3 overflow-y-auto px-4 py-4 sm:px-5">
              <AnimatePresence initial={false}>
                {messages.map((message) => {
                  const isUser = message.role === "user";

                  return (
                    <motion.article
                      key={message.id}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] as const }}
                      className={`max-w-[95%] rounded-2xl border px-3.5 py-3 sm:px-4 ${
                        isUser
                          ? "ml-auto border-purple/25 bg-purple/12"
                          : "mr-auto border-white/[0.09] bg-white/[0.03]"
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.12em] text-text-muted">
                        <span className={isUser ? "text-purple/80" : "text-cyan/80"}>
                          {isUser ? "You" : "Assistant"}
                        </span>
                        <span>{formatMessageTime(message.createdAt)}</span>
                      </div>

                      {isUser ? (
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-text">{message.content}</p>
                      ) : (
                        <MarkdownMessage content={message.content} streaming={message.streaming} />
                      )}
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>

            <div className="border-t border-white/[0.08] px-4 py-4 sm:px-5">
              <div className="mb-3 flex flex-wrap gap-2">
                {AI_CHAT_QUICK_PROMPTS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => sendPrompt(preset.prompt)}
                    disabled={isStreaming}
                    className="rounded-full border border-white/[0.12] bg-white/[0.02] px-3 py-1.5 text-xs text-text-muted transition-colors hover:border-cyan/30 hover:text-cyan disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  sendPrompt(draft);
                }}
                className="flex items-end gap-2"
              >
                <textarea
                  ref={composerRef}
                  value={draft}
                  onChange={handleDraftChange}
                  onKeyDown={handleComposerKeyDown}
                  placeholder="Ask about DeFi, AI UX, bot architecture, or contract safety..."
                  rows={1}
                  className="min-h-[44px] flex-1 resize-none rounded-xl border border-white/[0.12] bg-white/[0.03] px-3 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-text-muted/70 focus:border-cyan/35"
                />

                <button
                  type="submit"
                  disabled={isStreaming || draft.trim().length === 0}
                  className="h-[44px] rounded-xl border border-cyan/30 bg-cyan/15 px-4 text-sm font-medium text-cyan transition-all hover:border-cyan hover:bg-cyan/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isStreaming ? "Streaming..." : "Send"}
                </button>
              </form>
            </div>
          </motion.article>

          <motion.aside
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...revealTransition, delay: 0.14 }}
            className="space-y-4"
          >
            <section className="rounded-2xl border border-white/[0.08] bg-bg-glass p-4 backdrop-blur-md sm:p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">Telemetry</p>
              <h3 className="mt-1 text-lg font-semibold text-white">Runtime stats</h3>

              <div className="mt-4 space-y-2.5 text-sm">
                <div className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2">
                  <span className="text-text-muted">Model</span>
                  <span className="max-w-[60%] text-right font-mono text-xs text-cyan">
                    {lastMetrics?.model ?? "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2">
                  <span className="text-text-muted">Latency</span>
                  <span className="font-mono text-xs text-text">
                    {lastMetrics ? `${lastMetrics.latencyMs} ms` : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2">
                  <span className="text-text-muted">Output speed</span>
                  <span className="font-mono text-xs text-text">{getStreamRate(lastMetrics)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2">
                  <span className="text-text-muted">Prompt / completion</span>
                  <span className="font-mono text-xs text-text">
                    {lastMetrics
                      ? `${lastMetrics.promptTokens} / ${lastMetrics.completionTokens} tok`
                      : "—"}
                  </span>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-white/[0.08] bg-bg-glass p-4 backdrop-blur-md sm:p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">Conversation</p>
              <h3 className="mt-1 text-lg font-semibold text-white">Live counters</h3>

              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-purple/20 bg-purple/10 px-3 py-2.5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-purple/80">User turns</p>
                  <p className="mt-1 text-xl font-semibold text-purple">{userTurns}</p>
                </div>
                <div className="rounded-xl border border-cyan/20 bg-cyan/10 px-3 py-2.5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-cyan/80">Messages</p>
                  <p className="mt-1 text-xl font-semibold text-cyan">{messages.length}</p>
                </div>
                <div className="col-span-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-2.5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-muted">Assistant chars</p>
                  <p className="mt-1 text-xl font-semibold text-white">{assistantCharacters.toLocaleString("en-US")}</p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-white/[0.08] bg-bg-glass p-4 backdrop-blur-md sm:p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">Features shipped</p>
              <ul className="mt-3 space-y-2 text-sm text-text-muted">
                {[
                  "Token-by-token response streaming",
                  "Markdown parser with table/list support",
                  "Syntax-highlighted fenced code blocks",
                  "Preset prompts + responsive composer UX",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </section>
          </motion.aside>
        </section>
      </main>
    </div>
  );
}
