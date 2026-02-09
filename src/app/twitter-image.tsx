import { ImageResponse } from "next/og";
import { SITE } from "@/lib/constants";

export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "#050505",
          color: "#ffffff",
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 18% 24%, rgba(0,255,224,0.32), transparent 40%), radial-gradient(circle at 86% 82%, rgba(139,92,246,0.32), transparent 42%)",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: "100%",
            padding: "80px",
            gap: 26,
          }}
        >
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              alignItems: "center",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.22)",
              background: "rgba(255,255,255,0.05)",
              padding: "10px 18px",
              fontSize: 22,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {SITE.name}
          </div>

          <div
            style={{
              fontSize: 88,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: "-0.045em",
            }}
          >
            {SITE.tagline}
          </div>

          <div
            style={{
              maxWidth: 920,
              fontSize: 30,
              color: "rgba(255,255,255,0.78)",
              lineHeight: 1.3,
            }}
          >
            High-performance portfolio showcasing production-grade AI, Web3, and DeFi
            products.
          </div>

          <div
            style={{
              marginTop: 4,
              fontSize: 24,
              color: "#00FFE0",
            }}
          >
            shevas.vercel.app
          </div>
        </div>
      </div>
    ),
    size,
  );
}
