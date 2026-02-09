import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type HealthResponse = {
  status: "ok";
  service: "shevas-portfolio";
  environment: string;
  vercelEnv: string | null;
  commitSha: string | null;
  timestamp: string;
};

export function GET() {
  const payload: HealthResponse = {
    status: "ok",
    service: "shevas-portfolio",
    environment: process.env.NODE_ENV ?? "unknown",
    vercelEnv: process.env.VERCEL_ENV ?? null,
    commitSha: process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GIT_COMMIT_SHA ?? null,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(payload, {
    status: 200,
    headers: {
      "cache-control": "no-store",
    },
  });
}
