const DEFI_LLAMA_API = "https://api.llama.fi";
const EXCLUDED_CATEGORIES = new Set(["CEX"]);

interface LlamaProtocolResponse {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  chains: string[] | null;
  tvl: number | null;
  change_1d: number | null;
  change_7d: number | null;
  url: string | null;
}

interface LlamaChainResponse {
  name: string;
  tvl: number | null;
  tokenSymbol: string | null;
}

interface LlamaHistoricalPoint {
  date: number;
  tvl: number;
}

interface NormalizedProtocol {
  id: string;
  slug: string;
  name: string;
  category: string;
  chains: string[];
  tvlUsd: number;
  change1d: number;
  change7d: number;
  url: string | null;
}

export interface DefiHeadlineStats {
  totalTvlUsd: number;
  weightedChange1d: number;
  weightedChange7d: number;
  activeProtocols: number;
}

export interface DefiTvlPoint {
  timestamp: number;
  tvlUsd: number;
}

export interface DefiChainSnapshot {
  name: string;
  tokenSymbol: string | null;
  tvlUsd: number;
  dominance: number;
}

export interface DefiCategorySnapshot {
  name: string;
  tvlUsd: number;
  share: number;
  protocolCount: number;
}

export interface DefiProtocolSnapshot {
  id: string;
  name: string;
  category: string;
  tvlUsd: number;
  change1d: number;
  change7d: number;
  chainCount: number;
  url: string | null;
}

export interface DefiMomentumSignal {
  id: string;
  name: string;
  tvlUsd: number;
  change7d: number;
  score: number;
  narrative: string;
}

export interface DefiAnalyticsData {
  headline: DefiHeadlineStats;
  tvlHistory: DefiTvlPoint[];
  topChains: DefiChainSnapshot[];
  categories: DefiCategorySnapshot[];
  protocolBoard: DefiProtocolSnapshot[];
  momentumSignals: DefiMomentumSignal[];
  generatedAt: string;
}

async function fetchDeFiLlama<T>(path: string): Promise<T> {
  const response = await fetch(`${DEFI_LLAMA_API}${path}`, {
    headers: {
      accept: "application/json",
    },
    next: {
      revalidate: 90,
    },
  });

  if (!response.ok) {
    throw new Error(`DeFiLlama request failed (${response.status}) for ${path}`);
  }

  return response.json() as Promise<T>;
}

function toFiniteNumber(value: number | null | undefined, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function downsamplePoints(points: DefiTvlPoint[], targetPoints: number): DefiTvlPoint[] {
  if (points.length <= targetPoints) {
    return points;
  }

  const stride = Math.max(1, Math.floor(points.length / targetPoints));
  const sampled = points.filter((_, index) => index % stride === 0);

  const lastPoint = points.at(-1);
  if (lastPoint && sampled.at(-1)?.timestamp !== lastPoint.timestamp) {
    sampled.push(lastPoint);
  }

  return sampled;
}

function normalizeProtocols(protocols: LlamaProtocolResponse[]): NormalizedProtocol[] {
  return protocols
    .map((protocol) => {
      const tvlUsd = toFiniteNumber(protocol.tvl);

      return {
        id: String(protocol.id),
        slug: protocol.slug,
        name: protocol.name,
        category: protocol.category ?? "Other",
        chains: Array.isArray(protocol.chains)
          ? protocol.chains.filter((chain) => typeof chain === "string")
          : [],
        tvlUsd,
        change1d: toFiniteNumber(protocol.change_1d),
        change7d: toFiniteNumber(protocol.change_7d),
        url: protocol.url,
      };
    })
    .filter(
      (protocol) =>
        protocol.name.length > 0 &&
        protocol.tvlUsd > 0 &&
        !EXCLUDED_CATEGORIES.has(protocol.category)
    )
    .sort((a, b) => b.tvlUsd - a.tvlUsd);
}

function calculateWeightedChange(
  protocols: NormalizedProtocol[],
  key: "change1d" | "change7d"
): number {
  const aggregate = protocols.reduce(
    (accumulator, protocol) => {
      accumulator.weightedChange += protocol.tvlUsd * protocol[key];
      accumulator.totalTvl += protocol.tvlUsd;
      return accumulator;
    },
    { weightedChange: 0, totalTvl: 0 }
  );

  if (aggregate.totalTvl <= 0) {
    return 0;
  }

  return aggregate.weightedChange / aggregate.totalTvl;
}

function buildTopChains(chains: LlamaChainResponse[]): DefiChainSnapshot[] {
  const normalizedChains = chains
    .map((chain) => ({
      name: chain.name,
      tokenSymbol: chain.tokenSymbol,
      tvlUsd: toFiniteNumber(chain.tvl),
    }))
    .filter((chain) => chain.name.length > 0 && chain.tvlUsd > 0)
    .sort((a, b) => b.tvlUsd - a.tvlUsd);

  const totalChainTvl = normalizedChains.reduce((sum, chain) => sum + chain.tvlUsd, 0);

  return normalizedChains.slice(0, 8).map((chain) => ({
    ...chain,
    dominance: totalChainTvl > 0 ? (chain.tvlUsd / totalChainTvl) * 100 : 0,
  }));
}

function buildCategoryBreakdown(
  protocols: NormalizedProtocol[],
  totalTvlUsd: number
): DefiCategorySnapshot[] {
  const grouped = new Map<
    string,
    {
      tvlUsd: number;
      protocolCount: number;
    }
  >();

  for (const protocol of protocols) {
    const entry = grouped.get(protocol.category) ?? { tvlUsd: 0, protocolCount: 0 };
    entry.tvlUsd += protocol.tvlUsd;
    entry.protocolCount += 1;
    grouped.set(protocol.category, entry);
  }

  return Array.from(grouped.entries())
    .map(([name, metrics]) => ({
      name,
      tvlUsd: metrics.tvlUsd,
      protocolCount: metrics.protocolCount,
      share: totalTvlUsd > 0 ? (metrics.tvlUsd / totalTvlUsd) * 100 : 0,
    }))
    .sort((a, b) => b.tvlUsd - a.tvlUsd)
    .slice(0, 6);
}

function buildProtocolBoard(protocols: NormalizedProtocol[]): DefiProtocolSnapshot[] {
  return protocols.slice(0, 8).map((protocol) => ({
    id: protocol.id,
    name: protocol.name,
    category: protocol.category,
    tvlUsd: protocol.tvlUsd,
    change1d: protocol.change1d,
    change7d: protocol.change7d,
    chainCount: protocol.chains.length,
    url: protocol.url,
  }));
}

function buildMomentumSignals(protocols: NormalizedProtocol[]): DefiMomentumSignal[] {
  return protocols
    .filter((protocol) => protocol.tvlUsd >= 250_000_000 && protocol.change7d > 0)
    .map((protocol) => {
      const score = protocol.change7d * Math.log10(Math.max(protocol.tvlUsd, 1));

      const narrative =
        protocol.change7d >= 20
          ? "Breakout week with strong TVL inflows."
          : protocol.change7d >= 10
            ? "Solid expansion trend with healthy momentum."
            : "Steady accumulation and constructive flow.";

      return {
        id: protocol.id,
        name: protocol.name,
        tvlUsd: protocol.tvlUsd,
        change7d: protocol.change7d,
        score,
        narrative,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

function buildTvlHistory(history: LlamaHistoricalPoint[]): DefiTvlPoint[] {
  const normalized = history
    .filter(
      (point) =>
        Number.isFinite(point.date) && Number.isFinite(point.tvl) && point.tvl > 0
    )
    .map((point) => ({
      timestamp: point.date * 1000,
      tvlUsd: point.tvl,
    }));

  const recentWindow = normalized.slice(-150);
  return downsamplePoints(recentWindow, 90);
}

export async function getDefiAnalyticsData(): Promise<DefiAnalyticsData> {
  const [protocolsResponse, chainsResponse, historyResponse] = await Promise.all([
    fetchDeFiLlama<LlamaProtocolResponse[]>("/protocols"),
    fetchDeFiLlama<LlamaChainResponse[]>("/v2/chains"),
    fetchDeFiLlama<LlamaHistoricalPoint[]>("/v2/historicalChainTvl"),
  ]);

  const protocols = normalizeProtocols(protocolsResponse);

  if (protocols.length === 0) {
    throw new Error("DeFiLlama returned no valid protocol data.");
  }

  const totalTvlUsd = protocols.reduce((sum, protocol) => sum + protocol.tvlUsd, 0);

  return {
    headline: {
      totalTvlUsd,
      weightedChange1d: calculateWeightedChange(protocols, "change1d"),
      weightedChange7d: calculateWeightedChange(protocols, "change7d"),
      activeProtocols: protocols.length,
    },
    tvlHistory: buildTvlHistory(historyResponse),
    topChains: buildTopChains(chainsResponse),
    categories: buildCategoryBreakdown(protocols, totalTvlUsd),
    protocolBoard: buildProtocolBoard(protocols),
    momentumSignals: buildMomentumSignals(protocols),
    generatedAt: new Date().toISOString(),
  };
}
