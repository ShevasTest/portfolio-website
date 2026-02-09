import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
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
            "radial-gradient(circle at 22% 22%, rgba(0,255,224,0.42), transparent 55%), radial-gradient(circle at 78% 78%, rgba(139,92,246,0.52), transparent 58%)",
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.12)",
          color: "#ffffff",
          fontSize: 34,
          fontWeight: 700,
          letterSpacing: "-0.04em",
        }}
      >
        S
      </div>
    ),
    size,
  );
}
