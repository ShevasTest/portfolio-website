"use client";

import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, type MouseEvent, type ReactNode } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useIsCoarsePointer } from "@/hooks/useIsCoarsePointer";
import { PROJECTS } from "@/lib/constants";

/* ─── 3D Tilt Card Wrapper ─── */
function TiltCard({
  children,
  className,
  href,
  index,
}: {
  children: ReactNode;
  className?: string;
  href: string;
  index: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const isCoarsePointer = useIsCoarsePointer();

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), {
    stiffness: 200,
    damping: 25,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), {
    stiffness: 200,
    damping: 25,
  });
  const brightness = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [0.97, 1.03]),
    { stiffness: 200, damping: 25 }
  );
  const brightnessFilter = useTransform(brightness, (v) => `brightness(${v})`);

  function handleMouseMove(e: MouseEvent<HTMLAnchorElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={isCoarsePointer ? undefined : handleMouseMove}
      onMouseLeave={isCoarsePointer ? undefined : handleMouseLeave}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      whileTap={isCoarsePointer ? { scale: 0.985 } : undefined}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.7,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1] as const,
      }}
      style={{
        rotateX: isCoarsePointer ? 0 : rotateX,
        rotateY: isCoarsePointer ? 0 : rotateY,
        filter: isCoarsePointer ? "brightness(1)" : brightnessFilter,
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
      className={`${className} touch-pan-y`}
    >
      {children}
    </motion.a>
  );
}

type Project = (typeof PROJECTS)[number];

function getPreviewHeight(size: Project["size"]) {
  if (size === "large") return "h-[210px] sm:h-[240px]";
  if (size === "medium") return "h-[150px] sm:h-[170px]";
  return "h-[120px]";
}

function getImageSizes(size: Project["size"]) {
  if (size === "large") {
    return "(max-width: 768px) 92vw, (max-width: 1200px) 66vw, 720px";
  }
  if (size === "medium") {
    return "(max-width: 768px) 92vw, (max-width: 1200px) 33vw, 420px";
  }
  return "(max-width: 768px) 92vw, (max-width: 1200px) 33vw, 320px";
}

/* ─── Main Project Card ─── */
function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const isCyan = project.color === "cyan";

  const sizeClasses =
    project.size === "large"
      ? "md:col-span-2 md:row-span-2"
      : project.size === "medium"
        ? "md:col-span-1 md:row-span-2"
        : "md:col-span-1 md:row-span-1";

  const accentColor = isCyan ? "cyan" : "purple";
  const borderHover = isCyan
    ? "group-hover:border-cyan/30"
    : "group-hover:border-purple/30";

  return (
    <TiltCard
      href={project.href}
      index={index}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-bg-glass transition-all duration-500 ${sizeClasses} ${borderHover}`}
    >
      {/* Hover gradient tint */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-700 group-hover:opacity-100"
        style={{
          background: `linear-gradient(135deg, ${
            isCyan ? "rgba(0,255,224,0.08)" : "rgba(139,92,246,0.08)"
          } 0%, transparent 50%)`,
        }}
      />

      {/* Corner glow */}
      <div
        className={`absolute -right-16 -top-16 h-32 w-32 rounded-full blur-[60px] opacity-0 transition-all duration-700 group-hover:opacity-100 ${
          isCyan ? "bg-cyan/15" : "bg-purple/15"
        }`}
      />

      {/* Optimized preview image */}
      <div className={`relative mx-3 mt-3 overflow-hidden rounded-xl ${getPreviewHeight(project.size)}`}>
        <Image
          src={project.cover}
          alt={`${project.title} interface preview`}
          fill
          loading="lazy"
          sizes={getImageSizes(project.size)}
          className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b0f1f]/80 via-[#0b0f1f]/10 to-transparent" />
        <div className="pointer-events-none absolute inset-0 ring-1 ring-white/10 ring-inset" />

        <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-bg/55 px-2 py-1 font-mono text-[10px] text-white/80 backdrop-blur-sm">
          <span className={`h-1.5 w-1.5 rounded-full ${isCyan ? "bg-cyan" : "bg-purple"}`} />
          Preview
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col p-5 pt-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{project.emoji}</span>
            <div
              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                isCyan
                  ? "bg-cyan/10 text-cyan/80"
                  : "bg-purple/10 text-purple/80"
              }`}
            >
              <div className="h-1 w-1 animate-pulse rounded-full bg-current" />
              Live
            </div>
          </div>

          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300 ${
              isCyan
                ? "border-cyan/10 text-cyan/40 group-hover:border-cyan/40 group-hover:bg-cyan/10 group-hover:text-cyan"
                : "border-purple/10 text-purple/40 group-hover:border-purple/40 group-hover:bg-purple/10 group-hover:text-purple"
            }`}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 18 18"
              fill="none"
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            >
              <path
                d="M5 13L13 5M13 5H6M13 5V12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <h3 className="mb-1.5 text-lg font-semibold tracking-tight text-white sm:text-xl">
          {project.title}
        </h3>

        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-text-muted">
          {project.description}
        </p>

        <div className="mt-auto flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className={`rounded-full border px-2 py-0.5 font-mono text-[10px] transition-colors duration-300 ${
                isCyan
                  ? "border-cyan/10 text-cyan/50 group-hover:border-cyan/25 group-hover:text-cyan/70"
                  : "border-purple/10 text-purple/50 group-hover:border-purple/25 group-hover:text-purple/70"
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div
        className="h-[1px] w-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `linear-gradient(to right, transparent, var(--color-${accentColor}), transparent)`,
          opacity: undefined,
        }}
      />
    </TiltCard>
  );
}

/* ─── Projects Section ─── */
export function Projects() {
  return (
    <section id="projects" className="relative py-24 md:py-32">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple/[0.03] blur-[150px]" />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading
          label="// projects"
          title="What I've Built"
          description="Real products, real users. Each project solves a specific problem in the AI or Web3 space."
        />

        <div className="grid auto-rows-[minmax(220px,auto)] gap-3 sm:gap-4 md:grid-cols-3">
          {PROJECTS.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
