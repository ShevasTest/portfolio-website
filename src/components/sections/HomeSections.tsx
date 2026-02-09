"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";

const About = dynamic(
  () => import("@/components/sections/About").then((mod) => mod.About),
  { ssr: false }
);

const Projects = dynamic(
  () => import("@/components/sections/Projects").then((mod) => mod.Projects),
  { ssr: false }
);

const Skills = dynamic(
  () => import("@/components/sections/Skills").then((mod) => mod.Skills),
  { ssr: false }
);

const Contact = dynamic(
  () => import("@/components/sections/Contact").then((mod) => mod.Contact),
  { ssr: false }
);

function SectionFallback({
  id,
  heightClass,
}: {
  id: string;
  heightClass: string;
}) {
  return (
    <section id={id} className="relative py-24 md:py-32" aria-hidden>
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div
          className={`glass ${heightClass} animate-pulse rounded-2xl border border-white/5`}
        />
      </div>
    </section>
  );
}

function LazySection({
  id,
  heightClass,
  rootMargin = "320px 0px",
  children,
}: {
  id: string;
  heightClass: string;
  rootMargin?: string;
  children: ReactNode;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isVisible) return;

    const node = wrapperRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { rootMargin, threshold: 0.01 }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [isVisible, rootMargin]);

  return (
    <div ref={wrapperRef}>
      {isVisible ? children : <SectionFallback id={id} heightClass={heightClass} />}
    </div>
  );
}

export function HomeSections() {
  return (
    <>
      <LazySection id="about" heightClass="h-[360px] sm:h-[420px]">
        <About />
      </LazySection>

      <LazySection id="projects" heightClass="h-[860px] sm:h-[980px]">
        <Projects />
      </LazySection>

      <LazySection id="skills" heightClass="h-[520px] sm:h-[620px]">
        <Skills />
      </LazySection>

      <LazySection id="contact" heightClass="h-[480px] sm:h-[560px]">
        <Contact />
      </LazySection>
    </>
  );
}
