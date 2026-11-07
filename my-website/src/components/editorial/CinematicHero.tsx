"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Compass,
  Award,
  CheckCircle2,
} from "lucide-react";

interface CinematicHeroProps {
  onStartComeback: () => void;
  onOpenLearningHub: () => void;
  onOpenRoadmap: () => void;
  onOpenPassport: () => void;
}

export function CinematicHero({
  onStartComeback,
  onOpenLearningHub,
  onOpenRoadmap,
  onOpenPassport,
}: CinematicHeroProps) {
  // Stagger animation container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.14,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <section
      id="home"
      className="relative min-h-screen w-full flex flex-col justify-between pt-32 pb-12 px-6 sm:px-12 md:px-16 lg:px-20 z-10 overflow-hidden bg-[#0B0F0D]"
    >
      {/* Subtle Botanical Sage Glow Behind Title */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[900px] h-[450px] bg-gradient-to-tr from-[#1B231E]/60 via-[#536B58]/20 to-transparent rounded-full blur-[140px] pointer-events-none" />

      {/* Main Content Area */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto my-auto w-full text-center flex flex-col items-center space-y-8"
      >
        {/* Editorial Eyebrow Tag */}
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#111714]/90 border border-[#344236] backdrop-blur-md shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-[#B6C899] animate-pulse" />
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.24em] text-[#B6C899] font-medium">
            01 // WOMEN CAREER COMEBACK PLATFORM
          </span>
          <span className="text-[10px] text-[#AAB9A9]/60 hidden sm:inline">•</span>
          <span className="text-[10px] font-mono text-[#F5F0E5]/80 hidden sm:inline tracking-wider">
            DPDP COMPLIANT • 100% FREE FOR CANDIDATES
          </span>
        </motion.div>

        {/* Large Cinematic Editorial Headline */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl sm:text-7xl md:text-8xl lg:text-[7.25rem] font-normal tracking-tight leading-[0.95] text-[#F5F0E5] font-serif select-none"
        >
          <span>Not a restart. </span>
          <br className="hidden sm:inline" />
          <span className="italic text-[#B6C899] font-serif">
            A return to possibility.
          </span>
        </motion.h1>

        {/* Storytelling Subtext */}
        <motion.p
          variants={itemVariants}
          className="text-base sm:text-xl md:text-2xl text-[#AAB9A9] max-w-3xl font-light leading-relaxed text-center px-4"
        >
          Your career break is not a void — it is lived experience, resilience, and perspective. 
          GFG de-stigmatizes your pause through adaptive learning, verifiable skills, 
          and dignified pathways back into high-impact work.
        </motion.p>

        {/* Action Button Strip */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap items-center justify-center gap-4 pt-4 w-full"
        >
          {/* Primary CTA */}
          <button
            type="button"
            onClick={onStartComeback}
            className="px-8 py-3.5 rounded-full bg-[#B6C899] hover:bg-[#c8d8b0] text-[#0B0F0D] font-semibold text-xs tracking-wider uppercase transition-all shadow-[0_0_25px_rgba(182,200,153,0.3)] hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 group"
          >
            <span>Begin Your Journey</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>

          {/* Secondary CTA */}
          <button
            type="button"
            onClick={onOpenRoadmap}
            className="px-8 py-3.5 rounded-full border border-[#344236] bg-[#111714]/80 text-[#F5F0E5] hover:border-[#B6C899]/60 hover:text-[#B6C899] text-xs font-mono uppercase tracking-wider transition-all"
          >
            <span>Explore Opportunities</span>
          </button>

          {/* Quick Learning Hub Trigger */}
          <button
            type="button"
            onClick={onOpenLearningHub}
            className="px-7 py-3.5 rounded-full bg-[#111714]/80 border border-[#344236] hover:border-[#B6C899]/60 text-[#F5F0E5] text-xs font-mono uppercase tracking-wider flex items-center gap-2 backdrop-blur-md hover:text-[#B6C899] transition-all"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#B6C899]" />
            <span>Learning Hub</span>
          </button>
        </motion.div>

        {/* Quick Pillar Jump Pills */}
        <motion.div
          variants={itemVariants}
          className="pt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-[#AAB9A9]"
        >
          <span className="text-[11px] uppercase tracking-widest text-[#B6C899] mr-2">
            Direct Access:
          </span>
          <button
            type="button"
            onClick={onOpenRoadmap}
            className="px-3 py-1.5 rounded-lg bg-[#111714] border border-[#344236] hover:border-[#B6C899]/50 hover:text-[#F5F0E5] transition-all flex items-center gap-1.5 text-[11px]"
          >
            <Compass className="w-3 h-3 text-[#B6C899]" />
            <span>AI Roadmap</span>
          </button>
          <button
            type="button"
            onClick={onOpenPassport}
            className="px-3 py-1.5 rounded-lg bg-[#111714] border border-[#344236] hover:border-[#B6C899]/50 hover:text-[#F5F0E5] transition-all flex items-center gap-1.5 text-[11px]"
          >
            <ShieldCheck className="w-3 h-3 text-[#B6C899]" />
            <span>Career Passport</span>
          </button>
          <button
            type="button"
            onClick={onOpenLearningHub}
            className="px-3 py-1.5 rounded-lg bg-[#111714] border border-[#344236] hover:border-[#B6C899]/50 hover:text-[#F5F0E5] transition-all flex items-center gap-1.5 text-[11px]"
          >
            <Award className="w-3 h-3 text-[#C6AC7D]" />
            <span>Verified Credentials</span>
          </button>
        </motion.div>
      </motion.div>

      {/* Bottom Architectural Ticker Strip */}
      <div className="w-full max-w-7xl mx-auto pt-8 border-t border-[#344236] flex flex-wrap items-center justify-between gap-4 text-[11px] font-mono tracking-widest text-[#AAB9A9] uppercase">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[#B6C899]" />
          <span>SDG 5 &amp; 8 ALIGNED // NOIR BLOOM PLATFORM</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="hidden sm:inline">TENURE PRESERVED</span>
          <span className="text-[#344236] hidden sm:inline">•</span>
          <span>DPDP ACT (INDIA) COMPLIANT</span>
          <span className="text-[#344236] hidden md:inline">•</span>
          <span className="text-[#B6C899] hidden md:inline">100% FREE FOR LEARNERS</span>
        </div>
      </div>
    </section>
  );
}
