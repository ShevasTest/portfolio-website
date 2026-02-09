"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useId, useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DefiAnalyticsData } from "@/lib/defi-analytics";

const compactUsdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
});

const fullUsdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const integerFormatter = new Intl.NumberFormat("en-US");

const percentFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: "always",
});

const dashboardReveal = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
};

function formatCompactUsd(value: number): string {
  return compactUsdFormatter.format(value);
}

function formatUsd(value: number): string {
  return fullUsdFormatter.format(value);
}

function formatPercent(value: number): string {
  return `${percentFormatter.format(value)}%`;
}

function formatDateTick(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatAxisUsd(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(0)}B`;
  }

  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(0)}M`;
  }

  return `$${Math.round(value)}`;
}

function shortChainName(name: string): string {
  if (name.length <= 10) {
    return name;
  }

  return `${name.slice(0, 9)}…`;
}

interface DeFiAnalyticsViewProps {
  data: DefiAnalyticsData;
}

export function DeFiAnalyticsView({ data }: DeFiAnalyticsViewProps) {
  const gradientId = useId();
  const prefersReducedMotion = useReducedMotion();

  const history = useMemo(
    () =>
      data.tvlHistory.map((point) => ({
        timestamp: point.timestamp,
        tvl: Number(point.tvlUsd.toFixed(2)),
      })),
    [data.tvlHistory]
  );

  const chainChart = useMemo(
    () =>
      data.topChains.map((chain) => ({
        name: chain.name,
        shortName: shortChainName(chain.name),
        dominance: Number(chain.dominance.toFixed(2)),
        tvl: chain.tvlUsd,
      })),
    [data.topChains]
  );

  const trailingMonthMove = useMemo(() => {
    const latest = history.at(-1)?.tvl;
    const monthAnchor = history.at(-30)?.tvl ?? history[0]?.tvl;

    if (!latest || !monthAnchor) {
      return 0;
    }

    return ((latest - monthAnchor) / monthAnchor) * 100;
  }, [history]);

  const lastRefresh = new Date(data.generatedAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg pb-24">
      <div className="pointer-events-none absolute left-1/2 top-[-260px] h-[540px] w-[920px] -translate-x-1/2 rounded-full bg-cyan/[0.09] blur-[160px]" />
      <div className="pointer-events-none absolute left-[-160px] top-[46%] h-[380px] w-[380px] rounded-full bg-purple/[0.08] blur-[130px]" />
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
            Live DeFi feed
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-12">
        <motion.section {...dashboardReveal} className="mb-8">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple/20 bg-purple/10 px-3 py-1 font-mono text-xs text-purple/90">
            📊 Project #3 · DeFi Analytics
          </p>

          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl">
            TVL intelligence dashboard for <span className="text-gradient">protocol and chain rotation</span>
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-text-muted sm:text-base">
            Built on top of DeFiLlama datasets: market-wide TVL trend, chain dominance,
            category concentration, and a protocol board for quick relative-value analysis.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-text-muted">
            <span className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 font-mono">
              Source: DeFiLlama API
            </span>
            <span className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 font-mono">
              Updated: {lastRefresh}
            </span>
            <span className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 font-mono">
              Coverage: {integerFormatter.format(data.headline.activeProtocols)} protocols
            </span>
          </div>
        </motion.section>

        <motion.section
          {...dashboardReveal}
          transition={{ ...dashboardReveal.transition, delay: 0.06 }}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          {[
            {
              label: "Total DeFi TVL",
              value: formatCompactUsd(data.headline.totalTvlUsd),
              accent: "text-cyan",
            },
            {
              label: "TVL-Weighted 24h",
              value: formatPercent(data.headline.weightedChange1d),
              accent: data.headline.weightedChange1d >= 0 ? "text-cyan" : "text-purple",
            },
            {
              label: "TVL-Weighted 7d",
              value: formatPercent(data.headline.weightedChange7d),
              accent: data.headline.weightedChange7d >= 0 ? "text-cyan" : "text-purple",
            },
            {
              label: "Momentum Signals",
              value: integerFormatter.format(data.momentumSignals.length),
              accent: "text-purple",
            },
          ].map((metric) => (
            <article
              key={metric.label}
              className="rounded-2xl border border-white/[0.08] bg-bg-glass p-4 backdrop-blur-md"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-muted">
                {metric.label}
              </p>
              <p className={`mt-3 text-2xl font-semibold ${metric.accent}`}>{metric.value}</p>
            </article>
          ))}
        </motion.section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[1.42fr_0.98fr]">
          <motion.article
            {...dashboardReveal}
            transition={{ ...dashboardReveal.transition, delay: 0.12 }}
            className="rounded-2xl border border-white/[0.08] bg-bg-glass p-4 backdrop-blur-md sm:p-6"
          >
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-muted">
                  Global DeFi TVL · 90D
                </p>
                <h2 className="text-xl font-semibold text-white sm:text-2xl">
                  Regime shifts and liquidity trend
                </h2>
              </div>

              <div className="text-right">
                <p className="font-mono text-xs text-text-muted">Trailing 30d move</p>
                <p className={`text-lg font-semibold ${trailingMonthMove >= 0 ? "text-cyan" : "text-purple"}`}>
                  {formatPercent(trailingMonthMove)}
                </p>
              </div>
            </div>

            <div className="h-[290px] w-full sm:h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 12, right: 12, left: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00FFE0" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#00FFE0" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 4" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={formatDateTick}
                    stroke="rgba(255,255,255,0.4)"
                    tick={{ fontSize: 11 }}
                    minTickGap={28}
                  />
                  <YAxis
                    tickFormatter={(value) => formatAxisUsd(Number(value))}
                    stroke="rgba(255,255,255,0.4)"
                    tick={{ fontSize: 11 }}
                    width={50}
                    domain={["dataMin - 2000000000", "dataMax + 2000000000"]}
                  />
                  <Tooltip
                    cursor={{ stroke: "rgba(0,255,224,0.35)", strokeWidth: 1 }}
                    labelFormatter={(value) =>
                      new Date(Number(value)).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    }
                    formatter={(value) => [formatUsd(Number(value)), "TVL"]}
                    contentStyle={{
                      border: "1px solid rgba(0,255,224,0.2)",
                      borderRadius: 12,
                      backgroundColor: "rgba(8,8,12,0.92)",
                      color: "#f4f4f5",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="tvl"
                    stroke="#00FFE0"
                    strokeWidth={2.2}
                    fill={`url(#${gradientId})`}
                    dot={false}
                    activeDot={{ r: 3, fill: "#00FFE0" }}
                    isAnimationActive={!prefersReducedMotion}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.article>

          <motion.article
            {...dashboardReveal}
            transition={{ ...dashboardReveal.transition, delay: 0.18 }}
            className="rounded-2xl border border-white/[0.08] bg-bg-glass p-4 backdrop-blur-md sm:p-6"
          >
            <div className="mb-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-muted">
                Chain Dominance
              </p>
              <h2 className="text-xl font-semibold text-white sm:text-2xl">Where liquidity sits now</h2>
            </div>

            <div className="h-[210px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chainChart} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="shortName"
                    stroke="rgba(255,255,255,0.35)"
                    tick={{ fontSize: 10 }}
                    interval={0}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.35)"
                    tick={{ fontSize: 10 }}
                    width={34}
                    tickFormatter={(value) => `${Number(value)}%`}
                  />
                  <Tooltip
                    formatter={(value, _name, item) => {
                      const row = item.payload as { tvl: number };
                      return [`${Number(value).toFixed(2)}% · ${formatCompactUsd(row.tvl)}`, "Dominance"];
                    }}
                    contentStyle={{
                      border: "1px solid rgba(139,92,246,0.2)",
                      borderRadius: 12,
                      backgroundColor: "rgba(8,8,12,0.92)",
                      color: "#f4f4f5",
                    }}
                  />
                  <Bar dataKey="dominance" radius={[5, 5, 0, 0]}>
                    {chainChart.map((entry, index) => (
                      <Cell
                        key={`${entry.name}-${entry.dominance}`}
                        fill={index % 2 === 0 ? "#00FFE0" : "#8B5CF6"}
                        fillOpacity={0.78}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 space-y-2.5">
              {data.topChains.slice(0, 4).map((chain) => (
                <div
                  key={chain.name}
                  className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm text-white">{chain.name}</p>
                      <p className="text-[11px] text-text-muted">{chain.tokenSymbol ?? "native"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm text-cyan">{formatCompactUsd(chain.tvlUsd)}</p>
                      <p className="text-[11px] text-text-muted">{chain.dominance.toFixed(2)}% share</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.article>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[0.98fr_1.42fr]">
          <motion.article
            {...dashboardReveal}
            transition={{ ...dashboardReveal.transition, delay: 0.24 }}
            className="rounded-2xl border border-white/[0.08] bg-bg-glass p-4 backdrop-blur-md sm:p-6"
          >
            <div className="mb-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-muted">
                Category Allocation
              </p>
              <h2 className="text-xl font-semibold text-white sm:text-2xl">TVL concentration map</h2>
            </div>

            <div className="space-y-3">
              {data.categories.map((category, index) => (
                <div key={category.name} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm text-white">{category.name}</p>
                      <p className="text-[11px] text-text-muted">
                        {integerFormatter.format(category.protocolCount)} protocols
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm text-cyan">{formatCompactUsd(category.tvlUsd)}</p>
                      <p className="text-[11px] text-text-muted">{category.share.toFixed(2)}%</p>
                    </div>
                  </div>

                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                    <motion.div
                      className={index % 2 === 0 ? "h-full bg-cyan/70" : "h-full bg-purple/70"}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${Math.min(category.share, 100)}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.article>

          <motion.article
            {...dashboardReveal}
            transition={{ ...dashboardReveal.transition, delay: 0.3 }}
            className="rounded-2xl border border-white/[0.08] bg-bg-glass p-4 backdrop-blur-md sm:p-6"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-muted">
                  Protocol Comparison
                </p>
                <h2 className="text-xl font-semibold text-white sm:text-2xl">Top TVL protocols snapshot</h2>
              </div>
              <p className="font-mono text-xs text-text-muted">Sorted by TVL</p>
            </div>

            <div className="space-y-2.5">
              {data.protocolBoard.map((protocol) => {
                const isPositive1d = protocol.change1d >= 0;
                const isPositive7d = protocol.change7d >= 0;

                return (
                  <div
                    key={protocol.id}
                    className="grid grid-cols-[1.2fr_0.8fr] gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 sm:grid-cols-[1fr_0.9fr_0.8fr_0.7fr] sm:items-center"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-sm text-white">{protocol.name}</p>
                        <span className="rounded-full border border-white/[0.08] px-2 py-0.5 text-[10px] text-text-muted">
                          {protocol.category}
                        </span>
                      </div>

                      {protocol.url ? (
                        <a
                          href={protocol.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex text-[11px] text-cyan/70 transition-colors hover:text-cyan"
                        >
                          Open protocol ↗
                        </a>
                      ) : (
                        <p className="mt-1 text-[11px] text-text-muted">No direct URL</p>
                      )}
                    </div>

                    <div>
                      <p className="font-mono text-sm text-cyan">{formatCompactUsd(protocol.tvlUsd)}</p>
                      <p className="text-[11px] text-text-muted">TVL</p>
                    </div>

                    <div className="space-y-0.5 text-[11px] sm:text-right">
                      <p className={isPositive1d ? "text-cyan" : "text-purple"}>
                        {formatPercent(protocol.change1d)}
                      </p>
                      <p className={isPositive7d ? "text-cyan/70" : "text-purple/70"}>
                        {formatPercent(protocol.change7d)} / 7d
                      </p>
                    </div>

                    <div className="text-[11px] sm:text-right">
                      <p className="font-mono text-white">{protocol.chainCount}</p>
                      <p className="text-text-muted">chains</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.article>
        </section>

        <motion.section
          {...dashboardReveal}
          transition={{ ...dashboardReveal.transition, delay: 0.36 }}
          className="mt-4 rounded-2xl border border-white/[0.08] bg-bg-glass p-4 backdrop-blur-md sm:p-6"
        >
          <div className="mb-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-muted">
              Flow Momentum Radar
            </p>
            <h2 className="text-xl font-semibold text-white sm:text-2xl">Protocols with strongest 7d inflow profile</h2>
          </div>

          {data.momentumSignals.length === 0 ? (
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm text-text-muted">
              Not enough high-confidence momentum signals right now.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-3">
              {data.momentumSignals.map((signal, index) => (
                <article
                  key={signal.id}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="font-mono text-sm text-white">{signal.name}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        index % 2 === 0 ? "bg-cyan/15 text-cyan" : "bg-purple/15 text-purple"
                      }`}
                    >
                      Score {signal.score.toFixed(1)}
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed text-text-muted">{signal.narrative}</p>

                  <div className="mt-3 rounded-lg border border-white/[0.08] bg-black/20 px-3 py-2">
                    <p className="font-mono text-[11px] text-cyan">
                      {formatPercent(signal.change7d)} · 7d
                    </p>
                    <p className="text-[11px] text-text-muted">TVL {formatCompactUsd(signal.tvlUsd)}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </motion.section>
      </main>
    </div>
  );
}
