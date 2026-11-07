"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollScrubbedSequenceProps {
  onStartComeback: () => void;
}

interface StageInfo {
  index: number;
  stageName: string;
  headline: string;
  subtext: string;
  themeColor: string;
}

const STAGES: StageInfo[] = [
  {
    index: 0,
    stageName: "STAGE 01 // HERITAGE",
    headline: "Your experience still matters.",
    subtext:
      "Every complex system architected, team mentored, and problem solved before your career break remains an enduring foundation. Professional mastery does not expire.",
    themeColor: "#B6C899",
  },
  {
    index: 1,
    stageName: "STAGE 02 // STRENGTHS",
    headline: "Rediscover your strengths.",
    subtext:
      "A sabbatical for maternity, family care, or life transition is a crucible of empathy, composure, and resilience—qualities modern high-trust organizations value most.",
    themeColor: "#536B58",
  },
  {
    index: 2,
    stageName: "STAGE 03 // EVIDENCE",
    headline: "Build evidence of your capabilities.",
    subtext:
      "Modernize with current cloud, data, and AI ecosystems at your pace. Structured practical projects replace self-doubt with verified, portfolio-backed proof.",
    themeColor: "#C6AC7D",
  },
  {
    index: 3,
    stageName: "STAGE 04 // OPPORTUNITY",
    headline: "Connect with meaningful opportunities.",
    subtext:
      "Step into returnships and flexible roles with verified, forward-thinking employers who evaluate you by demonstrated skill and capability, not chronological gaps.",
    themeColor: "#F5F0E5",
  },
];

export function ScrollScrubbedSequence({ onStartComeback }: ScrollScrubbedSequenceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const [activeStage, setActiveStage] = useState<number>(0);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      renderFrame(scrollProgressRef.current);
    };
    window.addEventListener("resize", handleResize);

    const scrollProgressRef = { current: 0 };

    // High-performance canvas cinematic renderer in NOIR BLOOM palette
    const renderFrame = (progress: number) => {
      ctx2d.clearRect(0, 0, width, height);

      // Background Obsidian Black base
      ctx2d.fillStyle = "#0B0F0D";
      ctx2d.fillRect(0, 0, width, height);

      // Cinematic Radial Spotlight that moves through the 4 stages
      const lightX = width * (0.35 + Math.sin(progress * Math.PI) * 0.3);
      const lightY = height * (0.45 + Math.cos(progress * Math.PI * 0.8) * 0.15);
      const lightRadius = Math.max(width, height) * (0.65 + Math.sin(progress * Math.PI) * 0.2);

      const radialGrad = ctx2d.createRadialGradient(
        lightX,
        lightY,
        50,
        lightX,
        lightY,
        lightRadius
      );

      if (progress < 0.25) {
        // Stage 1: Sage Green & Deep Moss
        radialGrad.addColorStop(0, "rgba(182, 200, 153, 0.24)");
        radialGrad.addColorStop(0.45, "rgba(27, 35, 30, 0.55)");
        radialGrad.addColorStop(1, "#0B0F0D");
      } else if (progress < 0.5) {
        // Stage 2: Forest Green & Midnight Forest
        radialGrad.addColorStop(0, "rgba(83, 107, 88, 0.3)");
        radialGrad.addColorStop(0.5, "rgba(17, 23, 20, 0.65)");
        radialGrad.addColorStop(1, "#0B0F0D");
      } else if (progress < 0.75) {
        // Stage 3: Champagne Gold & Botanical Shadow
        radialGrad.addColorStop(0, "rgba(198, 172, 125, 0.28)");
        radialGrad.addColorStop(0.4, "rgba(27, 35, 30, 0.55)");
        radialGrad.addColorStop(1, "#0B0F0D");
      } else {
        // Stage 4: Warm Ivory & Sage Flourish
        radialGrad.addColorStop(0, "rgba(245, 240, 229, 0.32)");
        radialGrad.addColorStop(0.35, "rgba(182, 200, 153, 0.28)");
        radialGrad.addColorStop(0.7, "rgba(83, 107, 88, 0.2)");
        radialGrad.addColorStop(1, "#0B0F0D");
      }

      ctx2d.fillStyle = radialGrad;
      ctx2d.fillRect(0, 0, width, height);

      // Procedural Botanical Geometry & Light Filaments
      ctx2d.save();
      ctx2d.translate(width / 2, height / 2);

      // Rotating architectural concentric rings reflecting camera zoom
      const baseScale = 1.0 + progress * 0.4;
      const rotationAngle = progress * Math.PI * 0.75;

      for (let i = 1; i <= 3; i++) {
        ctx2d.beginPath();
        const r = (Math.min(width, height) * 0.28 * i * baseScale) / 3;
        ctx2d.arc(
          0,
          0,
          r,
          rotationAngle * (i % 2 === 0 ? 1 : -1),
          rotationAngle * (i % 2 === 0 ? 1 : -1) + Math.PI * 1.5
        );
        ctx2d.strokeStyle = i === 2 ? "rgba(182, 200, 153, 0.35)" : "rgba(83, 107, 88, 0.2)";
        ctx2d.lineWidth = i === 2 ? 2.0 : 1.0;
        ctx2d.stroke();
      }

      // Sage green light filaments
      const filamentCount = 18;
      for (let f = 0; f < filamentCount; f++) {
        const theta = (f / filamentCount) * Math.PI * 2 + progress * 0.8;
        const dist = Math.min(width, height) * (0.15 + (f % 4) * 0.08);
        const px = Math.cos(theta) * dist;
        const py = Math.sin(theta) * dist;

        ctx2d.beginPath();
        ctx2d.arc(px, py, 2.0 + Math.sin(progress * 10 + f) * 1.2, 0, Math.PI * 2);
        ctx2d.fillStyle = f % 2 === 0 ? "rgba(182, 200, 153, 0.7)" : "rgba(245, 240, 229, 0.8)";
        ctx2d.shadowColor = "#B6C899";
        ctx2d.shadowBlur = 10;
        ctx2d.fill();
        ctx2d.shadowBlur = 0;
      }

      ctx2d.restore();

      // Film Vignette Overlay
      const vigGrad = ctx2d.createRadialGradient(
        width / 2,
        height / 2,
        Math.min(width, height) * 0.35,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.75
      );
      vigGrad.addColorStop(0, "transparent");
      vigGrad.addColorStop(1, "rgba(11, 15, 13, 0.9)");
      ctx2d.fillStyle = vigGrad;
      ctx2d.fillRect(0, 0, width, height);
    };

    // Initialize initial render
    renderFrame(0);

    // GSAP ScrollTrigger Pinned Scrubbing
    let st: ScrollTrigger | null = null;
    const ctx = gsap.context(() => {
      st = ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: "+=260%",
        pin: true,
        scrub: 0.6,
        onUpdate: (self) => {
          const p = self.progress;
          scrollProgressRef.current = p;
          setScrollProgress(p);
          renderFrame(p);

          // Update active stage threshold
          if (p < 0.25) {
            setActiveStage(0);
          } else if (p < 0.5) {
            setActiveStage(1);
          } else if (p < 0.75) {
            setActiveStage(2);
          } else {
            setActiveStage(3);
          }
        },
      });
    }, container);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (st) st.kill();
      ctx.revert();
    };
  }, []);

  const currentStage = STAGES[activeStage];

  return (
    <section
      ref={containerRef}
      id="journey-film"
      className="relative w-full h-screen overflow-hidden bg-[#0B0F0D] select-none"
    >
      {/* Pinned Scrubber Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      {/* Dynamic Narrative Text Overlay */}
      <div
        ref={textContainerRef}
        className="relative z-10 w-full h-full max-w-6xl mx-auto px-6 sm:px-12 md:px-16 flex flex-col justify-between py-20 pointer-events-none"
      >
        {/* Top Chapter Pill */}
        <div className="flex items-center justify-between pointer-events-auto">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#111714]/90 border border-[#344236] backdrop-blur-md">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: currentStage.themeColor }}
            />
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.24em] text-[#B6C899] font-semibold">
              {currentStage.stageName}
            </span>
          </div>

          <div className="text-[11px] font-mono text-[#AAB9A9] tracking-wider hidden sm:block">
            STAGE {activeStage + 1} OF 4
          </div>
        </div>

        {/* Center Stage Typography */}
        <div className="my-auto max-w-3xl space-y-4">
          <h2
            key={currentStage.headline}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-serif font-normal tracking-tight leading-[0.95] text-[#F5F0E5] transition-all duration-500 animate-fadeIn"
          >
            {currentStage.headline}
          </h2>

          <p
            key={currentStage.subtext}
            className="text-sm sm:text-lg md:text-xl text-[#AAB9A9] font-light leading-relaxed max-w-2xl transition-all duration-500 delay-100 animate-fadeIn"
          >
            {currentStage.subtext}
          </p>

          {activeStage === 3 && (
            <div className="pt-4 pointer-events-auto animate-fadeIn">
              <button
                type="button"
                onClick={onStartComeback}
                className="px-8 py-3.5 rounded-full bg-[#B6C899] hover:bg-[#c8d8b0] text-[#0B0F0D] font-semibold text-xs uppercase tracking-widest transition-all shadow-[0_0_25px_rgba(182,200,153,0.35)] flex items-center gap-2 hover:scale-[1.03]"
              >
                <span>Begin Your Journey</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          )}
        </div>

        {/* Bottom Interactive Progress Scrubber */}
        <div className="space-y-3 pointer-events-auto">
          <div className="grid grid-cols-4 gap-2">
            {STAGES.map((s, idx) => {
              const isPassed = activeStage >= idx;
              const isCurrent = activeStage === idx;
              return (
                <div key={s.index} className="space-y-1.5">
                  <div className="h-1 rounded-full bg-[#1B231E] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#536B58] to-[#B6C899] transition-all duration-300"
                      style={{
                        width: isPassed
                          ? isCurrent
                            ? `${Math.max(10, ((scrollProgress * 4) % 1) * 100)}%`
                            : "100%"
                          : "0%",
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span
                      className={`truncate ${
                        isCurrent ? "text-[#B6C899] font-semibold" : "text-[#536B58]"
                      }`}
                    >
                      {s.stageName.split("// ")[1]}
                    </span>
                    {isPassed && idx < activeStage && (
                      <CheckCircle2 className="w-2.5 h-2.5 text-[#B6C899] shrink-0" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
