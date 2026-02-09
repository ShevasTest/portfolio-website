"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TECH_STACK } from "@/lib/constants";

/* ── Stats ── */
const STATS = [
  { value: 3, suffix: "+", label: "Years Building" },
  { value: 15, suffix: "+", label: "Projects Shipped" },
  { value: 5, suffix: "", label: "Tech Domains" },
] as const;

/* ── Tech categories with gradient config ── */
const CATEGORIES = [
  {
    key: "frontend",
    label: "Frontend",
    gradient: "from-cyan/20 to-cyan/5",
    borderHover: "group-hover:border-cyan/30",
    dotColor: "bg-cyan",
    textColor: "text-cyan",
  },
  {
    key: "backend",
    label: "Backend",
    gradient: "from-purple/20 to-purple/5",
    borderHover: "group-hover:border-purple/30",
    dotColor: "bg-purple",
    textColor: "text-purple",
  },
  {
    key: "web3",
    label: "Web3 / DeFi",
    gradient: "from-cyan/20 to-purple/10",
    borderHover: "group-hover:border-cyan/30",
    dotColor: "bg-cyan",
    textColor: "text-cyan",
  },
  {
    key: "ai",
    label: "AI / ML",
    gradient: "from-purple/20 to-cyan/10",
    borderHover: "group-hover:border-purple/30",
    dotColor: "bg-purple",
    textColor: "text-purple",
  },
  {
    key: "tools",
    label: "DevOps & Tools",
    gradient: "from-cyan/10 to-purple/10",
    borderHover: "group-hover:border-cyan/20",
    dotColor: "bg-cyan",
    textColor: "text-cyan",
  },
] as const;

/* ── Animated counter ── */
function AnimatedStat({
  value,
  suffix,
  label,
  delay,
}: {
  value: number;
  suffix: string;
  label: string;
  delay: number;
}) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const unsub = rounded.on("change", (v) => setDisplay(v));
    return unsub;
  }, [rounded]);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animate(count, value, {
            duration: 1.8,
            delay,
            ease: [0.22, 1, 0.36, 1],
          });
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [count, value, delay]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="text-center"
    >
      <div className="text-gradient text-3xl font-bold tracking-tight min-[480px]:text-4xl sm:text-5xl">
        {display}
        {suffix}
      </div>
      <div className="mt-2 font-mono text-[10px] tracking-wider text-text-muted uppercase sm:text-xs">
        {label}
      </div>
    </motion.div>
  );
}

/* ── Tech pill ── */
function TechPill({
  name,
  accentColor,
  index,
}: {
  name: string;
  accentColor: "cyan" | "purple";
  index: number;
}) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.7, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true }}
      transition={{
        delay: index * 0.04,
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1] as const,
      }}
      whileHover={{
        scale: 1.08,
        y: -2,
        boxShadow:
          accentColor === "cyan"
            ? "0 0 20px rgba(0,255,224,0.2), 0 4px 15px rgba(0,255,224,0.1)"
            : "0 0 20px rgba(139,92,246,0.2), 0 4px 15px rgba(139,92,246,0.1)",
      }}
      className="glass cursor-default rounded-full px-4 py-1.5 text-sm text-text-muted transition-colors hover:text-white"
    >
      {name}
    </motion.span>
  );
}

/* ── Main component ── */
export function About() {
  return (
    <section id="about" className="relative overflow-hidden py-24 md:py-32">
      {/* Subtle gradient accent */}
      <div className="pointer-events-none absolute top-0 left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan/20 to-transparent" />

      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading
          label="// about"
          title="Who I Am"
          description="Building at the intersection of AI and Web3 — shipping products that actually work."
        />

        {/* ── Stats row ── */}
        <div className="mx-auto mb-16 grid max-w-2xl grid-cols-3 gap-3 sm:mb-20 sm:gap-8">
          {STATS.map((stat, i) => (
            <AnimatedStat
              key={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              delay={i * 0.15}
            />
          ))}
        </div>

        {/* ── Bio + Stack ── */}
        <div className="grid gap-16 lg:grid-cols-5">
          {/* Bio — terminal style */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
            className="lg:col-span-2"
          >
            <div className="glass rounded-xl p-6">
              {/* Terminal header */}
              <div className="mb-5 flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500/70" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
                <span className="h-3 w-3 rounded-full bg-green-500/70" />
                <span className="ml-3 font-mono text-xs text-text-muted">
                  about.md
                </span>
              </div>

              <div className="space-y-4 font-mono text-sm leading-relaxed">
                <p className="text-text-muted">
                  <span className="text-purple">const</span>{" "}
                  <span className="text-cyan">developer</span> = {"{"}
                </p>
                <div className="space-y-2 pl-4">
                  <p className="text-text-muted">
                    <span className="text-text">location</span>:{" "}
                    <span className="text-green-400">
                      &quot;Germany 🇩🇪&quot;
                    </span>
                    ,
                  </p>
                  <p className="text-text-muted">
                    <span className="text-text">focus</span>:{" "}
                    <span className="text-green-400">
                      &quot;AI × Web3&quot;
                    </span>
                    ,
                  </p>
                  <p className="text-text-muted">
                    <span className="text-text">approach</span>:{" "}
                    <span className="text-green-400">
                      &quot;Ship fast, iterate faster&quot;
                    </span>
                    ,
                  </p>
                </div>
                <p className="text-text-muted">{"}"}</p>
              </div>

              <div className="mt-6 border-t border-border pt-4">
                <p className="text-sm leading-relaxed text-text-muted">
                  Full-stack dev focused on{" "}
                  <span className="text-cyan">AI-powered products</span> and{" "}
                  <span className="text-purple">on-chain protocols</span>.
                  From DeFi dashboards to autonomous agents — I don&apos;t just
                  write code, I ship things that work.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Tech Stack */}
          <div className="space-y-6 lg:col-span-3">
            {CATEGORIES.map((cat, catIdx) => {
              const items = TECH_STACK.filter((t) => t.category === cat.key);
              if (items.length === 0) return null;
              return (
                <motion.div
                  key={cat.key}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: catIdx * 0.1,
                    duration: 0.6,
                    ease: [0.22, 1, 0.36, 1] as const,
                  }}
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${cat.dotColor}`}
                    />
                    <h3
                      className={`font-mono text-xs font-medium tracking-wider uppercase ${cat.textColor}`}
                    >
                      {cat.label}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {items.map((tech, i) => (
                      <TechPill
                        key={tech.name}
                        name={tech.name}
                        accentColor={
                          cat.key === "backend" || cat.key === "ai"
                            ? "purple"
                            : "cyan"
                        }
                        index={catIdx * items.length + i}
                      />
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
