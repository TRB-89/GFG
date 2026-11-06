"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ShieldCheck, HeartHandshake, Zap, Compass, Check, ArrowRight } from "lucide-react";

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
      desc: "Whether your break was for maternity, elderly care, personal health, or relocation, GFG normalizes life sabbaticals. We replace awkward gap explanations with an executive Comeback Narrative rooted in resilience.",
      accent: "from-orange-500/20 via-orange-600/10 to-transparent",
      tag: "Dignified Re-Entry",
    },
    {
      num: "02",
      icon: Zap,
      title: "Skills Evolve. Logic Remains.",
      kicker: "CALIBRATION OVER REPETITION",
      desc: "You don't need to retake a 4-year degree. Our AI Career Guidance identifies precisely what has shifted in your domain and delivers targeted microlearning without forcing you to re-learn what you already mastered.",
      accent: "from-amber-500/20 via-amber-600/10 to-transparent",
      tag: "Targeted Upskilling",
    },
    {
      num: "03",
      icon: ShieldCheck,
      title: "Tenure Preservation",
      kicker: "PROTECTED RETURNSHIPS",
      desc: "We partner with forward-thinking employers to build structured returnships that honor prior seniority, provide market-rate stipends, and offer clear conversion paths to full leadership roles.",
      accent: "from-rose-500/20 via-amber-600/10 to-transparent",
      tag: "Equitable Compensation",
    },
  ];

  return (
    <section
      id="mission"
      ref={ref}
      className="relative min-h-screen w-full flex flex-col justify-center py-28 px-6 sm:px-12 md:px-16 lg:px-20 z-10 border-t border-orange-500/15 overflow-hidden"
    >
      {/* Ambient background glow beam */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full space-y-16">
        {/* Section Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="space-y-6 max-w-4xl"
        >
          <motion.div variants={itemVariants} className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="text-[11px] font-mono uppercase tracking-[0.26em] text-orange-400 font-semibold">
              02 // THE GFG PHILOSOPHY & MISSION
            </span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-4xl sm:text-6xl md:text-7xl font-light tracking-tight text-[#fcf8f2] leading-[1.02]"
          >
            THE RESUME GAP IS NOT A VOID.{" "}
            <span className="text-gradient-amber italic font-serif">
              IT IS LEADERSHIP IN DISGUISE.
            </span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl text-[#c7b7a6] leading-relaxed font-light max-w-3xl"
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
                className="card-editorial-glow rounded-3xl p-8 sm:p-10 flex flex-col justify-between space-y-8 relative overflow-hidden group"
              >
                {/* Ambient Top Corner Light */}
                <div
                  className={`absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br ${pillar.accent} rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700 pointer-events-none`}
                />

                <div className="space-y-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono tracking-widest text-orange-400/90 font-bold">
                      {`${pillar.num} //`}
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-mono tracking-wider bg-orange-500/10 border border-orange-500/20 text-orange-300">
                      {pillar.tag}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-[#1d140e] border border-orange-500/30 flex items-center justify-center text-orange-400 group-hover:border-orange-400 transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="space-y-2">
                    <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#9c8d80]">
                      {pillar.kicker}
                    </div>
                    <h3 className="text-2xl font-serif text-[#fcf8f2] tracking-wide">
                      {pillar.title}
                    </h3>
                  </div>

                  <p className="text-sm text-[#b5a596] leading-relaxed font-light">
                    {pillar.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-xs font-mono text-orange-300/80 group-hover:text-orange-200 transition-colors">
                  <Check className="w-3.5 h-3.5 text-orange-500" />
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
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#B6C899] font-semibold">
              SEPARATE JOURNEYS // UNIFIED IMPACT
            </span>
            <h3 className="text-2xl sm:text-3xl font-light text-[#F5F0E5]">
              Tailored Platforms for Returners and Inclusive Employers
            </h3>
            <p className="text-xs sm:text-sm text-[#AAB9A9] leading-relaxed">
              Whether you are rebuilding your career trajectory or seeking experienced, battle-tested talent, GFG provides dedicated workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {/* Returner Pathway Card */}
            <div className="p-8 rounded-3xl bg-[#1B231E] border border-[#344236] hover:border-[#B6C899] transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase px-3 py-1 rounded-full bg-[#202A23] text-[#B6C899] border border-[#B6C899]/30 font-bold">
                    For Women Returners
                  </span>
                  <span className="text-xs text-[#AAB9A9]">Empowerment &amp; Skills</span>
                </div>
                <h4 className="text-xl font-bold text-[#F5F0E5]">
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
                  className="w-full py-3 px-6 bg-[#B6C899] hover:bg-[#F5F0E5] text-[#111714] text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 hover:scale-[1.01]"
                >
                  <span>Start Your Personalized Journey</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Employer Pathway Card */}
            <div className="p-8 rounded-3xl bg-[#171F1A] border border-[#344236] hover:border-[#697D69] transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase px-3 py-1 rounded-full bg-[#202A23] text-[#F5F0E5] border border-[#344236] font-bold">
                    For Inclusive Employers
                  </span>
                  <span className="text-xs text-[#AAB9A9]">Talent &amp; Returnships</span>
                </div>
                <h4 className="text-xl font-bold text-[#F5F0E5]">
                  Discover Vetted Returner Talent &amp; Launch Returnship Cohorts
                </h4>
                <p className="text-xs sm:text-sm text-[#AAB9A9] leading-relaxed">
                  Access pre-vetted senior professionals, verify demonstrable work samples and Career Passports, post returnship openings with salary parity, and track cohort onboarding analytics.
                </p>
                <ul className="text-xs text-[#AAB9A9] space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#697D69]" />
                    <span>Bias-free talent discovery without resume-gap filtering</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#697D69]" />
                    <span>Returnship Cohort Builder &amp; Compensation Parity Toolkit</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#697D69]" />
                    <span>Tenant-isolated candidate records with role-based governance</span>
                  </li>
                </ul>
              </div>

              {onOpenEmployerDesk && (
                <button
                  type="button"
                  onClick={onOpenEmployerDesk}
                  className="w-full py-3 px-6 bg-[#202A23] hover:bg-[#344236] text-[#F5F0E5] text-xs font-bold rounded-xl border border-[#344236] transition-all flex items-center justify-center gap-2"
                >
                  <span>Access Employer Intelligence Portal</span>
                  <ArrowRight className="w-4 h-4 text-[#B6C899]" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
