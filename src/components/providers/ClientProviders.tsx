"use client";

import dynamic from "next/dynamic";
import { ReactNode, useEffect, useState } from "react";

const SmoothScroll = dynamic(
  () =>
    import("@/components/providers/SmoothScroll").then((mod) => mod.SmoothScroll),
  { ssr: false }
);

const CustomCursor = dynamic(
  () => import("@/components/ui/CustomCursor").then((mod) => mod.CustomCursor),
  { ssr: false }
);

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  const [enhancementsReady, setEnhancementsReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let timeoutId: number | undefined;
    let idleId: number | undefined;

    const enableEnhancements = () => setEnhancementsReady(true);

    const supportsIdleCallback =
      typeof window.requestIdleCallback === "function";

    if (supportsIdleCallback) {
      idleId = window.requestIdleCallback(enableEnhancements, { timeout: 1200 });
    } else {
      timeoutId = window.setTimeout(enableEnhancements, 420);
    }

    return () => {
      if (
        typeof idleId === "number" &&
        typeof window.cancelIdleCallback === "function"
      ) {
        window.cancelIdleCallback(idleId);
      }
      if (typeof timeoutId === "number") {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  return (
    <>
      {children}
      {enhancementsReady && (
        <>
          <SmoothScroll />
          <CustomCursor />
        </>
      )}
    </>
  );
}
