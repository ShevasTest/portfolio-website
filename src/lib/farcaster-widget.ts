const NEYNAR_API = "https://api.neynar.com/v2/farcaster";
const DEFAULT_USERNAME = "shevas";
const DEFAULT_VIEWER_FID = 3;
const DEFAULT_API_KEY = "NEYNAR_API_DOCS";
const FOLLOWER_SAMPLE_LIMIT = 24;
const CAST_SAMPLE_LIMIT = 8;

const KEYWORD_STOPWORDS = new Set([
  "about",
  "after",
  "also",
  "been",
  "before",
  "build",
  "check",
  "from",
  "have",
  "just",
  "like",
  "maybe",
  "more",
  "need",
  "only",
  "that",
  "this",
  "their",
  "them",
  "they",
  "what",
  "when",
  "where",
  "which",
  "with",
  "would",
  "your",
]);

interface NeynarUser {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string | null;
  follower_count: number | null;
  following_count: number | null;
  profile?: {
    bio?: {
      text?: string;
    };
  };
}

interface NeynarUserByUsernameResponse {
  user: NeynarUser;
}

interface NeynarCast {
  hash: string;
  text: string;
  timestamp: string;
  reactions?: {
    likes_count?: number | null;
    recasts_count?: number | null;
  };
  replies?: {
    count?: number | null;
  };
  channel?: {
    id?: string | null;
    name?: string | null;
  } | null;
}

interface NeynarUserFeedResponse {
  casts: NeynarCast[];
}

interface NeynarFollowResponse {
  users: Array<{
    user: NeynarUser;
  }>;
}

export interface FarcasterUserSnapshot {
  fid: number;
  username: string;
  displayName: string;
  followerCount: number;
  followingCount: number;
}

export interface FarcasterProfileSnapshot extends FarcasterUserSnapshot {
  bio: string;
}

export interface FarcasterCastSnapshot {
  hash: string;
  text: string;
  timestamp: string;
  channel: string | null;
  likes: number;
  recasts: number;
  replies: number;
}

export interface FarcasterGraphNode {
  id: string;
  fid: number;
  username: string;
  label: string;
  tier: "core" | "follower" | "following";
  influence: number;
  x: number;
  y: number;
}

export interface FarcasterGraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  weight: number;
}

export interface FarcasterTrendKeyword {
  term: string;
  mentions: number;
}

export interface FarcasterWidgetData {
  profile: FarcasterProfileSnapshot;
  recentCasts: FarcasterCastSnapshot[];
  topFollowers: FarcasterUserSnapshot[];
  topFollowing: FarcasterUserSnapshot[];
  graphNodes: FarcasterGraphNode[];
  graphEdges: FarcasterGraphEdge[];
  trendKeywords: FarcasterTrendKeyword[];
  generatedAt: string;
}

function asFiniteNumber(value: number | null | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function sanitizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function toUserSnapshot(user: NeynarUser): FarcasterUserSnapshot {
  return {
    fid: user.fid,
    username: user.username,
    displayName: user.display_name,
    followerCount: asFiniteNumber(user.follower_count),
    followingCount: asFiniteNumber(user.following_count),
  };
}

function toProfileSnapshot(user: NeynarUser): FarcasterProfileSnapshot {
  return {
    ...toUserSnapshot(user),
    bio: sanitizeText(user.profile?.bio?.text ?? "Building AI-native Web3 products."),
  };
}

function toCastSnapshot(cast: NeynarCast): FarcasterCastSnapshot {
  return {
    hash: cast.hash,
    text: sanitizeText(cast.text),
    timestamp: cast.timestamp,
    channel: cast.channel?.id ?? cast.channel?.name ?? null,
    likes: asFiniteNumber(cast.reactions?.likes_count),
    recasts: asFiniteNumber(cast.reactions?.recasts_count),
    replies: asFiniteNumber(cast.replies?.count),
  };
}

function normalizeFollowUsers(payload: NeynarFollowResponse): FarcasterUserSnapshot[] {
  const map = new Map<number, FarcasterUserSnapshot>();

  for (const entry of payload.users) {
    const snapshot = toUserSnapshot(entry.user);

    if (!map.has(snapshot.fid)) {
      map.set(snapshot.fid, snapshot);
    }
  }

  return Array.from(map.values());
}

function selectTopByInfluence(users: FarcasterUserSnapshot[], limit: number): FarcasterUserSnapshot[] {
  return [...users]
    .sort((a, b) => {
      if (b.followerCount !== a.followerCount) {
        return b.followerCount - a.followerCount;
      }

      return b.followingCount - a.followingCount;
    })
    .slice(0, limit);
}

function distributeAngles(count: number, start: number, end: number): number[] {
  if (count <= 0) {
    return [];
  }

  if (count === 1) {
    return [(start + end) / 2];
  }

  const step = (end - start) / (count - 1);
  return Array.from({ length: count }, (_, index) => start + step * index);
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleDeg: number) {
  const radians = (angleDeg * Math.PI) / 180;

  return {
    x: centerX + radius * Math.cos(radians),
    y: centerY + radius * Math.sin(radians),
  };
}

function toInfluenceScore(followerCount: number): number {
  if (followerCount <= 0) {
    return 0;
  }

  const normalized = Math.log10(followerCount + 1) / 6;
  return Math.min(1, Math.max(0.18, normalized));
}

function buildGraph(
  profile: FarcasterProfileSnapshot,
  followers: FarcasterUserSnapshot[],
  following: FarcasterUserSnapshot[]
): Pick<FarcasterWidgetData, "graphNodes" | "graphEdges"> {
  const centerNodeId = `fid-${profile.fid}`;

  const graphNodes: FarcasterGraphNode[] = [
    {
      id: centerNodeId,
      fid: profile.fid,
      username: profile.username,
      label: profile.displayName,
      tier: "core",
      influence: 1,
      x: 50,
      y: 50,
    },
  ];

  const graphEdges: FarcasterGraphEdge[] = [];

  const followerAngles = distributeAngles(followers.length, 210, 330);
  const followingAngles = distributeAngles(following.length, 30, 150);

  followers.forEach((user, index) => {
    const point = polarToCartesian(50, 50, 32, followerAngles[index] ?? 270);
    const nodeId = `fid-${user.fid}`;

    graphNodes.push({
      id: nodeId,
      fid: user.fid,
      username: user.username,
      label: user.displayName,
      tier: "follower",
      influence: toInfluenceScore(user.followerCount),
      x: point.x,
      y: point.y,
    });

    graphEdges.push({
      id: `${centerNodeId}-${nodeId}`,
      sourceId: centerNodeId,
      targetId: nodeId,
      weight: 0.35 + toInfluenceScore(user.followerCount) * 0.65,
    });
  });

  following.forEach((user, index) => {
    const point = polarToCartesian(50, 50, 32, followingAngles[index] ?? 90);
    const nodeId = `fid-${user.fid}`;

    graphNodes.push({
      id: nodeId,
      fid: user.fid,
      username: user.username,
      label: user.displayName,
      tier: "following",
      influence: toInfluenceScore(user.followerCount),
      x: point.x,
      y: point.y,
    });

    graphEdges.push({
      id: `${centerNodeId}-${nodeId}`,
      sourceId: centerNodeId,
      targetId: nodeId,
      weight: 0.35 + toInfluenceScore(user.followerCount) * 0.65,
    });
  });

  return {
    graphNodes,
    graphEdges,
  };
}

function extractTrendKeywords(casts: FarcasterCastSnapshot[]): FarcasterTrendKeyword[] {
  const counts = new Map<string, number>();

  for (const cast of casts) {
    const normalized = cast.text
      .toLowerCase()
      .replace(/https?:\/\/\S+/g, " ")
      .replace(/[^\w$#\s]/g, " ");

    const tokens = normalized.match(/[#$]?[a-z0-9]{3,}/g) ?? [];

    for (const token of tokens) {
      const term = token.trim();

      if (
        term.length < 3 ||
        KEYWORD_STOPWORDS.has(term) ||
        /^[0-9]+$/.test(term)
      ) {
        continue;
      }

      counts.set(term, (counts.get(term) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([term, mentions]) => ({ term, mentions }))
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 6);
}

async function fetchNeynar<T>(path: string): Promise<T> {
  const apiKey = process.env.NEYNAR_API_KEY?.trim() || DEFAULT_API_KEY;

  const response = await fetch(`${NEYNAR_API}${path}`, {
    headers: {
      accept: "application/json",
      api_key: apiKey,
    },
    next: {
      revalidate: 90,
    },
  });

  if (!response.ok) {
    throw new Error(`Neynar request failed (${response.status}) for ${path}`);
  }

  return response.json() as Promise<T>;
}

export async function getFarcasterWidgetData(
  username = DEFAULT_USERNAME
): Promise<FarcasterWidgetData> {
  const profileResponse = await fetchNeynar<NeynarUserByUsernameResponse>(
    `/user/by_username?username=${encodeURIComponent(username)}&viewer_fid=${DEFAULT_VIEWER_FID}`
  );

  const profile = toProfileSnapshot(profileResponse.user);

  const [castsResponse, followersResponse, followingResponse] = await Promise.all([
    fetchNeynar<NeynarUserFeedResponse>(
      `/feed/user/casts?fid=${profile.fid}&viewer_fid=${DEFAULT_VIEWER_FID}&limit=${CAST_SAMPLE_LIMIT}`
    ),
    fetchNeynar<NeynarFollowResponse>(
      `/followers?fid=${profile.fid}&limit=${FOLLOWER_SAMPLE_LIMIT}`
    ),
    fetchNeynar<NeynarFollowResponse>(
      `/following?fid=${profile.fid}&limit=${FOLLOWER_SAMPLE_LIMIT}`
    ),
  ]);

  const recentCasts = castsResponse.casts
    .map(toCastSnapshot)
    .filter((cast) => cast.text.length > 0)
    .slice(0, 6);

  const followers = normalizeFollowUsers(followersResponse).filter(
    (user) => user.fid !== profile.fid
  );
  const following = normalizeFollowUsers(followingResponse).filter(
    (user) => user.fid !== profile.fid
  );

  const topFollowers = selectTopByInfluence(followers, 6);
  const followerIds = new Set(topFollowers.map((user) => user.fid));

  const topFollowing = selectTopByInfluence(
    following.filter((user) => !followerIds.has(user.fid)),
    6
  );

  const { graphNodes, graphEdges } = buildGraph(
    profile,
    topFollowers.slice(0, 5),
    topFollowing.slice(0, 5)
  );

  return {
    profile,
    recentCasts,
    topFollowers,
    topFollowing,
    graphNodes,
    graphEdges,
    trendKeywords: extractTrendKeywords(recentCasts),
    generatedAt: new Date().toISOString(),
  };
}
