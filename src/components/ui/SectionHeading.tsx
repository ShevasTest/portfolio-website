"use client";

import { motion } from "framer-motion";
import { TextReveal } from "@/components/ui/TextReveal";

interface SectionHeadingProps {
  label: string;
  title: string;
  description?: string;
}

export function SectionHeading({
  label,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="mb-12 text-center sm:mb-16">
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-4 inline-block font-mono text-xs text-cyan sm:text-sm"
      >
        {label}
      </motion.span>

      <TextReveal
        as="h2"
        by="char"
        delay={0.1}
        className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
      >
        {title}
      </TextReveal>

      {description && (
        <TextReveal
          as="p"
          by="word"
          delay={0.2}
          className="mx-auto max-w-2xl text-sm text-text-muted sm:text-base"
        >
          {description}
        </TextReveal>
      )}
    </div>
  );
}
