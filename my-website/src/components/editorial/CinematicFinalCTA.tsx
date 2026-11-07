"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Sparkles,
  ShieldCheck,
  HeartHandshake,
  Lock,
  ChevronRight,
  Globe2,
} from "lucide-react";

interface CinematicFinalCTAProps {
  onStartComeback: () => void;
  onOpenLearningHub: () => void;
  onOpenOpportunities?: () => void;
  onOpenRoadmap?: () => void;
  onOpenScoring?: () => void;
  onOpenAdmin?: () => void;
  onOpenGovernmentPilot?: () => void;
}

export function CinematicFinalCTA({
  onStartComeback,
  onOpenLearningHub,
  onOpenOpportunities,
  onOpenRoadmap,
  onOpenScoring,
  onOpenAdmin,
  onOpenGovernmentPilot,
}: CinematicFinalCTAProps) {
  return (
    <section className="relative min-h-screen w-full flex flex-col justify-between pt-28 pb-12 px-6 sm:px-12 md:px-16 lg:px-24 z-10 overflow-hidden bg-[#0B0F0D]">
      {/* Background Radial Halo (Sage & Botanical Moss) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] md:w-[1100px] h-[550px] bg-gradient-to-tr from-[#1B231E]/60 via-[#536B58]/20 to-transparent rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-[#536B58]/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Decorative Editorial Border Top */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-[#344236] to-transparent mb-16" />

      {/* Center Stage Emotional Call To Action */}
      <div className="relative max-w-5xl mx-auto my-auto text-center flex flex-col items-center">
        {/* Subtle Eyebrow Pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111714] border border-[#344236] text-xs uppercase tracking-widest text-[#B6C899] font-medium backdrop-blur-md mb-8"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#B6C899]" />
          <span>Your Return Begins Here • 100% Free &amp; Verified</span>
        </motion.div>

        {/* Grand Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif font-normal tracking-tight text-[#F5F0E5] leading-[1.08] mb-8"
        >
          Your break does not <br />
          <span className="italic font-normal text-[#B6C899] font-serif">
            define your limit.
          </span>{" "}
          <br />
          Your ambition does.
        </motion.h2>

        {/* Narrative Emotional Subtext (Strictly truthful, no fake outcome statistics) */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-2xl text-base sm:text-lg md:text-xl text-[#AAB9A9] font-light leading-relaxed mb-12"
        >
          Women across sectors reclaim their independence, salary equity, and professional respect through GFG. 
          No fees, no judgment, no automated rejection. Just real skills, tailored roadmaps, and verified returnships.
        </motion.p>

        {/* Dual Primary CTA Action */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto"
        >
          <button
            type="button"
            onClick={onStartComeback}
            className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-3 px-10 py-5 rounded-full bg-[#B6C899] hover:bg-[#c8d8b0] text-[#0B0F0D] font-semibold text-base sm:text-lg shadow-[0_0_40px_rgba(182,200,153,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            <span>Begin Your Journey</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
          </button>

          <button
            type="button"
            onClick={onOpenLearningHub}
            className="w-full sm:w-auto group inline-flex items-center justify-center gap-3 px-8 py-5 rounded-full bg-[#111714] hover:bg-[#1B231E] text-[#F5F0E5] font-medium text-base sm:text-lg border border-[#344236] hover:border-[#B6C899]/60 backdrop-blur-md transition-all duration-300"
          >
            <BookOpen className="w-5 h-5 text-[#B6C899]" />
            <span>Explore Learning Hub</span>
            <ChevronRight className="w-4 h-4 text-[#AAB9A9] group-hover:text-[#B6C899] group-hover:translate-x-1 transition-all" />
          </button>
        </motion.div>

        {/* Assurance Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mt-16 pt-8 border-t border-[#344236] max-w-3xl w-full text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#1B231E] border border-[#344236] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-[#B6C899]" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-[#AAB9A9] font-medium">100% Free LMS</p>
              <p className="text-sm text-[#F5F0E5] font-medium">Zero Hidden Charges Ever</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#1B231E] border border-[#344236] flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4 text-[#B6C899]" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-[#AAB9A9] font-medium">Confidential &amp; Safe</p>
              <p className="text-sm text-[#F5F0E5] font-medium">DPDP Act 2023 Compliant</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#1B231E] border border-[#344236] flex items-center justify-center shrink-0">
              <HeartHandshake className="w-4 h-4 text-[#B6C899]" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-[#AAB9A9] font-medium">Vetted Employers</p>
              <p className="text-sm text-[#F5F0E5] font-medium">Verified Returnship Partners</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Editorial Footer Bottom Band */}
      <footer className="w-full mt-24 pt-12 border-t border-[#344236] text-xs text-[#AAB9A9] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2 text-sm font-serif text-[#F5F0E5]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B6C899] inline-block shadow-[0_0_10px_#B6C899]" />
            <span className="font-semibold">GFG</span>
            <span className="text-xs text-[#AAB9A9] font-mono tracking-wide">GAP FOR GOOD</span>
          </div>
          <span className="hidden sm:inline text-[#344236]">•</span>
          <p className="text-[#AAB9A9]">
            The Career Comeback &amp; Opportunity Platform for Returning Women.
          </p>
        </div>

        <div className="flex items-center gap-6 text-[#AAB9A9] flex-wrap justify-center">
          <button
            type="button"
            onClick={onOpenLearningHub}
            className="hover:text-[#B6C899] transition-colors"
          >
            Learning Hub
          </button>
          {onOpenRoadmap && (
            <button
              type="button"
              onClick={onOpenRoadmap}
              className="hover:text-[#B6C899] transition-colors"
            >
              AI Roadmap
            </button>
          )}
          {onOpenOpportunities && (
            <button
              type="button"
              onClick={onOpenOpportunities}
              className="hover:text-[#B6C899] transition-colors"
            >
              Verified Roles
            </button>
          )}
          {onOpenScoring && (
            <button
              type="button"
              onClick={onOpenScoring}
              className="hover:text-[#B6C899] transition-colors"
            >
              Scoring Disclosures
            </button>
          )}
          {onOpenAdmin && (
            <button
              type="button"
              onClick={onOpenAdmin}
              className="hover:text-[#B6C899] transition-colors"
            >
              Governance
            </button>
          )}
          {onOpenGovernmentPilot && (
            <button
              type="button"
              onClick={onOpenGovernmentPilot}
              className="hover:text-[#B6C899] transition-colors"
            >
              Gov Pilot
            </button>
          )}
          <a href="#mission" className="hover:text-[#B6C899] transition-colors">
            Our Mission
          </a>
          <span className="text-[#344236]">•</span>
          <span className="text-[#AAB9A9]">© {new Date().getFullYear()} GFG — All Rights Reserved</span>
        </div>
      </footer>
    </section>
  );
}
