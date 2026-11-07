"use client";

import React, { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  BookOpen,
  Award,
  CheckCircle2,
  Play,
  FileText,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  QrCode,
} from "lucide-react";

interface LearningHubShowcaseProps {
  onOpenLearningHub: () => void;
}

export function LearningHubShowcase({ onOpenLearningHub }: LearningHubShowcaseProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [selectedCourseIdx, setSelectedCourseIdx] = useState<number>(0);

  const COURSES = [
    {
      id: "wds",
      slug: "workplace-digital-skills",
      title: "Workplace Digital Skills for Career Returners",
      tagline: "Modern Collaboration, Cloud Workspaces & AI Productivity",
      hours: "12 Hours",
      level: "All Levels",
      modules: 2,
      lessons: 4,
      desc: "Re-anchor into the modern remote & hybrid enterprise. Master Slack/Teams asynchronous communication, Google Workspace / Microsoft 365, GenAI workplace assistants, and cloud security hygiene.",
      skills: ["Enterprise Slack/Teams", "Cloud Document Governance", "GenAI Prompting", "Cybersecurity Hygiene"],
      practical: "Async Remote Project Workspace Setup",
      credentialCode: "GFG-2026-WDS-E9B06B99",
    },
    {
      id: "excel",
      slug: "excel-for-career-returners",
      title: "Excel & Data Analysis for Career Returners",
      tagline: "XLOOKUP, Power Query, Pivot Tables & Executive Dashboards",
      hours: "16 Hours",
      level: "Intermediate",
      modules: 2,
      lessons: 4,
      desc: "Transition smoothly from legacy spreadsheet methods into modern data analytics. Replace fragile VLOOKUPs with dynamic XLOOKUP, master multi-condition aggregations, and build interactive executive KPI dashboards.",
      skills: ["Modern XLOOKUP", "Dynamic Array Formulas", "PivotTable Slicers", "Executive KPI Reporting"],
      practical: "Returnship Cohort Analytical Dashboard",
      credentialCode: "GFG-2026-XLS-4C108A72",
    },
    {
      id: "comeback",
      slug: "career-comeback-readiness",
      title: "Career Comeback Readiness & Strategic Re-Entry",
      tagline: "Hiatus Reframing, Narrative Resumes & Returnship Negotiation",
      hours: "14 Hours",
      level: "Leadership",
      modules: 2,
      lessons: 4,
      desc: "Deconstruct the career break penalty. Reframe your hiatus from an apology into an authentic demonstration of resilience, audit transferable tenure, and confidently negotiate competitive returnship stipends.",
      skills: ["Comeback Narrative Framing", "Skills-First Dossier Design", "Behavioral Interview Mastery", "Compensation Parity Strategy"],
      practical: "Executive Comeback Portfolio & Gap Narrative",
      credentialCode: "GFG-2026-CCR-7F34901B",
    },
  ];

  const currentCourse = COURSES[selectedCourseIdx];

  return (
    <section
      id="learning-showcase"
      ref={ref}
      className="relative min-h-screen w-full flex flex-col justify-center py-28 px-6 sm:px-12 md:px-16 lg:px-20 z-10 border-t border-[#344236] bg-[#0B0F0D] overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/3 w-[650px] h-[650px] bg-[#536B58]/08 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full space-y-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#344236] pb-8">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#B6C899]" />
              <span className="text-[11px] font-mono uppercase tracking-[0.26em] text-[#B6C899] font-medium">
                04 // GFG ACADEMY &amp; CREDENTIAL SYSTEM
              </span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-serif font-normal tracking-tight text-[#F5F0E5] leading-[1.04]">
              Genuine skills.{" "}
              <span className="italic text-[#B6C899] font-serif">
                Authentic credentials.
              </span>
            </h2>
          </div>

          <button
            type="button"
            onClick={onOpenLearningHub}
            className="px-6 py-3.5 rounded-full bg-[#B6C899] hover:bg-[#c8d8b0] text-[#0B0F0D] font-semibold text-xs tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(182,200,153,0.3)] flex items-center gap-2 shrink-0"
          >
            <span>Open Learning Hub</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Premium Split Layout: Course Catalogue (Left) & Verified Certificate Artifact (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* LEFT: Interactive Course Showcase */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            {/* Horizontal Course Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {COURSES.map((c, idx) => {
                const isActive = idx === selectedCourseIdx;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCourseIdx(idx)}
                    className={`px-4 py-3 rounded-xl border text-left font-mono text-xs transition-all shrink-0 min-w-[200px] flex flex-col gap-1 ${
                      isActive
                        ? "bg-[#1B231E] border-[#B6C899] text-[#F5F0E5] shadow-lg shadow-black/40"
                        : "bg-[#111714] border-[#344236] text-[#AAB9A9] hover:border-[#B6C899]/40 hover:text-[#F5F0E5]"
                    }`}
                  >
                    <span className={`text-[10px] ${isActive ? "text-[#B6C899] font-bold" : "text-[#536B58]"}`}>
                      {`COURSE 0${idx + 1} //`}
                    </span>
                    <span className="font-sans font-medium text-xs truncate">
                      {c.title}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Course Deep-Dive Card */}
            <div className="bg-[#111714] border border-[#344236] rounded-3xl p-8 sm:p-10 space-y-6 flex-1 flex flex-col justify-between shadow-xl">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono tracking-wider bg-[#1B231E] border border-[#344236] text-[#B6C899] font-medium">
                    {currentCourse.level}
                  </span>
                  <span className="text-xs font-mono text-[#AAB9A9] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#B6C899]" />
                    <span>{currentCourse.hours}</span>
                  </span>
                  <span className="text-xs font-mono text-[#AAB9A9]">
                    {currentCourse.modules} Modules • {currentCourse.lessons} Deep Lessons
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-serif text-[#F5F0E5] leading-tight">
                  {currentCourse.title}
                </h3>

                <p className="text-sm sm:text-base text-[#AAB9A9] leading-relaxed font-light">
                  {currentCourse.desc}
                </p>
              </div>

              {/* Skills Learned Badges */}
              <div className="space-y-3 pt-2">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#B6C899] font-medium">
                  Competencies You Will Master:
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentCourse.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-3 py-1 rounded-lg bg-[#1B231E] border border-[#344236] text-xs text-[#F5F0E5] font-mono flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3 h-3 text-[#B6C899]" />
                      <span>{skill}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Practical Capstone Note */}
              <div className="p-4 rounded-2xl bg-[#1B231E] border border-[#344236] flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-[10px] font-mono text-[#B6C899] uppercase tracking-wider font-medium">
                    Required Capstone Project:
                  </div>
                  <div className="text-xs text-[#F5F0E5] font-medium">
                    {currentCourse.practical}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onOpenLearningHub}
                  className="px-4 py-2 rounded-xl bg-[#B6C899]/15 hover:bg-[#B6C899] text-[#B6C899] hover:text-[#0B0F0D] border border-[#B6C899]/30 text-xs font-mono font-semibold transition-all shrink-0"
                >
                  Start Course
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: High-End Certificate Preview Artifact */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="relative rounded-3xl p-1 bg-gradient-to-b from-[#C6AC7D]/30 via-[#536B58]/20 to-[#1B231E]/40 shadow-2xl group">
              {/* Inner Luxury Certificate Frame */}
              <div className="bg-[#111714] rounded-[22px] p-6 sm:p-8 space-y-6 relative overflow-hidden text-[#F5F0E5] border border-[#344236]">
                {/* Guilloche Corner Accents (Champagne Gold) */}
                <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#C6AC7D]/60" />
                <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#C6AC7D]/60" />
                <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#C6AC7D]/60" />
                <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#C6AC7D]/60" />

                {/* Certificate Header */}
                <div className="text-center space-y-1.5 border-b border-[#344236] pb-5">
                  <div className="text-[10px] font-mono tracking-[0.28em] text-[#C6AC7D] uppercase font-bold">
                    GFG — GAP FOR GOOD
                  </div>
                  <h4 className="font-serif text-xl sm:text-2xl text-[#F5F0E5] tracking-wider uppercase font-light">
                    Certificate of Achievement
                  </h4>
                  <p className="text-[11px] text-[#AAB9A9] italic font-serif">
                    Authentic Credential Issued by GFG Governance Board
                  </p>
                </div>

                {/* Recipient Presentation */}
                <div className="text-center space-y-2 py-2">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#AAB9A9]">
                    This is proudly presented to:
                  </div>
                  <div className="text-2xl sm:text-3xl font-serif text-[#C6AC7D] italic tracking-wide">
                    Ananya Raman
                  </div>
                  <div className="text-xs text-[#AAB9A9] max-w-xs mx-auto font-light">
                    for meeting all completion criteria and demonstrating mastery in:
                  </div>
                  <div className="text-sm font-semibold text-[#F5F0E5] pt-1">
                    {currentCourse.title}
                  </div>
                </div>

                {/* Verification Box & QR Code Mockup */}
                <div className="p-4 rounded-xl bg-[#0B0F0D] border border-[#344236] flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-[9px] font-mono uppercase tracking-widest text-[#B6C899]">
                      Credential ID:
                    </div>
                    <div className="font-mono text-xs text-[#F5F0E5] font-bold tracking-wider">
                      {currentCourse.credentialCode}
                    </div>
                    <div className="text-[10px] text-[#AAB9A9]">
                      Server-Evaluated • DPDP Compliant
                    </div>
                  </div>

                  <div className="w-14 h-14 rounded-lg bg-white p-1 flex items-center justify-center shrink-0 shadow-md">
                    <QrCode className="w-12 h-12 text-[#0B0F0D]" />
                  </div>
                </div>

                {/* Verification Link Action */}
                <div className="text-center pt-1">
                  <a
                    href={`/verify/${currentCourse.credentialCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-[#B6C899] hover:underline transition-colors"
                  >
                    <span>Inspect Public Verification Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
