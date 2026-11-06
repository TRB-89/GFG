"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  BookOpen,
  Clock,
  Calendar,
  CheckCircle2,
  Circle,
  AlertCircle,
  HelpCircle,
  Award,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Sliders,
  Shield,
  Layers,
  Pause,
  Play,
  FileCheck,
  Target,
  ArrowRight,
  BookmarkCheck,
  Send,
  WifiOff,
  Wifi,
  Briefcase,
  Building,
  Compass,
} from "lucide-react";
import { personalizationApi, AdaptiveRoadmap, RoadmapWeek, RoadmapTask } from "@/lib/api";

interface AdaptiveRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSector?: string;
  initialHours?: number;
}

const ROADMAP_VARIANTS = [
  {
    id: "returner",
    title: "Career Returner",
    icon: Briefcase,
    desc: "Re-entry foundation, comeback narrative, verified portfolio proof, and returnship applications.",
  },
  {
    id: "learner",
    title: "Skill Rebuilder",
    icon: BookOpen,
    desc: "Core skill modernization, hands-on repositories, and verified capstone delivery.",
  },
  {
    id: "starter",
    title: "Early-Stage Entrepreneur",
    icon: Building,
    desc: "Venture validation, market research, business canvas, MVP, unit pricing, and launch.",
  },
  {
    id: "explorer",
    title: "Career Explorer",
    icon: Compass,
    desc: "Self-assessment, industry exploration, informational mentor chats, and trial projects.",
  },
];

const PACING_OPTIONS = [
  { id: "relaxed", hours: 5, label: "Relaxed (5 hrs/wk)" },
  { id: "balanced", hours: 15, label: "Balanced (10-15 hrs/wk)" },
  { id: "intensive", hours: 25, label: "Intensive (20+ hrs/wk)" },
];

export function AdaptiveRoadmapModal({
  isOpen,
  onClose,
  initialSector = "Technology & Software",
  initialHours = 15,
}: AdaptiveRoadmapModalProps) {
  const [roadmap, setRoadmap] = useState<AdaptiveRoadmap | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeVariant, setActiveVariant] = useState<string>("returner");
  const [activePace, setActivePace] = useState<string>("balanced");
  const [weeklyHours, setWeeklyHours] = useState<number>(initialHours);
  const [expandedWeek, setExpandedWeek] = useState<number>(1);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // Evidence editing modal
  const [selectedTask, setSelectedTask] = useState<{ weekNum: number; task: RoadmapTask } | null>(null);
  const [evidenceUrl, setEvidenceUrl] = useState<string>("");
  const [taskNotes, setTaskNotes] = useState<string>("");
  const [savingTask, setSavingTask] = useState<boolean>(false);

  // Low bandwidth state
  const [lowBandwidthMode, setLowBandwidthMode] = useState<boolean>(false);

  // Load existing roadmap on open
  const loadRoadmap = async () => {
    try {
      setLoading(true);
      let curr = await personalizationApi.getAdaptiveRoadmap();
      if (!curr) {
        // Generate initial roadmap
        curr = await personalizationApi.generateAdaptiveRoadmap({
          variant: activeVariant,
          target_role: initialSector,
          target_industry: initialSector,
          pace: activePace,
          weekly_hours: weeklyHours,
        });
      }
      if (curr) {
        setRoadmap(curr);
        if (curr.variant) setActiveVariant(curr.variant);
        if (curr.pace) setActivePace(curr.pace);
        if (curr.weekly_hours) setWeeklyHours(curr.weekly_hours);
      }
    } catch (err: any) {
      console.warn("Using local roadmap fallback", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      queueMicrotask(() => {
        void loadRoadmap();
      });
    }
  }, [isOpen]);

  // Recalibrate / regenerate roadmap with preserved completed tasks
  const handleRecalibrate = async (newVariant?: string, newPace?: string) => {
    const variant = newVariant || activeVariant;
    const pace = newPace || activePace;
    const hours = PACING_OPTIONS.find((p) => p.id === pace)?.hours || weeklyHours;

    try {
      setLoading(true);
      const updated = await personalizationApi.generateAdaptiveRoadmap({
        variant,
        pace,
        weekly_hours: hours,
        target_role: roadmap?.target_role || initialSector,
        target_industry: roadmap?.target_industry || initialSector,
      });
      setRoadmap(updated);
      setActiveVariant(variant);
      setActivePace(pace);
      setWeeklyHours(hours);
      setStatusMessage({
        type: "success",
        text: `Roadmap recalibrated for ${variant.toUpperCase()} (${hours} hrs/week). Completed tasks preserved!`,
      });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Recalibration failed." });
    } finally {
      setLoading(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  // Toggle task completion
  const handleToggleTask = async (weekNum: number, task: RoadmapTask) => {
    if (!roadmap) return;
    const nextCompleted = !task.completed;

    try {
      const updated = await personalizationApi.updateRoadmapTask(roadmap.id, task.id, {
        completed: nextCompleted,
        evidence_url: task.evidence_url,
        notes: task.notes,
      });
      setRoadmap(updated);
      setStatusMessage({
        type: "success",
        text: nextCompleted
          ? `Completed "${task.title}". Great progress!`
          : `Task "${task.title}" reopened.`,
      });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: "Failed to update task state." });
    } finally {
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  // Save evidence
  const handleSaveEvidence = async () => {
    if (!roadmap || !selectedTask) return;
    setSavingTask(true);
    try {
      const updated = await personalizationApi.updateRoadmapTask(roadmap.id, selectedTask.task.id, {
        completed: true,
        evidence_url: evidenceUrl,
        notes: taskNotes,
      });
      setRoadmap(updated);
      setSelectedTask(null);
      setStatusMessage({
        type: "success",
        text: "Demonstrable work sample and evidence recorded safely.",
      });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: "Failed to save evidence." });
    } finally {
      setSavingTask(false);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  // Toggle Pause/Resume
  const handleTogglePause = async () => {
    if (!roadmap) return;
    try {
      const updated = await personalizationApi.toggleRoadmapPause(roadmap.id);
      setRoadmap(updated);
      setStatusMessage({
        type: "info",
        text: updated.is_paused
          ? "Roadmap paused. Take all the time you need. Your progress is saved forever."
          : "Welcome back! Your roadmap is active and ready for your next milestone.",
      });
    } catch {
      setStatusMessage({ type: "error", text: "Unable to update pause status." });
    } finally {
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  if (!isOpen) return null;

  // Calculate stats
  let totalTasks = 0;
  let completedTasks = 0;
  if (roadmap?.weeks_data) {
    for (const w of roadmap.weeks_data) {
      for (const t of w.tasks) {
        totalTasks++;
        if (t.completed || roadmap.completed_task_ids?.includes(t.id)) {
          completedTasks++;
        }
      }
    }
  }
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="roadmap-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0E1310]/85 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-5xl bg-[#1B231E] border border-[#344236] rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-[#F5F0E5] font-sans">
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-[#344236] flex flex-wrap items-center justify-between gap-3 bg-[#111714]">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B6C899] shadow-[0_0_8px_rgba(182,200,153,0.6)]" />
            <span className="text-xs font-mono tracking-wider uppercase text-[#B6C899] font-semibold">
              8-WEEK ADAPTIVE ROADMAP
            </span>
            <span className="text-[11px] text-[#AAB9A9] border border-[#344236] px-2 py-0.5 rounded-full bg-[#202A23]">
              {roadmap?.title || "Personalized Track"}
            </span>
            {roadmap?.is_paused && (
              <span className="text-[11px] font-mono text-amber-300 bg-amber-950/70 border border-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Pause className="w-3 h-3" /> Paused (No Penalty)
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setLowBandwidthMode(!lowBandwidthMode)}
              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                lowBandwidthMode
                  ? "bg-[#B6C899] text-[#111714] border-[#B6C899]"
                  : "bg-[#202A23] text-[#AAB9A9] border-[#344236] hover:text-[#F5F0E5]"
              }`}
              title="Toggle low-bandwidth text mode"
            >
              {lowBandwidthMode ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={handleTogglePause}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                roadmap?.is_paused
                  ? "bg-[#B6C899] text-[#111714] border-[#B6C899]"
                  : "bg-[#202A23] text-[#AAB9A9] hover:text-[#F5F0E5] border-[#344236]"
              }`}
            >
              {roadmap?.is_paused ? (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Resume Roadmap</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause Roadmap</span>
                </>
              )}
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

        {/* CONTROLS BAR: VARIANT SWITCHER & PACING */}
        <div className="px-6 py-3 bg-[#171F1A] border-b border-[#344236] flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Variant Selector */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[#AAB9A9] font-mono mr-1">Track:</span>
            {ROADMAP_VARIANTS.map((v) => {
              const Icon = v.icon;
              const isSelected = activeVariant === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => handleRecalibrate(v.id, activePace)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
                    isSelected
                      ? "bg-[#B6C899] text-[#111714] border-[#B6C899] font-bold shadow-sm"
                      : "bg-[#202A23] text-[#AAB9A9] border-[#344236] hover:text-[#F5F0E5]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{v.title}</span>
                </button>
              );
            })}
          </div>

          {/* Pace Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[#AAB9A9] font-mono">Pace:</span>
            <select
              value={activePace}
              onChange={(e) => handleRecalibrate(activeVariant, e.target.value)}
              className="px-2.5 py-1 bg-[#202A23] border border-[#344236] rounded-lg text-xs text-[#F5F0E5] focus:outline-none focus:border-[#B6C899]"
            >
              {PACING_OPTIONS.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#1B231E]">
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* PROGRESS & NON-JUDGMENTAL BANNER */}
        <div className="px-6 py-3 bg-[#202A23] border-b border-[#344236] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-28 bg-[#171F1A] h-2.5 rounded-full overflow-hidden border border-[#344236]">
              <div
                className="bg-[#B6C899] h-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-[#F5F0E5]">
              {completedTasks} / {totalTasks} Tasks ({completionPercentage}%)
            </span>
          </div>

          <div className="text-[11px] text-[#AAB9A9] flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-[#B6C899]" />
            <span>
              <strong>Zero Stigma Guarantee:</strong> Pacing adapts to your life. Never any streaks broken, shame counters, or lost progress.
            </span>
          </div>
        </div>

        {/* STATUS MESSAGE */}
        {statusMessage && (
          <div
            className={`mx-6 mt-3 p-3 rounded-xl text-xs flex items-center gap-2 ${
              statusMessage.type === "success"
                ? "bg-[#202A23] border border-[#B6C899] text-[#F5F0E5]"
                : statusMessage.type === "info"
                ? "bg-[#202A23] border border-[#697D69] text-[#AAB9A9]"
                : "bg-red-950/60 border border-red-800 text-red-200"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-[#B6C899] shrink-0" />
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* ROADMAP WEEKS LIST */}
        <div className="overflow-y-auto px-6 sm:px-8 py-6 space-y-4 flex-1">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-6 h-6 animate-spin text-[#B6C899] mx-auto" />
              <p className="text-xs text-[#AAB9A9]">Calibrating 8-week structured roadmap...</p>
            </div>
          ) : !roadmap || !roadmap.weeks_data || roadmap.weeks_data.length === 0 ? (
            <div className="p-8 text-center bg-[#171F1A] rounded-xl border border-[#344236] space-y-3">
              <Compass className="w-8 h-8 text-[#B6C899] mx-auto opacity-70" />
              <h3 className="text-sm font-bold text-[#F5F0E5]">No Roadmap Generated Yet</h3>
              <p className="text-xs text-[#AAB9A9] max-w-md mx-auto">
                Generate your personalized 8-week roadmap adapted to your chosen goals and available hours.
              </p>
              <button
                type="button"
                onClick={() => handleRecalibrate()}
                className="px-4 py-2 bg-[#B6C899] text-[#111714] text-xs font-bold rounded-xl"
              >
                Generate 8-Week Roadmap
              </button>
            </div>
          ) : (
            roadmap.weeks_data.map((weekData: RoadmapWeek) => {
              const isExpanded = expandedWeek === weekData.week;
              const weekCompletedCount = weekData.tasks.filter(
                (t) => t.completed || roadmap.completed_task_ids?.includes(t.id)
              ).length;
              const isWeekComplete = weekCompletedCount === weekData.tasks.length;

              return (
                <div
                  key={weekData.week}
                  className={`rounded-xl border transition-all ${
                    isWeekComplete
                      ? "bg-[#171F1A] border-[#344236]"
                      : isExpanded
                      ? "bg-[#202A23] border-[#B6C899]/50 shadow-md"
                      : "bg-[#171F1A] border-[#344236] hover:border-[#697D69]"
                  }`}
                >
                  {/* Week Header Accordion Toggle */}
                  <button
                    type="button"
                    onClick={() => setExpandedWeek(isExpanded ? 0 : weekData.week)}
                    className="w-full p-4 flex items-center justify-between text-left gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                          isWeekComplete
                            ? "bg-[#B6C899] text-[#111714]"
                            : "bg-[#202A23] border border-[#344236] text-[#B6C899]"
                        }`}
                      >
                        {isWeekComplete ? "✓" : weekData.week}
                      </span>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase text-[#B6C899]">
                            Week {weekData.week}
                          </span>
                          <span className="text-xs text-[#697D69]">•</span>
                          <span className="text-xs text-[#AAB9A9]">
                            {weekCompletedCount}/{weekData.tasks.length} Done
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[#F5F0E5] mt-0.5">
                          {weekData.theme}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#111714] border border-[#344236] text-[11px] text-[#AAB9A9]">
                        <Award className="w-3.5 h-3.5 text-[#B6C899]" />
                        <span>Work Sample: {weekData.milestone.split(":")[0]}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-[#AAB9A9]" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-[#AAB9A9]" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Week Tasks */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-[#344236] space-y-3">
                      {/* Milestone Work Sample Prompt */}
                      <div className="p-3 bg-[#111714] rounded-lg border border-[#344236] text-xs flex items-start gap-2.5">
                        <Award className="w-4 h-4 text-[#B6C899] shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-[#F5F0E5]">Key Practical Output:</strong>{" "}
                          <span className="text-[#AAB9A9]">{weekData.milestone}</span>
                        </div>
                      </div>

                      {/* Tasks List */}
                      <div className="space-y-2">
                        {weekData.tasks.map((task: RoadmapTask) => {
                          const isDone =
                            task.completed || roadmap.completed_task_ids?.includes(task.id);
                          return (
                            <div
                              key={task.id}
                              className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                isDone
                                  ? "bg-[#171F1A] border-[#344236] opacity-90"
                                  : "bg-[#202A23] border-[#344236]"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <button
                                  type="button"
                                  onClick={() => handleToggleTask(weekData.week, task)}
                                  className="mt-0.5 shrink-0 text-[#B6C899] hover:scale-110 transition-transform"
                                >
                                  {isDone ? (
                                    <CheckCircle2 className="w-5 h-5 fill-[#B6C899] text-[#111714]" />
                                  ) : (
                                    <Circle className="w-5 h-5 text-[#697D69] hover:text-[#B6C899]" />
                                  )}
                                </button>

                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`text-xs font-semibold ${
                                        isDone
                                          ? "line-through text-[#AAB9A9]"
                                          : "text-[#F5F0E5]"
                                      }`}
                                    >
                                      {task.title}
                                    </span>
                                    <span className="text-[10px] font-mono text-[#697D69] px-1.5 py-0.2 rounded bg-[#111714] border border-[#344236]">
                                      ~{task.estimated_hours}h
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-[#AAB9A9]">
                                    {task.description}
                                  </p>

                                  {task.evidence_url && (
                                    <div className="pt-1 flex items-center gap-1.5 text-[11px] text-[#B6C899]">
                                      <BookmarkCheck className="w-3.5 h-3.5" />
                                      <a
                                        href={task.evidence_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:underline flex items-center gap-1"
                                      >
                                        Evidence: {task.evidence_url} <ExternalLink className="w-3 h-3" />
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="shrink-0 flex items-center gap-2 self-end sm:self-auto">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedTask({ weekNum: weekData.week, task });
                                    setEvidenceUrl(task.evidence_url || "");
                                    setTaskNotes(task.notes || "");
                                  }}
                                  className="px-2.5 py-1 bg-[#171F1A] hover:bg-[#344236] text-[11px] text-[#B6C899] rounded-lg border border-[#344236] transition-colors"
                                >
                                  {task.evidence_url ? "Edit Proof" : "Attach Work Sample"}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* EVIDENCE MODAL */}
        {selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0E1310]/80 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-[#1B231E] border border-[#344236] rounded-2xl p-6 shadow-2xl space-y-4 text-[#F5F0E5]">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#B6C899]">
                    Attach Practical Work Sample
                  </span>
                  <h3 className="text-base font-bold text-[#F5F0E5]">{selectedTask.task.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="p-1 text-[#AAB9A9] hover:text-[#F5F0E5]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F5F0E5] mb-1">
                  Evidence / Artifact Link
                </label>
                <input
                  type="url"
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  placeholder="https://github.com/your-repo or Google Doc / Loom"
                  className="w-full px-3 py-2 bg-[#171F1A] border border-[#344236] rounded-xl text-xs text-[#F5F0E5] focus:outline-none focus:border-[#B6C899]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F5F0E5] mb-1">
                  Key Notes & Learnings
                </label>
                <textarea
                  rows={3}
                  value={taskNotes}
                  onChange={(e) => setTaskNotes(e.target.value)}
                  placeholder="What did this project demonstrate? What went smoothly?"
                  className="w-full px-3 py-2 bg-[#171F1A] border border-[#344236] rounded-xl text-xs text-[#F5F0E5] focus:outline-none focus:border-[#B6C899]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2 bg-[#202A23] text-xs font-medium text-[#AAB9A9] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEvidence}
                  disabled={savingTask}
                  className="px-5 py-2 bg-[#B6C899] hover:bg-[#F5F0E5] text-[#111714] text-xs font-bold rounded-xl shadow-sm disabled:opacity-50"
                >
                  {savingTask ? "Saving..." : "Save Work Sample & Mark Complete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
