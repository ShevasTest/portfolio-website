"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useIsCoarsePointer } from "@/hooks/useIsCoarsePointer";

type SkillCategory = {
  name: string;
  accent: "cyan" | "purple";
  orbit: number;
  confidence: string;
  skills: string[];
};

const SKILL_CATEGORIES: SkillCategory[] = [
  {
    name: "Frontend",
    accent: "cyan",
    orbit: 0,
    confidence: "Pixel-perfect interfaces with motion-first UX.",
    skills: ["Next.js", "TypeScript", "Tailwind v4", "Framer Motion"],
  },
  {
    name: "Backend",
    accent: "purple",
    orbit: 72,
    confidence: "Reliable APIs, data pipelines, and automation layers.",
    skills: ["Node.js", "Python", "PostgreSQL", "WebSockets"],
  },
  {
    name: "Web3",
    accent: "cyan",
    orbit: 144,
    confidence: "On-chain products, analytics, and protocol integrations.",
    skills: ["Solidity", "Ethers.js", "DeFi", "On-chain Data"],
  },
  {
    name: "AI",
    accent: "purple",
    orbit: 216,
    confidence: "LLM features, agent workflows, and production prompts.",
    skills: ["LLM APIs", "RAG", "Agent Design", "Prompt Systems"],
  },
  {
    name: "Tools",
    accent: "cyan",
    orbit: 288,
    confidence: "From local DX to cloud deploys and observability.",
    skills: ["Git", "Docker", "Vercel", "CI/CD"],
  },
];

function OrbitalSkills({
  spinDuration,
  compact,
}: {
  spinDuration: number;
  compact: boolean;
}) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[320px] min-[420px]:max-w-[380px] sm:max-w-[480px]">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
        className="absolute inset-0"
      >
        <div className="absolute inset-[10%] rounded-full border border-white/10" />
        <div className="absolute inset-[22%] rounded-full border border-white/8" />
        <div className="absolute inset-[34%] rounded-full border border-white/6" />

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: spinDuration, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
        >
          {SKILL_CATEGORIES.map((category, index) => {
            const radius = compact ? 37 : 40;
            const angle = (category.orbit * Math.PI) / 180;
            const x = 50 + Math.cos(angle) * radius;
            const y = 50 + Math.sin(angle) * radius;
            const isCyan = category.accent === "cyan";

            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.7 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                  ease: [0.22, 1, 0.36, 1] as const,
                }}
                style={{ left: `${x}%`, top: `${y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2"
              >
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: spinDuration, repeat: Infinity, ease: "linear" }}
                  className="relative"
                >
                  <motion.div
                    animate={{ scale: [1, 1.12, 1], opacity: [0.35, 0.7, 0.35] }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      delay: index * 0.25,
                      ease: "easeInOut",
                    }}
                    className={`absolute inset-0 rounded-full blur-md ${
                      isCyan ? "bg-cyan/30" : "bg-purple/30"
                    }`}
                  />
                  <div
                    className={`glass relative rounded-full border px-3 py-1.5 text-center sm:px-4 sm:py-2 ${
                      isCyan ? "border-cyan/35" : "border-purple/35"
                    }`}
                  >
                    <p
                      className={`font-mono text-[9px] tracking-wide uppercase sm:text-[10px] ${
                        isCyan ? "text-cyan" : "text-purple"
                      }`}
                    >
                      {category.name}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="absolute left-1/2 top-1/2 h-[34%] w-[34%] -translate-x-1/2 -translate-y-1/2">
          <motion.div
            animate={{ boxShadow: [
              "0 0 20px rgba(0,255,224,0.18)",
              "0 0 42px rgba(139,92,246,0.24)",
              "0 0 20px rgba(0,255,224,0.18)",
            ] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="glass flex h-full w-full flex-col items-center justify-center rounded-full border border-cyan/20 bg-bg-card/70"
          >
            <span className="font-mono text-[10px] tracking-[0.2em] text-text-muted uppercase">
              Core
            </span>
            <span className="mt-1 text-gradient text-base font-semibold tracking-tight min-[420px]:text-lg sm:text-xl">
              SHEVAS
            </span>
            <span className="font-mono text-[10px] text-text-muted">AI × Web3</span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function CategoryCard({
  category,
  index,
}: {
  category: SkillCategory;
  index: number;
}) {
  const isCyan = category.accent === "cyan";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true }}
      transition={{
        duration: 0.55,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1] as const,
      }}
      className={`glass group relative overflow-hidden rounded-2xl p-5 ${
        isCyan ? "border-cyan/15" : "border-purple/15"
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${
          isCyan
            ? "bg-gradient-to-br from-cyan/[0.08] via-transparent to-transparent"
            : "bg-gradient-to-br from-purple/[0.08] via-transparent to-transparent"
        }`}
      />

      <div className="relative z-10">
        <div className="mb-2 flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${isCyan ? "bg-cyan" : "bg-purple"}`}
          />
          <h3
            className={`font-mono text-xs tracking-wider uppercase ${
              isCyan ? "text-cyan" : "text-purple"
            }`}
          >
            {category.name}
          </h3>
        </div>

        <p className="mb-4 text-sm leading-relaxed text-text-muted">
          {category.confidence}
        </p>

        <div className="flex flex-wrap gap-2">
          {category.skills.map((skill, chipIndex) => (
            <motion.span
              key={skill}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.3,
                delay: index * 0.05 + chipIndex * 0.04,
              }}
              className={`rounded-full border px-2.5 py-1 font-mono text-[10px] ${
                isCyan
                  ? "border-cyan/20 text-cyan/75"
                  : "border-purple/20 text-purple/75"
              }`}
            >
              {skill}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function Skills() {
  const isCoarsePointer = useIsCoarsePointer();

  return (
    <section id="skills" className="relative overflow-hidden py-24 md:py-32">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan/[0.03] blur-[130px]" />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading
          label="// skills"
          title="Capability Constellation"
          description="Not a list of percentages — a connected system of skills I combine to ship ambitious AI and Web3 products."
        />

        <div className="grid items-center gap-10 sm:gap-12 lg:grid-cols-[1.1fr_1fr]">
          <OrbitalSkills spinDuration={isCoarsePointer ? 70 : 45} compact={isCoarsePointer} />

          <div className="grid gap-4 sm:grid-cols-2">
            {SKILL_CATEGORIES.map((category, index) => (
              <CategoryCard
                key={category.name}
                category={category}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
