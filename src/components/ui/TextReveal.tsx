"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface TextRevealProps {
  children: string;
  className?: string;
  delay?: number;
  /** Split by "word" or "char" */
  by?: "word" | "char";
  /** Use whileInView instead of animate */
  inView?: boolean;
  /** Custom tag */
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
}

const containerVariants = {
  hidden: {},
  visible: (delay: number) => ({
    transition: {
      staggerChildren: 0.03,
      delayChildren: delay,
    },
  }),
};

const wordContainerVariants = {
  hidden: {},
  visible: (delay: number) => ({
    transition: {
      staggerChildren: 0.08,
      delayChildren: delay,
    },
  }),
};

const charVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

const wordVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    rotateX: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export function TextReveal({
  children,
  className = "",
  delay = 0,
  by = "word",
  inView = true,
  as: Tag = "div",
}: TextRevealProps) {
  const MotionTag = motion.create(Tag);

  if (by === "char") {
    const chars = children.split("");
    return (
      <MotionTag
        className={className}
        variants={containerVariants}
        custom={delay}
        initial="hidden"
        {...(inView
          ? { whileInView: "visible", viewport: { once: true, margin: "-50px" } }
          : { animate: "visible" })}
        style={{ display: "inline-block" }}
      >
        {chars.map((char, i) => (
          <motion.span
            key={`${char}-${i}`}
            variants={charVariants}
            className="inline-block"
            style={{ whiteSpace: char === " " ? "pre" : undefined }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </MotionTag>
    );
  }

  // By word
  const words = children.split(" ");
  return (
    <MotionTag
      className={className}
      variants={wordContainerVariants}
      custom={delay}
      initial="hidden"
      {...(inView
        ? { whileInView: "visible", viewport: { once: true, margin: "-50px" } }
        : { animate: "visible" })}
      style={{ perspective: "400px" }}
    >
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          variants={wordVariants}
          className="inline-block"
          style={{ transformOrigin: "bottom" }}
        >
          {word}
          {i < words.length - 1 ? "\u00A0" : ""}
        </motion.span>
      ))}
    </MotionTag>
  );
}

/**
 * Line-by-line reveal wrapper.
 * Wrap multiple children — each child animates in sequence.
 */
interface LineRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
}

const lineContainerVariants = {
  hidden: {},
  visible: ({ delay, stagger }: { delay: number; stagger: number }) => ({
    transition: {
      staggerChildren: stagger,
      delayChildren: delay,
    },
  }),
};

const lineItemVariants = {
  hidden: {
    opacity: 0,
    y: 40,
    clipPath: "inset(0 0 100% 0)",
  },
  visible: {
    opacity: 1,
    y: 0,
    clipPath: "inset(0 0 0% 0)",
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export function LineReveal({
  children,
  className = "",
  delay = 0,
  stagger = 0.12,
}: LineRevealProps) {
  return (
    <motion.div
      className={className}
      variants={lineContainerVariants}
      custom={{ delay, stagger }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
    >
      {Array.isArray(children) ? (
        children.map((child, i) => (
          <motion.div key={i} variants={lineItemVariants}>
            {child}
          </motion.div>
        ))
      ) : (
        <motion.div variants={lineItemVariants}>{children}</motion.div>
      )}
    </motion.div>
  );
}
