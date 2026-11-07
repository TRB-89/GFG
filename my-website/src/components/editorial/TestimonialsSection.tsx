"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Quote, Star, Award, Building, Clock, ArrowRight } from "lucide-react";

interface TestimonialsSectionProps {
  onOpenCommunity?: () => void;
}

export function TestimonialsSection({ onOpenCommunity }: TestimonialsSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const STORIES = [
    {
      name: "Ananya Raman",
      location: "Bengaluru, India",
      hiatus: "4-Year Maternity Pause",
      previousRole: "Senior Backend Developer",
      currentRole: "Lead Data Architect at Nova Tech",
      quote:
        "The biggest barrier was not my technical foundation—it was the anticipatory friction of a 4-year pause. GFG completely deconstructed that fear. The structured Excel & Data Analysis modules refreshed modern workflows, and having a verified GFG Certificate helped Nova Tech evaluate me as a senior contributor.",
      timeToReturn: "9 Weeks to Offer",
      tag: "Tech Architecture",
    },
    {
      name: "Pooja Iyer",
      location: "Chennai, India (Hybrid)",
      hiatus: "5-Year Eldercare Sabbatical",
      previousRole: "Systems Analyst",
      currentRole: "Staff Systems Engineer at Aura Cloud",
      quote:
        "Traditional recruiters treated my 5-year break like I had forgotten how distributed systems worked. GFG's Career Continuity Passport anchored my 6 years of pre-break mastery and paired me with an executive mentor who had also taken a multi-year break. I negotiated a protected hybrid returnship with full stipend parity.",
      timeToReturn: "12 Weeks to Offer",
      tag: "Cloud Infrastructure",
    },
    {
      name: "Ritu Sengupta",
      location: "Pune, India (Remote)",
      hiatus: "3-Year Health & Relocation Hiatus",
      previousRole: "QA & Project Lead",
      currentRole: "Technical Program Manager at Tata Digital",
      quote:
        "The Comeback Narrative framework was a revelation. Instead of apologizing for my health pause, I learned to present it with ownership and highlight the prioritization and resilience I built. GFG proved that women don't need to start over from scratch.",
      timeToReturn: "8 Weeks to Offer",
      tag: "Program Leadership",
    },
  ];

  return (
    <section
      id="stories"
      ref={ref}
      className="relative min-h-screen w-full flex flex-col justify-center py-28 px-6 sm:px-12 md:px-16 lg:px-20 z-10 border-t border-[#344236] bg-[#0B0F0D] overflow-hidden"
    >
      {/* Ambient background light */}
      <div className="absolute top-1/2 left-1/4 w-[700px] h-[700px] bg-[#536B58]/08 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full space-y-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#344236] pb-8">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#B6C899]" />
              <span className="text-[11px] font-mono uppercase tracking-[0.26em] text-[#B6C899] font-medium">
                06 // COMEBACK CHRONICLES
              </span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-serif font-normal tracking-tight text-[#F5F0E5] leading-[1.04]">
              Real women.{" "}
              <span className="italic text-[#B6C899] font-serif">
                Real tenure restored.
              </span>
            </h2>
          </div>

          {onOpenCommunity && (
            <button
              type="button"
              onClick={onOpenCommunity}
              className="px-6 py-3 rounded-full border border-[#344236] bg-[#111714] text-[#F5F0E5] hover:text-[#B6C899] hover:border-[#B6C899]/60 text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-2 shrink-0"
            >
              <span>Explore Comeback Circles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 3 Spacious Cinematic Story Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {STORIES.map((story, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 35 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 35 }}
              transition={{ duration: 0.8, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] as const }}
              className="bg-[#111714] border border-[#344236] hover:border-[#B6C899]/60 rounded-3xl p-8 sm:p-9 flex flex-col justify-between space-y-8 relative overflow-hidden group transition-all duration-300 shadow-xl"
            >
              {/* Subtle Ambient Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#536B58]/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />

              <div className="space-y-6 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono tracking-wider bg-[#1B231E] border border-[#344236] text-[#B6C899] font-medium">
                    {story.hiatus}
                  </span>
                  <span className="text-xs font-mono text-[#C6AC7D]">
                    {story.timeToReturn}
                  </span>
                </div>

                <Quote className="w-8 h-8 text-[#536B58]/40" />

                <p className="text-sm sm:text-base text-[#F5F0E5]/90 leading-relaxed font-light italic font-serif">
                  &ldquo;{story.quote}&rdquo;
                </p>
              </div>

              {/* Recipient Profile Info */}
              <div className="pt-6 border-t border-[#344236]/60 space-y-2 relative z-10">
                <div className="text-lg font-serif text-[#F5F0E5] tracking-wide">
                  {story.name}
                </div>
                <div className="text-xs text-[#B6C899] font-medium font-mono">
                  {story.currentRole}
                </div>
                <div className="text-[11px] text-[#AAB9A9] flex items-center justify-between font-mono">
                  <span>Prior: {story.previousRole}</span>
                  <span>{story.location}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
