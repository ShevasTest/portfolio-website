"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";

interface GlitchTextProps {
  text: string;
  className?: string;
  delay?: number;
}

const glitchChars = "!<>-_\\/[]{}—=+*^?#________";

export function GlitchText({ text, className = "", delay = 0.5 }: GlitchTextProps) {
  const [displayText, setDisplayText] = useState("");
  const [isRevealed, setIsRevealed] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    const revealTimeout = setTimeout(() => {
      let iteration = 0;
      const totalIterations = text.length * 3;

      const interval = setInterval(() => {
        setDisplayText(
          text
            .split("")
            .map((char, index) => {
              if (index < Math.floor(iteration / 3)) {
                return char;
              }
              return glitchChars[Math.floor(Math.random() * glitchChars.length)];
            })
            .join("")
        );

        iteration++;

        if (iteration > totalIterations) {
          clearInterval(interval);
          setDisplayText(text);
          setIsRevealed(true);
        }
      }, 35);

      return () => clearInterval(interval);
    }, delay * 1000);

    return () => clearTimeout(revealTimeout);
  }, [text, delay]);

  useEffect(() => {
    if (isRevealed) {
      controls.start({
        opacity: 1,
        transition: { duration: 0.3 },
      });
    }
  }, [isRevealed, controls]);

  return (
    <span className={`relative inline-block ${className}`}>
      {/* Main text */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.1, delay }}
        className="relative z-10"
      >
        {displayText || "\u00A0".repeat(text.length)}
      </motion.span>

      {/* Glitch layers — visible during reveal */}
      {!isRevealed && displayText && (
        <>
          <motion.span
            className="absolute left-0 top-0 z-20 text-cyan opacity-70"
            animate={{
              x: [0, -3, 2, -1, 0],
              y: [0, 1, -1, 0, 0],
            }}
            transition={{
              duration: 0.15,
              repeat: Infinity,
              repeatType: "mirror",
            }}
            aria-hidden
          >
            {displayText}
          </motion.span>
          <motion.span
            className="absolute left-0 top-0 z-20 text-purple opacity-70"
            animate={{
              x: [0, 3, -2, 1, 0],
              y: [0, -1, 1, 0, 0],
            }}
            transition={{
              duration: 0.12,
              repeat: Infinity,
              repeatType: "mirror",
            }}
            aria-hidden
          >
            {displayText}
          </motion.span>
        </>
      )}

      {/* Final glow pulse after reveal */}
      {isRevealed && (
        <motion.span
          className="absolute inset-0 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0] }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0,255,224,0.15) 0%, transparent 70%)",
            filter: "blur(20px)",
          }}
          aria-hidden
        />
      )}
    </span>
  );
}
