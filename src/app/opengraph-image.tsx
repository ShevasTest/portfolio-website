import { ImageResponse } from "next/og";
import { SITE } from "@/lib/constants";

export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
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
              "radial-gradient(circle at 14% 18%, rgba(0,255,224,0.35), transparent 42%), radial-gradient(circle at 88% 82%, rgba(139,92,246,0.32), transparent 42%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 28,
            borderRadius: 34,
            border: "1px solid rgba(255,255,255,0.16)",
            background: "rgba(8, 8, 8, 0.55)",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            padding: "74px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              alignItems: "center",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.04)",
              padding: "12px 20px",
              fontSize: 24,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Portfolio
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div
              style={{
                fontSize: 94,
                lineHeight: 1,
                fontWeight: 800,
                letterSpacing: "-0.045em",
              }}
            >
              {SITE.name}
            </div>
            <div
              style={{
                fontSize: 42,
                lineHeight: 1.15,
                color: "rgba(255,255,255,0.9)",
              }}
            >
              {SITE.tagline}
            </div>
            <div
              style={{
                maxWidth: 980,
                fontSize: 28,
                lineHeight: 1.38,
                color: "rgba(255,255,255,0.72)",
              }}
            >
              Building product-grade AI × Web3 experiences with clean engineering,
              immersive UI, and performance-first execution.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 24,
              color: "rgba(255,255,255,0.72)",
            }}
          >
            <span>shevas.vercel.app</span>
            <span style={{ color: "#00FFE0" }}>AI × Web3 × DeFi</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
