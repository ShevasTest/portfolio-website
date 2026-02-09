import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#050505",
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(0,255,224,0.4), transparent 56%), radial-gradient(circle at 80% 80%, rgba(139,92,246,0.5), transparent 60%)",
          borderRadius: 42,
          border: "4px solid rgba(255,255,255,0.12)",
          boxShadow: "0 0 40px rgba(0, 255, 224, 0.2), 0 0 52px rgba(139, 92, 246, 0.18)",
          color: "#ffffff",
          fontSize: 104,
          fontWeight: 700,
          letterSpacing: "-0.06em",
        }}
      >
        S
      </div>
    ),
    size,
  );
}
