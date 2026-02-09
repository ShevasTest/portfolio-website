"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { SITE } from "@/lib/constants";
import {
  TELEGRAM_AUTOMATION_FLOWS,
  TELEGRAM_BOT_COMMANDS,
  TELEGRAM_BOT_METRICS,
  TELEGRAM_BOT_SCENARIOS,
  type BotMessageRole,
} from "@/lib/telegram-bot";

const reveal = {
  duration: 0.62,
  ease: [0.22, 1, 0.36, 1] as const,
};

const PLAYBACK_INTERVAL_MS = 220;

const DELIVERY_MODULES = [
  "Wallet tracking",
  "Whale alerts",
  "AI command parser",
  "Scheduled digests",
  "Security scoring",
  "One-tap actions",
] as const;

function getMetricAccentClass(accent: "cyan" | "purple" | "white"): string {
  if (accent === "cyan") {
    return "text-cyan";
  }

  if (accent === "purple") {
    return "text-purple";
  }

  return "text-white";
}

function getCategoryClass(category: (typeof TELEGRAM_BOT_COMMANDS)[number]["category"]): string {
  if (category === "Security") {
    return "border-purple/25 bg-purple/10 text-purple";
  }

  if (category === "Trading") {
    return "border-cyan/25 bg-cyan/10 text-cyan";
  }

  if (category === "Automation") {
    return "border-white/[0.12] bg-white/[0.05] text-text";
  }

  return "border-cyan/20 bg-cyan/8 text-cyan/90";
}

function getMessageContainerClass(role: BotMessageRole): string {
  if (role === "user") {
    return "ml-auto max-w-[88%] rounded-2xl border border-purple/30 bg-purple/12 px-3.5 py-2.5";
  }

  if (role === "bot") {
    return "mr-auto max-w-[88%] rounded-2xl border border-cyan/20 bg-cyan/10 px-3.5 py-2.5";
  }

  return "mx-auto max-w-[96%] rounded-xl border border-white/[0.1] bg-white/[0.03] px-3 py-2 text-center";
}

export function TelegramBotLandingView() {
  const defaultScenario = TELEGRAM_BOT_SCENARIOS[0]!;

  const [activeScenarioId, setActiveScenarioId] = useState(defaultScenario.id);
  const [visibleMessages, setVisibleMessages] = useState(0);

  const activeScenario = useMemo(
    () =>
      TELEGRAM_BOT_SCENARIOS.find((scenario) => scenario.id === activeScenarioId) ??
      defaultScenario,
    [activeScenarioId, defaultScenario]
  );

  const visibleTranscript = useMemo(
    () => activeScenario.messages.slice(0, visibleMessages),
    [activeScenario.messages, visibleMessages]
  );

  useEffect(() => {
    setVisibleMessages(0);

    const total = activeScenario.messages.length;

    const intervalId = window.setInterval(() => {
      setVisibleMessages((previous) => {
        if (previous >= total) {
          window.clearInterval(intervalId);
          return previous;
        }

        return previous + 1;
      });
    }, PLAYBACK_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [activeScenario.id, activeScenario.messages.length]);

  const scenarioIsCyan = activeScenario.accent === "cyan";
  const scenarioAccentClass = scenarioIsCyan
    ? "border-cyan/25 bg-cyan/10 text-cyan"
    : "border-purple/25 bg-purple/10 text-purple";

  const telegramDemoLink = `${SITE.links.telegram}?text=${encodeURIComponent(
    "Hey SHEVAS, I saw your Telegram Bot demo and want to build a similar automation stack."
  )}`;

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg pb-24">
      <div className="pointer-events-none absolute left-1/2 top-[-250px] h-[540px] w-[930px] -translate-x-1/2 rounded-full bg-cyan/[0.08] blur-[150px]" />
      <div className="pointer-events-none absolute right-[-180px] top-[44%] h-[400px] w-[400px] rounded-full bg-purple/[0.1] blur-[130px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:52px_52px]" />

      <header className="relative z-20 border-b border-white/[0.06] bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/#projects"
            className="group inline-flex items-center gap-2 font-mono text-xs text-text-muted transition-colors hover:text-cyan"
          >
            <span className="transition-transform group-hover:-translate-x-0.5">←</span>
            Back to portfolio
          </Link>

          <div className="flex items-center gap-2 rounded-full border border-cyan/20 bg-cyan/10 px-3 py-1 text-[11px] font-medium text-cyan">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan" />
            Bot runtime online
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-12">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reveal}
          className="mb-8"
        >
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple/20 bg-purple/10 px-3 py-1 font-mono text-xs text-purple/90">
            ⚡ Project #5 · Telegram Bot Landing
          </p>

          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl">
            Conversational automation hub for <span className="text-gradient">DeFi + AI workflows</span>
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-text-muted sm:text-base">
            A productized Telegram interface where users can track wallets, run risk checks, and receive
            smart strategy digests in seconds. Designed to showcase backend automation, reliability,
            and high-signal UX.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-text-muted">
            <span className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 font-mono">
              Interface: Telegram-first
            </span>
            <span className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 font-mono">
              Stack: Next.js + Node.js + Cron jobs
            </span>
            <span className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 font-mono">
              Focus: Fast actions, low friction
            </span>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...reveal, delay: 0.06 }}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          {TELEGRAM_BOT_METRICS.map((metric) => (
            <article
              key={metric.label}
              className="rounded-2xl border border-white/[0.08] bg-bg-glass p-4 backdrop-blur-md"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-muted">
                {metric.label}
              </p>
              <p className={`mt-3 text-2xl font-semibold ${getMetricAccentClass(metric.accent)}`}>
                {metric.value}
              </p>
              <p className="mt-1 text-[11px] text-text-muted">{metric.hint}</p>
            </article>
          ))}
        </motion.section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[1.28fr_0.92fr]">
          <motion.article
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...reveal, delay: 0.12 }}
            className="rounded-2xl border border-white/[0.08] bg-bg-glass p-4 backdrop-blur-md sm:p-6"
          >
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-muted">Scenario player</p>
                <h2 className="text-xl font-semibold text-white sm:text-2xl">Interactive bot dialog demo</h2>
              </div>
              <p className="font-mono text-xs text-text-muted">Tap scenarios to replay transcript</p>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {TELEGRAM_BOT_SCENARIOS.map((scenario) => {
                const isActive = scenario.id === activeScenario.id;

                return (
                  <button
                    key={scenario.id}
                    type="button"
                    onClick={() => setActiveScenarioId(scenario.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      isActive
                        ? scenario.accent === "cyan"
                          ? "border-cyan/30 bg-cyan/10 text-cyan"
                          : "border-purple/30 bg-purple/10 text-purple"
                        : "border-white/[0.12] bg-white/[0.02] text-text-muted hover:border-white/[0.24] hover:text-text"
                    }`}
                  >
                    {scenario.title}
                  </button>
                );
              })}
            </div>

            <div className="mb-3 grid gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className={`inline-flex rounded-full border px-2.5 py-1 font-mono text-[10px] ${scenarioAccentClass}`}>
                  {activeScenario.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">{activeScenario.summary}</p>
                <p className="mt-1 text-[11px] text-text">Outcome: {activeScenario.outcome}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:w-[180px]">
                <div className="rounded-lg border border-white/[0.08] bg-black/20 px-2 py-2 text-center">
                  <p className="font-mono text-[10px] text-text-muted">Latency</p>
                  <p className="text-sm font-semibold text-cyan">{activeScenario.latencyMs} ms</p>
                </div>
                <div className="rounded-lg border border-white/[0.08] bg-black/20 px-2 py-2 text-center">
                  <p className="font-mono text-[10px] text-text-muted">Automations</p>
                  <p className="text-sm font-semibold text-purple">{activeScenario.automationsTriggered}</p>
                </div>
              </div>
            </div>

            <div className="max-h-[420px] space-y-2.5 overflow-y-auto pr-1">
              <AnimatePresence initial={false} mode="popLayout">
                {visibleTranscript.map((message) => (
                  <motion.article
                    key={message.id}
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] as const }}
                    className={getMessageContainerClass(message.role)}
                  >
                    <div className="flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.1em] text-text-muted">
                      <span>
                        {message.role === "user"
                          ? "User"
                          : message.role === "bot"
                            ? "Bot"
                            : "System"}
                      </span>
                      <span>{message.time}</span>
                    </div>

                    <p className="mt-1.5 text-sm leading-relaxed text-text">{message.text}</p>

                    {message.tag ? (
                      <span className="mt-2 inline-flex rounded-full border border-white/[0.12] bg-black/20 px-2 py-0.5 font-mono text-[10px] text-text-muted">
                        {message.tag}
                      </span>
                    ) : null}
                  </motion.article>
                ))}
              </AnimatePresence>

              {visibleTranscript.length === 0 ? (
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-3 text-sm text-text-muted">
                  Loading transcript...
                </div>
              ) : null}
            </div>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...reveal, delay: 0.18 }}
            className="rounded-2xl border border-white/[0.08] bg-bg-glass p-4 backdrop-blur-md sm:p-6"
          >
            <div className="mb-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-muted">Command surface</p>
              <h2 className="text-xl font-semibold text-white sm:text-2xl">What users can run in chat</h2>
            </div>

            <div className="space-y-2.5">
              {TELEGRAM_BOT_COMMANDS.map((entry) => (
                <article
                  key={entry.command}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="font-mono text-sm text-white">{entry.command}</p>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${getCategoryClass(entry.category)}`}>
                      {entry.category}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-text-muted">{entry.purpose}</p>
                  <p className="mt-2 font-mono text-[11px] text-text-muted">Response: {entry.responseTime}</p>
                </article>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-cyan/20 bg-cyan/8 p-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-cyan/90">Core modules</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {DELIVERY_MODULES.map((module) => (
                  <span
                    key={module}
                    className="rounded-full border border-cyan/20 bg-cyan/10 px-2 py-0.5 text-[11px] text-cyan/90"
                  >
                    {module}
                  </span>
                ))}
              </div>
            </div>
          </motion.article>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-2">
          <motion.article
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...reveal, delay: 0.24 }}
            className="rounded-2xl border border-white/[0.08] bg-bg-glass p-4 backdrop-blur-md sm:p-6"
          >
            <div className="mb-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-muted">Automation pipelines</p>
              <h2 className="text-xl font-semibold text-white sm:text-2xl">From signal to action in seconds</h2>
            </div>

            <div className="space-y-3">
              {TELEGRAM_AUTOMATION_FLOWS.map((flow, index) => (
                <article
                  key={flow.id}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="font-mono text-sm text-white">{flow.title}</p>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] ${
                        index % 2 === 0
                          ? "border-cyan/25 bg-cyan/10 text-cyan"
                          : "border-purple/25 bg-purple/10 text-purple"
                      }`}
                    >
                      Trigger: {flow.trigger}
                    </span>
                  </div>

                  <ol className="space-y-1.5 pl-4 text-xs text-text-muted">
                    {flow.steps.map((step) => (
                      <li key={step} className="list-decimal leading-relaxed">
                        {step}
                      </li>
                    ))}
                  </ol>

                  <p className="mt-2 rounded-lg border border-white/[0.08] bg-black/20 px-2.5 py-1.5 text-xs text-text">
                    {flow.output}
                  </p>
                </article>
              ))}
            </div>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...reveal, delay: 0.3 }}
            className="rounded-2xl border border-white/[0.08] bg-bg-glass p-4 backdrop-blur-md sm:p-6"
          >
            <div className="mb-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-muted">Why this landing works</p>
              <h2 className="text-xl font-semibold text-white sm:text-2xl">Product story + technical depth</h2>
            </div>

            <ul className="space-y-2 text-sm text-text-muted">
              {[
                "Shows real command-level UX instead of static screenshots.",
                "Highlights backend automation architecture in user language.",
                "Demonstrates reliability metrics and operational maturity.",
                "Keeps conversion friction low with direct Telegram CTA.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 rounded-xl border border-purple/20 bg-purple/10 p-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-purple/90">Implementation highlights</p>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                Scenario replay is fully interactive, transcripts are typed and deterministic, and all UI blocks are
                reusable for future bot products or client showcases.
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2.5">
              <a
                href={telegramDemoLink}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-cyan/30 bg-cyan/10 px-4 py-2 text-sm font-medium text-cyan transition-colors hover:border-cyan hover:bg-cyan/15"
              >
                Request bot demo
              </a>

              <Link
                href="/#contact"
                className="rounded-full border border-white/[0.14] px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:border-white/30 hover:text-white"
              >
                Open contact section
              </Link>
            </div>
          </motion.article>
        </section>
      </main>
    </div>
  );
}
