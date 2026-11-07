"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Brain,
  BookOpen,
  FileCheck2,
  Briefcase,
  Users,
  Award,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface CinematicFeaturesSectionProps {
  onOpenRoadmap: () => void;
  onOpenLearningHub: () => void;
  onOpenPassport: () => void;
  onOpenJobs: () => void;
  onOpenCommunity: (tab?: any) => void;
}

export function CinematicFeaturesSection({
  onOpenRoadmap,
  onOpenLearningHub,
  onOpenPassport,
  onOpenJobs,
  onOpenCommunity,
}: CinematicFeaturesSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 35 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  const FEATURES = [
    {
      id: "roadmap",
      num: "01",
      icon: Brain,
      title: "AI Career Roadmap",
      subtitle: "Non-Punitive Skill Calibration",
      desc: "Our intelligent engine analyzes past experience and current ecosystem developments, creating tailored microlearning paths that skip concepts you already know.",
      actionText: "Generate Roadmap",
      action: onOpenRoadmap,
      badge: "Adaptive Engine",
      glowColor: "from-[#B6C899]/15 via-[#536B58]/05",
    },
    {
      id: "learning",
      num: "02",
      icon: BookOpen,
      title: "Learning Hub & Academy",
      subtitle: "Free, Practical Applied Modules",
      desc: "Complete structured curricula in Workplace Digital Skills, Modern Excel & Data Analysis, and Career Comeback Readiness with video guidance and worksheets.",
      actionText: "Enter Learning Hub",
      action: onOpenLearningHub,
      badge: "Free Courses",
      glowColor: "from-[#536B58]/20 via-[#1B231E]/30",
    },
    {
      id: "passport",
      num: "03",
      icon: FileCheck2,
      title: "Resume Rebuild & Passport",
      subtitle: "Tamper-Evident Career Passport",
      desc: "Reframe your sabbatical into an evidence-first dossier. Fully compliant with India's DPDP Act 2023, granting you complete data consent controls.",
      actionText: "View Career Passport",
      action: onOpenPassport,
      badge: "DPDP Protected",
      glowColor: "from-[#C6AC7D]/15 via-[#536B58]/05",
    },
    {
      id: "opportunities",
      num: "04",
      icon: Briefcase,
      title: "Verified Opportunities",
      subtitle: "Protected Returnships & Flexible Roles",
      desc: "Explore curated returnship tracks with transparent stipends, flexible arrangements (remote, hybrid, flexible hours), and genuine paths to full tenure.",
      actionText: "Browse Opportunities",
      action: onOpenJobs,
      badge: "Fair Compensation",
      glowColor: "from-[#B6C899]/15 via-[#1B231E]/20",
    },
    {
      id: "mentorship",
      num: "05",
      icon: Users,
      title: "Executive Mentorship",
      subtitle: "1:1 Guidance & Comeback Circles",
      desc: "Connect with verified senior leaders who successfully navigated career sabbaticals. Join peer circles for mock interviews, salary negotiation, and community.",
      actionText: "Connect with Mentors",
      action: () => onOpenCommunity("mentors"),
      badge: "Verified Leaders",
      glowColor: "from-[#536B58]/20 via-[#C6AC7D]/05",
    },
    {
      id: "certificates",
      num: "06",
      icon: Award,
      title: "Certificate System",
      subtitle: "Authentic GFG-Issued Credentials",
      desc: "Earn high-resolution A4 landscape PDF certificates backed by server-side quiz scoring, mentor-approved projects, and public QR verification routes.",
      actionText: "Verify Certificates",
      action: onOpenLearningHub,
      badge: "Tamper-Proof QR",
      glowColor: "from-[#C6AC7D]/15 via-[#B6C899]/05",
    },
  ];

  return (
    <section
      id="features"
      ref={ref}
      className="relative min-h-screen w-full flex flex-col justify-center py-28 px-6 sm:px-12 md:px-16 lg:px-20 z-10 border-t border-[#344236] bg-[#0B0F0D] overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-[#536B58]/08 rounded-full blur-[170px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full space-y-16">
        {/* Section Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="space-y-4 max-w-3xl"
        >
          <motion.div variants={itemVariants} className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#B6C899]" />
            <span className="text-[11px] font-mono uppercase tracking-[0.26em] text-[#B6C899] font-medium">
              03 // COMPREHENSIVE ARCHITECTURE
            </span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-4xl sm:text-6xl md:text-7xl font-serif font-normal tracking-tight text-[#F5F0E5] leading-[1.02]"
          >
            The six pillars of your{" "}
            <span className="italic text-[#B6C899] font-serif">
              career comeback.
            </span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg text-[#AAB9A9] font-light leading-relaxed"
          >
            Every tool on GFG is intentionally engineered to eliminate the friction, stigma, and vulnerability 
            of returning to the workforce.
          </motion.p>
        </motion.div>

        {/* 6 Spacious Luxury Feature Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                variants={itemVariants}
                className="bg-[#111714] border border-[#344236] hover:border-[#B6C899]/60 rounded-3xl p-8 sm:p-9 flex flex-col justify-between space-y-8 relative overflow-hidden group transition-all duration-300 shadow-xl"
              >
                {/* Ambient Top Glow */}
                <div
                  className={`absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br ${feature.glowColor} to-transparent rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700 pointer-events-none`}
                />

                <div className="space-y-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono tracking-widest text-[#B6C899] font-semibold">
                      {`${feature.num} //`}
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-mono tracking-wider bg-[#1B231E] border border-[#344236] text-[#B6C899]">
                      {feature.badge}
                    </span>
                  </div>

                  <div className="w-14 h-14 rounded-2xl bg-[#1B231E] border border-[#344236] flex items-center justify-center text-[#B6C899] group-hover:border-[#B6C899]/60 group-hover:scale-105 transition-all duration-300">
                    <Icon className="w-7 h-7" />
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-2xl font-serif text-[#F5F0E5] tracking-wide group-hover:text-[#B6C899] transition-colors">
                      {feature.title}
                    </h3>
                    <div className="text-[11px] font-mono text-[#AAB9A9] uppercase tracking-wider">
                      {feature.subtitle}
                    </div>
                  </div>

                  <p className="text-sm text-[#AAB9A9] leading-relaxed font-light">
                    {feature.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#344236]/60 relative z-10">
                  <button
                    type="button"
                    onClick={feature.action}
                    className="w-full py-3 px-4 rounded-xl bg-[#1B231E] hover:bg-[#202A23] border border-[#344236] hover:border-[#B6C899]/60 text-xs font-mono uppercase tracking-wider text-[#F5F0E5] hover:text-[#B6C899] transition-all flex items-center justify-between group/btn"
                  >
                    <span>{feature.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#B6C899] group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
