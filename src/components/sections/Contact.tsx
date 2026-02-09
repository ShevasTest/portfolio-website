"use client";

import { motion } from "framer-motion";
import { type FormEvent, type ReactNode, useMemo, useState } from "react";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SITE } from "@/lib/constants";

type ProjectType =
  | "AI Product"
  | "Web3 App"
  | "DeFi Analytics"
  | "Automation Bot"
  | "Other";

type ContactForm = {
  name: string;
  contact: string;
  projectType: ProjectType;
  timeline: string;
  message: string;
};

type SubmitState = {
  kind: "idle" | "error" | "success";
  text: string;
};

type SocialLink = {
  name: string;
  handle: string;
  href: string;
  description: string;
  accent: "cyan" | "purple";
  icon: ReactNode;
};

const PROJECT_TYPES: ProjectType[] = [
  "AI Product",
  "Web3 App",
  "DeFi Analytics",
  "Automation Bot",
  "Other",
];

const TIMELINES = ["ASAP", "2-4 weeks", "1-2 months", "Flexible"] as const;

const INITIAL_FORM: ContactForm = {
  name: "",
  contact: "",
  projectType: "AI Product",
  timeline: "2-4 weeks",
  message: "",
};

const SOCIAL_LINKS: SocialLink[] = [
  {
    name: "Telegram",
    handle: "@Shevas_o",
    href: SITE.links.telegram,
    description: "Fastest response. Best for project briefs and async communication.",
    accent: "cyan",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0h-.056zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
  {
    name: "Farcaster",
    handle: "@shevas",
    href: SITE.links.farcaster,
    description: "Follow product updates and reach out in the web3 social loop.",
    accent: "purple",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.24 3.6H5.76a.48.48 0 0 0-.48.48v15.84a.48.48 0 0 0 .48.48h12.48a.48.48 0 0 0 .48-.48V4.08a.48.48 0 0 0-.48-.48zM12 16.08a4.08 4.08 0 1 1 0-8.16 4.08 4.08 0 0 1 0 8.16z" />
      </svg>
    ),
  },
  {
    name: "GitHub",
    handle: "github.com/shevas",
    href: SITE.links.github,
    description: "Browse shipped code, architecture choices, and live repositories.",
    accent: "cyan",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.51 11.51 0 0 1 12 5.8c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.798 24 17.301 24 12c0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
];

function buildTelegramBrief(form: ContactForm): string {
  return [
    "🚀 New project inquiry from portfolio",
    "",
    `Name: ${form.name.trim()}`,
    `Contact: ${form.contact.trim()}`,
    `Project Type: ${form.projectType}`,
    `Timeline: ${form.timeline}`,
    "",
    "Brief:",
    form.message.trim(),
  ].join("\n");
}

const fieldClassName =
  "w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-text-muted focus:border-cyan/35 focus:bg-white/[0.04]";

export function Contact() {
  const [form, setForm] = useState<ContactForm>(INITIAL_FORM);
  const [submitState, setSubmitState] = useState<SubmitState>({
    kind: "idle",
    text: "",
  });

  const encodedBrief = useMemo(() => {
    const brief = buildTelegramBrief(form);
    return encodeURIComponent(brief);
  }, [form]);

  const setField = <K extends keyof ContactForm>(
    key: K,
    value: ContactForm[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim() || !form.contact.trim() || !form.message.trim()) {
      setSubmitState({
        kind: "error",
        text: "Please fill name, contact, and project brief first.",
      });
      return;
    }

    window.open(
      `${SITE.links.telegram}?text=${encodedBrief}`,
      "_blank",
      "noopener,noreferrer"
    );

    setSubmitState({
      kind: "success",
      text: "Brief draft opened in Telegram — send it there and I’ll reply fast.",
    });
    setForm(INITIAL_FORM);
  };

  return (
    <section id="contact" className="relative overflow-hidden py-24 pb-16 md:py-32">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[620px] w-[880px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan/[0.04] blur-[150px]" />
      <div className="pointer-events-none absolute -right-24 top-24 h-80 w-80 rounded-full bg-purple/[0.06] blur-[130px]" />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading
          label="// contact"
          title="Let's Build Something That Ships"
          description="Share a quick brief and I’ll turn it into a product plan: scope, stack, and a shipping roadmap."
        />

        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
          className="mb-10 flex justify-center"
        >
          <MagneticButton
            href={SITE.links.telegram}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-cyan/30 bg-cyan px-8 py-3.5 font-medium text-bg transition-all hover:shadow-[0_0_36px_rgba(0,255,224,0.28)] sm:w-auto"
          >
            Let&apos;s Build Something
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M4 10h12M12 6l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </MagneticButton>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] as const }}
            className="space-y-4"
          >
            {SOCIAL_LINKS.map((link, index) => {
              const isCyan = link.accent === "cyan";
              return (
                <motion.a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: 0.1 + index * 0.08,
                    duration: 0.45,
                    ease: [0.22, 1, 0.36, 1] as const,
                  }}
                  whileHover={{ y: -2 }}
                  className={`glass group flex items-start gap-4 rounded-2xl p-4 transition-colors ${
                    isCyan
                      ? "hover:border-cyan/30"
                      : "hover:border-purple/30"
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${
                      isCyan
                        ? "border-cyan/25 bg-cyan/10 text-cyan"
                        : "border-purple/25 bg-purple/10 text-purple"
                    }`}
                  >
                    {link.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold tracking-tight text-white">
                        {link.name}
                      </h3>
                      <span
                        className={`max-w-full break-all rounded-full border px-2 py-0.5 font-mono text-[10px] ${
                          isCyan
                            ? "border-cyan/20 text-cyan/75"
                            : "border-purple/20 text-purple/75"
                        }`}
                      >
                        {link.handle}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-text-muted">
                      {link.description}
                    </p>
                  </div>

                  <div
                    className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all ${
                      isCyan
                        ? "border-cyan/15 text-cyan/45 group-hover:border-cyan/35 group-hover:text-cyan"
                        : "border-purple/15 text-purple/45 group-hover:border-purple/35 group-hover:text-purple"
                    }`}
                  >
                    <svg width="14" height="14" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                      <path
                        d="M5 13L13 5M13 5H6M13 5V12"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </motion.a>
              );
            })}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.34, duration: 0.5 }}
              className="glass rounded-2xl p-5"
            >
              <p className="font-mono text-xs tracking-wider text-text-muted uppercase">
                Availability
              </p>
              <p className="mt-3 text-sm leading-relaxed text-text-muted">
                Currently based in Germany (CET). Typical response time: within
                24 hours. Best outcomes happen when the brief includes target
                users, timeline, and core metrics.
              </p>
            </motion.div>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] as const }}
            onSubmit={handleSubmit}
            className="glass rounded-2xl p-5 sm:p-6"
          >
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-white">
                  Project Brief
                </h3>
                <p className="mt-1 text-sm text-text-muted">
                  Fill this once — it opens a ready-to-send Telegram draft.
                </p>
              </div>
              <span className="rounded-full border border-cyan/20 bg-cyan/10 px-2.5 py-1 font-mono text-[10px] text-cyan/80">
                Telegram-first
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="font-mono text-[11px] tracking-wider text-text-muted uppercase">
                  Name
                </span>
                <input
                  className={fieldClassName}
                  placeholder="Your name"
                  value={form.name}
                  onChange={(event) => setField("name", event.target.value)}
                  autoComplete="name"
                  required
                />
              </label>

              <label className="space-y-2">
                <span className="font-mono text-[11px] tracking-wider text-text-muted uppercase">
                  Contact
                </span>
                <input
                  className={fieldClassName}
                  placeholder="@telegram or email"
                  value={form.contact}
                  onChange={(event) => setField("contact", event.target.value)}
                  required
                />
              </label>

              <label className="space-y-2">
                <span className="font-mono text-[11px] tracking-wider text-text-muted uppercase">
                  Project Type
                </span>
                <select
                  className={fieldClassName}
                  value={form.projectType}
                  onChange={(event) =>
                    setField("projectType", event.target.value as ProjectType)
                  }
                >
                  {PROJECT_TYPES.map((type) => (
                    <option key={type} value={type} className="bg-[#0a0a10]">
                      {type}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="font-mono text-[11px] tracking-wider text-text-muted uppercase">
                  Timeline
                </span>
                <select
                  className={fieldClassName}
                  value={form.timeline}
                  onChange={(event) => setField("timeline", event.target.value)}
                >
                  {TIMELINES.map((timeline) => (
                    <option key={timeline} value={timeline} className="bg-[#0a0a10]">
                      {timeline}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="mt-4 block space-y-2">
              <span className="font-mono text-[11px] tracking-wider text-text-muted uppercase">
                Brief
              </span>
              <textarea
                className={`${fieldClassName} min-h-34 resize-y`}
                placeholder="What do you want to build? Goals, users, and must-have features."
                value={form.message}
                onChange={(event) => setField("message", event.target.value)}
                required
              />
            </label>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                className="group inline-flex items-center justify-center gap-2 rounded-full border border-cyan/30 bg-cyan px-6 py-3 text-sm font-medium text-bg transition-all hover:shadow-[0_0_28px_rgba(0,255,224,0.28)]"
              >
                Open Telegram Draft
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                  aria-hidden="true"
                >
                  <path
                    d="M4 10h12M12 6l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <p className="font-mono text-[10px] tracking-wide text-text-muted uppercase">
                No spam • no bots • direct founder chat
              </p>
            </div>

            {submitState.kind !== "idle" && (
              <p
                className={`mt-4 text-sm ${
                  submitState.kind === "error" ? "text-red-400" : "text-cyan"
                }`}
              >
                {submitState.text}
              </p>
            )}
          </motion.form>
        </div>

        <div className="mt-20 border-t border-border pt-8 text-center">
          <p className="font-mono text-xs text-text-muted">
            © {new Date().getFullYear()} SHEVAS. Built with Next.js, Tailwind,
            Framer Motion, and obsession for details.
          </p>
        </div>
      </div>
    </section>
  );
}
