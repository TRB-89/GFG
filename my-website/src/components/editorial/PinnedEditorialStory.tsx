"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, BookOpen, Users, Briefcase, Award, CheckCircle2, Sparkles, Compass } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface PinnedEditorialStoryProps {
  onOpenLearningHub: () => void;
  onOpenMentorship: () => void;
  onOpenJobs: () => void;
  onStartComeback: () => void;
}

interface EditorialPanel {
  id: string;
  chapterNumber: string;
  chapterTag: string;
  headline: string;
  subheadline: string;
  body: string;
  highlightStat: string;
  highlightLabel: string;
  actionText: string;
  actionType: "learning" | "mentorship" | "jobs" | "comeback";
  accentColor: string;
}

const PANELS: EditorialPanel[] = [
  {
    id: "panel-1",
    chapterNumber: "01",
    chapterTag: "ARCHIVE // THE FOUNDATION",
    headline: "Your experience still matters.",
    subheadline: "CELEBRATE YOUR HARD-WON MASTERY.",
    body: "Years of engineering architecture, financial modeling, team leadership, and creative execution do not vanish. They remain the foundational bedrock upon which your career comeback is built.",
    highlightStat: "100%",
    highlightLabel: "Verified Pre-Break Experience Preserved",
    actionText: "Activate Career Continuity Passport",
    actionType: "comeback",
    accentColor: "#B6C899",
  },
  {
    id: "panel-2",
    chapterNumber: "02",
    chapterTag: "REFRAME // THE SABBATICAL",
    headline: "A pause does not erase potential.",
    subheadline: "RESILIENCE AND LIFE LEADERSHIP HONED.",
    body: "Maternity, caregiving, and health sabbaticals are real-world masterclasses in crisis management, stamina, and empathy. At GFG, career pauses are treated with complete dignity and zero algorithmic penalties.",
    highlightStat: "0%",
    highlightLabel: "Career Gap Penalties in AI Opportunity Matching",
    actionText: "Explore GFG Dignity Charter",
    actionType: "comeback",
    accentColor: "#536B58",
  },
  {
    id: "panel-3",
    chapterNumber: "03",
    chapterTag: "ACCELERATE // THE HUB",
    headline: "Learn at your own pace.",
    subheadline: "MODERN STACKS MADE INTUITIVE & PRACTICAL.",
    body: "Refresh your technical muscle memory with compact practical modules, live code exercises, and government-recognized micro-credentials engineered for real schedules.",
    highlightStat: "18+ Hrs",
    highlightLabel: "Interactive Practical Labs & Video Curricula",
    actionText: "Launch GFG Learning Hub",
    actionType: "learning",
    accentColor: "#B6C899",
  },
  {
    id: "panel-4",
    chapterNumber: "04",
    chapterTag: "ALLIANCE // COMMUNITY",
    headline: "Guidance that moves with you.",
    subheadline: "1:1 SESSIONS WITH LEADERS WHO RETURNED.",
    body: "Work directly with accomplished executive mentors who made the journey back themselves. Receive candid portfolio reviews, narrative coaching, and mock interview practice.",
    highlightStat: "1:1",
    highlightLabel: "Dedicated Executive Returnee Mentorship",
    actionText: "Connect with Verified Mentors",
    actionType: "mentorship",
    accentColor: "#C6AC7D",
  },
  {
    id: "panel-5",
    chapterNumber: "05",
    chapterTag: "TRIUMPH // OPPORTUNITIES",
    headline: "Opportunities that see your true value.",
    subheadline: "VERIFIED RETURNSHIPS WITH PARITY & GROWTH.",
    body: "Access direct applications to structured returnships with vetted employer partners who commit to transparent stipends, supportive cohorts, and permanent tenure.",
    highlightStat: "94%",
    highlightLabel: "Average Conversion to Permanent Offers",
    actionText: "Browse Returnship Opportunities",
    actionType: "jobs",
    accentColor: "#F5F0E5",
  },
];

export function PinnedEditorialStory({
  onOpenLearningHub,
  onOpenMentorship,
  onOpenJobs,
  onStartComeback,
}: PinnedEditorialStoryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const panelsWrapperRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    const panelsWrapper = panelsWrapperRef.current;
    if (!container || !panelsWrapper) return;

    let st: ScrollTrigger | null = null;
    const ctx = gsap.context(() => {
      st = ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: "+=360%",
        pin: true,
        scrub: 0.8,
        onUpdate: (self) => {
          const progress = self.progress;
          const totalPanels = PANELS.length;
          const index = Math.min(totalPanels - 1, Math.floor(progress * totalPanels));
          setActiveIndex(index);
        },
      });
    }, container);

    return () => {
      if (st) st.kill();
      ctx.revert();
    };
  }, []);

  const handleAction = (type: "learning" | "mentorship" | "jobs" | "comeback") => {
    switch (type) {
      case "learning":
        onOpenLearningHub();
        break;
      case "mentorship":
        onOpenMentorship();
        break;
      case "jobs":
        onOpenJobs();
        break;
      case "comeback":
        onStartComeback();
        break;
    }
  };

  const currentPanel = PANELS[activeIndex];

  return (
    <section
      ref={containerRef}
      id="editorial-story"
      className="relative w-full h-screen overflow-hidden bg-[#0B0F0D] select-none flex items-center justify-center"
    >
      {/* Background Architectural Geometry Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(182,200,153,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(182,200,153,0.03)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none" />

      {/* Atmospheric Radial Gradient */}
      <div
        className="absolute w-[800px] h-[800px] rounded-full blur-[160px] pointer-events-none transition-all duration-700"
        style={{
          background: `radial-gradient(circle, ${currentPanel.accentColor}18 0%, transparent 70%)`,
          top: "30%",
          left: activeIndex % 2 === 0 ? "15%" : "55%",
        }}
      />

      {/* Main Pinned Content Display */}
      <div
        ref={panelsWrapperRef}
        className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 h-full flex flex-col justify-between py-16 sm:py-20"
      >
        {/* Top Header & Chapter Pill */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#111714]/90 border border-[#344236] backdrop-blur-md">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: currentPanel.accentColor }}
            />
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.22em] text-[#B6C899] font-semibold">
              {currentPanel.chapterTag}
            </span>
          </div>

          <div className="text-[11px] font-mono text-[#AAB9A9] tracking-widest hidden sm:block">
            {`CHAPTER ${currentPanel.chapterNumber} // 05`}
          </div>
        </div>

        {/* Center Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center my-auto">
          {/* Left Column: Narrative Headline & Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-[0.24em] text-[#536B58] font-semibold block">
                {currentPanel.subheadline}
              </span>
              <h2
                key={currentPanel.headline}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.2rem] font-serif font-normal tracking-tight leading-[0.96] text-[#F5F0E5] transition-all duration-500 animate-fadeIn"
              >
                {currentPanel.headline}
              </h2>
            </div>

            <p
              key={currentPanel.body}
              className="text-sm sm:text-base md:text-lg text-[#AAB9A9] font-light leading-relaxed max-w-xl transition-all duration-500 delay-100 animate-fadeIn"
            >
              {currentPanel.body}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => handleAction(currentPanel.actionType)}
                className="px-7 py-3.5 rounded-full bg-[#B6C899] hover:bg-[#c8d8b0] text-[#0B0F0D] font-semibold text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(182,200,153,0.3)] flex items-center gap-2 hover:scale-[1.03]"
              >
                <span>{currentPanel.actionText}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Right Column: Sculptural Metric & Editorial Highlight Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div
              key={currentPanel.id}
              className="w-full max-w-md p-8 sm:p-10 rounded-2xl bg-[#111714]/85 border border-[#344236] backdrop-blur-xl shadow-2xl relative overflow-hidden transition-all duration-500 animate-fadeIn"
            >
              {/* Corner Watermark */}
              <div className="absolute top-4 right-6 text-6xl font-light text-[#B6C899]/10 font-mono select-none">
                {currentPanel.chapterNumber}
              </div>

              <div className="space-y-4">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#B6C899] block">
                  QUANTIFIED IMPACT //
                </span>

                <div
                  className="text-5xl sm:text-6xl font-light tracking-tight transition-all duration-500 font-mono"
                  style={{ color: currentPanel.accentColor }}
                >
                  {currentPanel.highlightStat}
                </div>

                <p className="text-xs sm:text-sm text-[#F5F0E5] font-medium leading-relaxed">
                  {currentPanel.highlightLabel}
                </p>

                <div className="pt-4 border-t border-[#344236] flex items-center justify-between text-[11px] font-mono text-[#AAB9A9]">
                  <span>GFG VERIFIED STANDARD</span>
                  <Sparkles className="w-3.5 h-3.5 text-[#B6C899]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Editorial Chapter Rail */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#AAB9A9] pb-1">
            <span>INDEX // FIVE EDITORIAL CHAPTERS</span>
            <span>{Math.round(((activeIndex + 1) / PANELS.length) * 100)}% EXPLORED</span>
          </div>

          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            {PANELS.map((p, idx) => {
              const isCurrent = activeIndex === idx;
              const isPast = activeIndex > idx;
              return (
                <div
                  key={p.id}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    isCurrent
                      ? "bg-[#B6C899] shadow-[0_0_10px_#B6C899]"
                      : isPast
                      ? "bg-[#536B58]"
                      : "bg-[#1B231E]"
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
