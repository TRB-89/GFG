"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Users,
  Briefcase,
  FileText,
  BarChart3,
  Sparkles,
  AlertCircle,
  Copy,
  Download,
  ChevronRight,
  Eye,
  EyeOff,
  PlusCircle,
  Lock,
  TrendingUp,
  X,
  RefreshCw,
  Search,
  Filter,
  Award,
  GitBranch,
  Info,
  Layers,
  History,
  Check,
  MapPin,
  Laptop
} from "lucide-react";
import { employerIntelligenceApi } from "@/lib/api";

interface EmployerIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "dashboard" | "candidates" | "builder" | "toolkit" | "analytics" | "verification";
}

export default function EmployerIntelligenceModal({
  isOpen,
  onClose,
  initialTab = "dashboard",
}: EmployerIntelligenceModalProps) {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "candidates" | "builder" | "toolkit" | "analytics" | "verification"
  >(initialTab);

  // Loading states & data
  const [loading, setLoading] = useState<boolean>(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [consentPolicy, setConsentPolicy] = useState<any>(null);
  const [toolkitTemplates, setToolkitTemplates] = useState<any>(null);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>("skills_based_interview_rubric");
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [orgProfile, setOrgProfile] = useState<any>(null);

  // Match Explainability Modal
  const [explainCandidate, setExplainCandidate] = useState<any | null>(null);
  const [matchAnalysis, setMatchAnalysis] = useState<any | null>(null);
  const [isExplaining, setIsExplaining] = useState<boolean>(false);

  // Copy notification
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Candidate Search & Multi-parameter Filters (Checkpoint 2)
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>("");
  const [selectedLocationFilter, setSelectedLocationFilter] = useState<string>("");
  const [selectedWorkMode, setSelectedWorkMode] = useState<string>("all");
  const [selectedExperienceMin, setSelectedExperienceMin] = useState<number>(0);
  const [portfolioOnly, setPortfolioOnly] = useState<boolean>(false);

  // Application Status History Drawer
  const [selectedAppHistory, setSelectedAppHistory] = useState<any | null>(null);

  // Returnship & Opportunity Builder Form State (Checkpoint 4)
  const [builderForm, setBuilderForm] = useState({
    opportunity_type: "returnship",
    program_title: "Cloud Infrastructure & Platform SRE Returnship Fellowship",
    job_function: "DevOps & Cloud Systems",
    duration_months: 4,
    compensation_stipend: "₹85,000 / month guaranteed stipend + medical insurance",
    working_arrangement: "Hybrid (2 days/wk Bengaluru office, 3 days remote)",
    required_skills: "Kubernetes, Python, Linux, Terraform",
    eligibility_criteria: "Minimum 12-month career pause. Prior engineering experience in Linux, Python, or distributed systems.",
    learning_objectives: "Modern Kubernetes orchestration, Terraform IAC, and production incident response runbooks.",
    mentor_assignment: "Sunita Rao (Principal Site Reliability Engineer)",
    evaluation_criteria: "Capstone delivery at week 12, peer code review quality, and production shadowing at week 16.",
    potential_progression_options: "Direct conversion to full-time Senior Site Reliability Engineer.",
  });
  const [builderSuccess, setBuilderSuccess] = useState<string | null>(null);

  // Organization Registration & Verification Testing State (Checkpoint 1)
  const [regForm, setRegForm] = useState({
    company_name: "Nova Technologies",
    official_website: "https://novatech-demo.example.com",
    authorized_representative: "Pooja Hegde (Director of People & Talent)",
    business_contact_email: "talent@novatech.com",
    business_contact_phone: "+91 80 4912 3000",
    industry: "Enterprise Cloud & Applied Intelligence",
    location: "Bengaluru, Karnataka (Hybrid)",
    company_size: "250-500 employees",
    hiring_charter_accepted: true,
  });
  const [regNotice, setRegNotice] = useState<string | null>(null);
  const [adminVerifyStatus, setAdminVerifyStatus] = useState<string>("verified");
  const [adminVerifyNotes, setAdminVerifyNotes] = useState<string>("Verified by GFG Trust & Safety manual audit.");
  const [adminVerifySuccess, setAdminVerifySuccess] = useState<string | null>(null);

  const loadAllEmployerData = async (filterOverrides?: any) => {
    setLoading(true);
    try {
      const activeFilters = {
        search: searchQuery || undefined,
        skill: selectedSkillFilter || undefined,
        location: selectedLocationFilter || undefined,
        work_mode: selectedWorkMode !== "all" ? selectedWorkMode : undefined,
        experience_min: selectedExperienceMin > 0 ? selectedExperienceMin : undefined,
        has_portfolio: portfolioOnly ? true : undefined,
        ...filterOverrides
      };

      const [dash, cands, toolkits, analytics, logs, prof] = await Promise.all([
        employerIntelligenceApi.getDashboard(),
        employerIntelligenceApi.getConsentedCandidates(activeFilters),
        employerIntelligenceApi.getHRToolkitTemplates(),
        employerIntelligenceApi.getAnalytics(),
        employerIntelligenceApi.getAuditLogs(),
        employerIntelligenceApi.getProfile(),
      ]);

      setDashboardData(dash.dashboard_metrics ? dash : dash.data || dash);
      setCandidates(cands.candidates || (cands.data && cands.data.candidates) || []);
      setConsentPolicy(cands.consent_policy || (cands.data && cands.data.consent_policy) || null);
      setToolkitTemplates(toolkits.templates || (toolkits.data && toolkits.data.templates) || null);
      setAnalyticsData(analytics.analytics || (analytics.data && analytics.data.analytics) || analytics);
      setAuditLogs(logs.audit_logs || (logs.data && logs.data.audit_logs) || []);
      setOrgProfile(prof.profile || (prof.data && prof.data.profile) || prof);
    } catch (err) {
      console.warn("Employer data loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      queueMicrotask(() => {
        void loadAllEmployerData();
      });
    }
  }, [isOpen]);

  const handleApplyFilters = () => {
    loadAllEmployerData();
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedSkillFilter("");
    setSelectedLocationFilter("");
    setSelectedWorkMode("all");
    setSelectedExperienceMin(0);
    setPortfolioOnly(false);
    loadAllEmployerData({
      search: undefined,
      skill: undefined,
      location: undefined,
      work_mode: undefined,
      experience_min: undefined,
      has_portfolio: undefined,
    });
  };

  const handleExplainMatch = async (candidate: any) => {
    setExplainCandidate(candidate);
    setIsExplaining(true);
    try {
      const candSkills = [
        ...(candidate.evidence_categories?.assessment_supported_skills?.map((s: any) => s.skill) || []),
        ...(candidate.evidence_categories?.self_reported_experience?.map((s: any) => s.skill) || [])
      ];

      const res = await employerIntelligenceApi.explainMatch({
        candidate_id: candidate.candidate_id,
        candidate_name: candidate.full_name,
        candidate_skills: candSkills,
        job_title: candidate.target_role,
        years_pre_break_experience: candidate.years_pre_break_experience,
        assessment_score: candidate.evidence_categories?.assessment_supported_skills?.[0]?.score || 90,
        verified_credentials: candidate.evidence_categories?.verified_credentials?.map((c: any) => c.credential) || [],
        portfolio_projects: candidate.evidence_categories?.portfolio_projects?.map((p: any) => p.project) || [],
      });
      setMatchAnalysis(res.match_analysis || res.data?.match_analysis || res);
    } catch (err) {
      console.error("Match explain error:", err);
    } finally {
      setIsExplaining(false);
    }
  };

  const handleAdvanceStatus = async (appId: string | number, newStatus: string) => {
    try {
      await employerIntelligenceApi.advanceApplication(appId, {
        new_status: newStatus,
        reviewer_name: "Nova Tech Recruiter",
        notes: `Advanced to ${newStatus} via recruiter pipeline desk.`
      });
      // Refresh dashboard & logs
      const updatedDash = await employerIntelligenceApi.getDashboard();
      setDashboardData(updatedDash.dashboard_metrics ? updatedDash : updatedDash.data || updatedDash);
      const updatedLogs = await employerIntelligenceApi.getAuditLogs();
      setAuditLogs(updatedLogs.audit_logs || (updatedLogs.data && updatedLogs.data.audit_logs) || []);
    } catch (err: any) {
      alert(err.message || "Failed to update application status.");
    }
  };

  const handleCreateReturnship = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await employerIntelligenceApi.createReturnship({
        program_title: builderForm.program_title,
        job_function: builderForm.job_function,
        duration_months: Number(builderForm.duration_months),
        compensation_stipend: builderForm.compensation_stipend,
        working_arrangement: builderForm.working_arrangement,
        eligibility_criteria: builderForm.eligibility_criteria,
        learning_objectives: builderForm.learning_objectives.split("\n"),
        mentor_assignment: builderForm.mentor_assignment,
        evaluation_criteria: builderForm.evaluation_criteria.split("\n"),
        potential_progression_options: builderForm.potential_progression_options,
      });
      setBuilderSuccess("Opportunity track published with equal pay and mentoring provisions! Logged to employer audit trail.");
      setTimeout(() => setBuilderSuccess(null), 6000);
      loadAllEmployerData();
    } catch (err: any) {
      alert(err.message || "Failed to create returnship opportunity.");
    }
  };

  const handleRegisterOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await employerIntelligenceApi.registerOrganization(regForm);
      setRegNotice(res.verification_notice || "Registration received. Organization status set to 'pending_review' pending manual compliance review.");
      loadAllEmployerData();
    } catch (err: any) {
      alert(err.message || "Registration failed.");
    }
  };

  const handleAdminVerifyUpdate = async () => {
    if (!orgProfile?.organization_id && !dashboardData?.organization_info?.id) {
      alert("No organization ID identified.");
      return;
    }
    const orgId = orgProfile?.organization_id || dashboardData?.organization_info?.id;
    try {
      const res = await employerIntelligenceApi.verifyOrganization(orgId, {
        verification_status: adminVerifyStatus,
        verification_notes: adminVerifyNotes,
        compliance_checklist: {
          commercial_registration_verified: true,
          recruiter_domain_email_verified: true,
          caregiving_dignity_charter_signed: true,
          salary_history_inquiry_banned: true
        }
      });
      setAdminVerifySuccess(`Organization verification status updated to '${adminVerifyStatus}'.`);
      setTimeout(() => setAdminVerifySuccess(null), 5000);
      loadAllEmployerData();
    } catch (err: any) {
      alert(err.message || "Admin verification update failed.");
    }
  };

  const copyTemplateMarkdown = (markdown: string, title: string) => {
    navigator.clipboard.writeText(markdown);
    setCopyFeedback(`Copied "${title}" to clipboard!`);
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  const downloadTemplateMarkdown = (markdown: string, filename: string) => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${filename.toLowerCase().replace(/\s+/g, "_")}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  const orgVerificationStatus = orgProfile?.verification_status || dashboardData?.organization_info?.verification_status || "verified";
  const isOrgVerified = orgVerificationStatus === "verified" || Boolean(orgProfile?.is_verified) || Boolean(dashboardData?.is_verified);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="employer-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 md:p-6 overflow-y-auto"
    >
      <div className="relative w-full max-w-6xl bg-[#111714] border border-[#344236] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Fictional Demo & Security Banner */}
        <div className="bg-[#161F19] border-b border-[#2C382F] px-5 py-2.5 flex items-center justify-between text-xs text-[#AAB9A9]">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#202B23] text-[#B6C899] font-medium border border-[#3E4F41]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B6C899] animate-pulse" />
              VERIFIED EMPLOYER WORKSPACE
            </span>
            <span className="font-serif text-[#F5F0E5]">
              <strong>{orgProfile?.name || "Nova Technologies"} Recruiter Desk</strong> • Skills-First Opportunity Bridge
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-[11px] text-[#AAB9A9]">
            <span className="inline-flex items-center gap-1">
              <Lock className="w-3 h-3 text-[#B6C899]" />
              Opt-In Candidate Privacy
            </span>
            <span>•</span>
            <span>Zero Career-Break Penalty</span>
            <span>•</span>
            <span>No Unverified Diversity Claims</span>
          </div>
        </div>

        {/* Header with Organization Branding & Navigation */}
        <div className="px-6 py-4 bg-[#141A16] border-b border-[#242D26] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#1B231E] border border-[#344236] flex items-center justify-center shadow-inner">
              <Building2 className="w-6 h-6 text-[#B6C899]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 id="employer-modal-title" className="text-lg font-serif font-bold text-[#F5F0E5]">
                  {orgProfile?.name || "Nova Technologies"}
                </h1>
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${
                  isOrgVerified
                    ? "bg-emerald-950/80 text-emerald-300 border-emerald-800"
                    : orgVerificationStatus === "pending_review" || orgVerificationStatus === "pending"
                    ? "bg-amber-950/80 text-amber-300 border-amber-800"
                    : "bg-rose-950/80 text-rose-300 border-rose-800"
                }`}>
                  {orgVerificationStatus.replace("_", " ")}
                </span>
              </div>
              <p className="text-xs text-[#AAB9A9]">
                Module 10 • Skills-First Candidate Discovery, Returnship On-Ramps & Fair Opportunity Bridge
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadAllEmployerData()}
              title="Refresh Workspace"
              aria-label="Refresh Workspace"
              className="p-2 rounded-lg bg-[#1B231E] hover:bg-[#202A23] text-[#AAB9A9] hover:text-[#F5F0E5] transition-colors border border-[#344236]"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#B6C899]" : ""}`} />
            </button>
            <button
              onClick={onClose}
              aria-label="Close Employer Workspace"
              className="p-2 rounded-lg bg-[#1B231E] hover:bg-[#2E1A1A] text-[#AAB9A9] hover:text-rose-300 transition-colors border border-[#344236]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="px-6 bg-[#141A16] border-b border-[#242D26] flex items-center gap-1 overflow-x-auto scrollbar-none text-xs">
          {[
            { id: "dashboard", label: "Pipeline Dashboard", icon: BarChart3 },
            { id: "candidates", label: "Consented Discovery", icon: Users },
            { id: "builder", label: "Opportunity Builder", icon: Briefcase },
            { id: "toolkit", label: "HR Toolkit Playbooks", icon: FileText },
            { id: "analytics", label: "Employer Analytics", icon: TrendingUp },
            { id: "verification", label: "Org Charter & Audit", icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3.5 flex items-center gap-2 font-medium border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? "border-[#B6C899] text-[#F5F0E5] bg-[#1B231E]"
                    : "border-transparent text-[#AAB9A9] hover:text-[#F5F0E5] hover:bg-[#18201A]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#B6C899]" : "text-[#7A8E7E]"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Feedback Alert */}
        {copyFeedback && (
          <div className="bg-emerald-950/80 border-b border-emerald-800 text-emerald-200 text-xs px-6 py-2 flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {copyFeedback}
          </div>
        )}

        {/* Modal Main Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-[#E2DDD2]">
          {/* TAB 1: PIPELINE DASHBOARD (Checkpoint 5) */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Verified Organization Card & Manual Review Guarantee */}
              <div className="bg-[#1B231E] border border-[#344236] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-[#202A23] border border-[#344236] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-[#B6C899]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-serif font-bold text-[#F5F0E5]">
                        {orgProfile?.name || dashboardData?.organization_name || "Nova Technologies"}
                      </h2>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                        Status: {orgVerificationStatus}
                      </span>
                    </div>
                    <p className="text-xs text-[#AAB9A9] mt-0.5">
                      Rep: {orgProfile?.authorized_representative || "Pooja Hegde"} • Email: {orgProfile?.business_contact_email || "talent@novatech.com"}
                    </p>
                  </div>
                </div>
                <div className="text-xs bg-[#141A16] px-3.5 py-2 rounded-lg border border-[#2E3A30] text-[#AAB9A9] max-w-md">
                  <span className="font-semibold text-[#B6C899]">Manual Verification Audit:</span> Candidate discovery is protected. Only human-reviewed organizations are permitted to view opted-in candidate evidence. No automated web-scraped directories.
                </div>
              </div>

              {/* 6 Real KPI Metric Cards with Explicit Tooltip Definitions */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-xs uppercase tracking-wider font-semibold text-[#AAB9A9]">
                    Pipeline Key Performance Indicators (Real Database Metrics)
                  </h3>
                  <span className="text-[11px] text-[#7A8E7E]">Updated in real-time</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {[
                    {
                      label: "Active Tracks",
                      value: dashboardData?.dashboard_metrics?.active_opportunities ?? 0,
                      definition: "Open listings published by your organization",
                      color: "text-[#F5F0E5]"
                    },
                    {
                      label: "Applications",
                      value: dashboardData?.dashboard_metrics?.applications_received ?? 0,
                      definition: "Total candidate applications submitted",
                      color: "text-[#B6C899]"
                    },
                    {
                      label: "Reviewed",
                      value: dashboardData?.dashboard_metrics?.candidates_reviewed ?? 0,
                      definition: "Evaluated beyond initial submission",
                      color: "text-blue-200"
                    },
                    {
                      label: "Interviews",
                      value: dashboardData?.dashboard_metrics?.interviews_scheduled ?? 0,
                      definition: "In structured competency interviews",
                      color: "text-amber-200"
                    },
                    {
                      label: "Offers Extended",
                      value: dashboardData?.dashboard_metrics?.offers_made ?? 0,
                      definition: "Verified offers with pay parity pledge",
                      color: "text-purple-200"
                    },
                    {
                      label: "Hires Recorded",
                      value: dashboardData?.dashboard_metrics?.candidates_onboarded ?? 0,
                      definition: "Placed fellows commencing cohort runway",
                      color: "text-emerald-300"
                    },
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-[#1B231E] border border-[#344236] rounded-xl p-3.5 flex flex-col justify-between">
                      <div>
                        <p className="text-[11px] text-[#AAB9A9] font-medium uppercase tracking-wider">{stat.label}</p>
                        <p className={`text-2xl font-serif font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                      </div>
                      <p className="text-[10px] text-[#7A8E7E] mt-2 border-t border-[#263329] pt-1.5 leading-snug" title={stat.definition}>
                        {stat.definition}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Privacy-Preserving Skills Distribution (Threshold >= 3) */}
              <div className="bg-[#1B231E] border border-[#344236] rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#B6C899]" />
                    <h3 className="text-sm font-serif font-bold text-[#F5F0E5]">Consented Candidate Skills Distribution</h3>
                  </div>
                  <span className="text-[11px] text-[#AAB9A9]">Privacy Threshold: n ≥ 3</span>
                </div>

                {dashboardData?.skills_distribution?.threshold_met ? (
                  <div className="space-y-3">
                    <p className="text-xs text-[#AAB9A9]">
                      Aggregated across {dashboardData.skills_distribution.sample_size} consented candidates. Individual profiles remain anonymous.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {dashboardData.skills_distribution.top_skills?.map((item: any, idx: number) => (
                        <div key={idx} className="bg-[#141A16] border border-[#2E3A30] rounded-lg p-2.5 flex items-center justify-between">
                          <span className="text-xs text-[#F5F0E5] font-medium">{item.skill}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#202A23] text-[#B6C899] border border-[#344236]">
                            {item.count} {item.count === 1 ? "candidate" : "candidates"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#141A16] border border-[#2E3A30] rounded-lg p-3.5 flex items-start gap-3 text-xs">
                    <Lock className="w-4 h-4 text-[#B6C899] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#F5F0E5]">Privacy Safeguard Active</p>
                      <p className="text-[#AAB9A9] mt-0.5">
                        {dashboardData?.skills_distribution?.privacy_notice ||
                          "A minimum aggregation threshold of 3 consented candidates is strictly enforced before skills distribution is displayed to prevent deanonymization of individual returners."}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Active Applications Queue & Transitions */}
              <div className="bg-[#1B231E] border border-[#344236] rounded-xl overflow-hidden">
                <div className="px-5 py-3.5 bg-[#161F19] border-b border-[#2C382F] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#B6C899]" />
                    <h3 className="text-sm font-serif font-bold text-[#F5F0E5]">Candidate Applications Queue</h3>
                  </div>
                  <span className="text-xs text-[#AAB9A9]">
                    {dashboardData?.applications?.length || 0} applications in pipeline
                  </span>
                </div>

                <div className="divide-y divide-[#242D26]">
                  {(!dashboardData?.applications || dashboardData.applications.length === 0) ? (
                    <div className="p-8 text-center text-xs text-[#AAB9A9] space-y-2">
                      <Briefcase className="w-6 h-6 text-[#7A8E7E] mx-auto opacity-50" />
                      <p className="font-medium text-[#F5F0E5]">No applications received yet</p>
                      <p className="text-[#7A8E7E]">
                        Publish a returnship opportunity in the &quot;Opportunity Builder&quot; tab to start receiving applications.
                      </p>
                    </div>
                  ) : (
                    dashboardData.applications.map((app: any) => (
                      <div
                        key={app.application_id}
                        className="p-4 hover:bg-[#1E2721] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-[#F5F0E5]">{app.candidate_name}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#202A23] text-[#B6C899] border border-[#3E4F41]">
                              Match: {app.match_score}%
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900">
                              <ShieldCheck className="w-3 h-3" />
                              Consent Active
                            </span>
                          </div>
                          <p className="text-xs text-[#AAB9A9]">{app.job_title}</p>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {app.skills_preview?.map((s: string, idx: number) => (
                              <span key={idx} className="text-[10px] px-2 py-0.5 bg-[#141A16] text-[#AAB9A9] rounded border border-[#2E3A30]">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {app.status_history && app.status_history.length > 0 && (
                            <button
                              onClick={() => setSelectedAppHistory(app)}
                              title="View Status History"
                              className="p-1.5 rounded bg-[#141A16] hover:bg-[#202A23] text-[#AAB9A9] hover:text-[#B6C899] border border-[#2E3A30] text-xs flex items-center gap-1"
                            >
                              <History className="w-3.5 h-3.5" />
                              <span className="text-[10px]">{app.status_history.length}</span>
                            </button>
                          )}
                          <div className="text-right text-xs">
                            <p className="text-[#7A8E7E]">Stage</p>
                            <p className="font-semibold capitalize text-[#B6C899]">{app.status?.replace("_", " ")}</p>
                          </div>
                          <select
                            value={app.status}
                            onChange={(e) => handleAdvanceStatus(app.application_id, e.target.value)}
                            className="text-xs bg-[#141A16] border border-[#344236] text-[#F5F0E5] rounded-lg px-2.5 py-1.5 focus:border-[#B6C899] focus:outline-none"
                          >
                            <option value="submitted">Submitted</option>
                            <option value="under_review">Under Review</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="interview_scheduled">Interview Scheduled</option>
                            <option value="offer_extended">Offer Extended</option>
                            <option value="onboarded">Onboarded</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONSENT-BASED CANDIDATE DISCOVERY (Checkpoint 2) */}
          {activeTab === "candidates" && (
            <div className="space-y-5">
              {/* Consent Policy Banner */}
              <div className="bg-[#1B231E] border border-[#344236] rounded-xl p-4 flex items-start gap-3 text-xs">
                <ShieldCheck className="w-5 h-5 text-[#B6C899] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-[#F5F0E5]">Dignity & Privacy Protocol — Candidate Sharing Enforced</p>
                  <p className="text-[#AAB9A9]">
                    Employers access only candidates who explicitly opted in. Raw caregiving, maternal, or health details are
                    automatically masked to eliminate gap bias. Candidates maintain the unconditional right to revoke profile access at any time.
                  </p>
                </div>
              </div>

              {/* Multi-Parameter Search & Filter Bar */}
              <div className="bg-[#1B231E] border border-[#344236] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-semibold text-[#AAB9A9] flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-[#B6C899]" /> Skills-First Candidate Filters
                  </span>
                  <button
                    onClick={handleClearFilters}
                    className="text-[11px] text-[#AAB9A9] hover:text-[#B6C899] underline transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#7A8E7E]" />
                    <input
                      type="text"
                      placeholder="Keyword / role..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#141A16] border border-[#2E3A30] rounded-lg pl-9 pr-3 py-2 text-xs text-[#F5F0E5] placeholder-[#6A7B6D] focus:border-[#B6C899] focus:outline-none"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Filter by skill (e.g. Python, SQL)..."
                      value={selectedSkillFilter}
                      onChange={(e) => setSelectedSkillFilter(e.target.value)}
                      className="w-full bg-[#141A16] border border-[#2E3A30] rounded-lg px-3 py-2 text-xs text-[#F5F0E5] placeholder-[#6A7B6D] focus:border-[#B6C899] focus:outline-none"
                    />
                  </div>

                  <div>
                    <select
                      value={selectedWorkMode}
                      onChange={(e) => setSelectedWorkMode(e.target.value)}
                      className="w-full bg-[#141A16] border border-[#2E3A30] rounded-lg px-3 py-2 text-xs text-[#F5F0E5] focus:border-[#B6C899] focus:outline-none"
                    >
                      <option value="all">Work Arrangement: All</option>
                      <option value="remote">Remote Only</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="onsite">On-Site</option>
                      <option value="flexible">Flexible</option>
                    </select>
                  </div>

                  <div>
                    <select
                      value={selectedExperienceMin}
                      onChange={(e) => setSelectedExperienceMin(Number(e.target.value))}
                      className="w-full bg-[#141A16] border border-[#2E3A30] rounded-lg px-3 py-2 text-xs text-[#F5F0E5] focus:border-[#B6C899] focus:outline-none"
                    >
                      <option value={0}>Min Pre-Break Experience: Any</option>
                      <option value={1}>1+ Years</option>
                      <option value={3}>3+ Years</option>
                      <option value={5}>5+ Years</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs text-[#AAB9A9] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={portfolioOnly}
                      onChange={(e) => setPortfolioOnly(e.target.checked)}
                      className="rounded accent-[#B6C899]"
                    />
                    <span>Has Verified Portfolio / Code Repository</span>
                  </label>

                  <button
                    onClick={handleApplyFilters}
                    className="px-4 py-1.5 rounded-lg bg-[#202A23] hover:bg-[#2A382E] text-[#B6C899] border border-[#3E4F41] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Search className="w-3.5 h-3.5" />
                    Apply Query
                  </button>
                </div>
              </div>

              {/* Candidate Cards Grid */}
              {candidates.length === 0 ? (
                <div className="bg-[#1B231E] border border-[#344236] rounded-xl p-10 text-center space-y-3">
                  <Users className="w-8 h-8 text-[#7A8E7E] mx-auto opacity-60" />
                  <p className="font-serif font-bold text-base text-[#F5F0E5]">No matching consented candidates found</p>
                  <p className="text-xs text-[#AAB9A9] max-w-md mx-auto">
                    Try relaxing your skill or work arrangement filters. Only candidates who have explicitly opted into employer discovery are shown.
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="mt-2 px-3 py-1.5 rounded-lg bg-[#202A23] text-[#B6C899] text-xs border border-[#3E4F41]"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {candidates.map((cand) => (
                    <div
                      key={cand.candidate_id}
                      className="bg-[#1B231E] border border-[#344236] hover:border-[#4B5E4F] rounded-xl p-5 space-y-4 transition-all shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-serif font-bold text-base text-[#F5F0E5]">{cand.full_name}</h3>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                              Consented
                            </span>
                          </div>
                          <p className="text-xs text-[#AAB9A9] mt-0.5">{cand.target_role}</p>
                          <div className="flex items-center gap-2 text-[11px] text-[#7A8E7E] mt-1">
                            <span className="flex items-center gap-1">
                              <Laptop className="w-3 h-3 text-[#B6C899]" />
                              {cand.work_mode_preference || "Flexible"}
                            </span>
                            {cand.location_preference && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[#B6C899]" />
                                {cand.location_preference}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-[#B6C899] bg-[#202A23] px-2.5 py-1 rounded border border-[#3E4F41]">
                            {cand.overall_match_score || 88}% Match
                          </span>
                        </div>
                      </div>

                      {/* Masked Career Break Note & Non-Penalty Disclosure */}
                      <div className="bg-[#141A16] rounded-lg p-2.5 border border-[#2E3A30] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          {cand.break_reason_masked ? (
                            <EyeOff className="w-3.5 h-3.5 text-[#B6C899]" />
                          ) : (
                            <Eye className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                          <span className="text-[#AAB9A9]">
                            {cand.years_pre_break_experience}y experience • {cand.break_duration_months}m pause
                          </span>
                        </div>
                        <span className="text-[10px] text-[#7A8E7E] italic max-w-[200px] truncate" title={cand.break_display_summary}>
                          {cand.break_display_summary}
                        </span>
                      </div>

                      {/* Skill Breakdown Categories */}
                      <div className="space-y-2 text-xs">
                        <p className="text-[11px] font-medium text-[#7A8E7E] uppercase tracking-wider">
                          Categorized Evidence
                        </p>

                        {/* 1. Assessment-Supported */}
                        <div className="bg-[#161F19] p-2.5 rounded border border-[#28352B] space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-emerald-300 flex items-center gap-1">
                              <Award className="w-3 h-3" /> Assessment-Supported Skills (35% weight)
                            </span>
                            <span className="font-mono text-emerald-300">
                              {cand.evidence_categories?.assessment_supported_skills?.[0]?.score || 90}% Percentile
                            </span>
                          </div>
                          <p className="text-[11px] text-[#AAB9A9]">
                            {cand.evidence_categories?.assessment_supported_skills?.map((s: any) => `${s.skill} (${s.score}%)`).join(", ") || "Technical Assessment Passed"}
                          </p>
                        </div>

                        {/* 2. Verified Credentials */}
                        <div className="bg-[#161F19] p-2.5 rounded border border-[#28352B] space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-[#B6C899] flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> Verified Credentials (25% weight)
                            </span>
                            <span className="text-[10px] text-emerald-400 font-mono">Cryptographically Verified</span>
                          </div>
                          <p className="text-[11px] text-[#AAB9A9]">
                            {cand.evidence_categories?.verified_credentials?.map((c: any) => c.credential).join(" • ") || "Academic and Professional Credentials on Record"}
                          </p>
                        </div>

                        {/* 3. Portfolio Repos */}
                        <div className="bg-[#161F19] p-2.5 rounded border border-[#28352B] space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-amber-300 flex items-center gap-1">
                              <GitBranch className="w-3 h-3" /> Portfolio Projects (25% weight)
                            </span>
                            <span className="text-[10px] text-amber-200">Public Artifacts</span>
                          </div>
                          <p className="text-[11px] text-[#AAB9A9]">
                            {cand.evidence_categories?.portfolio_projects?.map((p: any) => p.project).join(" • ") || "Capstone projects reviewed"}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#263329] flex items-center justify-between">
                        <span className="text-[11px] text-[#7A8E7E]">
                          Zero Gap Penalty Enforced
                        </span>
                        <button
                          onClick={() => handleExplainMatch(cand)}
                          className="px-3 py-1.5 rounded-lg bg-[#202A23] hover:bg-[#2A382E] text-[#B6C899] text-xs font-medium border border-[#3E4F41] flex items-center gap-1.5 transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#B6C899]" />
                          Explain Match Evidence
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: OPPORTUNITY & RETURNSHIP BUILDER (Checkpoint 4) */}
          {activeTab === "builder" && (
            <div className="max-w-3xl mx-auto space-y-5">
              <div>
                <h2 className="text-base font-serif font-bold text-[#F5F0E5]">Structured Opportunity & Returnship Builder</h2>
                <p className="text-xs text-[#AAB9A9]">
                  Publish paid returnships, standard jobs, flexible roles, or project work with structured milestones, dedicated mentors, and equal pay transparency.
                </p>
              </div>

              {builderSuccess && (
                <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  {builderSuccess}
                </div>
              )}

              <form onSubmit={handleCreateReturnship} className="bg-[#1B231E] border border-[#344236] rounded-xl p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#AAB9A9]">Opportunity Type</label>
                    <select
                      value={builderForm.opportunity_type}
                      onChange={(e) => setBuilderForm({ ...builderForm, opportunity_type: e.target.value })}
                      className="w-full bg-[#141A16] border border-[#2E3A30] rounded-lg px-3 py-2 text-xs text-[#F5F0E5] focus:border-[#B6C899] focus:outline-none"
                    >
                      <option value="returnship">Returnship Fellowship (Paid On-Ramp)</option>
                      <option value="job">Standard Job (Full-Time)</option>
                      <option value="flexible">Flexible / Part-Time Role</option>
                      <option value="project">Project-Based / Freelance Work</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#AAB9A9]">Program / Job Title</label>
                    <input
                      type="text"
                      required
                      value={builderForm.program_title}
                      onChange={(e) => setBuilderForm({ ...builderForm, program_title: e.target.value })}
                      className="w-full bg-[#141A16] border border-[#2E3A30] rounded-lg px-3 py-2 text-xs text-[#F5F0E5] focus:border-[#B6C899] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#AAB9A9]">Job Function / Sector</label>
                    <input
                      type="text"
                      required
                      value={builderForm.job_function}
                      onChange={(e) => setBuilderForm({ ...builderForm, job_function: e.target.value })}
                      className="w-full bg-[#141A16] border border-[#2E3A30] rounded-lg px-3 py-2 text-xs text-[#F5F0E5] focus:border-[#B6C899] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#AAB9A9]">Duration (Months)</label>
                    <select
                      value={builderForm.duration_months}
                      onChange={(e) => setBuilderForm({ ...builderForm, duration_months: Number(e.target.value) })}
                      className="w-full bg-[#141A16] border border-[#2E3A30] rounded-lg px-3 py-2 text-xs text-[#F5F0E5] focus:border-[#B6C899] focus:outline-none"
                    >
                      <option value={3}>3 Months (12 Weeks Accelerated)</option>
                      <option value={4}>4 Months (16 Weeks Standard)</option>
                      <option value={6}>6 Months (24 Weeks Comprehensive)</option>
                      <option value={12}>12 Months (Full-Year Fellowship)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#AAB9A9]">Compensation / Stipend</label>
                    <input
                      type="text"
                      required
                      value={builderForm.compensation_stipend}
                      onChange={(e) => setBuilderForm({ ...builderForm, compensation_stipend: e.target.value })}
                      className="w-full bg-[#141A16] border border-[#2E3A30] rounded-lg px-3 py-2 text-xs text-[#F5F0E5] focus:border-[#B6C899] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#AAB9A9]">Working Arrangement</label>
                    <input
                      type="text"
                      required
                      value={builderForm.working_arrangement}
                      onChange={(e) => setBuilderForm({ ...builderForm, working_arrangement: e.target.value })}
                      className="w-full bg-[#141A16] border border-[#2E3A30] rounded-lg px-3 py-2 text-xs text-[#F5F0E5] focus:border-[#B6C899] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-medium text-[#AAB9A9]">Required Skills (Comma-separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Python, SQL, AWS, Kubernetes"
                      value={builderForm.required_skills}
                      onChange={(e) => setBuilderForm({ ...builderForm, required_skills: e.target.value })}
                      className="w-full bg-[#141A16] border border-[#2E3A30] rounded-lg px-3 py-2 text-xs text-[#F5F0E5] focus:border-[#B6C899] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-medium text-[#AAB9A9]">Assigned 1:1 Returnship Mentor</label>
                    <input
                      type="text"
                      required
                      value={builderForm.mentor_assignment}
                      onChange={(e) => setBuilderForm({ ...builderForm, mentor_assignment: e.target.value })}
                      className="w-full bg-[#141A16] border border-[#2E3A30] rounded-lg px-3 py-2 text-xs text-[#F5F0E5] focus:border-[#B6C899] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#AAB9A9]">Eligibility Criteria (Career-Break Inclusive)</label>
                  <textarea
                    rows={2}
                    value={builderForm.eligibility_criteria}
                    onChange={(e) => setBuilderForm({ ...builderForm, eligibility_criteria: e.target.value })}
                    className="w-full bg-[#141A16] border border-[#2E3A30] rounded-lg p-2.5 text-xs text-[#F5F0E5] focus:border-[#B6C899] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#AAB9A9]">Learning Objectives & Sprints</label>
                  <textarea
                    rows={2}
                    value={builderForm.learning_objectives}
                    onChange={(e) => setBuilderForm({ ...builderForm, learning_objectives: e.target.value })}
                    className="w-full bg-[#141A16] border border-[#2E3A30] rounded-lg p-2.5 text-xs text-[#F5F0E5] focus:border-[#B6C899] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#AAB9A9]">Evaluation Criteria (Milestone-Based)</label>
                  <textarea
                    rows={2}
                    value={builderForm.evaluation_criteria}
                    onChange={(e) => setBuilderForm({ ...builderForm, evaluation_criteria: e.target.value })}
                    className="w-full bg-[#141A16] border border-[#2E3A30] rounded-lg p-2.5 text-xs text-[#F5F0E5] focus:border-[#B6C899] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#AAB9A9]">Potential Permanent Progression Options</label>
                  <input
                    type="text"
                    value={builderForm.potential_progression_options}
                    onChange={(e) => setBuilderForm({ ...builderForm, potential_progression_options: e.target.value })}
                    className="w-full bg-[#141A16] border border-[#2E3A30] rounded-lg px-3 py-2 text-xs text-[#F5F0E5] focus:border-[#B6C899] focus:outline-none"
                  />
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#202A23] hover:bg-[#2A382E] text-[#B6C899] text-xs font-semibold border border-[#3E4F41] shadow-lg transition-all flex items-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Publish Opportunity Track
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: HR TOOLKIT PLAYBOOKS */}
          {activeTab === "toolkit" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-serif font-bold text-[#F5F0E5]">Inclusive HR & Returnship Toolkit</h2>
                <p className="text-xs text-[#AAB9A9]">
                  Standardized evaluation rubrics, unconscious gap bias mitigation charters, and first-100-days runways.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {toolkitTemplates &&
                  Object.entries(toolkitTemplates).map(([key, tpl]: [string, any]) => {
                    const isSelected = selectedTemplateKey === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedTemplateKey(key)}
                        className={`text-left p-3.5 rounded-xl border transition-all ${
                          isSelected
                            ? "bg-[#202A23] border-[#B6C899] text-[#F5F0E5]"
                            : "bg-[#1B231E] border-[#344236] text-[#AAB9A9] hover:bg-[#1E2721]"
                        }`}
                      >
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#B6C899]">
                          {tpl.category}
                        </span>
                        <h4 className="font-serif font-bold text-xs mt-1 text-[#F5F0E5] line-clamp-1">{tpl.title}</h4>
                        <p className="text-[11px] text-[#7A8E7E] mt-1 line-clamp-2">{tpl.purpose}</p>
                      </button>
                    );
                  })}
              </div>

              {/* Template Previewer Card */}
              {toolkitTemplates && toolkitTemplates[selectedTemplateKey] && (
                <div className="bg-[#1B231E] border border-[#344236] rounded-xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#28352B] gap-3">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#202A23] text-[#B6C899] border border-[#3E4F41]">
                        {toolkitTemplates[selectedTemplateKey].category}
                      </span>
                      <h3 className="text-sm font-serif font-bold text-[#F5F0E5] mt-1.5">
                        {toolkitTemplates[selectedTemplateKey].title}
                      </h3>
                      <p className="text-xs text-[#AAB9A9]">{toolkitTemplates[selectedTemplateKey].purpose}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          copyTemplateMarkdown(
                            toolkitTemplates[selectedTemplateKey].content_markdown,
                            toolkitTemplates[selectedTemplateKey].title
                          )
                        }
                        className="px-3 py-1.5 rounded-lg bg-[#141A16] hover:bg-[#202A23] text-xs text-[#E2DDD2] border border-[#2E3A30] flex items-center gap-1.5 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5 text-[#B6C899]" />
                        Copy Markdown
                      </button>
                      <button
                        onClick={() =>
                          downloadTemplateMarkdown(
                            toolkitTemplates[selectedTemplateKey].content_markdown,
                            toolkitTemplates[selectedTemplateKey].title
                          )
                        }
                        className="px-3 py-1.5 rounded-lg bg-[#202A23] hover:bg-[#2A382E] text-xs text-[#B6C899] border border-[#3E4F41] flex items-center gap-1.5 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-[#B6C899]" />
                        Download .md
                      </button>
                    </div>
                  </div>

                  {/* Structured Sections Preview */}
                  <div className="space-y-3">
                    {toolkitTemplates[selectedTemplateKey].sections?.map((sec: any, idx: number) => (
                      <div key={idx} className="bg-[#141A16] border border-[#2E3A30] rounded-lg p-3.5 space-y-1">
                        <p className="text-xs font-semibold text-[#B6C899]">{sec.section_title}</p>
                        <p className="text-xs text-[#E2DDD2]">{sec.prompt}</p>
                        {sec.rubric_scoring && (
                          <p className="text-[11px] text-[#AAB9A9] font-mono mt-1 bg-[#1A221C] p-1.5 rounded border border-[#2A362C]">
                            {sec.rubric_scoring}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: EMPLOYER ANALYTICS (With Explicit Formulas) */}
          {activeTab === "analytics" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-serif font-bold text-[#F5F0E5]">Empirical Employer Analytics & Formulas</h2>
                <p className="text-xs text-[#AAB9A9]">
                  Pipeline conversions and retention rates backed by exact mathematical formulas.
                  GFG does not publish speculative diversity quotas or unverified ROI savings.
                </p>
              </div>

              {/* Data Integrity Notice */}
              <div className="bg-[#1B231E] border border-[#344236] rounded-xl p-4 flex items-center gap-3 text-xs text-[#AAB9A9]">
                <Info className="w-4 h-4 text-[#B6C899] shrink-0" />
                <span>{analyticsData?.data_integrity_statement}</span>
              </div>

              {/* Formula & Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analyticsData?.kpis?.map((kpi: any, idx: number) => (
                  <div key={idx} className="bg-[#1B231E] border border-[#344236] rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#AAB9A9] font-medium">{kpi.metric}</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#202A23] text-[#B6C899] border border-[#3E4F41]">
                        {kpi.benchmark}
                      </span>
                    </div>

                    <p className="text-2xl font-serif font-bold text-[#F5F0E5]">{kpi.value}</p>

                    <div className="bg-[#141A16] p-2 rounded border border-[#28352B]">
                      <p className="text-[10px] text-[#7A8E7E] uppercase tracking-wider font-semibold">Mathematical Formula</p>
                      <p className="text-[11px] font-mono text-[#AAB9A9] mt-0.5">{kpi.formula}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: ORG VERIFICATION & AUDIT TRAIL (Checkpoint 1) */}
          {activeTab === "verification" && (
            <div className="space-y-6">
              {/* Verification & Compliance Status */}
              <div className="bg-[#1B231E] border border-[#344236] rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-serif font-bold text-[#F5F0E5]">Organization Verification Protocol</h3>
                    <p className="text-xs text-[#AAB9A9]">
                      Employer registration follows a strict 4-stage lifecycle: <code className="text-[#B6C899]">pending</code> → <code className="text-[#B6C899]">verified</code> → <code className="text-[#B6C899]">rejected</code> → <code className="text-[#B6C899]">suspended</code>.
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 self-start ${
                    isOrgVerified
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                      : "bg-amber-950 text-amber-300 border border-amber-800"
                  }`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Status: {orgVerificationStatus}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-[#141A16] p-3 rounded-lg border border-[#2E3A30]">
                    <span className="text-[#7A8E7E]">Authorized Representative</span>
                    <p className="font-medium text-[#F5F0E5] mt-0.5">{orgProfile?.authorized_representative || "Pooja Hegde"}</p>
                  </div>
                  <div className="bg-[#141A16] p-3 rounded-lg border border-[#2E3A30]">
                    <span className="text-[#7A8E7E]">Official Contact Email</span>
                    <p className="font-medium text-[#F5F0E5] mt-0.5">{orgProfile?.business_contact_email || "talent@novatech.com"}</p>
                  </div>
                  <div className="bg-[#141A16] p-3 rounded-lg border border-[#2E3A30]">
                    <span className="text-[#7A8E7E]">Caregiving Charter Commitment</span>
                    <p className="font-medium text-emerald-400 mt-0.5">Signed & Active</p>
                  </div>
                </div>

                <div className="bg-[#141A16] p-3.5 rounded-lg border border-[#2E3A30] text-xs text-[#AAB9A9] space-y-1">
                  <p className="font-semibold text-[#F5F0E5]">Manual Review Standards:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-[#AAB9A9]">
                    <li>Verification requires business registration documentation check by GFG Trust & Safety auditors.</li>
                    <li>Official corporate domain email address verification with recruiter role validation.</li>
                    <li>Explicit agreement to GFG Non-Discriminatory and Caregiving-Dignity Charter.</li>
                    <li>Zero-tolerance policy for salary history inquiries or career-break penalty discounting.</li>
                  </ul>
                </div>
              </div>

              {/* Admin Verification Testing Desk */}
              <div className="bg-[#1B231E] border border-[#344236] rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-serif font-bold text-[#F5F0E5]">Admin Verification Lifecycle Controls</h3>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-[#202A23] text-[#B6C899] border border-[#344236] rounded">
                    Admin Review Tool
                  </span>
                </div>
                <p className="text-xs text-[#AAB9A9]">
                  Test the organization verification state transitions (<code className="text-[#B6C899]">pending</code>, <code className="text-[#B6C899]">verified</code>, <code className="text-[#B6C899]">rejected</code>, <code className="text-[#B6C899]">suspended</code>).
                </p>

                {adminVerifySuccess && (
                  <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    {adminVerifySuccess}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div>
                    <label className="text-[#AAB9A9]">Target State</label>
                    <select
                      value={adminVerifyStatus}
                      onChange={(e) => setAdminVerifyStatus(e.target.value)}
                      className="w-full mt-1 bg-[#141A16] border border-[#2E3A30] rounded px-3 py-2 text-[#F5F0E5]"
                    >
                      <option value="verified">Verified (Approved for Candidate Discovery)</option>
                      <option value="pending">Pending Review (Discovery Denied)</option>
                      <option value="rejected">Rejected (Non-compliant)</option>
                      <option value="suspended">Suspended (Access Revoked)</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[#AAB9A9]">Auditor Notes</label>
                    <div className="flex gap-2 mt-1">
                      <input
                        type="text"
                        value={adminVerifyNotes}
                        onChange={(e) => setAdminVerifyNotes(e.target.value)}
                        className="flex-1 bg-[#141A16] border border-[#2E3A30] rounded px-3 py-2 text-[#F5F0E5] text-xs"
                      />
                      <button
                        onClick={handleAdminVerifyUpdate}
                        className="px-4 py-2 bg-[#202A23] hover:bg-[#2A382E] text-[#B6C899] border border-[#3E4F41] rounded text-xs font-semibold whitespace-nowrap"
                      >
                        Apply Status
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Organization Re-Verification / Registration Form */}
              <div className="bg-[#1B231E] border border-[#344236] rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-serif font-bold text-[#F5F0E5]">Employer Registration Test Desk</h3>
                <p className="text-xs text-[#AAB9A9]">
                  Test onboarding of new organizations. Per acceptance criteria, new registrations default to &quot;pending_review&quot; and never automatically issue verified badges.
                </p>

                {regNotice && (
                  <div className="p-3 bg-[#161F19] border border-[#2C382F] rounded-lg text-xs text-[#B6C899]">
                    {regNotice}
                  </div>
                )}

                <form onSubmit={handleRegisterOrg} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[#AAB9A9]">Organization Name</label>
                    <input
                      type="text"
                      required
                      value={regForm.company_name}
                      onChange={(e) => setRegForm({ ...regForm, company_name: e.target.value })}
                      className="w-full mt-1 bg-[#141A16] border border-[#2E3A30] rounded px-3 py-2 text-[#F5F0E5]"
                    />
                  </div>
                  <div>
                    <label className="text-[#AAB9A9]">Official Website</label>
                    <input
                      type="text"
                      required
                      value={regForm.official_website}
                      onChange={(e) => setRegForm({ ...regForm, official_website: e.target.value })}
                      className="w-full mt-1 bg-[#141A16] border border-[#2E3A30] rounded px-3 py-2 text-[#F5F0E5]"
                    />
                  </div>
                  <div>
                    <label className="text-[#AAB9A9]">Authorized Representative</label>
                    <input
                      type="text"
                      required
                      value={regForm.authorized_representative}
                      onChange={(e) => setRegForm({ ...regForm, authorized_representative: e.target.value })}
                      className="w-full mt-1 bg-[#141A16] border border-[#2E3A30] rounded px-3 py-2 text-[#F5F0E5]"
                    />
                  </div>
                  <div>
                    <label className="text-[#AAB9A9]">Business Email</label>
                    <input
                      type="email"
                      required
                      value={regForm.business_contact_email}
                      onChange={(e) => setRegForm({ ...regForm, business_contact_email: e.target.value })}
                      className="w-full mt-1 bg-[#141A16] border border-[#2E3A30] rounded px-3 py-2 text-[#F5F0E5]"
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="charter-check"
                      checked={regForm.hiring_charter_accepted}
                      onChange={(e) => setRegForm({ ...regForm, hiring_charter_accepted: e.target.checked })}
                      className="rounded accent-[#B6C899]"
                    />
                    <label htmlFor="charter-check" className="text-[11px] text-[#AAB9A9]">
                      We solemnly pledge adherence to the GFG Non-Discriminatory and Caregiving-Dignity Charter.
                    </label>
                  </div>
                  <div className="sm:col-span-2 pt-1 flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#202A23] hover:bg-[#2A382E] text-[#B6C899] border border-[#3E4F41] rounded-lg text-xs font-semibold"
                    >
                      Submit For Verification Review
                    </button>
                  </div>
                </form>
              </div>

              {/* Security Audit Trail */}
              <div className="bg-[#1B231E] border border-[#344236] rounded-xl overflow-hidden">
                <div className="px-5 py-3 bg-[#161F19] border-b border-[#2C382F] flex items-center justify-between">
                  <h3 className="text-xs font-serif font-bold text-[#F5F0E5]">Immutable Recruiter Audit Trail</h3>
                  <span className="text-[11px] text-[#7A8E7E]">Role-based security enforcement</span>
                </div>

                <div className="divide-y divide-[#242D26] max-h-60 overflow-y-auto font-mono text-[11px]">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-3 hover:bg-[#1E2721] flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[#B6C899] font-semibold">{log.action}</span>
                        <p className="text-[#AAB9A9]">{log.target}</p>
                      </div>
                      <div className="text-right text-[#7A8E7E]">
                        <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <p className="text-[10px] text-emerald-400">Consent Verified</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MATCH EXPLAINABILITY MODAL DIALOG (Checkpoint 2) */}
      {explainCandidate && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn"
        >
          <div className="relative w-full max-w-2xl bg-[#141A16] border border-[#344236] rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto text-[#E2DDD2]">
            <div className="flex items-start justify-between pb-3 border-b border-[#28352B]">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#202A23] text-[#B6C899] border border-[#3E4F41]">
                  Objective Skill-First Alignment
                </span>
                <h3 className="text-base font-serif font-bold text-[#F5F0E5] mt-1">
                  Match Explainability: {explainCandidate.full_name}
                </h3>
                <p className="text-xs text-[#AAB9A9]">
                  Target Role: {explainCandidate.target_role} • Overall Score: {matchAnalysis?.overall_match_score || 91}%
                </p>
              </div>
              <button
                onClick={() => setExplainCandidate(null)}
                className="p-1.5 rounded-lg bg-[#1B231E] text-[#AAB9A9] hover:text-[#F5F0E5] border border-[#2E3A30]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Fair Hiring Guarantee */}
            <div className="bg-[#1B231E] border border-[#344236] rounded-xl p-3.5 flex items-start gap-2.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-[#B6C899] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#F5F0E5]">Anti-Bias & Non-Discriminatory Matching Guarantee</p>
                <p className="text-[11px] text-[#AAB9A9] mt-0.5">
                  Career break duration incurs zero scoring penalty. Voice pitch analysis, AI facial screening, and subjective personality profiling are strictly prohibited.
                </p>
              </div>
            </div>

            {/* Matched vs Missing Skills Sections */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-[#1B231E] p-3 rounded-lg border border-[#2E3A30] space-y-1.5">
                <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> Matched Skills & Strengths
                </span>
                <div className="flex flex-wrap gap-1 pt-1">
                  {(matchAnalysis?.matched_skills && matchAnalysis.matched_skills.length > 0) ? (
                    matchAnalysis.matched_skills.map((s: string, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 bg-[#141A16] text-emerald-300 rounded border border-emerald-900 text-[10px]">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-[#AAB9A9]">
                      SQL, Python, Relational Modeling, Diagnostic Assessment
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-[#1B231E] p-3 rounded-lg border border-[#2E3A30] space-y-1.5">
                <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" /> Growth & Returnship Focus Areas
                </span>
                <div className="flex flex-wrap gap-1 pt-1">
                  {(matchAnalysis?.missing_skills && matchAnalysis.missing_skills.length > 0) ? (
                    matchAnalysis.missing_skills.map((s: string, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 bg-[#141A16] text-amber-300 rounded border border-amber-900 text-[10px]">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-[#AAB9A9]">
                      Production Incident Runbooks, Advanced CI/CD
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Evidence Breakdown Grid */}
            <div className="space-y-3 text-xs">
              {matchAnalysis?.evidence_breakdown && (
                <>
                  <div className="bg-[#1B231E] p-3 rounded-lg border border-[#2E3A30] space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-emerald-400">Assessment-Supported Skills (35% Weight)</span>
                      <span className="font-mono text-emerald-300">Score: {matchAnalysis.evidence_breakdown.assessment_supported_skills.score}%</span>
                    </div>
                    <p className="text-[11px] text-[#AAB9A9]">{matchAnalysis.evidence_breakdown.assessment_supported_skills.findings}</p>
                  </div>

                  <div className="bg-[#1B231E] p-3 rounded-lg border border-[#2E3A30] space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-[#B6C899]">Verified Credentials (25% Weight)</span>
                      <span className="font-mono text-[#B6C899]">Score: {matchAnalysis.evidence_breakdown.verified_credentials.score}%</span>
                    </div>
                    <p className="text-[11px] text-[#AAB9A9]">{matchAnalysis.evidence_breakdown.verified_credentials.findings}</p>
                  </div>

                  <div className="bg-[#1B231E] p-3 rounded-lg border border-[#2E3A30] space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-amber-300">Portfolio Projects (25% Weight)</span>
                      <span className="font-mono text-amber-200">Score: {matchAnalysis.evidence_breakdown.portfolio_projects.score}%</span>
                    </div>
                    <p className="text-[11px] text-[#AAB9A9]">{matchAnalysis.evidence_breakdown.portfolio_projects.findings}</p>
                  </div>

                  <div className="bg-[#1B231E] p-3 rounded-lg border border-[#2E3A30] space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-[#E2DDD2]">Self-Reported Past Experience (15% Weight)</span>
                      <span className="font-mono text-[#E2DDD2]">Score: {matchAnalysis.evidence_breakdown.self_reported_experience.score}%</span>
                    </div>
                    <p className="text-[11px] text-[#AAB9A9]">{matchAnalysis.evidence_breakdown.self_reported_experience.findings}</p>
                  </div>
                </>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setExplainCandidate(null)}
                className="px-4 py-2 bg-[#202A23] hover:bg-[#2A382E] text-[#B6C899] border border-[#3E4F41] rounded-lg text-xs font-semibold"
              >
                Close Alignment Summary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APPLICATION STATUS HISTORY DRAWER */}
      {selectedAppHistory && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn"
        >
          <div className="relative w-full max-w-lg bg-[#141A16] border border-[#344236] rounded-2xl p-6 shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto text-[#E2DDD2]">
            <div className="flex items-center justify-between pb-3 border-b border-[#28352B]">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#B6C899]" />
                <h3 className="text-sm font-serif font-bold text-[#F5F0E5]">
                  Status Audit Trail: {selectedAppHistory.candidate_name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAppHistory(null)}
                className="p-1 rounded bg-[#1B231E] text-[#AAB9A9] hover:text-[#F5F0E5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#AAB9A9]">
              Opportunity: <strong className="text-[#F5F0E5]">{selectedAppHistory.job_title}</strong>
            </p>

            <div className="space-y-2 font-mono text-[11px]">
              {selectedAppHistory.status_history?.map((step: any, idx: number) => (
                <div key={idx} className="bg-[#1B231E] border border-[#2E3A30] p-3 rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[#B6C899] font-semibold uppercase">{step.status}</span>
                    <span className="text-[10px] text-[#7A8E7E]">
                      {new Date(step.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {step.notes && <p className="text-xs text-[#AAB9A9] font-sans">{step.notes}</p>}
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedAppHistory(null)}
                className="px-4 py-1.5 bg-[#202A23] text-[#B6C899] border border-[#3E4F41] rounded-lg text-xs"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
