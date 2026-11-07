"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ShieldCheck, HeartHandshake, Zap, Compass, Check, ArrowRight, Building2 } from "lucide-react";

interface MissionStorySectionProps {
  onExploreSolutions?: () => void;
  onStartComeback?: () => void;
  onOpenEmployerDesk?: () => void;
}

export function MissionStorySection({
  onExploreSolutions,
  onStartComeback,
  onOpenEmployerDesk,
}: MissionStorySectionProps = {}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.18,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  const PILLARS = [
    {
      num: "01",
      icon: HeartHandshake,
      title: "Life Is Not a Liability",
      kicker: "RADICAL EMPATHY // ZERO PENALTY",
      desc: "Whether your break was for maternity, family care, personal health, or transition, GFG normalizes sabbaticals. We replace awkward gap explanations with an executive Comeback Narrative rooted in resilience.",
      accent: "from-[#B6C899]/20 via-[#536B58]/10 to-transparent",
      tag: "Dignified Re-Entry",
    },
    {
      num: "02",
      icon: Zap,
      title: "Skills Evolve. Logic Remains.",
      kicker: "CALIBRATION OVER REPETITION",
      desc: "You do not need to restart from scratch. Our AI Career Guidance identifies precisely what has evolved in your domain and delivers targeted practical learning without forcing you to re-learn what you mastered.",
      accent: "from-[#536B58]/25 via-[#1B231E]/40 to-transparent",
      tag: "Targeted Upskilling",
    },
    {
      num: "03",
      icon: ShieldCheck,
      title: "Tenure Preservation",
      kicker: "PROTECTED RETURNSHIPS",
      desc: "We partner with verified employers to build structured returnships that honor prior seniority, provide transparent stipends, and offer clear conversion paths to permanent leadership roles.",
      accent: "from-[#C6AC7D]/20 via-[#536B58]/10 to-transparent",
      tag: "Equitable Compensation",
    },
  ];

  return (
    <section
      id="mission"
      ref={ref}
      className="relative min-h-screen w-full flex flex-col justify-center py-28 px-6 sm:px-12 md:px-16 lg:px-20 z-10 border-t border-[#344236] bg-[#0B0F0D] overflow-hidden"
    >
      {/* Ambient background glow beam */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-[#536B58]/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full space-y-16">
        {/* Section Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="space-y-6 max-w-4xl"
        >
          <motion.div variants={itemVariants} className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#B6C899]" />
            <span className="text-[11px] font-mono uppercase tracking-[0.26em] text-[#B6C899] font-medium">
              02 // THE GFG PHILOSOPHY &amp; MISSION
            </span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-4xl sm:text-6xl md:text-7xl font-serif font-normal tracking-tight text-[#F5F0E5] leading-[1.02]"
          >
            The resume gap is not a void.{" "}
            <span className="italic text-[#B6C899] font-serif">
              It is life leadership in disguise.
            </span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl text-[#AAB9A9] leading-relaxed font-light max-w-3xl"
          >
            Hard-won engineering architecture decisions, financial models, and strategic problem-solving do not evaporate into thin air. 
            GFG was built to bridge the gap between seasoned capability and modern opportunities—equitably, transparently, and with complete dignity.
          </motion.p>
        </motion.div>

        {/* 3 Large Narrative Pillars */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 pt-4"
        >
          {PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="bg-[#111714] border border-[#344236] hover:border-[#B6C899]/60 rounded-3xl p-8 sm:p-10 flex flex-col justify-between space-y-8 relative overflow-hidden group transition-all duration-300 shadow-xl"
              >
                {/* Ambient Top Corner Light */}
                <div
                  className={`absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br ${pillar.accent} rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700 pointer-events-none`}
                />

                <div className="space-y-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono tracking-widest text-[#B6C899] font-semibold">
                      {`${pillar.num} //`}
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-mono tracking-wider bg-[#1B231E] border border-[#344236] text-[#B6C899]">
                      {pillar.tag}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-[#1B231E] border border-[#344236] flex items-center justify-center text-[#B6C899] group-hover:border-[#B6C899]/60 transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="space-y-2">
                    <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#AAB9A9]">
                      {pillar.kicker}
                    </div>
                    <h3 className="text-2xl font-serif text-[#F5F0E5] tracking-wide">
                      {pillar.title}
                    </h3>
                  </div>

                  <p className="text-sm text-[#AAB9A9] leading-relaxed font-light">
                    {pillar.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#344236]/60 flex items-center gap-2 text-xs font-mono text-[#B6C899]/80 group-hover:text-[#B6C899] transition-colors">
                  <Check className="w-3.5 h-3.5 text-[#B6C899]" />
                  <span>Integrated in GFG Core</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ============================================================ */}
        {/* DUAL PATHWAY: RETURNER VS EMPLOYER DISTINCT JOURNEYS         */}
        {/* ============================================================ */}
        <motion.div
          variants={itemVariants}
          className="pt-10 border-t border-[#344236] space-y-6"
        >
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#B6C899] font-medium">
              SEPARATE JOURNEYS // UNIFIED IMPACT
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-normal text-[#F5F0E5]">
              Tailored Platforms for Returners and Inclusive Employers
            </h3>
            <p className="text-xs sm:text-sm text-[#AAB9A9] leading-relaxed">
              Whether you are rebuilding your career trajectory or seeking experienced, battle-tested talent, GFG provides dedicated workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {/* Returner Pathway Card */}
            <div className="p-8 rounded-3xl bg-[#111714] border border-[#344236] hover:border-[#B6C899] transition-all flex flex-col justify-between space-y-6 shadow-xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase px-3 py-1 rounded-full bg-[#1B231E] text-[#B6C899] border border-[#B6C899]/30 font-semibold">
                    For Women Returners
                  </span>
                  <span className="text-xs text-[#AAB9A9] font-mono">Empowerment &amp; Skills</span>
                </div>
                <h4 className="text-xl font-serif text-[#F5F0E5]">
                  Rebuild Confidence, Update Skills &amp; Step Back into Leadership
                </h4>
                <p className="text-xs sm:text-sm text-[#AAB9A9] leading-relaxed">
                  Access 8-week structured roadmaps, a private confidence action journal, demonstrable portfolio projects, 1:1 mentor coaching, and direct applications to verified returnships.
                </p>
                <ul className="text-xs text-[#AAB9A9] space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#B6C899]" />
                    <span>8-Week Adaptive Roadmap calibrated to your weekly hours</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#B6C899]" />
                    <span>Non-judgmental Confidence Journal &amp; Milestone Proof</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#B6C899]" />
                    <span>Cryptographically verified Career Passport 2.0</span>
                  </li>
                </ul>
              </div>

              {onStartComeback && (
                <button
                  type="button"
                  onClick={onStartComeback}
                  className="w-full py-3.5 px-6 bg-[#B6C899] hover:bg-[#c8d8b0] text-[#0B0F0D] text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(182,200,153,0.3)] flex items-center justify-center gap-2 hover:scale-[1.01]"
                >
                  <span>Start Your Personalized Journey</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Employer Pathway Card */}
            <div className="p-8 rounded-3xl bg-[#111714] border border-[#344236] hover:border-[#C6AC7D] transition-all flex flex-col justify-between space-y-6 shadow-xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase px-3 py-1 rounded-full bg-[#1B231E] text-[#C6AC7D] border border-[#C6AC7D]/30 font-semibold">
                    For Inclusive Employers
                  </span>
                  <span className="text-xs text-[#AAB9A9] font-mono">Talent &amp; Returnships</span>
                </div>
                <h4 className="text-xl font-serif text-[#F5F0E5]">
                  Discover Vetted Returner Talent &amp; Launch Returnship Cohorts
                </h4>
                <p className="text-xs sm:text-sm text-[#AAB9A9] leading-relaxed">
                  Access pre-vetted senior professionals, verify demonstrable work samples and Career Passports, post returnship openings with salary parity, and track cohort onboarding analytics.
                </p>
                <ul className="text-xs text-[#AAB9A9] space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#C6AC7D]" />
                    <span>Skills-first talent discovery without algorithmic gap penalties</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#C6AC7D]" />
                    <span>Returnship Cohort Builder &amp; Compensation Parity Toolkit</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#C6AC7D]" />
                    <span>Tenant-isolated candidate records with role-based governance</span>
                  </li>
                </ul>
              </div>

              {onOpenEmployerDesk && (
                <button
                  type="button"
                  onClick={onOpenEmployerDesk}
                  className="w-full py-3.5 px-6 bg-[#1B231E] hover:bg-[#202A23] text-[#C6AC7D] text-xs font-semibold uppercase tracking-wider rounded-xl border border-[#C6AC7D]/40 hover:border-[#C6AC7D] transition-all flex items-center justify-center gap-2"
                >
                  <Building2 className="w-4 h-4 text-[#C6AC7D]" />
                  <span>Access Employer Intelligence Desk</span>
                  <ArrowRight className="w-4 h-4 text-[#C6AC7D]" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
