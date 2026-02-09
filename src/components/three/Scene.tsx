"use client";

import { Canvas } from "@react-three/fiber";
import { ParticleField, type ParticleFieldMode } from "./ParticleField";

type SceneProps = {
  quality?: ParticleFieldMode;
  interactive?: boolean;
};

export function Scene({ quality = "desktop", interactive = true }: SceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 55 }}
      style={{
        position: "absolute",
        inset: 0,
      }}
      dpr={quality === "mobile" ? [1, 1.2] : [1, 1.5]}
      gl={{ antialias: false, alpha: true }}
      eventSource={
        interactive && typeof document !== "undefined" ? document.body : undefined
      }
      eventPrefix="client"
    >
      <ParticleField mode={quality} interactive={interactive} />
    </Canvas>
  );
}
