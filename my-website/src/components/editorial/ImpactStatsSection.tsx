"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";
import { TrendingUp, Users, Building2, ShieldCheck, Heart, Sparkles, Scale } from "lucide-react";

interface CounterProps {
  from?: number;
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

function Counter({ from = 0, to, duration = 2.2, prefix = "", suffix = "" }: CounterProps) {
  const [current, setCurrent] = useState(from);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(from, to, {
      duration,
      ease: [0.16, 1, 0.3, 1] as const,
      onUpdate(value) {
        setCurrent(Math.floor(value));
      },
    });
    return () => controls.stop();
  }, [isInView, from, to, duration]);

  return (
    <span ref={ref} className="font-serif tracking-tight">
      {prefix}
      {current.toLocaleString()}
      {suffix}
    </span>
  );
}

export function ImpactStatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const STATS = [
    {
      to: 0,
      prefix: "₹",
      label: "Learner Platform Fee",
      sublabel: "100% Free, philanthropic & dignified access for women",
      icon: Heart,
    },
    {
      to: 100,
      suffix: "%",
      label: "DPDP Act 2023 Compliant",
      sublabel: "Cryptographic user consent & data sovereignty",
      icon: ShieldCheck,
    },
    {
      to: 0,
      suffix: "%",
      label: "Career Hiatus Penalty",
      sublabel: "Algorithmic gap neutrality in opportunity matching",
      icon: Scale,
    },
    {
      to: 8,
      suffix: " Wks",
      label: "Adaptive Returnship Pathway",
      sublabel: "Structured milestone roadmap calibrated to your weekly hours",
      icon: TrendingUp,
    },
    {
      to: 6,
      suffix: " Pillars",
      label: "Comprehensive Architecture",
      sublabel: "Roadmap, Academy, Passport, Returnships, Mentorship & Certificates",
      icon: Sparkles,
    },
  ];

  return (
    <section
      id="impact"
      ref={ref}
      className="relative min-h-[85vh] w-full flex flex-col justify-center py-24 px-6 sm:px-12 md:px-16 lg:px-20 z-10 border-t border-[#344236] bg-[#0B0F0D] overflow-hidden"
    >
      {/* Ambient background light beam */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-gradient-to-r from-[#536B58]/10 via-[#1B231E]/20 to-transparent rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#B6C899]" />
            <span className="text-[11px] font-mono uppercase tracking-[0.26em] text-[#B6C899] font-medium">
              05 // ARCHITECTURAL COMMITMENTS
            </span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-serif font-normal tracking-tight text-[#F5F0E5] leading-[1.04]">
            Measured by dignity,{" "}
            <span className="italic text-[#B6C899] font-serif">
              evidence &amp; equity.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-[#AAB9A9] font-light leading-relaxed">
            GFG operates on verifiable engineering standards, transparent algorithmic governance, and strict privacy principles.
          </p>
        </div>

        {/* 5 Architectural Metric Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.7, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] as const }}
                className="bg-[#111714] border border-[#344236] hover:border-[#B6C899]/60 rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-6 relative overflow-hidden group transition-all duration-300 shadow-xl"
              >
                <div className="space-y-4 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-[#1B231E] border border-[#344236] flex items-center justify-center text-[#B6C899] group-hover:border-[#B6C899]/50 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="text-3xl sm:text-4xl font-serif text-[#F5F0E5] group-hover:text-[#B6C899] transition-colors">
                    <Counter
                      to={stat.to}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                    />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-[#F5F0E5] tracking-wide">
                      {stat.label}
                    </h3>
                    <p className="text-xs text-[#AAB9A9] leading-relaxed font-light">
                      {stat.sublabel}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#344236]/60 flex items-center justify-between text-[10px] font-mono text-[#536B58] group-hover:text-[#B6C899] transition-colors">
                  <span>METRIC // 0{idx + 1}</span>
                  <span>VERIFIED</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
