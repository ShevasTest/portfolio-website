"use client";

import { useEffect, useRef } from "react";
import type Lenis from "lenis";

export function SmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    let isMounted = true;
    let rafId = 0;

    const teardown: Array<() => void> = [];

    const setup = async () => {
      const { default: LenisClass } = await import("lenis");
      if (!isMounted) return;

      const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

      const lenis = new LenisClass({
        duration: isCoarsePointer ? 1 : 1.4,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        touchMultiplier: isCoarsePointer ? 1.15 : 2,
        syncTouch: isCoarsePointer,
        infinite: false,
      });

      const anchorOffset = isCoarsePointer ? -72 : -80;

      lenisRef.current = lenis;

      const raf = (time: number) => {
        lenis.raf(time);
        rafId = window.requestAnimationFrame(raf);
      };

      rafId = window.requestAnimationFrame(raf);

      const handleAnchorClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const anchor = target.closest("a[href^='#']") as HTMLAnchorElement | null;
        if (!anchor) return;

        const id = anchor.getAttribute("href");
        if (!id || id === "#") return;

        const element = document.querySelector(id);
        if (!element) return;

        e.preventDefault();
        lenis.scrollTo(element as HTMLElement, { offset: anchorOffset });
      };

      document.addEventListener("click", handleAnchorClick);
      teardown.push(() => document.removeEventListener("click", handleAnchorClick));
    };

    void setup();

    return () => {
      isMounted = false;
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      teardown.forEach((cleanup) => cleanup());
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
  }, []);

  return null;
}
