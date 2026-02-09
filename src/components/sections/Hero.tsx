"use client";

import dynamic from "next/dynamic";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { TypewriterText } from "@/components/ui/TypewriterText";
import { GlitchText } from "@/components/ui/GlitchText";
import { useIsCoarsePointer } from "@/hooks/useIsCoarsePointer";

const Scene = dynamic(
  () => import("@/components/three/Scene").then((mod) => mod.Scene),
  { ssr: false }
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 1.8,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const nameVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const isCoarsePointer = useIsCoarsePointer();
  const [sceneReady, setSceneReady] = useState(false);

  // Mouse parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 50, damping: 30, mass: 1 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Parallax transforms for different layers
  const contentX = useTransform(smoothMouseX, [-0.5, 0.5], [12, -12]);
  const contentY = useTransform(smoothMouseY, [-0.5, 0.5], [8, -8]);
  const auroraX = useTransform(smoothMouseX, [-0.5, 0.5], [24, -24]);
  const auroraY = useTransform(smoothMouseY, [-0.5, 0.5], [16, -16]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let timeoutId: number | undefined;
    let idleId: number | undefined;

    const enableScene = () => setSceneReady(true);

    const supportsIdleCallback =
      typeof window.requestIdleCallback === "function";

    if (supportsIdleCallback) {
      idleId = window.requestIdleCallback(enableScene, { timeout: 900 });
    } else {
      timeoutId = window.setTimeout(enableScene, 280);
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

  useEffect(() => {
    if (isCoarsePointer) {
      mouseX.set(0);
      mouseY.set(0);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isCoarsePointer, mouseX, mouseY]);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden py-24 sm:py-28"
    >
      {/* 3D Particle Background */}
      <div className="absolute inset-0 z-0">
        {sceneReady ? (
          <Scene
            quality={isCoarsePointer ? "mobile" : "desktop"}
            interactive={!isCoarsePointer}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-b from-bg via-bg/95 to-bg" aria-hidden />
        )}
      </div>

      {/* Animated Aurora Blobs */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={isCoarsePointer ? undefined : { x: auroraX, y: auroraY }}
      >
        <div className="aurora-blob aurora-blob-1" />
        <div className="aurora-blob aurora-blob-2" />
        <div className="aurora-blob aurora-blob-3" />
      </motion.div>

      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 z-[2] bg-gradient-to-b from-bg/60 via-transparent to-bg" />
      <div className="absolute bottom-0 left-0 right-0 z-[2] h-48 bg-gradient-to-t from-bg to-transparent" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 z-[1] opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content with mouse parallax */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto max-w-5xl px-5 text-center sm:px-6"
        style={isCoarsePointer ? undefined : { x: contentX, y: contentY }}
      >
        {/* Status badge */}
        <motion.div variants={itemVariants} className="mb-6 inline-block sm:mb-8">
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-medium tracking-wide text-text-muted sm:text-xs">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" />
            </span>
            Available for projects
          </span>
        </motion.div>

        {/* Name with glitch reveal */}
        <motion.h1
          variants={nameVariants}
          className="mb-5 text-5xl font-bold tracking-tighter sm:mb-6 sm:text-7xl md:text-8xl lg:text-9xl"
        >
          <GlitchText text="SHEVAS" delay={0.6} className="text-gradient" />
        </motion.h1>

        {/* Tagline with typewriter */}
        <motion.div
          variants={itemVariants}
          className="mb-6 flex items-center justify-center gap-2 text-base text-text-muted sm:mb-8 sm:text-xl md:text-2xl"
        >
          <span className="font-mono text-cyan/80">&gt;</span>
          <TypewriterText
            words={[
              "AI-Powered Web3 Builder",
              "Full-Stack Developer",
              "DeFi Architect",
              "Automation Engineer",
            ]}
            className="font-mono"
          />
        </motion.div>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          className="mx-auto mb-10 max-w-[42rem] text-sm leading-relaxed text-text-muted/80 sm:mb-14 sm:text-lg"
        >
          Building products at the intersection of{" "}
          <span className="text-cyan/90">AI</span>,{" "}
          <span className="text-purple/90">Web3</span>, and DeFi.
          <br className="hidden sm:block" />
          From smart contracts to full-stack apps — I ship things that work.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
        >
          <MagneticButton
            href="#projects"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-cyan px-8 py-3.5 font-semibold text-bg transition-all hover:shadow-[0_0_40px_rgba(0,255,224,0.3)] sm:w-auto"
          >
            View Projects
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </MagneticButton>
          <MagneticButton
            href="#contact"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 px-8 py-3.5 font-semibold text-white transition-all hover:border-cyan/30 hover:bg-cyan/5 hover:shadow-[0_0_30px_rgba(0,255,224,0.1)] sm:w-auto"
          >
            Get in Touch
          </MagneticButton>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      {!isCoarsePointer && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3, duration: 1 }}
          className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 sm:block"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-[10px] uppercase tracking-[0.25em] text-text-muted/60">
              Scroll
            </span>
            <div className="relative h-10 w-px">
              <div className="absolute inset-0 bg-gradient-to-b from-cyan/40 to-transparent" />
              <motion.div
                className="absolute top-0 h-3 w-px bg-cyan"
                animate={{ y: [0, 28, 0] }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
