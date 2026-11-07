"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  Award,
  CheckCircle2,
  Circle,
  ExternalLink,
  Shield,
  Heart,
  TrendingUp,
  Plus,
  Calendar,
  Lock,
  ArrowRight,
  HelpCircle,
  BookmarkCheck,
  AlertCircle,
  MessageSquare,
  FileCheck,
  Target,
  Users,
  Compass,
} from "lucide-react";
import { personalizationApi, ConfidenceGoal, ConfidenceCheckIn } from "@/lib/api";

interface ConfidenceRebuildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewPassport?: () => void;
}

export function ConfidenceRebuildModal({
  isOpen,
  onClose,
  onViewPassport,
}: ConfidenceRebuildModalProps) {
  const [activeTab, setActiveTab] = useState<"milestones" | "checkin">("milestones");
  const [goals, setGoals] = useState<ConfidenceGoal[]>([]);
  const [checkIns, setCheckIns] = useState<ConfidenceCheckIn[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Milestone completion state
  const [completingGoal, setCompletingGoal] = useState<ConfidenceGoal | null>(null);
  const [evidenceUrl, setEvidenceUrl] = useState<string>("");
  const [userReflection, setUserReflection] = useState<string>("");
  const [shareOnPassport, setShareOnPassport] = useState<boolean>(true);
  const [submittingCompletion, setSubmittingCompletion] = useState<boolean>(false);

  // New Goal modal
  const [showAddGoal, setShowAddGoal] = useState<boolean>(false);
  const [newGoalTitle, setNewGoalTitle] = useState<string>("");
  const [newGoalDescription, setNewGoalDescription] = useState<string>("");
  const [newGoalCategory, setNewGoalCategory] = useState<string>("skill_action");
  const [newGoalActionPlan, setNewGoalActionPlan] = useState<string>("");

  // Check-in state
  const [checkInScore, setCheckInScore] = useState<number>(4);
  const [checkInReflection, setCheckInReflection] = useState<string>("");
  const [checkInStrengths, setCheckInStrengths] = useState<string>("");
  const [submittingCheckIn, setSubmittingCheckIn] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [goalsRes, checkInsRes] = await Promise.all([
        personalizationApi.getConfidenceGoals(),
        personalizationApi.getConfidenceCheckIns(),
      ]);
      setGoals(goalsRes || []);
      setCheckIns(checkInsRes || []);
    } catch (err: any) {
      console.warn("Using offline fallback for confidence goals", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      queueMicrotask(() => {
        void loadData();
      });
    }
  }, [isOpen]);

  const handleOpenCompleteModal = (goal: ConfidenceGoal) => {
    setCompletingGoal(goal);
    setEvidenceUrl(goal.demonstrable_evidence_url || "");
    setUserReflection(goal.user_reflection || "");
    setShareOnPassport(goal.share_on_passport ?? true);
  };

  const handleSaveCompletion = async () => {
    if (!completingGoal) return;
    setSubmittingCompletion(true);
    try {
      const updated = await personalizationApi.updateConfidenceGoal(completingGoal.id, {
        is_completed: true,
        demonstrable_evidence_url: evidenceUrl,
        user_reflection: userReflection,
        share_on_passport: shareOnPassport,
      });

      setGoals((prev) => prev.map((g) => (g.id === completingGoal.id ? updated : g)));
      setStatusMessage({
        type: "success",
        text: "Milestone completed! Actionable feedback and growth reflection recorded.",
      });
      setCompletingGoal(null);
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to update milestone." });
    } finally {
      setSubmittingCompletion(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleCreateCustomGoal = async () => {
    if (!newGoalTitle.trim()) {
      alert("Please provide a milestone title.");
      return;
    }
    try {
      const created = await personalizationApi.createConfidenceGoal({
        title: newGoalTitle,
        description: newGoalDescription,
        category: newGoalCategory,
        action_plan: newGoalActionPlan,
        is_milestone: true,
        share_on_passport: true,
      });
      setGoals((prev) => [created, ...prev]);
      setShowAddGoal(false);
      setNewGoalTitle("");
      setNewGoalDescription("");
      setNewGoalActionPlan("");
      setStatusMessage({ type: "success", text: "New milestone goal added to your journal." });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to create milestone." });
    } finally {
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleSubmitCheckIn = async () => {
    setSubmittingCheckIn(true);
    try {
      const created = await personalizationApi.createConfidenceCheckIn({
        score: checkInScore,
        reflection: checkInReflection,
        noted_strengths: checkInStrengths,
      });
      setCheckIns((prev) => [created, ...prev]);
      setCheckInReflection("");
      setCheckInStrengths("");
      setStatusMessage({
        type: "success",
        text: "Weekly growth check-in saved privately in your personal journal.",
      });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to save check-in." });
    } finally {
      setSubmittingCheckIn(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  if (!isOpen) return null;

  const completedCount = goals.filter((g) => g.is_completed).length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confidence-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0B0F0D]/90 backdrop-blur-xl backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl bg-[#1B231E] border border-[#344236] rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-[#F5F0E5] font-sans">
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-[#344236] flex flex-wrap items-center justify-between gap-3 bg-[#111714]">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B6C899] shadow-[0_0_8px_rgba(182,200,153,0.6)]" />
            <span className="text-xs font-mono tracking-wider uppercase text-[#B6C899] font-semibold">
              CONFIDENCE & ACTION JOURNAL
            </span>
            <span className="text-[11px] text-[#AAB9A9] border border-[#344236] px-2 py-0.5 rounded-full bg-[#202A23]">
              Personal Growth
            </span>
          </div>

          <div className="flex items-center gap-4">
            {onViewPassport && (
              <button
                type="button"
                onClick={onViewPassport}
                className="inline-flex items-center gap-1.5 text-xs text-[#B6C899] hover:text-[#F5F0E5] font-semibold transition-colors"
              >
                <Award className="w-3.5 h-3.5" />
                <span>View Career Passport</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#AAB9A9] hover:text-[#F5F0E5] hover:bg-[#202A23] transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="px-6 border-b border-[#344236] flex items-center gap-6 bg-[#111714] text-xs font-medium">
          <button
            onClick={() => setActiveTab("milestones")}
            className={`py-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "milestones"
                ? "border-[#B6C899] text-[#B6C899] font-bold"
                : "border-transparent text-[#AAB9A9] hover:text-[#F5F0E5]"
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Actionable Milestones ({completedCount}/{goals.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("checkin")}
            className={`py-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "checkin"
                ? "border-[#B6C899] text-[#B6C899] font-bold"
                : "border-transparent text-[#AAB9A9] hover:text-[#F5F0E5]"
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Growth Check-in ({checkIns.length} logged)</span>
          </button>
        </div>

        {/* PRIVACY & ETHICS GUARANTEE BANNER */}
        <div className="px-6 py-2 bg-[#202A23] border-b border-[#344236] text-[11px] text-[#AAB9A9] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-[#B6C899] shrink-0" />
            <span>
              <strong>Ethical Confidence Engine:</strong> No shaming streaks • No video/camera biometrics • Strictly private personal journal.
            </span>
          </div>
          <span className="text-[10px] text-[#536B58] hidden sm:inline">DPDP Act Compliant</span>
        </div>

        {/* FEEDBACK STATUS */}
        {statusMessage && (
          <div
            className={`mx-6 mt-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
              statusMessage.type === "success"
                ? "bg-[#202A23] border border-[#B6C899] text-[#F5F0E5]"
                : "bg-red-950/60 border border-red-800 text-red-200"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-[#B6C899] shrink-0" />
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* BODY CONTENT */}
        <div className="overflow-y-auto px-6 sm:px-8 py-6 space-y-6 flex-1">
          {/* TAB 1: ACTIONABLE MILESTONES */}
          {activeTab === "milestones" && (
            <div className="space-y-6">
              {/* Top Banner */}
              <div className="p-4 rounded-xl bg-[#202A23] border border-[#344236] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-[#F5F0E5]">
                    Tangible, Evidence-Based Milestones
                  </h3>
                  <p className="text-xs text-[#AAB9A9] mt-0.5">
                    Confidence is built through tangible action. Complete milestones, link demonstrable work, and build verified proof.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddGoal(true)}
                  className="px-3.5 py-2 bg-[#B6C899] hover:bg-[#F5F0E5] text-[#111714] text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Milestone</span>
                </button>
              </div>

              {/* Add Custom Goal Modal / Drawer */}
              {showAddGoal && (
                <div className="p-4 rounded-xl bg-[#111714] border border-[#B6C899]/40 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono uppercase text-[#B6C899] font-bold">
                      Add New Practical Milestone
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowAddGoal(false)}
                      className="text-xs text-[#AAB9A9] hover:text-[#F5F0E5]"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#F5F0E5] mb-1">
                        Milestone Title
                      </label>
                      <input
                        type="text"
                        value={newGoalTitle}
                        onChange={(e) => setNewGoalTitle(e.target.value)}
                        placeholder="e.g. Publish Star Schema SQL Case Study"
                        className="w-full px-3 py-2 bg-[#1B231E] border border-[#344236] rounded-xl text-xs text-[#F5F0E5] focus:outline-none focus:border-[#B6C899]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#F5F0E5] mb-1">
                        Category
                      </label>
                      <select
                        value={newGoalCategory}
                        onChange={(e) => setNewGoalCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-[#1B231E] border border-[#344236] rounded-xl text-xs text-[#F5F0E5] focus:outline-none focus:border-[#B6C899]"
                      >
                        <option value="skill_action">Technical Refresher / Skill Action</option>
                        <option value="work_sample">Demonstrable Work Sample / Project</option>
                        <option value="career_break_narrative">Comeback Narrative & Pitch</option>
                        <option value="interview_practice">Mock Interview / Behavioral Practice</option>
                        <option value="community_connection">Mentor Session / Community</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#F5F0E5] mb-1">
                      Action Plan / Tangible Output
                    </label>
                    <input
                      type="text"
                      value={newGoalActionPlan}
                      onChange={(e) => setNewGoalActionPlan(e.target.value)}
                      placeholder="e.g. Build GitHub repository with README, data cleaning script, and visual insights"
                      className="w-full px-3 py-2 bg-[#1B231E] border border-[#344236] rounded-xl text-xs text-[#F5F0E5] focus:outline-none focus:border-[#B6C899]"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddGoal(false)}
                      className="px-3 py-1.5 bg-[#202A23] text-xs text-[#AAB9A9] rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateCustomGoal}
                      className="px-4 py-1.5 bg-[#B6C899] text-xs font-bold text-[#111714] rounded-lg"
                    >
                      Save Milestone
                    </button>
                  </div>
                </div>
              )}

              {/* List of Goals */}
              <div className="space-y-3">
                {goals.map((goal) => {
                  const isCompleted = goal.is_completed;
                  return (
                    <div
                      key={goal.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isCompleted
                          ? "bg-[#111714] border-[#344236]"
                          : "bg-[#202A23] border-[#344236] hover:border-[#536B58]"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
                                isCompleted
                                  ? "bg-[#202A23] text-[#B6C899] border border-[#B6C899]/30"
                                  : "bg-[#1B231E] text-[#AAB9A9] border border-[#344236]"
                              }`}
                            >
                              {goal.category.replace(/_/g, " ")}
                            </span>

                            {goal.share_on_passport && isCompleted && (
                              <span className="text-[10px] font-mono text-[#B6C899] flex items-center gap-1">
                                <Award className="w-3 h-3" /> Career Passport Consented
                              </span>
                            )}
                          </div>

                          <h4
                            className={`text-sm font-semibold ${
                              isCompleted ? "text-[#F5F0E5] line-through opacity-85" : "text-[#F5F0E5]"
                            }`}
                          >
                            {goal.title}
                          </h4>

                          {goal.description && (
                            <p className="text-xs text-[#AAB9A9] leading-relaxed">
                              {goal.description}
                            </p>
                          )}

                          {goal.action_plan && (
                            <div className="text-[11px] text-[#536B58]">
                              <strong>Action Plan:</strong> {goal.action_plan}
                            </div>
                          )}
                        </div>

                        <div className="shrink-0 flex items-center gap-2 self-start">
                          {isCompleted ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#202A23] text-[#B6C899] text-xs font-semibold border border-[#344236]">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Completed</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenCompleteModal(goal)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#B6C899] hover:bg-[#F5F0E5] text-[#111714] text-xs font-bold rounded-lg transition-all shadow-sm"
                            >
                              <Circle className="w-3.5 h-3.5" />
                              <span>Complete & Submit Proof</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Display Completed Evidence, Reflection & Feedback */}
                      {isCompleted && (
                        <div className="mt-4 pt-3 border-t border-[#344236] space-y-2.5 text-xs">
                          {goal.demonstrable_evidence_url && (
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-[#AAB9A9]">Demonstrable Proof:</span>
                              <a
                                href={goal.demonstrable_evidence_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#B6C899] hover:underline flex items-center gap-1 font-mono"
                              >
                                {goal.demonstrable_evidence_url} <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}

                          {goal.user_reflection && (
                            <div className="p-3 bg-[#111714] rounded-lg border border-[#344236] text-xs space-y-1">
                              <div className="text-[11px] font-mono uppercase text-[#AAB9A9]">
                                Your Growth Reflection
                              </div>
                              <p className="text-[#F5F0E5] italic">&ldquo;{goal.user_reflection}&rdquo;</p>
                            </div>
                          )}

                          {goal.actionable_feedback && (
                            <div className="p-3 bg-[#202A23] rounded-lg border border-[#B6C899]/30 text-xs space-y-1">
                              <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase text-[#B6C899]">
                                <Sparkles className="w-3 h-3" /> Constructive Actionable Feedback
                              </div>
                              <p className="text-[#AAB9A9] leading-relaxed">{goal.actionable_feedback}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: PERSONAL GROWTH CHECK-IN (1-5 Scale) */}
          {activeTab === "checkin" && (
            <div className="space-y-6">
              {/* Check-in Form */}
              <div className="p-5 rounded-xl bg-[#202A23] border border-[#344236] space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-[#F5F0E5]">
                    Self-Reported Confidence Check-in
                  </h3>
                  <p className="text-xs text-[#AAB9A9] mt-0.5">
                    How do you feel about your career trajectory and momentum today? This is completely private personal tracking, never evaluated or shown to employers.
                  </p>
                </div>

                {/* 1-5 Scale Buttons */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#F5F0E5]">
                    Self-Assessed Confidence Level (1 to 5)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                    {[
                      { num: 1, label: "Finding Footing", desc: "Taking step by step" },
                      { num: 2, label: "Building Pace", desc: "Finding what works" },
                      { num: 3, label: "Steady Growth", desc: "Consistent progress" },
                      { num: 4, label: "Strong & Capable", desc: "Clear tangible output" },
                      { num: 5, label: "Empowered", desc: "Ready for returnships" },
                    ].map((s) => (
                      <button
                        key={s.num}
                        type="button"
                        onClick={() => setCheckInScore(s.num)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          checkInScore === s.num
                            ? "bg-[#B6C899] text-[#111714] border-[#B6C899] font-bold shadow-sm"
                            : "bg-[#111714] text-[#AAB9A9] border-[#344236] hover:border-[#536B58]"
                        }`}
                      >
                        <div className="text-base font-bold font-mono">{s.num}</div>
                        <div className="text-xs font-semibold mt-1">{s.label}</div>
                        <div className="text-[10px] opacity-80 mt-0.5">{s.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reflection text */}
                <div>
                  <label className="block text-xs font-semibold text-[#F5F0E5] mb-1">
                    What was your biggest win, insight, or breakthrough this week? (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={checkInReflection}
                    onChange={(e) => setCheckInReflection(e.target.value)}
                    placeholder="e.g. Completed my first end-to-end Python script and realized my pre-break problem solving returned quickly."
                    className="w-full px-3 py-2 bg-[#111714] border border-[#344236] rounded-xl text-xs text-[#F5F0E5] focus:outline-none focus:border-[#B6C899]"
                  />
                </div>

                {/* Strengths noted */}
                <div>
                  <label className="block text-xs font-semibold text-[#F5F0E5] mb-1">
                    What is one transferable strength you relied on?
                  </label>
                  <input
                    type="text"
                    value={checkInStrengths}
                    onChange={(e) => setCheckInStrengths(e.target.value)}
                    placeholder="e.g. Structured logic, resilience, clear communication"
                    className="w-full px-3 py-2 bg-[#111714] border border-[#344236] rounded-xl text-xs text-[#F5F0E5] focus:outline-none focus:border-[#B6C899]"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSubmitCheckIn}
                    disabled={submittingCheckIn}
                    className="px-5 py-2.5 bg-[#B6C899] hover:bg-[#F5F0E5] text-[#111714] text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {submittingCheckIn ? "Recording..." : "Record Growth Check-in"}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Check-in History */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase text-[#AAB9A9]">
                  Personal Growth Journal History
                </h4>

                {checkIns.length === 0 ? (
                  <div className="p-4 rounded-xl bg-[#111714] border border-[#344236] text-xs text-[#AAB9A9] text-center">
                    No check-ins recorded yet. Log your first check-in above to begin tracking your personal momentum!
                  </div>
                ) : (
                  checkIns.map((ci) => (
                    <div
                      key={ci.id}
                      className="p-4 rounded-xl bg-[#111714] border border-[#344236] space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#202A23] border border-[#B6C899]/30 text-[#B6C899] font-mono font-bold flex items-center justify-center text-xs">
                            {ci.score}
                          </span>
                          <span className="text-xs font-semibold text-[#F5F0E5]">
                            Score: {ci.score}/5
                          </span>
                        </div>
                        <span className="text-[11px] text-[#AAB9A9] font-mono">
                          {ci.created_at ? new Date(ci.created_at).toLocaleDateString() : "Recent"}
                        </span>
                      </div>

                      {ci.reflection && (
                        <p className="text-[#AAB9A9] italic pl-2 border-l-2 border-[#B6C899]">
                          &ldquo;{ci.reflection}&rdquo;
                        </p>
                      )}

                      {ci.noted_strengths && (
                        <div className="text-[11px] text-[#536B58]">
                          <strong>Strength:</strong> {ci.noted_strengths}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* MODAL / DRAWER FOR COMPLETING A MILESTONE */}
        {completingGoal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0F0D]/90 backdrop-blur-xl backdrop-blur-sm">
            <div className="w-full max-w-lg bg-[#1B231E] border border-[#344236] rounded-2xl p-6 shadow-2xl space-y-4 text-[#F5F0E5]">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#B6C899]">
                    Complete Milestone
                  </span>
                  <h3 className="text-base font-bold text-[#F5F0E5]">{completingGoal.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setCompletingGoal(null)}
                  className="p-1 text-[#AAB9A9] hover:text-[#F5F0E5]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Demonstrable Evidence URL */}
              <div>
                <label className="block text-xs font-semibold text-[#F5F0E5] mb-1">
                  Demonstrable Evidence / Output Link
                </label>
                <input
                  type="url"
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  placeholder="https://github.com/... or Google Doc or Loom link"
                  className="w-full px-3 py-2 bg-[#111714] border border-[#344236] rounded-xl text-xs text-[#F5F0E5] focus:outline-none focus:border-[#B6C899]"
                />
                <span className="text-[11px] text-[#AAB9A9] mt-0.5 block">
                  Link to your project code, portfolio case study, or return-to-work pitch.
                </span>
              </div>

              {/* Reflection */}
              <div>
                <label className="block text-xs font-semibold text-[#F5F0E5] mb-1">
                  Guided Reflection Prompt
                </label>
                <textarea
                  rows={3}
                  value={userReflection}
                  onChange={(e) => setUserReflection(e.target.value)}
                  placeholder="What felt challenging? What went better than expected? What strength did you demonstrate?"
                  className="w-full px-3 py-2 bg-[#111714] border border-[#344236] rounded-xl text-xs text-[#F5F0E5] focus:outline-none focus:border-[#B6C899]"
                />
              </div>

              {/* Consent Toggle for Career Passport */}
              <div className="p-3 bg-[#202A23] rounded-xl border border-[#344236] flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-[#F5F0E5] block">
                    Include on Career Passport
                  </span>
                  <span className="text-[11px] text-[#AAB9A9] block">
                    Verified milestone will be featured in your exported Career Passport PDF.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={shareOnPassport}
                  onChange={(e) => setShareOnPassport(e.target.checked)}
                  className="w-4 h-4 accent-[#B6C899] rounded cursor-pointer"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCompletingGoal(null)}
                  className="px-4 py-2 bg-[#202A23] text-xs font-medium text-[#AAB9A9] hover:text-[#F5F0E5] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCompletion}
                  disabled={submittingCompletion}
                  className="px-5 py-2 bg-[#B6C899] hover:bg-[#F5F0E5] text-[#111714] text-xs font-bold rounded-xl shadow-sm disabled:opacity-50"
                >
                  {submittingCompletion ? "Saving..." : "Verify Milestone & Complete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

