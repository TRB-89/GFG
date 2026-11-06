"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { DEMO_PERSONA, DEMO_METRICS } from "@/lib/demoPersona";
import { DataClassificationBadge } from "./DataClassificationBadge";
import { api, privacyApi, personalizationApi } from "@/lib/api";

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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0E1310]/85 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-5xl bg-[#1B231E] text-[#F5F0E5] rounded-2xl border border-[#344236] overflow-hidden my-auto max-h-[92vh] flex flex-col font-sans shadow-2xl">
        {/* Top Header */}
        <div className="px-6 sm:px-8 py-4 border-b border-[#344236] flex items-center justify-between bg-[#111714] sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B6C899] shadow-[0_0_8px_rgba(182,200,153,0.6)]" />
            <span className="text-xs font-mono tracking-wider uppercase text-[#B6C899] font-semibold">
              CAREER EMPOWERMENT // DASHBOARD
            </span>
            <DataClassificationBadge type="simulated_demonstration" size="sm" />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 text-xs font-mono uppercase text-[#AAB9A9] hover:text-[#F5F0E5] transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#AAB9A9] hover:text-[#F5F0E5] hover:bg-[#202A23] transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Goal Switcher Strip */}
        <div className="px-6 sm:px-8 py-2.5 bg-[#171F1A] border-b border-[#344236] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#AAB9A9] font-mono text-[11px]">Primary Goal:</span>
            <select
              value={currentGoal}
              onChange={(e) => handleGoalSwitch(e.target.value)}
              disabled={isSwitchingGoal}
              className="px-2.5 py-1 bg-[#202A23] border border-[#344236] rounded-lg text-xs text-[#B6C899] font-semibold focus:outline-none focus:border-[#B6C899] cursor-pointer"
            >
              {GOAL_OPTIONS.map((g) => (
                <option key={g.id} value={g.id} className="bg-[#1B231E] text-[#F5F0E5]">
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
                className="px-2.5 py-1 text-xs text-[#AAB9A9] hover:text-[#F5F0E5] hover:bg-[#202A23] rounded-lg border border-[#344236] transition-colors"
              >
                Review & Edit All Preferences
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 sm:px-8 border-b border-[#344236] flex items-center gap-6 bg-[#171F1A] text-xs font-medium overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "overview"
                ? "border-[#B6C899] text-[#B6C899] font-bold"
                : "border-transparent text-[#AAB9A9] hover:text-[#F5F0E5]"
            }`}
          >
            <Compass className="w-3.5 h-3.5" /> Personalized Overview
          </button>
          <button
            onClick={() => setActiveTab("roadmap")}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "roadmap"
                ? "border-[#B6C899] text-[#B6C899] font-bold"
                : "border-transparent text-[#AAB9A9] hover:text-[#F5F0E5]"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> 8-Week Roadmap
          </button>
          <button
            onClick={() => setActiveTab("confidence")}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "confidence"
                ? "border-[#B6C899] text-[#B6C899] font-bold"
                : "border-transparent text-[#AAB9A9] hover:text-[#F5F0E5]"
            }`}
          >
            <Heart className="w-3.5 h-3.5" /> Confidence & Milestones
          </button>
          <button
            onClick={() => setActiveTab("learning")}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "learning"
                ? "border-[#B6C899] text-[#B6C899] font-bold"
                : "border-transparent text-[#AAB9A9] hover:text-[#F5F0E5]"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Skills & Learning
          </button>
          <button
            onClick={() => setActiveTab("privacy")}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "privacy"
                ? "border-[#B6C899] text-[#B6C899] font-bold"
                : "border-transparent text-[#AAB9A9] hover:text-[#F5F0E5]"
            }`}
          >
            <Lock className="w-3.5 h-3.5" /> Privacy & DPDP
          </button>
        </div>

        {/* Dashboard Body */}
        <div className="overflow-y-auto px-6 sm:px-8 py-6 space-y-6 flex-1">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <>
              {/* Hero Greeting & Track Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-[#171F1A] via-[#1B231E] to-[#202A23] border border-[#344236] flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#B6C899] font-semibold">
                      {personalizedDash?.journey_title || "Career Comeback Track"}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B6C899]" />
                    <span className="text-xs text-[#AAB9A9]">
                      Target: {targetRole}
                    </span>
                  </div>
                  <h1
                    id="dashboard-modal-title"
                    className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F0E5]"
                  >
                    Welcome back, {displayName.split(" ")[0]}.
                  </h1>
                  <p className="text-xs sm:text-sm text-[#AAB9A9] max-w-xl leading-relaxed">
                    {personalizedDash?.journey_summary ||
                      `Your foundation is preserved with ${candidateProfile?.years_experience || 3} years of verified experience. Every milestone ahead is tailored to your schedule.`}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {onViewPassport && (
                    <button
                      onClick={onViewPassport}
                      className="px-4 py-2 bg-[#B6C899] hover:bg-[#F5F0E5] text-[#111714] font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Career Passport</span>
                    </button>
                  )}
                  {onOpenConfidence && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenConfidence();
                      }}
                      className="px-3.5 py-2 bg-[#202A23] hover:bg-[#344236] border border-[#344236] text-xs font-semibold text-[#F5F0E5] rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <Heart className="w-3.5 h-3.5 text-[#B6C899]" />
                      <span>Confidence Journal</span>
                    </button>
                  )}
                </div>
              </div>

              {/* PRIMARY ACTION CARD (Highest-Impact Next Step) */}
              <div className="p-6 rounded-2xl bg-[#202A23] border border-[#B6C899]/50 shadow-[0_0_20px_rgba(182,200,153,0.1)] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase bg-[#111714] text-[#B6C899] border border-[#B6C899]/30 px-2.5 py-0.5 rounded-full font-bold">
                      {primaryAction.badge}
                    </span>
                    <span className="text-xs text-[#AAB9A9]">
                      Est. time: {primaryAction.estimated_time}
                    </span>
                  </div>
                  <span className="text-xs text-[#697D69] font-mono">HIGHEST IMPACT ACTION</span>
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-lg sm:text-xl font-bold text-[#F5F0E5]">
                    {primaryAction.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#AAB9A9] leading-relaxed max-w-3xl">
                    {primaryAction.description}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleActionClick(primaryAction.action_type)}
                    className="px-6 py-2.5 bg-[#B6C899] hover:bg-[#F5F0E5] text-[#111714] text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 hover:scale-[1.02]"
                  >
                    <span>{primaryAction.cta_label}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <span className="text-[11px] text-[#AAB9A9] hidden sm:inline">
                    Progress is auto-saved as you complete tasks.
                  </span>
                </div>
              </div>

              {/* SECONDARY RECOMMENDED STEPS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#AAB9A9]">
                    Secondary Recommended Steps
                  </h3>
                  <span className="text-xs text-[#697D69]">Sequenced for high momentum</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {secondarySteps.map((step: any) => (
                    <div
                      key={step.id}
                      className="p-4 rounded-xl bg-[#171F1A] border border-[#344236] hover:border-[#697D69] transition-all flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#202A23] text-[#B6C899] border border-[#344236]">
                            {step.badge}
                          </span>
                          <span className="text-[10px] text-[#AAB9A9] font-mono">
                            ~{step.estimated_time}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-[#F5F0E5]">{step.title}</h4>
                        <p className="text-xs text-[#AAB9A9] leading-relaxed">{step.description}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleActionClick(step.action_type)}
                        className="w-full mt-2 py-2 px-3 bg-[#202A23] hover:bg-[#344236] text-[#B6C899] text-xs font-semibold rounded-lg border border-[#344236] transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span>{step.cta_label}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* EXPLAINABILITY NOTES */}
              {personalizedDash?.explainability_notes && (
                <div className="p-4 rounded-xl bg-[#171F1A] border border-[#344236] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#B6C899]">
                    <Sparkles className="w-3.5 h-3.5 text-[#B6C899]" />
                    <span>Why are these actions recommended? (Explainability)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {personalizedDash.explainability_notes.map((note: any, i: number) => (
                      <div key={i} className="text-xs space-y-0.5 text-[#AAB9A9]">
                        <strong className="text-[#F5F0E5] block">{note.headline}</strong>
                        <p className="text-[11px] leading-relaxed">{note.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB 2: ROADMAP PREVIEW & TRIGGER */}
          {activeTab === "roadmap" && (
            <div className="space-y-4">
              <div className="p-5 rounded-xl bg-[#202A23] border border-[#344236] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-[#F5F0E5]">
                    Adaptive 8-Week Structured Roadmap
                  </h3>
                  <p className="text-xs text-[#AAB9A9] mt-0.5">
                    Adapted to your {currentGoal.replace(/_/g, " ")} track with milestone-driven demonstrable outputs.
                  </p>
                </div>
                {onOpenRoadmap && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenRoadmap();
                    }}
                    className="px-5 py-2.5 bg-[#B6C899] hover:bg-[#F5F0E5] text-[#111714] text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <span>Launch Full Interactive Roadmap</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { week: 1, title: "Foundation & Narrative", status: "Active" },
                  { week: 2, title: "Technical Core Refresher", status: "Upcoming" },
                  { week: 3, title: "Applied Work Sample Sprint", status: "Upcoming" },
                  { week: 4, title: "Mock Interview & Narrative", status: "Upcoming" },
                  { week: 5, title: "Portfolio Capstone Build", status: "Target" },
                  { week: 6, title: "Mentorship Alignment", status: "Target" },
                  { week: 7, title: "Direct Returnship Outreach", status: "Target" },
                  { week: 8, title: "Tenure & Negotiation", status: "Final" },
                ].map((w) => (
                  <div key={w.week} className="p-3.5 rounded-xl bg-[#171F1A] border border-[#344236] space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[#B6C899] font-bold">Week {w.week}</span>
                      <span className="text-[10px] text-[#AAB9A9]">{w.status}</span>
                    </div>
                    <div className="text-[#F5F0E5] font-semibold">{w.title}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CONFIDENCE JOURNAL PREVIEW */}
          {activeTab === "confidence" && (
            <div className="space-y-4">
              <div className="p-5 rounded-xl bg-[#202A23] border border-[#344236] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-[#F5F0E5]">
                    Confidence & Milestone Action Journal
                  </h3>
                  <p className="text-xs text-[#AAB9A9] mt-0.5">
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
                    className="px-5 py-2.5 bg-[#B6C899] hover:bg-[#F5F0E5] text-[#111714] text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <Heart className="w-3.5 h-3.5" />
                    <span>Open Confidence Journal</span>
                  </button>
                )}
              </div>

              <div className="p-4 bg-[#171F1A] border border-[#344236] rounded-xl text-xs text-[#AAB9A9] space-y-2">
                <div className="flex items-center gap-2 text-[#F5F0E5] font-semibold">
                  <Shield className="w-4 h-4 text-[#B6C899]" />
                  <span>Ethical Non-Evaluative Journal</span>
                </div>
                <p>
                  Zero streaks, zero shaming counters, and zero biometric camera scoring. Your confidence journal is strictly private personal tracking.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: SKILLS & LEARNING */}
          {activeTab === "learning" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Verified Skills */}
                <div className="p-5 bg-[#171F1A] border border-[#344236] rounded-xl space-y-3">
                  <h3 className="text-xs font-bold text-[#F5F0E5] flex items-center gap-1.5 uppercase tracking-wider">
                    <CheckCircle className="w-3.5 h-3.5 text-[#B6C899]" />
                    Verified & Reported Capabilities
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
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
                        className="px-2.5 py-1 bg-[#202A23] rounded-md text-xs text-[#F5F0E5] border border-[#344236]"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recommended Modules */}
                <div className="p-5 bg-[#171F1A] border border-[#344236] rounded-xl space-y-3">
                  <h3 className="text-xs font-bold text-[#F5F0E5] flex items-center gap-1.5 uppercase tracking-wider">
                    <BookOpen className="w-3.5 h-3.5 text-[#B6C899]" />
                    Active Learning Modules
                  </h3>
                  <div className="space-y-2">
                    <div className="p-3 bg-[#202A23] rounded-lg space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-[#F5F0E5]">
                          Modern Workplace Technologies & AI Assistants
                        </span>
                        <span className="text-[#B6C899] font-mono">Verified Track</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#111714] rounded-full overflow-hidden">
                        <div className="w-[65%] h-full bg-[#B6C899] rounded-full" />
                      </div>
                    </div>

                    <div className="p-3 bg-[#202A23] rounded-lg space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-[#F5F0E5]">
                          Data Analytics & Returnship Portfolio Refresher
                        </span>
                        <span className="text-[#B6C899] font-mono">Hands-on</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#111714] rounded-full overflow-hidden">
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
            <div className="p-6 rounded-xl bg-[#171F1A] border border-[#344236] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#B6C899]" />
                  <span className="text-xs font-mono uppercase tracking-wider text-[#F5F0E5]">
                    PRIVACY & CONSENT SETTINGS
                  </span>
                </div>
                {privacySaved && (
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Saved
                  </span>
                )}
              </div>

              <p className="text-xs text-[#AAB9A9] leading-relaxed">
                Your profile is private by default. Control exactly who can view your credentials,
                verified passport, and career break context.
              </p>

              <div className="space-y-3 font-mono text-xs pt-2">
                <label className="flex items-center justify-between p-3 rounded-lg bg-[#202A23] border border-[#344236] cursor-pointer">
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

                <label className="flex items-center justify-between p-3 rounded-lg bg-[#202A23] border border-[#344236] cursor-pointer">
                  <div>
                    <span className="text-[#F5F0E5] block font-medium">
                      Career Passport Employer Sharing
                    </span>
                    <span className="text-[11px] text-[#AAB9A9]">
                      Explicit consent required to transmit verified pre-break tenure & capstone
                      records.
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

                <label className="flex items-center justify-between p-3 rounded-lg bg-[#202A23] border border-[#344236] cursor-pointer">
                  <div>
                    <span className="text-[#F5EDE4] block font-medium">
                      Career Break Reason (Optional)
                    </span>
                    <span className="text-[11px] text-[#A89B90]">
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

                <label className="flex items-center justify-between p-3 rounded-lg bg-[#202A23] border border-[#344236] cursor-pointer">
                  <div>
                    <span className="text-[#F5F0E5] block font-medium">
                      Algorithmic Recommendation Transparency
                    </span>
                    <span className="text-[11px] text-[#AAB9A9]">
                      Opt-out of automated ranking to view all opportunities chronologically without
                      scoring algorithms.
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

                  <span className="text-[10px] font-mono text-[#697D69]">
                    DPDP Act 2023 Compliant • Grievance: privacy@gfg-platform.org
                  </span>
                </div>

                {privacyMessage && (
                  <div className="p-2.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-mono flex items-center gap-2">
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
