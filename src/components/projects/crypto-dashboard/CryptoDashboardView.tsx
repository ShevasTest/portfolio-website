"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useId, useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CryptoDashboardData, TrackedCoin } from "@/lib/crypto-dashboard";

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
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
};

const PORTFOLIO_MODEL: Array<{
  id: TrackedCoin["id"];
  amount: number;
  strategy: string;
}> = [
  { id: "bitcoin", amount: 0.82, strategy: "Long-term core" },
  { id: "ethereum", amount: 9.4, strategy: "L2 + restaking exposure" },
  { id: "solana", amount: 275, strategy: "High-beta momentum" },
  { id: "chainlink", amount: 1180, strategy: "Oracle infra thesis" },
];

interface CryptoDashboardViewProps {
  data: CryptoDashboardData;
}

function formatUsd(value: number): string {
  return fullUsdFormatter.format(value);
}

function formatCompactUsd(value: number): string {
  return compactUsdFormatter.format(value);
}

function formatPercent(value: number): string {
  return `${percentFormatter.format(value)}%`;
}

function formatTick(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function Sparkline({
  values,
  positive,
}: {
  values: number[];
  positive: boolean;
}) {
  const gradientId = useId();
  const points = values.slice(-28);

  if (points.length < 2) {
    return <div className="h-10 rounded-lg bg-white/[0.02]" />;
  }

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const coordinates = points
    .map((value, index) => {
      const x = (index / (points.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 100" className="h-10 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            stopColor={positive ? "#00FFE0" : "#8B5CF6"}
            stopOpacity="0.25"
          />
          <stop offset="100%" stopColor={positive ? "#00FFE0" : "#8B5CF6"} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`${coordinates} 100,100 0,100`} fill={`url(#${gradientId})`} />
      <polyline
        points={coordinates}
        fill="none"
        stroke={positive ? "#00FFE0" : "#8B5CF6"}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CryptoDashboardView({ data }: CryptoDashboardViewProps) {
  const history = useMemo(
    () =>
      data.bitcoinHistory.map((point) => ({
        timestamp: point.timestamp,
        price: Number(point.price.toFixed(2)),
      })),
    [data.bitcoinHistory]
  );

  const btcWeeklyChange = useMemo(() => {
    const first = history[0]?.price;
    const last = history.at(-1)?.price;

    if (!first || !last) {
      return 0;
    }

    return ((last - first) / first) * 100;
  }, [history]);

  const coinById = useMemo(
    () => new Map(data.coins.map((coin) => [coin.id, coin])),
    [data.coins]
  );

  const portfolio = useMemo(
    () =>
      PORTFOLIO_MODEL.map((entry) => {
        const coin = coinById.get(entry.id);
        const price = coin?.currentPrice ?? 0;
        const positionValue = price * entry.amount;

        return {
          ...entry,
          symbol: coin?.symbol ?? entry.id.toUpperCase(),
          price,
          positionValue,
          change24h: coin?.change24h ?? 0,
        };
      }),
    [coinById]
  );

  const portfolioValue = portfolio.reduce((sum, row) => sum + row.positionValue, 0);
  const portfolioPnl24h = portfolio.reduce(
    (sum, row) => sum + row.positionValue * (row.change24h / 100),
    0
  );

  const lastRefresh = new Date(data.generatedAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg pb-24">
      <div className="pointer-events-none absolute left-1/2 top-[-260px] h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-cyan/[0.08] blur-[150px]" />
      <div className="pointer-events-none absolute right-[-180px] top-[36%] h-[420px] w-[420px] rounded-full bg-purple/[0.1] blur-[130px]" />
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
            Live market feed
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-12">
        <motion.section {...dashboardReveal} className="mb-8">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple/20 bg-purple/10 px-3 py-1 font-mono text-xs text-purple/90">
            🔥 Project #1 · Crypto Dashboard
          </p>

          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl">
            Market intelligence layer for <span className="text-gradient">real-time crypto decisions</span>
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-text-muted sm:text-base">
            Live CoinGecko prices, seven-day trend chart, whale flow signals, and a portfolio tracker in a single
            high-contrast interface. Optimized for fast scanning on desktop and mobile.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-text-muted">
            <span className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 font-mono">
              Source: CoinGecko API
            </span>
            <span className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 font-mono">
              Updated: {lastRefresh}
            </span>
            <span className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 font-mono">
              Chart: Recharts
            </span>
          </div>
        </motion.section>

        <motion.section
          {...dashboardReveal}
          transition={{ ...dashboardReveal.transition, delay: 0.08 }}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          {[
            {
              label: "Total Market Cap",
              value: formatCompactUsd(data.global.totalMarketCapUsd),
              accent: "text-cyan",
            },
            {
              label: "24h Spot Volume",
              value: formatCompactUsd(data.global.totalVolumeUsd),
              accent: "text-purple",
            },
            {
              label: "BTC Dominance",
              value: `${data.global.btcDominance.toFixed(2)}%`,
              accent: "text-cyan",
            },
            {
              label: "Active Coins",
              value: integerFormatter.format(data.global.activeCryptocurrencies),
              accent: "text-purple",
            },
          ].map((metric) => (
            <article
              key={metric.label}
              className="rounded-2xl border border-white/[0.08] bg-bg-glass p-4 backdrop-blur-md"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-muted">{metric.label}</p>
              <p className={`mt-3 text-2xl font-semibold ${metric.accent}`}>{metric.value}</p>
            </article>
          ))}
        </motion.section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[1.45fr_0.95fr]">
          <motion.article
            {...dashboardReveal}
            transition={{ ...dashboardReveal.transition, delay: 0.12 }}
            className="rounded-2xl border border-white/[0.08] bg-bg-glass p-4 backdrop-blur-md sm:p-6"
          >
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-muted">BTC · 7 Day Trend</p>
                <h2 className="text-xl font-semibold text-white sm:text-2xl">Price momentum overview</h2>
              </div>

              <div className="text-right">
                <p className="font-mono text-xs text-text-muted">Weekly move</p>
                <p className={`text-lg font-semibold ${btcWeeklyChange >= 0 ? "text-cyan" : "text-purple"}`}>
                  {formatPercent(btcWeeklyChange)}
                </p>
              </div>
            </div>

            <div className="h-[280px] w-full sm:h-[330px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 12, right: 12, left: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="btcArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00FFE0" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#00FFE0" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 4" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={formatTick}
                    stroke="rgba(255,255,255,0.4)"
                    tick={{ fontSize: 11 }}
                    minTickGap={28}
                  />
                  <YAxis
                    tickFormatter={(value) => `$${Math.round(Number(value) / 1000)}k`}
                    stroke="rgba(255,255,255,0.4)"
                    tick={{ fontSize: 11 }}
                    width={44}
                    domain={["dataMin - 600", "dataMax + 600"]}
                  />
                  <Tooltip
                    cursor={{ stroke: "rgba(0,255,224,0.35)", strokeWidth: 1 }}
                    labelFormatter={(value) =>
                      new Date(Number(value)).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    }
                    formatter={(value) => [formatUsd(Number(value)), "BTC Price"]}
                    contentStyle={{
                      border: "1px solid rgba(0,255,224,0.2)",
                      borderRadius: 12,
                      backgroundColor: "rgba(8,8,12,0.92)",
                      color: "#f4f4f5",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#00FFE0"
                    strokeWidth={2.2}
                    fill="url(#btcArea)"
                    dot={false}
                    activeDot={{ r: 3, fill: "#00FFE0" }}
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
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-muted">Portfolio Tracker</p>
              <h2 className="text-xl font-semibold text-white sm:text-2xl">Live position value</h2>
            </div>

            <div className="mb-4 rounded-xl border border-cyan/15 bg-cyan/10 p-3">
              <p className="font-mono text-[11px] text-text-muted">Portfolio total</p>
              <p className="mt-1 text-3xl font-semibold text-cyan">{formatUsd(portfolioValue)}</p>
              <p className={`mt-1 text-sm ${portfolioPnl24h >= 0 ? "text-cyan" : "text-purple"}`}>
                {portfolioPnl24h >= 0 ? "+" : ""}
                {formatUsd(portfolioPnl24h)} · 24h
              </p>
            </div>

            <div className="space-y-2.5">
              {portfolio.map((row) => (
                <div
                  key={row.id}
                  className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs text-white">{row.symbol}</p>
                      <p className="text-[11px] text-text-muted">{row.strategy}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm text-white">{row.amount.toLocaleString("en-US")}</p>
                      <p className="text-[11px] text-text-muted">{formatUsd(row.price)} each</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-text-muted">Position value</span>
                    <span className="font-mono text-cyan">{formatUsd(row.positionValue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.article>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[0.95fr_1.45fr]">
          <motion.article
            {...dashboardReveal}
            transition={{ ...dashboardReveal.transition, delay: 0.22 }}
            className="rounded-2xl border border-white/[0.08] bg-bg-glass p-4 backdrop-blur-md sm:p-6"
          >
            <div className="mb-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-muted">Whale Alerts</p>
              <h2 className="text-xl font-semibold text-white sm:text-2xl">Flow intensity signals</h2>
            </div>

            <div className="space-y-3">
              {data.whaleSignals.map((signal) => {
                const isPositive = signal.sentiment !== "distribution";

                return (
                  <div
                    key={signal.id}
                    className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <p className="font-mono text-sm text-white">{signal.symbol}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] ${
                          signal.intensity === "high"
                            ? isPositive
                              ? "bg-cyan/15 text-cyan"
                              : "bg-purple/15 text-purple"
                            : "bg-white/[0.08] text-text-muted"
                        }`}
                      >
                        {signal.intensity}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-text-muted">{signal.message}</p>
                  </div>
                );
              })}
            </div>
          </motion.article>

          <motion.article
            {...dashboardReveal}
            transition={{ ...dashboardReveal.transition, delay: 0.28 }}
            className="rounded-2xl border border-white/[0.08] bg-bg-glass p-4 backdrop-blur-md sm:p-6"
          >
            <div className="mb-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-muted">Asset Board</p>
              <h2 className="text-xl font-semibold text-white sm:text-2xl">Tracked majors snapshot</h2>
            </div>

            <div className="space-y-2.5">
              {data.coins.map((coin) => {
                const up24h = coin.change24h >= 0;
                const up7d = coin.change7d >= 0;

                return (
                  <div
                    key={coin.id}
                    className="grid grid-cols-[1.1fr_1fr] gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 sm:grid-cols-[1fr_0.8fr_0.8fr_1.4fr] sm:items-center"
                  >
                    <div>
                      <p className="font-mono text-sm text-white">{coin.symbol}</p>
                      <p className="text-[11px] text-text-muted">{coin.name}</p>
                    </div>

                    <div>
                      <p className="font-mono text-sm text-white">{formatUsd(coin.currentPrice)}</p>
                      <p className="text-[11px] text-text-muted">Now</p>
                    </div>

                    <div className="space-y-0.5 text-[11px] sm:text-right">
                      <p className={up24h ? "text-cyan" : "text-purple"}>{formatPercent(coin.change24h)}</p>
                      <p className={up7d ? "text-cyan/70" : "text-purple/70"}>{formatPercent(coin.change7d)} / 7d</p>
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <Sparkline values={coin.sparkline7d} positive={up7d} />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.article>
        </section>
      </main>
    </div>
  );
}
