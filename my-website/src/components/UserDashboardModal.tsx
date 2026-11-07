"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  LogOut,
  ArrowRight,
  Shield,
  Lock,
  CheckCircle,
  Download,
  Trash2,
  RotateCcw,
  Sparkles,
  Calendar,
  Compass,
  BookOpen,
  Briefcase,
  Users,
  Target,
  FileCheck,
  Building,
  Award,
  ChevronRight,
  Clock,
  Flame,
  Code2,
  Heart,
  TrendingUp,
  Sliders,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  Search,
  Command,
  Bell,
  Check,
} from "lucide-react";
import { DEMO_PERSONA, DEMO_METRICS } from "@/lib/demoPersona";
import { DataClassificationBadge } from "./DataClassificationBadge";
import { api, privacyApi, personalizationApi } from "@/lib/api";
import { NoirConsentBadge } from "./noir/NoirBloomKit";

export interface UserDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { id?: string; full_name?: string; email?: string; role?: string } | null;
  currentRole: string;
  onLogout: () => void;
  applications: Array<{ id: string; title?: string; status: string }>;
  readinessScore?: number;
  onViewPassport?: () => void;
  onOpenOnboarding?: () => void;
  onOpenDigitalTwin?: () => void;
  onOpenSimulator?: () => void;
  onOpenRoadmap?: () => void;
  onOpenConfidence?: () => void;
  onOpenMentorship?: () => void;
  onOpenOpportunities?: () => void;
  onOpenEntrepreneurship?: () => void;
  onOpenLearning?: () => void;
}

const GOAL_OPTIONS = [
  { id: "return_to_work", title: "Return to Employment" },
  { id: "learn_skills", title: "Learn & Modernize Skills" },
  { id: "start_business", title: "Start a Business / Consultancy" },
  { id: "grow_business", title: "Grow an Existing Business" },
  { id: "find_mentorship", title: "Find Mentorship & Guidance" },
  { id: "explore_careers", title: "Explore Career Pathways" },
];

export function UserDashboardModal({
  isOpen,
  onClose,
  currentUser,
  currentRole,
  onLogout,
  applications,
  readinessScore = 88,
  onViewPassport,
  onOpenOnboarding,
  onOpenDigitalTwin,
  onOpenSimulator,
  onOpenRoadmap,
  onOpenConfidence,
  onOpenMentorship,
  onOpenOpportunities,
  onOpenEntrepreneurship,
  onOpenLearning,
}: UserDashboardModalProps) {
  const [profileVisibility, setProfileVisibility] = useState<"private" | "employers">(
    DEMO_PERSONA.privacy.profile_visibility === "public"
      ? "employers"
      : DEMO_PERSONA.privacy.profile_visibility
  );
  const [passportConsent, setPassportConsent] = useState(
    DEMO_PERSONA.privacy.passport_sharing_consent
  );
  const [shareBreakReason, setShareBreakReason] = useState(
    DEMO_PERSONA.privacy.career_break_optional_shared
  );
  const [privacySaved, setPrivacySaved] = useState(false);
  const [privacyMessage, setPrivacyMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [optOutRanking, setOptOutRanking] = useState(false);
  const [erasurePending, setErasurePending] = useState(false);

  // Dynamic candidate & personalization data
  const [candidateProfile, setCandidateProfile] = useState<any>(null);
  const [personalizedDash, setPersonalizedDash] = useState<any>(null);
  const [currentGoal, setCurrentGoal] = useState<string>("return_to_work");
  const [isSwitchingGoal, setIsSwitchingGoal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "roadmap" | "learning" | "confidence" | "privacy">(
    "overview"
  );

  const loadData = async () => {
    try {
      const [profile, dash] = await Promise.all([
        api.getCandidateProfile().catch(() => null),
        personalizationApi.getPersonalizedDashboard().catch(() => null),
      ]);
      if (profile) setCandidateProfile(profile);
      if (dash) {
        setPersonalizedDash(dash);
        if (dash.primary_goal) setCurrentGoal(dash.primary_goal);
      }
    } catch (err) {
      console.warn("Using local candidate dashboard fallback", err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      queueMicrotask(() => {
        void loadData();
      });
    }
  }, [isOpen]);

  // Keyboard shortcut: Ctrl+K or Cmd+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Goal Switcher handler
  const handleGoalSwitch = async (newGoal: string) => {
    setIsSwitchingGoal(true);
    setCurrentGoal(newGoal);
    try {
      await personalizationApi.savePersonalization({ primary_goal: newGoal, is_completed: true });
      const updatedDash = await personalizationApi.getPersonalizedDashboard();
      setPersonalizedDash(updatedDash);
    } catch (err) {
      console.warn("Goal switch offline", err);
    } finally {
      setIsSwitchingGoal(false);
    }
  };

  // Route dispatcher
  const handleActionClick = (actionType: string) => {
    onClose();
    switch (actionType) {
      case "open_roadmap":
        if (onOpenRoadmap) onOpenRoadmap();
        break;
      case "open_confidence":
        if (onOpenConfidence) onOpenConfidence();
        break;
      case "open_mentorship":
        if (onOpenMentorship) onOpenMentorship();
        break;
      case "open_opportunities":
        if (onOpenOpportunities) onOpenOpportunities();
        break;
      case "open_entrepreneurship":
        if (onOpenEntrepreneurship) onOpenEntrepreneurship();
        break;
      case "open_learning":
        if (onOpenLearning) onOpenLearning();
        break;
      default:
        if (onOpenRoadmap) onOpenRoadmap();
        break;
    }
  };

  if (!isOpen) return null;

  const displayName =
    currentUser?.full_name ||
    candidateProfile?.full_name ||
    DEMO_PERSONA.full_name;
  const targetRole =
    candidateProfile?.target_role ||
    candidateProfile?.previous_job_title ||
    DEMO_PERSONA.target_role;
  const breakInfo = candidateProfile?.career_breaks?.[0];
  const breakMonths = breakInfo?.duration_months || 24;
  const breakDurationDisplay = `${Math.floor(breakMonths / 12)} years ${
    breakMonths % 12 > 0 ? `${breakMonths % 12} months` : ""
  }`;

  const primaryAction = personalizedDash?.primary_action || {
    id: "act-1",
    title: "Complete Week 1: Core Foundation & Comeback Narrative",
    description: "Reframe your career break as strategic growth and verify your foundational competencies.",
    action_type: "open_roadmap",
    cta_label: "Open Adaptive Roadmap",
    badge: "Recommended First Step",
    estimated_time: "2 hours",
  };

  const secondarySteps = personalizedDash?.secondary_steps || [
    {
      id: "act-2",
      title: "Set Your First Actionable Milestone",
      description: "Choose a practical milestone like drafting your narrative or completing a mini-project.",
      action_type: "open_confidence",
      cta_label: "Confidence Journal",
      badge: "Confidence Building",
      estimated_time: "30 mins",
    },
    {
      id: "act-3",
      title: "Schedule 1:1 Returnee Mentor Guidance",
      description: "Connect with an alumna who successfully transitioned back to industry.",
      action_type: "open_mentorship",
      cta_label: "Explore Mentors",
      badge: "Mentorship",
      estimated_time: "45 mins",
    },
  ];

  const handleSavePrivacy = async () => {
    setPrivacySaved(true);
    await privacyApi.updateConsentSettings({
      career_break_visibility: profileVisibility,
      allow_mentor_sharing: passportConsent,
      allow_ai_matching: !optOutRanking,
    });
    setPrivacyMessage("Consent preferences updated and logged per DPDP Act 2023.");
    setTimeout(() => {
      setPrivacySaved(false);
      setPrivacyMessage(null);
    }, 4000);
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const res = await privacyApi.exportData();
      const exportJson = JSON.stringify(res.data || res, null, 2);
      const blob = new Blob([exportJson], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gfg_personal_data_export_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setPrivacyMessage("Data portability bundle generated and downloaded successfully.");
    } catch {
      setPrivacyMessage("Export failed or network offline.");
    } finally {
      setIsExporting(false);
      setTimeout(() => setPrivacyMessage(null), 4000);
    }
  };

  const handleRevokeAll = async () => {
    await privacyApi.revokeAllConsent();
    setProfileVisibility("private");
    setPassportConsent(false);
    setShareBreakReason(false);
    setOptOutRanking(true);
    setPrivacyMessage("All external data sharing consents revoked immediately. Status set to private.");
    setTimeout(() => setPrivacyMessage(null), 5000);
  };

  const handleErasureRequest = async () => {
    await privacyApi.submitErasureRequest("Candidate requested account deletion per DPDP Act.");
    setErasurePending(true);
    setPrivacyMessage(
      "Account deletion & data erasure request logged with Data Grievance Officer (SLA: 7 business days)."
    );
    setTimeout(() => setPrivacyMessage(null), 5000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dashboard-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0B0F0D]/90 backdrop-blur-xl overflow-y-auto"
    >
      <div className="relative w-full max-w-6xl bg-[#0B0F0D] text-[#F5F0E5] rounded-3xl border border-[#344236] overflow-hidden my-auto max-h-[94vh] flex flex-col font-sans shadow-2xl">
        {/* ========================================================= */}
        {/* TOP BAR: BRAND, SEARCH & QUICK ACTIONS                    */}
        {/* ========================================================= */}
        <div className="px-6 sm:px-8 py-3.5 border-b border-[#344236] flex flex-wrap items-center justify-between gap-4 bg-[#111714] sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B6C899] shadow-[0_0_10px_#B6C899]" />
            <span className="text-xs font-mono tracking-wider uppercase text-[#B6C899] font-medium">
              GFG // NOIR BLOOM DASHBOARD
            </span>
            <NoirConsentBadge status="consented" />
          </div>

          {/* Quick Search & Command Filter */}
          <div className="flex items-center gap-3 flex-1 max-w-md mx-auto hidden md:flex">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#AAB9A9]" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search modules, skills, or mentors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1B231E] border border-[#344236] rounded-full py-1.5 pl-9 pr-14 text-xs text-[#F5F0E5] placeholder-[#AAB9A9]/60 focus:outline-none focus:border-[#B6C899]"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#AAB9A9] bg-[#111714] px-1.5 py-0.5 rounded border border-[#344236]">
                Ctrl K
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-1.5 text-xs font-mono uppercase text-[#AAB9A9] hover:text-[#B6C899] transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#AAB9A9] hover:text-[#F5F0E5] hover:bg-[#1B231E] transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* GOAL SWITCHER STRIP                                       */}
        {/* ========================================================= */}
        <div className="px-6 sm:px-8 py-2.5 bg-[#111714] border-b border-[#344236] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#AAB9A9] font-mono text-[11px]">Active Pathway:</span>
            <select
              value={currentGoal}
              onChange={(e) => handleGoalSwitch(e.target.value)}
              disabled={isSwitchingGoal}
              className="px-3 py-1 bg-[#1B231E] border border-[#344236] rounded-lg text-xs text-[#B6C899] font-medium focus:outline-none focus:border-[#B6C899] cursor-pointer"
            >
              {GOAL_OPTIONS.map((g) => (
                <option key={g.id} value={g.id} className="bg-[#111714] text-[#F5F0E5]">
                  {g.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {onOpenOnboarding && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenOnboarding();
                }}
                className="px-3 py-1 text-xs text-[#AAB9A9] hover:text-[#F5F0E5] hover:bg-[#1B231E] rounded-lg border border-[#344236] transition-colors font-mono"
              >
                Review Preferences
              </button>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* NAVIGATION TABS (Active Sage Underline)                   */}
        {/* ========================================================= */}
        <div className="px-6 sm:px-8 border-b border-[#344236] flex items-center gap-6 bg-[#0B0F0D] text-xs font-medium overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "overview"
                ? "border-[#B6C899] text-[#B6C899] font-semibold"
                : "border-transparent text-[#AAB9A9] hover:text-[#F5F0E5]"
            }`}
          >
            <Compass className="w-3.5 h-3.5" /> Bento Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("roadmap")}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "roadmap"
                ? "border-[#B6C899] text-[#B6C899] font-semibold"
                : "border-transparent text-[#AAB9A9] hover:text-[#F5F0E5]"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> 8-Week Roadmap
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("confidence")}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "confidence"
                ? "border-[#B6C899] text-[#B6C899] font-semibold"
                : "border-transparent text-[#AAB9A9] hover:text-[#F5F0E5]"
            }`}
          >
            <Heart className="w-3.5 h-3.5" /> Confidence &amp; Milestones
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("learning")}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "learning"
                ? "border-[#B6C899] text-[#B6C899] font-semibold"
                : "border-transparent text-[#AAB9A9] hover:text-[#F5F0E5]"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Skills &amp; Learning
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("privacy")}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "privacy"
                ? "border-[#B6C899] text-[#B6C899] font-semibold"
                : "border-transparent text-[#AAB9A9] hover:text-[#F5F0E5]"
            }`}
          >
            <Lock className="w-3.5 h-3.5" /> Privacy &amp; DPDP Consent
          </button>
        </div>

        {/* ========================================================= */}
        {/* DASHBOARD BODY (12-COLUMN BENTO GRID)                     */}
        {/* ========================================================= */}
        <div className="overflow-y-auto px-6 sm:px-8 py-6 space-y-6 flex-1 bg-[#0B0F0D]">
          {/* TAB 1: 12-COLUMN BENTO OVERVIEW */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-12 gap-6">
              {/* LEFT COLUMN: 8 COLS */}
              <div className="col-span-12 lg:col-span-8 space-y-6">
                {/* 1. HERO GREETING BENTO CELL */}
                <div className="p-7 rounded-3xl bg-[#111714] border border-[#344236] flex flex-col justify-between space-y-5 shadow-xl relative overflow-hidden">
                  <div className="space-y-2 relative z-10">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#B6C899] font-semibold">
                        {personalizedDash?.journey_title || "Career Comeback Pathway"}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B6C899]" />
                      <span className="text-xs text-[#AAB9A9] font-mono">
                        Target: {targetRole}
                      </span>
                    </div>

                    <h1
                      id="dashboard-modal-title"
                      className="text-2xl sm:text-3xl font-serif font-normal tracking-tight text-[#F5F0E5]"
                    >
                      Welcome back, {displayName.split(" ")[0]}.
                    </h1>

                    <p className="text-xs sm:text-sm text-[#AAB9A9] max-w-xl leading-relaxed font-light">
                      {personalizedDash?.journey_summary ||
                        `Your foundation is preserved with ${candidateProfile?.years_experience || 3} years of verified experience. Every milestone ahead is calibrated to your active weekly schedule.`}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2 relative z-10">
                    {onViewPassport && (
                      <button
                        type="button"
                        onClick={onViewPassport}
                        className="px-5 py-2.5 bg-[#B6C899] hover:bg-[#c8d8b0] text-[#0B0F0D] font-semibold text-xs rounded-full transition-all shadow-[0_0_15px_rgba(182,200,153,0.25)] flex items-center gap-1.5"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Open Career Passport</span>
                      </button>
                    )}
                    {onOpenConfidence && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenConfidence();
                        }}
                        className="px-4 py-2.5 bg-[#1B231E] hover:bg-[#202A23] border border-[#344236] text-xs font-medium text-[#F5F0E5] hover:text-[#B6C899] rounded-full transition-colors flex items-center gap-1.5"
                      >
                        <Heart className="w-3.5 h-3.5 text-[#B6C899]" />
                        <span>Confidence Journal</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. PRIMARY NEXT BEST ACTION BENTO CELL */}
                <div className="p-7 rounded-3xl bg-[#1B231E] border border-[#B6C899]/60 shadow-[0_0_30px_rgba(182,200,153,0.12)] space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase bg-[#111714] text-[#B6C899] border border-[#B6C899]/30 px-3 py-1 rounded-full font-bold">
                        {primaryAction.badge}
                      </span>
                      <span className="text-xs text-[#AAB9A9] font-mono">
                        Est. time: {primaryAction.estimated_time}
                      </span>
                    </div>
                    <span className="text-xs text-[#B6C899] font-mono font-semibold">
                      RECOMMENDED FOCUS // 01
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h2 className="text-xl sm:text-2xl font-serif text-[#F5F0E5]">
                      {primaryAction.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#AAB9A9] leading-relaxed max-w-2xl font-light">
                      {primaryAction.description}
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => handleActionClick(primaryAction.action_type)}
                      className="px-6 py-3 bg-[#B6C899] hover:bg-[#c8d8b0] text-[#0B0F0D] text-xs font-semibold uppercase tracking-wider rounded-full transition-all shadow-[0_0_20px_rgba(182,200,153,0.3)] flex items-center gap-2 hover:scale-[1.02]"
                    >
                      <span>{primaryAction.cta_label}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <span className="text-[11px] text-[#AAB9A9] font-mono">
                      Auto-saved • Fully encrypted
                    </span>
                  </div>
                </div>

                {/* 3. SECONDARY ACTION CARDS (Sub-Bento Grid) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-[#AAB9A9]">
                      Sequenced Growth Milestones
                    </h3>
                    <span className="text-xs text-[#536B58] font-mono">PROGRESSIVE ADAPTATION</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {secondarySteps.map((step: any) => (
                      <div
                        key={step.id}
                        className="p-5 rounded-2xl bg-[#111714] border border-[#344236] hover:border-[#B6C899]/50 transition-all flex flex-col justify-between gap-4 shadow-lg"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-[#1B231E] text-[#B6C899] border border-[#344236]">
                              {step.badge}
                            </span>
                            <span className="text-[10px] text-[#AAB9A9] font-mono">
                              ~{step.estimated_time}
                            </span>
                          </div>
                          <h4 className="text-sm font-serif font-normal text-[#F5F0E5] text-base">{step.title}</h4>
                          <p className="text-xs text-[#AAB9A9] leading-relaxed font-light">{step.description}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleActionClick(step.action_type)}
                          className="w-full mt-1 py-2 px-3 bg-[#1B231E] hover:bg-[#202A23] text-[#B6C899] text-xs font-semibold rounded-xl border border-[#344236] transition-colors flex items-center justify-center gap-1.5"
                        >
                          <span>{step.cta_label}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. 8-WEEK ROADMAP TIMELINE PREVIEW */}
                <div className="p-6 rounded-3xl bg-[#111714] border border-[#344236] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-serif text-[#F5F0E5]">
                        8-Week Comeback Roadmap
                      </h3>
                      <p className="text-xs text-[#AAB9A9] font-light">
                        Milestone progress tied to your weekly time commitment.
                      </p>
                    </div>
                    {onOpenRoadmap && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenRoadmap();
                        }}
                        className="px-3.5 py-1.5 text-xs font-mono text-[#B6C899] hover:underline flex items-center gap-1"
                      >
                        <span>View Full Roadmap</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((wk) => {
                      const isActive = wk === 1;
                      return (
                        <div
                          key={wk}
                          className={`p-2.5 rounded-xl border text-center font-mono text-xs flex flex-col items-center justify-center gap-1 ${
                            isActive
                              ? "bg-[#1B231E] border-[#B6C899] text-[#B6C899] font-bold shadow-md"
                              : "bg-[#0B0F0D] border-[#344236] text-[#AAB9A9]"
                          }`}
                        >
                          <span className="text-[10px]">W{wk}</span>
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-[#B6C899]" : "bg-[#344236]"}`} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: 4 COLS (CREDENTIALS, PASSPORT, PRIVACY & SHORTCUTS) */}
              <div className="col-span-12 lg:col-span-4 space-y-6">
                {/* 1. CAREER PASSPORT MINI CARD */}
                <div className="p-6 rounded-3xl bg-[#111714] border border-[#344236] space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#C6AC7D] font-bold">
                      VERIFIABLE CREDENTIAL
                    </span>
                    <Award className="w-4 h-4 text-[#C6AC7D]" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-serif text-[#F5F0E5]">
                      Career Passport 2.0
                    </h3>
                    <p className="text-xs text-[#AAB9A9] font-light">
                      Cryptographically certified evidence of pre-break mastery and recent project capstones.
                    </p>
                  </div>

                  <div className="p-3 bg-[#1B231E] rounded-xl border border-[#344236] text-xs font-mono space-y-1.5">
                    <div className="flex justify-between text-[#AAB9A9]">
                      <span>Preserved Experience:</span>
                      <span className="text-[#F5F0E5] font-semibold">{candidateProfile?.years_experience || 3} Years</span>
                    </div>
                    <div className="flex justify-between text-[#AAB9A9]">
                      <span>Consent Status:</span>
                      <span className="text-[#B6C899]">
                        {profileVisibility === "employers" ? "Consented (Partners)" : "Private Only"}
                      </span>
                    </div>
                  </div>

                  {onViewPassport && (
                    <button
                      type="button"
                      onClick={onViewPassport}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#1B231E] hover:bg-[#202A23] border border-[#C6AC7D]/40 hover:border-[#C6AC7D] text-[#C6AC7D] text-xs font-mono font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <span>Inspect Passport Dossier</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* 2. VERIFIED SKILLS BADGE CLOUD */}
                <div className="p-6 rounded-3xl bg-[#111714] border border-[#344236] space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#B6C899] font-bold">
                      CAPABILITY PROFILE
                    </span>
                    <CheckCircle className="w-4 h-4 text-[#B6C899]" />
                  </div>

                  <h3 className="text-sm font-semibold text-[#F5F0E5]">
                    Active &amp; Refreshed Skills
                  </h3>

                  <div className="flex flex-wrap gap-1.5">
                    {(
                      candidateProfile?.skills?.map((s: any) => s.name || s) || [
                        "Python",
                        "SQL",
                        "PostgreSQL",
                        "Data Modeling",
                        "Excel Analytics",
                        "System Architecture",
                      ]
                    ).map((sk: string) => (
                      <span
                        key={sk}
                        className="px-2.5 py-1 bg-[#1B231E] rounded-lg text-xs text-[#F5F0E5] border border-[#344236] font-mono text-[11px]"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("learning")}
                    className="w-full text-center text-xs text-[#B6C899] hover:underline pt-1 font-mono block"
                  >
                    + Add New Competency
                  </button>
                </div>

                {/* 3. DIRECT ACTION SHORTCUTS */}
                <div className="p-6 rounded-3xl bg-[#111714] border border-[#344236] space-y-3 shadow-xl">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#AAB9A9] font-semibold block">
                    QUICK DISCOVERY
                  </span>

                  {onOpenOpportunities && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenOpportunities();
                      }}
                      className="w-full text-left p-3 rounded-xl bg-[#1B231E] hover:bg-[#202A23] border border-[#344236] text-xs text-[#F5F0E5] hover:text-[#B6C899] transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-[#B6C899]" />
                        <span>Browse Returnships</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-[#AAB9A9]" />
                    </button>
                  )}

                  {onOpenMentorship && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenMentorship();
                      }}
                      className="w-full text-left p-3 rounded-xl bg-[#1B231E] hover:bg-[#202A23] border border-[#344236] text-xs text-[#F5F0E5] hover:text-[#B6C899] transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#B6C899]" />
                        <span>1:1 Mentor Circles</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-[#AAB9A9]" />
                    </button>
                  )}

                  {onOpenLearning && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenLearning();
                      }}
                      className="w-full text-left p-3 rounded-xl bg-[#1B231E] hover:bg-[#202A23] border border-[#344236] text-xs text-[#F5F0E5] hover:text-[#B6C899] transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[#B6C899]" />
                        <span>Learning Hub Academy</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-[#AAB9A9]" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 8-WEEK ROADMAP */}
          {activeTab === "roadmap" && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-[#111714] border border-[#344236] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-serif text-[#F5F0E5]">
                    Adaptive 8-Week Structured Roadmap
                  </h3>
                  <p className="text-xs text-[#AAB9A9] mt-0.5 font-light">
                    Calibrated to your {currentGoal.replace(/_/g, " ")} track with milestone-driven outputs.
                  </p>
                </div>
                {onOpenRoadmap && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenRoadmap();
                    }}
                    className="px-6 py-3 bg-[#B6C899] hover:bg-[#c8d8b0] text-[#0B0F0D] text-xs font-semibold uppercase tracking-wider rounded-full transition-all shadow-[0_0_20px_rgba(182,200,153,0.3)] flex items-center gap-2"
                  >
                    <span>Launch Full Interactive View</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { week: 1, title: "Foundation & Narrative", status: "Active", desc: "Reframe hiatus & map transferable skills" },
                  { week: 2, title: "Technical Core Refresher", status: "Upcoming", desc: "Modern cloud workflows & AI productivity" },
                  { week: 3, title: "Applied Work Sample Sprint", status: "Upcoming", desc: "Build tangible repository proof" },
                  { week: 4, title: "Mock Interview & Narrative", status: "Upcoming", desc: "1:1 coaching with executive returnee" },
                  { week: 5, title: "Portfolio Capstone Build", status: "Target", desc: "Complete production-ready mini project" },
                  { week: 6, title: "Mentorship Alignment", status: "Target", desc: "Review dossier with industry leader" },
                  { week: 7, title: "Direct Returnship Outreach", status: "Target", desc: "Apply with verified Career Passport" },
                  { week: 8, title: "Tenure & Negotiation", status: "Final", desc: "Stipend parity & full conversion plan" },
                ].map((w) => (
                  <div key={w.week} className="p-5 rounded-2xl bg-[#111714] border border-[#344236] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[#B6C899] font-bold">Week 0{w.week}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${w.status === "Active" ? "bg-[#B6C899]/20 text-[#B6C899]" : "text-[#AAB9A9]"}`}>
                        {w.status}
                      </span>
                    </div>
                    <div className="text-[#F5F0E5] font-serif text-base">{w.title}</div>
                    <p className="text-[11px] text-[#AAB9A9] font-light leading-relaxed">{w.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CONFIDENCE JOURNAL */}
          {activeTab === "confidence" && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-[#111714] border border-[#344236] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-serif text-[#F5F0E5]">
                    Confidence &amp; Milestone Action Journal
                  </h3>
                  <p className="text-xs text-[#AAB9A9] mt-0.5 font-light">
                    Build confidence through tangible proof: work samples, pitch drafts, and private self-reported check-ins.
                  </p>
                </div>
                {onOpenConfidence && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenConfidence();
                    }}
                    className="px-6 py-3 bg-[#B6C899] hover:bg-[#c8d8b0] text-[#0B0F0D] text-xs font-semibold uppercase tracking-wider rounded-full transition-all shadow-[0_0_20px_rgba(182,200,153,0.3)] flex items-center gap-2"
                  >
                    <Heart className="w-4 h-4" />
                    <span>Open Interactive Journal</span>
                  </button>
                )}
              </div>

              <div className="p-6 bg-[#111714] border border-[#344236] rounded-3xl text-xs text-[#AAB9A9] space-y-3">
                <div className="flex items-center gap-2 text-[#F5F0E5] font-semibold">
                  <Shield className="w-4 h-4 text-[#B6C899]" />
                  <span>Ethical Non-Evaluative Journal Design</span>
                </div>
                <p className="leading-relaxed font-light text-sm">
                  Zero streaks, zero shaming counters, and zero biometric camera scoring. Your confidence journal is strictly private personal tracking, empowering you without surveillance.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: SKILLS & LEARNING */}
          {activeTab === "learning" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Verified Skills */}
                <div className="p-6 bg-[#111714] border border-[#344236] rounded-3xl space-y-4">
                  <h3 className="text-xs font-bold text-[#F5F0E5] flex items-center gap-1.5 uppercase tracking-wider font-mono">
                    <CheckCircle className="w-3.5 h-3.5 text-[#B6C899]" />
                    Verified &amp; Reported Capabilities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(
                      candidateProfile?.skills?.map((s: any) => s.name || s) || [
                        "Python",
                        "SQL",
                        "PostgreSQL",
                        "Data Modeling",
                        "Tableau",
                        "Git",
                      ]
                    ).map((sk: string) => (
                      <span
                        key={sk}
                        className="px-3 py-1.5 bg-[#1B231E] rounded-xl text-xs text-[#F5F0E5] border border-[#344236] font-mono"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Active Learning Modules */}
                <div className="p-6 bg-[#111714] border border-[#344236] rounded-3xl space-y-4">
                  <h3 className="text-xs font-bold text-[#F5F0E5] flex items-center gap-1.5 uppercase tracking-wider font-mono">
                    <BookOpen className="w-3.5 h-3.5 text-[#B6C899]" />
                    Active Learning Modules
                  </h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-[#1B231E] rounded-2xl border border-[#344236] space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-[#F5F0E5]">
                          Modern Workplace Technologies &amp; AI Assistants
                        </span>
                        <span className="text-[#B6C899] font-mono text-[11px]">Verified Track</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#0B0F0D] rounded-full overflow-hidden">
                        <div className="w-[65%] h-full bg-[#B6C899] rounded-full" />
                      </div>
                    </div>

                    <div className="p-4 bg-[#1B231E] rounded-2xl border border-[#344236] space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-[#F5F0E5]">
                          Data Analytics &amp; Returnship Portfolio Refresher
                        </span>
                        <span className="text-[#B6C899] font-mono text-[11px]">Hands-on</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#0B0F0D] rounded-full overflow-hidden">
                        <div className="w-[40%] h-full bg-[#B6C899] rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PRIVACY & DPDP ACT */}
          {activeTab === "privacy" && (
            <div className="p-7 rounded-3xl bg-[#111714] border border-[#344236] space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#B6C899]" />
                  <span className="text-xs font-mono uppercase tracking-wider text-[#F5F0E5]">
                    PRIVACY &amp; CONSENT SETTINGS
                  </span>
                </div>
                {privacySaved && (
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Saved
                  </span>
                )}
              </div>

              <p className="text-xs text-[#AAB9A9] leading-relaxed font-light">
                Your profile is private by default under India&apos;s DPDP Act 2023. Control exactly who can view your credentials,
                verified passport, and career break context.
              </p>

              <div className="space-y-3 font-mono text-xs pt-2">
                <label className="flex items-center justify-between p-4 rounded-2xl bg-[#1B231E] border border-[#344236] cursor-pointer">
                  <div>
                    <span className="text-[#F5F0E5] block font-medium">Profile Visibility</span>
                    <span className="text-[11px] text-[#AAB9A9]">
                      {profileVisibility === "private"
                        ? "Private — Only visible to you"
                        : "Shared with Verified Returnship Employers"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = profileVisibility === "private" ? "employers" : "private";
                      setProfileVisibility(next);
                      handleSavePrivacy();
                    }}
                    className={`px-3 py-1 rounded-full text-[10px] font-semibold transition-all ${
                      profileVisibility === "private"
                        ? "bg-[#111714] text-[#B6C899] border border-[#B6C899]/30"
                        : "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                    }`}
                  >
                    {profileVisibility === "private" ? "PRIVATE (DEFAULT)" : "SHARED WITH PARTNERS"}
                  </button>
                </label>

                <label className="flex items-center justify-between p-4 rounded-2xl bg-[#1B231E] border border-[#344236] cursor-pointer">
                  <div>
                    <span className="text-[#F5F0E5] block font-medium">
                      Career Passport Employer Sharing
                    </span>
                    <span className="text-[11px] text-[#AAB9A9]">
                      Explicit consent required to transmit verified pre-break tenure &amp; capstone records.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={passportConsent}
                    onChange={(e) => {
                      setPassportConsent(e.target.checked);
                      handleSavePrivacy();
                    }}
                    className="w-4 h-4 accent-[#B6C899] cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-2xl bg-[#1B231E] border border-[#344236] cursor-pointer">
                  <div>
                    <span className="text-[#F5F0E5] block font-medium">
                      Career Break Reason (Optional)
                    </span>
                    <span className="text-[11px] text-[#AAB9A9]">
                      Keep sensitive caregiving or medical reasons private during employer review.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={shareBreakReason}
                    onChange={(e) => {
                      setShareBreakReason(e.target.checked);
                      handleSavePrivacy();
                    }}
                    className="w-4 h-4 accent-[#B6C899] cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-2xl bg-[#1B231E] border border-[#344236] cursor-pointer">
                  <div>
                    <span className="text-[#F5F0E5] block font-medium">
                      Algorithmic Recommendation Transparency
                    </span>
                    <span className="text-[11px] text-[#AAB9A9]">
                      Opt-out of automated ranking to view all opportunities chronologically without scoring algorithms.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={optOutRanking}
                    onChange={(e) => {
                      setOptOutRanking(e.target.checked);
                      handleSavePrivacy();
                    }}
                    className="w-4 h-4 accent-[#B6C899] cursor-pointer"
                  />
                </label>

                {/* DPDP Act 2023 Rights Action Strip */}
                <div className="pt-3 border-t border-[#344236] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExportData}
                      disabled={isExporting}
                      className="px-3 py-1.5 rounded-lg bg-[#111714] hover:bg-[#202A23] border border-[#344236] text-[#B6C899] hover:text-[#F5F0E5] flex items-center gap-1.5 font-mono text-[11px] transition-all disabled:opacity-50"
                      title="DPDP Act Section 12: Export complete personal records as JSON"
                    >
                      <Download className={`w-3.5 h-3.5 ${isExporting ? "animate-bounce" : ""}`} />
                      <span>{isExporting ? "Exporting..." : "Export Data (JSON)"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleRevokeAll}
                      className="px-3 py-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-950/70 border border-amber-500/30 text-amber-300 flex items-center gap-1.5 font-mono text-[11px] transition-all"
                      title="DPDP Act Section 6(4): One-click revocation of all active consents"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Revoke All Consents</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleErasureRequest}
                      disabled={erasurePending}
                      className="px-3 py-1.5 rounded-lg bg-red-950/30 hover:bg-red-950/60 border border-red-500/30 text-red-300 flex items-center gap-1.5 font-mono text-[11px] transition-all disabled:opacity-50"
                      title="DPDP Act Section 12: Right to correction and erasure"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{erasurePending ? "Erasure Pending" : "Request Account Erasure"}</span>
                    </button>
                  </div>

                  <span className="text-[10px] font-mono text-[#536B58]">
                    DPDP Act 2023 Compliant • Grievance: privacy@gfg-platform.org
                  </span>
                </div>

                {privacyMessage && (
                  <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-mono flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                    <span>{privacyMessage}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
