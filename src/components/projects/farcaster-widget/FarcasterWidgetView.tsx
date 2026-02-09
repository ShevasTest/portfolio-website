"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useId, useMemo } from "react";
import type {
  FarcasterGraphNode,
  FarcasterUserSnapshot,
  FarcasterWidgetData,
} from "@/lib/farcaster-widget";

const reveal = {
  duration: 0.64,
  ease: [0.22, 1, 0.36, 1] as const,
};

const compactNumber = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function formatCount(value: number): string {
  return compactNumber.format(value);
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}…`;
}

function initials(value: string): string {
  const normalized = value.trim();

  if (!normalized) {
    return "?";
  }

  return normalized.charAt(0).toUpperCase();
}

function getNodePalette(tier: FarcasterGraphNode["tier"]) {
  if (tier === "core") {
    return {
      fill: "#FFFFFF",
      glow: "rgba(255,255,255,0.25)",
      text: "#F4F4F5",
    };
  }

  if (tier === "follower") {
    return {
      fill: "#8B5CF6",
      glow: "rgba(139,92,246,0.28)",
      text: "#C4B5FD",
    };
  }

  return {
    fill: "#00FFE0",
    glow: "rgba(0,255,224,0.28)",
    text: "#6EE7D8",
  };
}

function NetworkList({
  title,
  users,
  tier,
}: {
  title: string;
  users: FarcasterUserSnapshot[];
  tier: "follower" | "following";
}) {
  const headerClass =
    tier === "follower"
      ? "border-purple/20 bg-purple/10 text-purple/90"
      : "border-cyan/20 bg-cyan/10 text-cyan/90";

  const avatarClass =
    tier === "follower"
      ? "border-purple/25 bg-purple/15 text-purple"
      : "border-cyan/25 bg-cyan/15 text-cyan";

  return (
    <section className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
      <p className={`inline-flex rounded-full border px-2.5 py-1 font-mono text-[10px] ${headerClass}`}>
        {title}
      </p>

      <div className="mt-3 space-y-2.5">
        {users.length === 0 ? (
          <p className="rounded-lg border border-white/[0.08] bg-black/20 px-3 py-2 text-xs text-text-muted">
            No graph contacts available right now.
          </p>
        ) : (
          users.map((user, index) => (
            <div
              key={user.fid}
              className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.08] bg-black/20 px-2.5 py-2"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="font-mono text-[10px] text-text-muted">#{index + 1}</span>
                <span
                  className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-xs ${avatarClass}`}
                >
                  {initials(user.displayName)}
                </span>

                <div className="min-w-0">
                  <p className="truncate font-mono text-xs text-white">{user.displayName}</p>
                  <p className="truncate text-[10px] text-text-muted">@{user.username}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-mono text-[11px] text-text">{formatCount(user.followerCount)}</p>
                <p className="text-[10px] text-text-muted">followers</p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

interface FarcasterWidgetViewProps {
  data: FarcasterWidgetData;
}

export function FarcasterWidgetView({ data }: FarcasterWidgetViewProps) {
  const graphGradientId = useId();
  const nodeMap = useMemo(
    () => new Map(data.graphNodes.map((node) => [node.id, node])),
    [data.graphNodes]
  );

  const averageEngagement = useMemo(() => {
    if (data.recentCasts.length === 0) {
      return 0;
    }

    const total = data.recentCasts.reduce(
      (sum, cast) => sum + cast.likes + cast.recasts + cast.replies,
      0
    );

    return total / data.recentCasts.length;
  }, [data.recentCasts]);

  const lastRefresh = new Date(data.generatedAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg pb-24">
      <div className="pointer-events-none absolute left-1/2 top-[-240px] h-[520px] w-[920px] -translate-x-1/2 rounded-full bg-purple/[0.1] blur-[160px]" />
      <div className="pointer-events-none absolute right-[-170px] top-[48%] h-[380px] w-[380px] rounded-full bg-cyan/[0.08] blur-[125px]" />
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

          <div className="flex items-center gap-2 rounded-full border border-purple/20 bg-purple/10 px-3 py-1 text-[11px] font-medium text-purple/90">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple" />
            Neynar index online
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
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan/20 bg-cyan/10 px-3 py-1 font-mono text-xs text-cyan/90">
            🟣 Project #4 · Farcaster Widget
          </p>

          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl">
            Social graph intelligence for <span className="text-gradient">@{data.profile.username}</span>
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-text-muted sm:text-base">
            Built on Neynar API: account profile, cast stream, and relationship graph mapped
            into an interactive Web3-native analytics surface.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-text-muted">
            <span className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 font-mono">
              FID: {data.profile.fid}
            </span>
            <span className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 font-mono">
              Bio: {truncate(data.profile.bio, 60)}
            </span>
            <span className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 font-mono">
              Updated: {lastRefresh}
            </span>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...reveal, delay: 0.06 }}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          {[
            {
              label: "Followers",
              value: formatCount(data.profile.followerCount),
              accent: "text-purple",
            },
            {
              label: "Following",
              value: formatCount(data.profile.followingCount),
              accent: "text-cyan",
            },
            {
              label: "Recent Casts",
              value: data.recentCasts.length.toString(),
              accent: "text-white",
            },
            {
              label: "Avg interactions / cast",
              value: averageEngagement.toFixed(1),
              accent: "text-cyan",
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

        <section className="mt-4 grid gap-4 lg:grid-cols-[1.18fr_0.92fr]">
          <motion.article
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...reveal, delay: 0.12 }}
            className="rounded-2xl border border-white/[0.08] bg-bg-glass p-4 backdrop-blur-md sm:p-6"
          >
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-muted">
                  Social Graph
                </p>
                <h2 className="text-xl font-semibold text-white sm:text-2xl">
                  Follower + following orbit map
                </h2>
              </div>
              <p className="font-mono text-xs text-text-muted">
                {data.graphNodes.length - 1} connected nodes
              </p>
            </div>

            <div className="relative h-[380px] overflow-hidden rounded-xl border border-white/[0.08] bg-black/25">
              <motion.svg
                viewBox="0 0 100 100"
                className="h-full w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                <defs>
                  <linearGradient id={graphGradientId} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#00FFE0" stopOpacity="0.75" />
                  </linearGradient>
                </defs>

                <circle cx="50" cy="50" r="18" fill="none" stroke="rgba(255,255,255,0.09)" strokeDasharray="1 1.8" />
                <circle cx="50" cy="50" r="32" fill="none" stroke="rgba(255,255,255,0.07)" strokeDasharray="1 2.1" />

                {data.graphEdges.map((edge, index) => {
                  const source = nodeMap.get(edge.sourceId);
                  const target = nodeMap.get(edge.targetId);

                  if (!source || !target) {
                    return null;
                  }

                  return (
                    <motion.line
                      key={edge.id}
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={`url(#${graphGradientId})`}
                      strokeWidth={0.2 + edge.weight * 0.5}
                      strokeOpacity={0.2 + edge.weight * 0.25}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{
                        duration: 0.7,
                        delay: 0.2 + index * 0.04,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    />
                  );
                })}

                {data.graphNodes.map((node, index) => {
                  const palette = getNodePalette(node.tier);
                  const isCore = node.tier === "core";
                  const radius = isCore ? 3.4 : 1.4 + node.influence * 1.3;

                  return (
                    <motion.g
                      key={node.id}
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.46,
                        delay: 0.16 + index * 0.05,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                    >
                      <circle cx={node.x} cy={node.y} r={radius * 1.8} fill={palette.glow} />
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={radius}
                        fill={palette.fill}
                        stroke="rgba(5,5,5,0.65)"
                        strokeWidth={0.2}
                      />

                      <text
                        x={node.x}
                        y={node.y + radius + (isCore ? 3.5 : 2.2)}
                        fontSize={isCore ? 2.5 : 1.7}
                        fill={palette.text}
                        textAnchor="middle"
                        fontFamily="var(--font-jetbrains-mono), monospace"
                      >
                        {isCore ? "SHEVAS" : truncate(`@${node.username}`, 12)}
                      </text>
                    </motion.g>
                  );
                })}
              </motion.svg>

              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[240px] w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple/[0.08] blur-[70px]" />
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-text-muted">
              <span className="inline-flex items-center gap-1 rounded-full border border-purple/20 bg-purple/10 px-2.5 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-purple" /> Followers
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-cyan/20 bg-cyan/10 px-2.5 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan" /> Following
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.1] bg-white/[0.03] px-2.5 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-white" /> Core account
              </span>
            </div>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...reveal, delay: 0.18 }}
            className="rounded-2xl border border-white/[0.08] bg-bg-glass p-4 backdrop-blur-md sm:p-6"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-muted">
                  Feed Viewer
                </p>
                <h2 className="text-xl font-semibold text-white sm:text-2xl">Latest casts snapshot</h2>
              </div>
              <a
                href={`https://warpcast.com/${data.profile.username}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-cyan/25 px-3 py-1.5 text-[11px] font-mono text-cyan transition-colors hover:border-cyan hover:bg-cyan/10"
              >
                Open Warpcast ↗
              </a>
            </div>

            <div className="max-h-[420px] space-y-2.5 overflow-y-auto pr-1">
              {data.recentCasts.length === 0 ? (
                <p className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-3 text-sm text-text-muted">
                  Cast feed is empty right now.
                </p>
              ) : (
                data.recentCasts.map((cast) => (
                  <article
                    key={cast.hash}
                    className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3"
                  >
                    <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.1em] text-text-muted">
                      <span>@{data.profile.username}</span>
                      <span>{formatTimestamp(cast.timestamp)}</span>
                    </div>

                    <p className="mt-2 text-sm leading-relaxed text-text">{truncate(cast.text, 180)}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-text-muted">
                      <span className="rounded-full border border-white/[0.1] px-2 py-0.5">♥ {cast.likes}</span>
                      <span className="rounded-full border border-white/[0.1] px-2 py-0.5">↻ {cast.recasts}</span>
                      <span className="rounded-full border border-white/[0.1] px-2 py-0.5">↩ {cast.replies}</span>
                      {cast.channel && (
                        <span className="rounded-full border border-purple/20 bg-purple/10 px-2 py-0.5 text-purple/90">
                          #{cast.channel}
                        </span>
                      )}
                    </div>
                  </article>
                ))
              )}
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
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-muted">Network Board</p>
              <h2 className="text-xl font-semibold text-white sm:text-2xl">High-signal accounts around SHEVAS</h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <NetworkList title="Top followers" users={data.topFollowers.slice(0, 5)} tier="follower" />
              <NetworkList title="Top following" users={data.topFollowing.slice(0, 5)} tier="following" />
            </div>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...reveal, delay: 0.3 }}
            className="rounded-2xl border border-white/[0.08] bg-bg-glass p-4 backdrop-blur-md sm:p-6"
          >
            <div className="mb-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-muted">Cast pulse</p>
              <h2 className="text-xl font-semibold text-white sm:text-2xl">Topic extraction from recent posts</h2>
            </div>

            {data.trendKeywords.length === 0 ? (
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-3 text-sm text-text-muted">
                No repeated keywords detected in the latest cast window.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {data.trendKeywords.map((keyword, index) => (
                  <div
                    key={keyword.term}
                    className={`rounded-full border px-3 py-1.5 font-mono text-xs ${
                      index % 2 === 0
                        ? "border-cyan/20 bg-cyan/10 text-cyan"
                        : "border-purple/20 bg-purple/10 text-purple"
                    }`}
                  >
                    {keyword.term} · {keyword.mentions}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 space-y-2 text-sm text-text-muted">
              <p>
                <span className="font-mono text-cyan">Data source:</span> Neynar API
              </p>
              <p>
                <span className="font-mono text-cyan">Endpoints:</span> user profile, user cast feed,
                followers, following.
              </p>
              <p>
                <span className="font-mono text-cyan">Use case:</span> drop this widget into product
                pages where creator discovery and social proof matter.
              </p>
            </div>
          </motion.article>
        </section>
      </main>
    </div>
  );
}
