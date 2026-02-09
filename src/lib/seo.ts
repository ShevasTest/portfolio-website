import type { Metadata } from "next";
import { SITE } from "@/lib/constants";

const BASE_KEYWORDS = [
  "SHEVAS",
  "AI-Powered Web3 Builder",
  "AI developer",
  "Web3 developer",
  "DeFi analytics",
  "full-stack developer",
  "Next.js portfolio",
];

const DEFAULT_OG_IMAGE = "/opengraph-image.png";
const DEFAULT_TWITTER_IMAGE = "/twitter-image.png";

type BuildPageMetadataInput = {
  title: string;
  description: string;
  path?: `/${string}` | "/";
  keywords?: string[];
};

export const ALL_INDEXABLE_ROUTES = [
  "/",
  "/projects/crypto-dashboard",
  "/projects/ai-chat",
  "/projects/defi-analytics",
  "/projects/farcaster-widget",
  "/projects/telegram-bot",
] as const;

export function buildPageMetadata({
  title,
  description,
  path = "/",
  keywords = [],
}: BuildPageMetadataInput): Metadata {
  const canonicalPath = path;
  const canonicalUrl = new URL(canonicalPath, SITE.url).toString();
  const mergedKeywords = Array.from(new Set([...BASE_KEYWORDS, ...keywords]));

  return {
    title,
    description,
    keywords: mergedKeywords,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type: "website",
      locale: SITE.locale,
      siteName: `${SITE.name} — ${SITE.tagline}`,
      title,
      description,
      url: canonicalUrl,
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${SITE.name} — ${SITE.tagline}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: SITE.social.farcaster,
      images: [DEFAULT_TWITTER_IMAGE],
    },
  };
}
