"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion";
import {
  Check,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Lock,
  Sparkles,
  AlertCircle,
  X,
  Compass,
  ArrowRight,
  Award,
  Clock,
  Briefcase,
  Layers,
} from "lucide-react";

// ============================================================================
// 1. BOTANICAL SVG MOTIFS (Noir Bloom Signature Growth Visuals)
// ============================================================================

export function BotanicalBranch({ className = "w-6 h-6 text-[#B6C899]" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M20,90 Q40,65 50,40 Q55,25 65,10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Delicate organic foliage */}
      <path
        d="M36,73 Q48,68 46,58 Q34,64 36,73 Z"
        fill="currentColor"
        fillOpacity="0.8"
      />
      <path
        d="M48,50 Q60,45 58,35 Q46,41 48,50 Z"
        fill="currentColor"
        fillOpacity="0.85"
      />
      <path
        d="M58,28 Q70,23 68,13 Q56,19 58,28 Z"
        fill="currentColor"
        fillOpacity="0.95"
      />
      <circle cx="65" cy="10" r="3" fill="#C6AC7D" />
    </svg>
  );
}

export function BotanicalBloomIcon({ className = "w-8 h-8 text-[#B6C899]" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
      <path
        d="M40 16 C30 28 30 40 40 52 C50 40 50 28 40 16 Z"
        fill="currentColor"
        fillOpacity="0.25"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M16 40 C28 30 40 30 52 40 C40 50 30 50 16 40 Z"
        fill="currentColor"
        fillOpacity="0.25"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="40" cy="40" r="4.5" fill="#C6AC7D" />
    </svg>
  );
}

// ============================================================================
// 2. NOIR BLOOM BUTTONS
// ============================================================================

interface NoirButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "champagne" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  isLoading?: boolean;
}

export function NoirButton({
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "right",
  isLoading = false,
  className = "",
  children,
  ...props
}: NoirButtonProps) {
  const sizeClasses = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-2.5 text-xs sm:text-sm",
    lg: "px-8 py-3.5 text-sm sm:text-base",
  }[size];

  const variantClasses = {
    primary:
      "bg-[#B6C899] text-[#0B0F0D] font-semibold tracking-wider uppercase border border-[#B6C899] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.45),0_8px_20px_-4px_rgba(182,200,153,0.3)] hover:bg-[#c5d4ac] hover:shadow-[0_10px_26px_-4px_rgba(182,200,153,0.45)]",
    secondary:
      "bg-[#1B231E]/80 text-[#F5F0E5] font-medium tracking-wider uppercase border border-[#344236] backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:border-[#B6C899]/80 hover:bg-[#202A23] hover:text-[#B6C899]",
    champagne:
      "bg-gradient-to-r from-[#C6AC7D] to-[#b89c67] text-[#0B0F0D] font-bold tracking-wider uppercase border border-[#C6AC7D] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),0_6px_20px_-4px_rgba(198,172,125,0.35)] hover:from-[#d5bc8e] hover:to-[#c6ac7d]",
    ghost:
      "bg-transparent text-[#AAB9A9] font-medium hover:text-[#F5F0E5] hover:bg-[#1B231E]/50 border border-transparent",
  }[variant];

  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98, y: 0.5 }}
      transition={{ type: "spring", stiffness: 450, damping: 25 }}
      className={`relative inline-flex items-center justify-center gap-2 rounded-full font-sans transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B6C899] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F0D] disabled:pointer-events-none disabled:opacity-40 cursor-pointer ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {icon && iconPosition === "left" && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
          {icon && iconPosition === "right" && <span className="shrink-0">{icon}</span>}
        </>
      )}
    </motion.button>
  );
}

// ============================================================================
// 3. EDITORIAL & BENTO CARDS
// ============================================================================

export function NoirCard({
  children,
  className = "",
  highlight = false,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  highlight?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl bg-[#111714] border border-[#344236] p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_12px_36px_-10px_rgba(0,0,0,0.6)] transition-all duration-300 hover:border-[#B6C899]/40 hover:shadow-[inset_0_1px_0_0_rgba(182,200,153,0.12),0_18px_40px_-10px_rgba(0,0,0,0.7)] ${
        highlight ? "border-[#B6C899]/60 shadow-[0_0_30px_-8px_rgba(182,200,153,0.2)]" : ""
      } ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function NoirBentoCard({
  title,
  subtitle,
  badge,
  icon,
  children,
  actionLabel,
  onAction,
  className = "",
  colSpan = "col-span-12 md:col-span-6 lg:col-span-4",
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  colSpan?: string;
}) {
  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl bg-[#111714] border border-[#344236] p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_12px_32px_-12px_rgba(0,0,0,0.7)] transition-all duration-300 hover:border-[#B6C899]/40 ${colSpan} ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-9 h-9 rounded-xl bg-[#1B231E] border border-[#344236] flex items-center justify-center text-[#B6C899] shrink-0">
                {icon}
              </div>
            )}
            <div>
              <h3 className="font-display font-semibold text-[#F5F0E5] text-base leading-snug group-hover:text-[#B6C899] transition-colors">
                {title}
              </h3>
              {subtitle && <p className="text-xs text-[#AAB9A9] mt-0.5 font-sans">{subtitle}</p>}
            </div>
          </div>
          {badge && (
            <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#1B231E] text-[#B6C899] border border-[#344236]">
              {badge}
            </span>
          )}
        </div>
        <div className="text-sm text-[#AAB9A9] font-sans space-y-3">{children}</div>
      </div>

      {actionLabel && (
        <div className="mt-5 pt-4 border-t border-[#344236]/60 flex items-center justify-between">
          <button
            onClick={onAction}
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-[#B6C899] hover:text-[#F5F0E5] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B6C899] rounded py-1"
          >
            <span>{actionLabel}</span>
            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 4. CONSENT & PRIVACY BADGE (Skills-First DPDP Compliance)
// ============================================================================

export function NoirConsentBadge({
  status = "consented",
  label,
  className = "",
}: {
  status?: "consented" | "private" | "anonymized";
  label?: string;
  className?: string;
}) {
  const configs = {
    consented: {
      bg: "bg-[#1B231E]",
      border: "border-[#536B58]",
      text: "text-[#B6C899]",
      icon: <ShieldCheck className="w-3.5 h-3.5 text-[#B6C899]" />,
      defaultText: "Consented Talent Pool",
    },
    private: {
      bg: "bg-[#111714]",
      border: "border-[#344236]",
      text: "text-[#AAB9A9]",
      icon: <Lock className="w-3.5 h-3.5 text-[#AAB9A9]" />,
      defaultText: "Private / Candidate-Only",
    },
    anonymized: {
      bg: "bg-[#202A23]",
      border: "border-[#C6AC7D]/40",
      text: "text-[#C6AC7D]",
      icon: <Sparkles className="w-3.5 h-3.5 text-[#C6AC7D]" />,
      defaultText: "Anonymized Discovery",
    },
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider px-3 py-1 rounded-full border ${configs.bg} ${configs.border} ${configs.text} ${className}`}
    >
      {configs.icon}
      <span>{label || configs.defaultText}</span>
    </span>
  );
}

// ============================================================================
// 5. PROGRESS TIMELINE & MILESTONES (8-Week Returnship Roadmap)
// ============================================================================

export interface MilestoneItem {
  week: number;
  title: string;
  description: string;
  status: "completed" | "current" | "upcoming" | "paused";
  deliverable?: string;
}

export function NoirProgressTimeline({
  milestones,
  onTaskClick,
}: {
  milestones: MilestoneItem[];
  onTaskClick?: (m: MilestoneItem) => void;
}) {
  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-[#B6C899] before:via-[#536B58] before:to-[#344236]">
      {milestones.map((m) => {
        const isDone = m.status === "completed";
        const isCurrent = m.status === "current";
        const isPaused = m.status === "paused";

        return (
          <div
            key={m.week}
            onClick={() => onTaskClick?.(m)}
            className={`group relative p-4 rounded-xl transition-all duration-200 border ${
              isCurrent
                ? "bg-[#1B231E] border-[#B6C899]/70 shadow-[0_0_24px_-6px_rgba(182,200,153,0.18)]"
                : isDone
                ? "bg-[#111714] border-[#536B58]/40 opacity-90"
                : isPaused
                ? "bg-[#111714] border-[#344236] opacity-60"
                : "bg-[#111714] border-[#344236] opacity-80"
            } ${onTaskClick ? "cursor-pointer hover:border-[#B6C899]" : ""}`}
          >
            {/* Timeline Node Marker */}
            <div
              className={`absolute -left-[31px] top-4.5 w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                isDone
                  ? "bg-[#B6C899] border-[#0B0F0D] text-[#0B0F0D]"
                  : isCurrent
                  ? "bg-[#0B0F0D] border-[#B6C899] text-[#B6C899] ring-4 ring-[#B6C899]/20"
                  : "bg-[#1B231E] border-[#344236] text-[#AAB9A9]"
              }`}
            >
              {isDone ? (
                <Check className="w-3 h-3 stroke-[3]" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
              )}
            </div>

            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#B6C899] font-bold">
                    Week {m.week}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#B6C899]/15 text-[#B6C899] border border-[#B6C899]/30">
                      In Progress
                    </span>
                  )}
                  {isPaused && (
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#344236] text-[#AAB9A9]">
                      Paused
                    </span>
                  )}
                </div>
                <h4 className="font-display font-medium text-[#F5F0E5] text-sm sm:text-base mt-1 group-hover:text-[#B6C899] transition-colors">
                  {m.title}
                </h4>
                <p className="text-xs text-[#AAB9A9] mt-1 font-sans leading-relaxed">{m.description}</p>
                {m.deliverable && (
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] font-mono text-[#C6AC7D]">
                    <Award className="w-3.5 h-3.5" />
                    <span>Evidence: {m.deliverable}</span>
                  </div>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-[#AAB9A9] shrink-0 mt-1 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// 6. NOIR FORM INPUTS & CONTROLS
// ============================================================================

export function NoirInput({
  label,
  helperText,
  error,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  helperText?: string;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-mono uppercase tracking-wider text-[#AAB9A9]">
          {label}
        </label>
      )}
      <input
        className={`w-full rounded-xl bg-[#1B231E]/90 border border-[#344236] px-4 py-2.5 text-sm text-[#F5F0E5] placeholder-[#AAB9A9]/50 transition-colors duration-200 focus:border-[#B6C899] focus:bg-[#202A23] focus:outline-none focus:ring-1 focus:ring-[#B6C899] disabled:opacity-50 ${
          error ? "border-rose-500/70 focus:border-rose-500 focus:ring-rose-500" : ""
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-rose-400 font-sans">{error}</p>}
      {helperText && !error && <p className="text-xs text-[#AAB9A9]/70 font-sans">{helperText}</p>}
    </div>
  );
}

export function NoirTextarea({
  label,
  helperText,
  error,
  className = "",
  rows = 3,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  helperText?: string;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-mono uppercase tracking-wider text-[#AAB9A9]">
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        className={`w-full rounded-xl bg-[#1B231E]/90 border border-[#344236] px-4 py-2.5 text-sm text-[#F5F0E5] placeholder-[#AAB9A9]/50 transition-colors duration-200 focus:border-[#B6C899] focus:bg-[#202A23] focus:outline-none focus:ring-1 focus:ring-[#B6C899] disabled:opacity-50 ${
          error ? "border-rose-500/70 focus:border-rose-500 focus:ring-rose-500" : ""
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-rose-400 font-sans">{error}</p>}
      {helperText && !error && <p className="text-xs text-[#AAB9A9]/70 font-sans">{helperText}</p>}
    </div>
  );
}

export function NoirSelect({
  label,
  options,
  value,
  onChange,
  className = "",
}: {
  label?: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (val: string) => void;
  className?: string;
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-mono uppercase tracking-wider text-[#AAB9A9]">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none rounded-xl bg-[#1B231E]/90 border border-[#344236] px-4 py-2.5 pr-10 text-sm text-[#F5F0E5] transition-colors duration-200 focus:border-[#B6C899] focus:bg-[#202A23] focus:outline-none focus:ring-1 focus:ring-[#B6C899] ${className}`}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#111714] text-[#F5F0E5]">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAB9A9]" />
      </div>
    </div>
  );
}

// ============================================================================
// 7. SKELETON LOADERS & EMPTY STATES
// ============================================================================

export function NoirSkeleton({ className = "h-4 w-full" }: { className?: string }) {
  return (
    <div
      className={`rounded-lg bg-gradient-to-r from-[#1B231E] via-[#202A23] to-[#1B231E] bg-[length:200%_100%] animate-pulse ${className}`}
    />
  );
}

export function NoirEmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <div className="text-center py-12 px-6 rounded-2xl bg-[#111714] border border-[#344236]/60 border-dashed">
      <div className="mx-auto w-12 h-12 rounded-2xl bg-[#1B231E] border border-[#344236] flex items-center justify-center text-[#B6C899] mb-4">
        {icon || <BotanicalBloomIcon className="w-6 h-6 text-[#B6C899]" />}
      </div>
      <h3 className="font-display font-medium text-base text-[#F5F0E5]">{title}</h3>
      <p className="text-xs sm:text-sm text-[#AAB9A9] max-w-sm mx-auto mt-1.5 font-sans leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <NoirButton size="sm" variant="secondary" onClick={onAction}>
            {actionLabel}
          </NoirButton>
        </div>
      )}
    </div>
  );
}
