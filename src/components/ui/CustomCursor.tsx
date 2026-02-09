"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

type CursorVariant = "default" | "hover" | "text";

const springConfig = { damping: 25, stiffness: 250, mass: 0.5 };

export function CustomCursor() {
  const [variant, setVariant] = useState<CursorVariant>("default");
  const [visible, setVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(true); // default true to avoid flash

  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  // Outer ring follows with spring (smooth lag)
  const ringX = useSpring(cursorX, springConfig);
  const ringY = useSpring(cursorY, springConfig);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!visible) setVisible(true);
    },
    [cursorX, cursorY, visible]
  );

  const handleMouseLeave = useCallback(() => {
    setVisible(false);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setVisible(true);
  }, []);

  // Detect touch devices
  useEffect(() => {
    const isTouch =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(isTouch);
  }, []);

  // Set up cursor tracking + interactive element detection
  useEffect(() => {
    if (isTouchDevice) return;

    document.body.classList.add("cursor-hidden");

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    // Track interactive elements for cursor variant changes
    const setupHoverListeners = () => {
      const interactiveElements = document.querySelectorAll(
        "a, button, [role='button'], input, textarea, select, [data-cursor='hover']"
      );

      const enterHandlers: Array<[Element, () => void]> = [];
      const leaveHandlers: Array<[Element, () => void]> = [];

      interactiveElements.forEach((el) => {
        const enter = () => setVariant("hover");
        const leave = () => setVariant("default");
        el.addEventListener("mouseenter", enter);
        el.addEventListener("mouseleave", leave);
        enterHandlers.push([el, enter]);
        leaveHandlers.push([el, leave]);
      });

      return () => {
        enterHandlers.forEach(([el, fn]) =>
          el.removeEventListener("mouseenter", fn)
        );
        leaveHandlers.forEach(([el, fn]) =>
          el.removeEventListener("mouseleave", fn)
        );
      };
    };

    let cleanupHovers = setupHoverListeners();

    // Re-setup on DOM changes
    const observer = new MutationObserver(() => {
      cleanupHovers();
      cleanupHovers = setupHoverListeners();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.body.classList.remove("cursor-hidden");
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      cleanupHovers();
      observer.disconnect();
    };
  }, [isTouchDevice, handleMouseMove, handleMouseLeave, handleMouseEnter]);

  // Don't render anything for touch devices
  if (isTouchDevice) return null;

  const variants = {
    default: {
      width: 32,
      height: 32,
      borderColor: "rgba(0, 255, 224, 0.4)",
      backgroundColor: "transparent",
    },
    hover: {
      width: 56,
      height: 56,
      borderColor: "rgba(0, 255, 224, 0.6)",
      backgroundColor: "rgba(0, 255, 224, 0.06)",
    },
    text: {
      width: 4,
      height: 28,
      borderColor: "rgba(0, 255, 224, 0.8)",
      backgroundColor: "rgba(0, 255, 224, 0.8)",
      borderRadius: 2,
    },
  };

  const dotVariants = {
    default: {
      width: 6,
      height: 6,
      opacity: 1,
    },
    hover: {
      width: 8,
      height: 8,
      opacity: 0.8,
    },
    text: {
      width: 0,
      height: 0,
      opacity: 0,
    },
  };

  return (
    <>
      {/* Outer ring (follows with spring lag) */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[9998] rounded-full border mix-blend-difference"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          ...variants[variant],
          opacity: visible ? 1 : 0,
        }}
        transition={{
          width: { duration: 0.3, ease: "easeOut" },
          height: { duration: 0.3, ease: "easeOut" },
          borderColor: { duration: 0.3 },
          backgroundColor: { duration: 0.3 },
          opacity: { duration: 0.2 },
        }}
      />

      {/* Inner dot (follows cursor directly) */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[9998] rounded-full bg-cyan"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          ...dotVariants[variant],
          opacity: visible ? dotVariants[variant].opacity : 0,
        }}
        transition={{
          width: { duration: 0.2 },
          height: { duration: 0.2 },
          opacity: { duration: 0.2 },
        }}
      />

      {/* Glow trail (large, very blurred, follows with extra lag) */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[9997] rounded-full"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
          width: 120,
          height: 120,
          background:
            "radial-gradient(circle, rgba(0,255,224,0.06) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
        animate={{
          opacity: visible && variant !== "text" ? 1 : 0,
        }}
        transition={{ opacity: { duration: 0.3 } }}
      />
    </>
  );
}
