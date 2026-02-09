const COINGECKO_API = "https://api.coingecko.com/api/v3";
const TRACKED_COIN_IDS = ["bitcoin", "ethereum", "solana", "chainlink"] as const;

type TrackedCoinId = (typeof TRACKED_COIN_IDS)[number];

interface CoinMarketResponse {
  id: TrackedCoinId;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_percentage_24h: number | null;
  price_change_percentage_7d_in_currency: number | null;
  sparkline_in_7d: {
    price: number[];
  } | null;
  last_updated: string;
}

interface GlobalResponse {
  data: {
    active_cryptocurrencies: number;
    total_market_cap: {
      usd: number;
    };
    total_volume: {
      usd: number;
    };
    market_cap_percentage: {
      btc: number;
    };
  };
}

interface BitcoinHistoryResponse {
  prices: Array<[timestamp: number, price: number]>;
}

export interface TrackedCoin {
  id: TrackedCoinId;
  symbol: string;
  name: string;
  currentPrice: number;
  marketCap: number;
  totalVolume: number;
  high24h: number;
  low24h: number;
  change24h: number;
  change7d: number;
  sparkline7d: number[];
  lastUpdated: string;
}

export interface GlobalSnapshot {
  activeCryptocurrencies: number;
  totalMarketCapUsd: number;
  totalVolumeUsd: number;
  btcDominance: number;
}

export interface PricePoint {
  timestamp: number;
  price: number;
}

export interface WhaleSignal {
  id: TrackedCoinId;
  symbol: string;
  sentiment: "accumulation" | "distribution" | "rotation";
  intensity: "high" | "medium";
  message: string;
}

export interface CryptoDashboardData {
  coins: TrackedCoin[];
  global: GlobalSnapshot;
  bitcoinHistory: PricePoint[];
  whaleSignals: WhaleSignal[];
  generatedAt: string;
}

async function fetchCoinGecko<T>(path: string): Promise<T> {
  const response = await fetch(`${COINGECKO_API}${path}`, {
    headers: {
      accept: "application/json",
    },
    next: {
      revalidate: 60,
    },
  });

  if (!response.ok) {
    throw new Error(`CoinGecko request failed (${response.status}) for ${path}`);
  }

  return response.json() as Promise<T>;
}

function toTrackedCoin(item: CoinMarketResponse): TrackedCoin {
  return {
    id: item.id,
    symbol: item.symbol.toUpperCase(),
    name: item.name,
    currentPrice: item.current_price,
    marketCap: item.market_cap,
    totalVolume: item.total_volume,
    high24h: item.high_24h,
    low24h: item.low_24h,
    change24h: item.price_change_percentage_24h ?? 0,
    change7d: item.price_change_percentage_7d_in_currency ?? 0,
    sparkline7d: item.sparkline_in_7d?.price.filter((value) =>
      Number.isFinite(value)
    ) ?? [],
    lastUpdated: item.last_updated,
  };
}

function buildWhaleSignals(coins: TrackedCoin[]): WhaleSignal[] {
  return coins
    .map((coin) => {
      const turnoverRatio = coin.marketCap > 0 ? coin.totalVolume / coin.marketCap : 0;
      const momentum = coin.change24h;

      const sentiment: WhaleSignal["sentiment"] =
        turnoverRatio > 0.035
          ? momentum >= 0
            ? "accumulation"
            : "distribution"
          : "rotation";

      const intensity: WhaleSignal["intensity"] =
        turnoverRatio > 0.06 || Math.abs(momentum) > 4 ? "high" : "medium";

      const headline =
        sentiment === "accumulation"
          ? "Large wallets are likely accumulating."
          : sentiment === "distribution"
            ? "High-volume selling pressure detected."
            : "Flow rotation across majors remains active.";

      return {
        id: coin.id,
        symbol: coin.symbol,
        sentiment,
        intensity,
        score: turnoverRatio * 100 + Math.abs(momentum),
        message: `${headline} 24h turnover is ${(turnoverRatio * 100).toFixed(1)}% of market cap with ${momentum.toFixed(2)}% price change.`,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((signal) => ({
      id: signal.id,
      symbol: signal.symbol,
      sentiment: signal.sentiment,
      intensity: signal.intensity,
      message: signal.message,
    }));
}

function downsampleHistory(points: PricePoint[], targetPoints: number): PricePoint[] {
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

export async function getCryptoDashboardData(): Promise<CryptoDashboardData> {
  const coinIds = TRACKED_COIN_IDS.join(",");

  const [marketsResponse, globalResponse, historyResponse] = await Promise.all([
    fetchCoinGecko<CoinMarketResponse[]>(
      `/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&per_page=10&page=1&sparkline=true&price_change_percentage=24h,7d`
    ),
    fetchCoinGecko<GlobalResponse>("/global"),
    fetchCoinGecko<BitcoinHistoryResponse>(
      "/coins/bitcoin/market_chart?vs_currency=usd&days=7&interval=hourly"
    ),
  ]);

  const coinOrder = new Map<TrackedCoinId, number>(
    TRACKED_COIN_IDS.map((id, index) => [id, index])
  );

  const coins = marketsResponse
    .filter((coin): coin is CoinMarketResponse =>
      TRACKED_COIN_IDS.includes(coin.id)
    )
    .map(toTrackedCoin)
    .sort((a, b) => {
      const aOrder = coinOrder.get(a.id) ?? Number.MAX_SAFE_INTEGER;
      const bOrder = coinOrder.get(b.id) ?? Number.MAX_SAFE_INTEGER;
      return aOrder - bOrder;
    });

  const bitcoinHistory = downsampleHistory(
    historyResponse.prices
      .filter((point) => Number.isFinite(point[0]) && Number.isFinite(point[1]))
      .map(([timestamp, price]) => ({ timestamp, price })),
    64
  );

  return {
    coins,
    global: {
      activeCryptocurrencies: globalResponse.data.active_cryptocurrencies,
      totalMarketCapUsd: globalResponse.data.total_market_cap.usd,
      totalVolumeUsd: globalResponse.data.total_volume.usd,
      btcDominance: globalResponse.data.market_cap_percentage.btc,
    },
    bitcoinHistory,
    whaleSignals: buildWhaleSignals(coins),
    generatedAt: new Date().toISOString(),
  };
}
