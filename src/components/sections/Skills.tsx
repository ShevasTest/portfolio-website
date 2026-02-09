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
    orbit: 30,
    confidence: "React, Next.js, Tailwind — production-grade UI at speed.",
    skills: ["TypeScript", "React", "Next.js", "Tailwind CSS", "Three.js"],
  },
  {
    name: "Backend",
    accent: "purple",
    orbit: 90,
    confidence: "APIs, databases, and infra that scale.",
    skills: ["Node.js", "Python", "PostgreSQL", "Redis", "Docker"],
  },
  {
    name: "Web3",
    accent: "cyan",
    orbit: 150,
    confidence: "Smart contracts, DeFi protocols, on-chain analytics.",
    skills: ["Solidity", "Ethereum", "Base", "DeFi", "Farcaster"],
  },
  {
    name: "AI / ML",
    accent: "purple",
    orbit: 210,
    confidence: "LLM integration, prompt engineering, AI agents.",
    skills: ["Claude AI", "OpenAI", "LangChain", "RAG", "Agents"],
  },
  {
    name: "DevOps",
    accent: "cyan",
    orbit: 270,
    confidence: "CI/CD, containers, cloud deploy.",
    skills: ["Vercel", "Git", "GitHub Actions", "Linux"],
  },
  {
    name: "Design",
    accent: "purple",
    orbit: 330,
    confidence: "UI/UX with attention to motion and detail.",
    skills: ["Figma", "Motion Design", "Responsive", "A11y"],
  },
];

/* ─── Orbital: desktop only, simplified ─── */
function OrbitalSkills({ spinDuration }: { spinDuration: number }) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[480px]">
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
            const radius = 40;
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
                  <div
                    className={`glass relative rounded-full border px-4 py-2 text-center ${
                      isCyan ? "border-cyan/35" : "border-purple/35"
                    }`}
                  >
                    <p
                      className={`font-mono text-[10px] tracking-wide uppercase ${
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
          <div className="glass flex h-full w-full flex-col items-center justify-center rounded-full border border-cyan/20 bg-bg-card/70">
            <span className="font-mono text-[10px] tracking-[0.2em] text-text-muted uppercase">
              Core
            </span>
            <span className="mt-1 text-gradient text-xl font-semibold tracking-tight">
              SHEVAS
            </span>
            <span className="font-mono text-[10px] text-text-muted">AI × Web3</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Category Card: no blur animations ─── */
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.45,
        delay: index * 0.06,
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
          {category.skills.map((skill) => (
            <span
              key={skill}
              className={`rounded-full border px-2.5 py-1 font-mono text-[10px] ${
                isCyan
                  ? "border-cyan/20 text-cyan/75"
                  : "border-purple/20 text-purple/75"
              }`}
            >
              {skill}
            </span>
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
          {!isCoarsePointer && <OrbitalSkills spinDuration={45} />}

          <div className={`grid gap-4 sm:grid-cols-2 ${isCoarsePointer ? "lg:col-span-2" : ""}`}>
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
