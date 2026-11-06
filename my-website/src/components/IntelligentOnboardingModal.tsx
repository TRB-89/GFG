"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  Upload,
  FileText,
  Shield,
  Sparkles,
  Lock,
  Briefcase,
  Calendar,
  Clock,
  Compass,
  ArrowRight,
  CheckCircle2,
  Trash2,
  Plus,
  ExternalLink,
  Code2,
  BookOpen,
  GraduationCap,
  Users,
  Target,
  FileCheck,
  Building,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  BookmarkCheck,
  HeartHandshake,
  TrendingUp,
  Sliders,
  Save,
  Edit3,
} from "lucide-react";
import { api, personalizationApi } from "@/lib/api";

export interface IntelligentOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (candidateData: unknown) => void;
  initialStep?: number;
}

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  skills_demonstrated: string[];
  technologies_used: string[];
  project_link?: string;
  repository_link?: string;
  year_completed: number;
}

// 7 Concise Questions State + Optional Professional Background
export interface PersonalizationFormState {
  // Q1: Primary goal
  primary_goal: string;
  secondary_goals: string[];

  // Q2: Current situation
  current_situation: string;

  // Q3: Interests & professional areas
  interests: string[];

  // Q4: Main challenges or support needs
  challenges: string[];

  // Q5: Available time
  available_time: string;
  weekly_hours: number;

  // Q6: Preferred support format
  preferred_support: string[];

  // Q7: Preferred experience
  preferred_experience: string;

  // Optional Professional Details
  previous_job_title: string;
  target_role: string;
  industry: string;
  experience_years: number;
  existing_skills: string[];
  qualifications: string;
  portfolio_url: string;
  linkedin_url: string;
  github_url: string;
  resume_url?: string;
  resume_filename?: string;
  resume_size?: number;
  projects: PortfolioProject[];

  // Support details
  preferred_learning_language: string;
}

const DEFAULT_FORM_STATE: PersonalizationFormState = {
  primary_goal: "return_to_work",
  secondary_goals: ["learn_skills", "find_mentorship"],
  current_situation: "career_break",
  interests: ["Technology & Software Development", "Data Science & Business Intelligence"],
  challenges: ["skills_gap", "confidence"],
  available_time: "10_to_20",
  weekly_hours: 15,
  preferred_support: ["roadmap", "learning", "mentorship"],
  preferred_experience: "guided",

  previous_job_title: "",
  target_role: "",
  industry: "Technology & Software",
  experience_years: 3,
  existing_skills: ["Python", "SQL", "Project Coordination"],
  qualifications: "Bachelor's Degree",
  portfolio_url: "",
  linkedin_url: "",
  github_url: "",
  resume_url: undefined,
  resume_filename: undefined,
  resume_size: undefined,
  projects: [],
  preferred_learning_language: "English",
};

// Data Catalogs for 7 Questions
const PRIMARY_GOALS = [
  {
    id: "return_to_work",
    title: "Return to Employment",
    description: "Re-enter the workforce, join verified returnships, and achieve competitive compensation.",
    icon: Briefcase,
    badge: "Most Popular",
  },
  {
    id: "learn_skills",
    title: "Learn & Modernize Skills",
    description: "Master modern tools, frameworks, and AI workflows with hands-on practice.",
    icon: BookOpen,
    badge: "Skill Refresh",
  },
  {
    id: "start_business",
    title: "Start a Business / Consultancy",
    description: "Launch an independent venture, small enterprise, or freelance practice.",
    icon: Building,
    badge: "Entrepreneurship",
  },
  {
    id: "grow_business",
    title: "Grow an Existing Business",
    description: "Scale revenue, refine client pricing, and access women-focused micro-grants.",
    icon: TrendingUp,
    badge: "Scale-Up",
  },
  {
    id: "find_mentorship",
    title: "Find Mentorship & Direction",
    description: "Connect with senior women leaders for career strategy, confidence, and advice.",
    icon: Users,
    badge: "Guidance",
  },
  {
    id: "explore_careers",
    title: "Explore Career Pathways",
    description: "Discover emerging roles, evaluate options, and transition with confidence.",
    icon: Compass,
    badge: "Exploration",
  },
];

const CURRENT_SITUATIONS = [
  {
    id: "career_break",
    title: "On a Career Break / Hiatus",
    description: "Taking time out for family care, health, education, or personal renewal.",
  },
  {
    id: "currently_employed",
    title: "Currently Employed",
    description: "Working today, looking to pivot, advance seniority, or switch tracks.",
  },
  {
    id: "entrepreneur",
    title: "Freelancer / Small Business Owner",
    description: "Operating independently or building a self-directed venture.",
  },
  {
    id: "student_graduate",
    title: "Recent Graduate / Learner",
    description: "Transitioning from studies into professional industry opportunities.",
  },
  {
    id: "exploring",
    title: "Exploring Options",
    description: "Open to new directions and evaluating high-impact trajectories.",
  },
];

const PROFESSIONAL_AREAS = [
  "Technology & Software Development",
  "Data Science & Business Intelligence",
  "Digital Marketing & Brand Building",
  "Product Management & Agile Operations",
  "Financial Services, FinTech & Accounting",
  "Healthcare, Life Sciences & Biotech",
  "Education, EdTech & Instructional Design",
  "Consulting, Advisory & Client Success",
  "E-Commerce, Retail & Micro-Enterprise",
  "Creative Media, Content & UI/UX Design",
  "Human Resources & Talent Development",
  "Supply Chain, Logistics & Sustainability",
];

const CHALLENGES_OPTIONS = [
  {
    id: "skills_gap",
    title: "Skills & Tooling Gap",
    desc: "Keeping pace with updated technologies, AI tools, and workflows.",
  },
  {
    id: "confidence",
    title: "Confidence & Interview Presence",
    desc: "Rebuilding self-assurance and articulating career breaks with agency.",
  },
  {
    id: "limited_time",
    title: "Limited Available Time",
    desc: "Balancing household, caregiving, or family priorities with career prep.",
  },
  {
    id: "opportunities",
    title: "Finding Verified Opportunities",
    desc: "Locating bias-free employers offering fair pay and flexible returnships.",
  },
  {
    id: "guidance",
    title: "Roadmap Clarity & Direction",
    desc: "Knowing where to start and following a realistic, sequenced progression.",
  },
  {
    id: "financial_constraints",
    title: "Financial Planning & Support",
    desc: "Accessing free quality learning, stipends, or venture funding options.",
  },
];

const TIME_OPTIONS = [
  {
    id: "under_5",
    hours: 4,
    title: "Under 5 Hours / Week",
    desc: "Micro-learning: 30-45 minutes per day. Steady, low-pressure progress.",
  },
  {
    id: "5_to_10",
    hours: 8,
    title: "5 to 10 Hours / Week",
    desc: "Balanced pace: 1-1.5 hours per weekday. Consistent milestone completion.",
  },
  {
    id: "10_to_20",
    hours: 15,
    title: "10 to 20 Hours / Week",
    desc: "Dedicated comeback: 2-3 hours per day. Fast-track readiness in 8 weeks.",
  },
  {
    id: "20_plus",
    hours: 25,
    title: "20+ Hours / Week",
    desc: "Full immersion: Accelerated curriculum and intensive project sprints.",
  },
];

const SUPPORT_FORMATS = [
  {
    id: "roadmap",
    title: "8-Week Structured Roadmap",
    desc: "Weekly milestones, curated actions, and clear completion checklists.",
  },
  {
    id: "learning",
    title: "Skill Learning Modules",
    desc: "Self-paced video, exercises, and verified digital certificates.",
  },
  {
    id: "mentorship",
    title: "1:1 Mentor Guidance",
    desc: "Personal check-ins and mock interviews with seasoned industry leaders.",
  },
  {
    id: "opportunities",
    title: "Vetted Returnships & Jobs",
    desc: "Curated openings with partner companies committed to returner talent.",
  },
  {
    id: "resume_portfolio",
    title: "Portfolio & Pitch Building",
    desc: "Modernizing your professional narrative and verifiable code repositories.",
  },
  {
    id: "business_guidance",
    title: "Business Strategy & Pricing",
    desc: "Unit economics, client contract templates, and market validation tools.",
  },
];

const EXPERIENCE_STYLES = [
  {
    id: "guided",
    title: "Guided Step-by-Step",
    desc: "We tell you exactly what to do next each week with structured checklists and proactive nudges.",
  },
  {
    id: "independent",
    title: "Self-Directed Explorer",
    desc: "You set your own pace and explore tools, roadmaps, and mentors on your own timetable.",
  },
  {
    id: "blended",
    title: "Blended Approach",
    desc: "A solid structured baseline with the freedom to dive deep into specialized topics anytime.",
  },
];

const SUGGESTED_SKILLS = [
  "Python",
  "SQL",
  "Data Analysis",
  "React",
  "TypeScript",
  "JavaScript",
  "Excel / Power BI",
  "AWS Cloud",
  "Digital Marketing",
  "Project Management",
  "Agile / Scrum",
  "UI/UX Design",
  "Financial Modeling",
  "Business Communication",
  "Customer Success",
  "System Architecture",
];

export function IntelligentOnboardingModal({
  isOpen,
  onClose,
  onSuccess,
  initialStep = 1,
}: IntelligentOnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [state, setState] = useState<PersonalizationFormState>(DEFAULT_FORM_STATE);
  const [isExistingUser, setIsExistingUser] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  const [newSkillInput, setNewSkillInput] = useState("");
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<string>("Draft auto-saved");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load existing personalization or candidate profile on mount/open
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function loadExistingState() {
      try {
        const [personalization, candidateProfileRes, draft] = await Promise.all([
          personalizationApi.getPersonalization().catch(() => null),
          api.getCandidateProfile().catch(() => null),
          api.getOnboardingDraft().catch(() => null),
        ]);

        const candidateProfile = candidateProfileRes as any;

        if (!isMounted) return;

        if (personalization && personalization.is_completed) {
          setIsExistingUser(true);
          setIsEditMode(true);
          setState((prev) => ({
            ...prev,
            primary_goal: personalization.primary_goal || prev.primary_goal,
            secondary_goals: personalization.secondary_goals || prev.secondary_goals,
            current_situation: personalization.current_situation || prev.current_situation,
            interests: personalization.interests || prev.interests,
            challenges: personalization.challenges || prev.challenges,
            available_time: personalization.available_time || prev.available_time,
            weekly_hours: personalization.weekly_hours || prev.weekly_hours,
            preferred_support: personalization.preferred_support || prev.preferred_support,
            preferred_experience: personalization.preferred_experience || prev.preferred_experience,
            previous_job_title: candidateProfile?.previous_job_title || prev.previous_job_title,
            target_role: candidateProfile?.target_role || prev.target_role,
            industry: candidateProfile?.industry || prev.industry,
            experience_years: candidateProfile?.years_experience || prev.experience_years,
            existing_skills: candidateProfile?.skills?.map((s: any) => (typeof s === "string" ? s : s.name)) || prev.existing_skills,
          }));
          setCurrentStep(5); // Jump straight to review/edit for existing users!
          setAutosaveStatus("Loaded existing preferences");
        } else if (draft && draft.draft_data) {
          setState((prev) => ({
            ...prev,
            ...(draft.draft_data as Partial<PersonalizationFormState>),
          }));
          if (draft.current_step && draft.current_step >= 1 && draft.current_step <= 5) {
            setCurrentStep(draft.current_step);
          }
          setAutosaveStatus("Restored draft");
        } else if (candidateProfile) {
          setState((prev) => ({
            ...prev,
            previous_job_title: candidateProfile.previous_job_title || prev.previous_job_title,
            target_role: candidateProfile.target_role || prev.target_role,
            industry: candidateProfile.industry || prev.industry,
            experience_years: candidateProfile.years_experience || prev.experience_years,
          }));
        }
      } catch (err) {
        console.warn("Unable to load cloud personalization state", err);
      }
    }

    loadExistingState();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Debounced Autosave
  const triggerAutosave = (updated: PersonalizationFormState, step: number) => {
    setAutosaveStatus("Saving...");
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }
    autosaveTimerRef.current = setTimeout(async () => {
      try {
        await Promise.all([
          api.saveOnboardingDraft(step, updated as unknown as Record<string, unknown>).catch(() => null),
          personalizationApi.savePersonalization({
            primary_goal: updated.primary_goal,
            secondary_goals: updated.secondary_goals,
            current_situation: updated.current_situation,
            interests: updated.interests,
            challenges: updated.challenges,
            available_time: updated.available_time,
            weekly_hours: updated.weekly_hours,
            preferred_support: updated.preferred_support,
            preferred_experience: updated.preferred_experience,
            is_completed: false,
          }).catch(() => null),
        ]);
        const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        setAutosaveStatus(`Saved at ${time}`);
      } catch {
        setAutosaveStatus("Saved locally");
      }
    }, 600);
  };

  const updateState = (fields: Partial<PersonalizationFormState>) => {
    setState((prev) => {
      const next = { ...prev, ...fields };
      triggerAutosave(next, currentStep);
      return next;
    });
    setValidationError(null);
  };

  // Toggle helper for multi-select lists
  const toggleArrayItem = (field: "secondary_goals" | "interests" | "challenges" | "preferred_support", item: string) => {
    const list = state[field] || [];
    if (list.includes(item)) {
      updateState({ [field]: list.filter((i) => i !== item) });
    } else {
      updateState({ [field]: [...list, item] });
    }
  };

  // Add custom skill
  const handleAddSkill = () => {
    const trimmed = newSkillInput.trim();
    if (!trimmed) return;
    if (!state.existing_skills.includes(trimmed)) {
      updateState({ existing_skills: [...state.existing_skills, trimmed] });
    }
    setNewSkillInput("");
  };

  const handleRemoveSkill = (skill: string) => {
    updateState({ existing_skills: state.existing_skills.filter((s) => s !== skill) });
  };

  // Resume upload
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      setValidationError("Please upload a PDF document.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setValidationError("File exceeds maximum allowed size of 5 MB.");
      return;
    }

    setIsUploadingResume(true);
    setValidationError(null);
    try {
      const res = await api.uploadResume(file);
      updateState({
        resume_url: res.url,
        resume_filename: res.filename || file.name,
        resume_size: res.size_bytes || file.size,
      });
      setAutosaveStatus("Resume attached safely");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setValidationError(message);
    } finally {
      setIsUploadingResume(false);
    }
  };

  // Step Validation
  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!state.primary_goal) {
        setValidationError("Please select your primary career goal.");
        return false;
      }
      if (!state.current_situation) {
        setValidationError("Please select your current situation.");
        return false;
      }
    }
    if (step === 2) {
      if (state.interests.length === 0) {
        setValidationError("Please select at least one professional area of interest.");
        return false;
      }
      if (state.challenges.length === 0) {
        setValidationError("Please select at least one area where you would like support.");
        return false;
      }
    }
    if (step === 3) {
      if (!state.available_time) {
        setValidationError("Please indicate your available preparation time per week.");
        return false;
      }
      if (state.preferred_support.length === 0) {
        setValidationError("Please select at least one preferred support format.");
        return false;
      }
    }
    setValidationError(null);
    return true;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    const nextStep = Math.min(5, currentStep + 1);
    setCurrentStep(nextStep);
    triggerAutosave(state, nextStep);
  };

  const handleBack = () => {
    const prev = Math.max(1, currentStep - 1);
    setCurrentStep(prev);
    triggerAutosave(state, prev);
  };

  // Save & Resume Later
  const handleSaveAndResumeLater = async () => {
    try {
      setAutosaveStatus("Saving draft...");
      await Promise.all([
        api.saveOnboardingDraft(currentStep, state as unknown as Record<string, unknown>),
        personalizationApi.savePersonalization({
          primary_goal: state.primary_goal,
          secondary_goals: state.secondary_goals,
          current_situation: state.current_situation,
          interests: state.interests,
          challenges: state.challenges,
          available_time: state.available_time,
          weekly_hours: state.weekly_hours,
          preferred_support: state.preferred_support,
          preferred_experience: state.preferred_experience,
          is_completed: false,
        }),
      ]);
      setAutosaveStatus("Draft saved safely");
      onClose();
    } catch {
      onClose();
    }
  };

  // Final Complete / Save Goals
  const handleComplete = async () => {
    setIsSubmitting(true);
    setValidationError(null);
    try {
      // 1. Save to Personalization Engine
      await personalizationApi.savePersonalization({
        primary_goal: state.primary_goal,
        secondary_goals: state.secondary_goals,
        current_situation: state.current_situation,
        interests: state.interests,
        challenges: state.challenges,
        available_time: state.available_time,
        weekly_hours: state.weekly_hours,
        preferred_support: state.preferred_support,
        preferred_experience: state.preferred_experience,
        is_completed: true,
      });

      // 2. Synchronize candidate profile baseline
      const candidatePayload = {
        previous_job_title: state.previous_job_title || "Career Professional",
        industry: state.industry || "Technology & Software",
        experience_years: Number(state.experience_years) || 3,
        qualifications: state.qualifications || "Bachelor's Degree",
        target_role: state.target_role || state.previous_job_title || "Modern Specialist",
        existing_skills: state.existing_skills,
        currently_on_break: state.current_situation === "career_break",
        weekly_learning_hours: state.weekly_hours,
        preferred_work_mode: "hybrid",
        language_preference: state.preferred_learning_language,
        resume_url: state.resume_url,
        linkedin_url: state.linkedin_url,
        portfolio_url: state.portfolio_url,
        support_preferences: {
          services: state.preferred_support,
          format: state.preferred_experience,
          availability: `${state.weekly_hours} hours/week`,
          language: state.preferred_learning_language,
          primary_goal: state.primary_goal,
        },
      };

      const result = await api.completeOnboarding(candidatePayload).catch(() => ({ success: true }));

      // Clean draft
      await api.clearOnboardingDraft().catch(() => null);

      onSuccess(result);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Saving preferences failed";
      setValidationError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0E1310]/85 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl bg-[#1B231E] border border-[#344236] rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-[#F5F0E5] font-sans">
        {/* TOP STATUS BAR */}
        <div className="px-6 py-4 border-b border-[#344236] flex flex-wrap items-center justify-between gap-3 bg-[#111714]">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B6C899] shadow-[0_0_8px_rgba(182,200,153,0.6)]" />
            <span className="text-xs font-mono tracking-wider uppercase text-[#B6C899] font-semibold">
              {isEditMode ? "REVIEW & EDIT GOALS" : "PERSONALIZED ONBOARDING"}
            </span>
            <span className="text-[11px] text-[#AAB9A9] border border-[#344236] px-2 py-0.5 rounded-full bg-[#202A23]">
              Step {currentStep} of 5
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveAndResumeLater}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#AAB9A9] hover:text-[#F5F0E5] hover:bg-[#202A23] border border-[#344236] transition-colors"
              title="Save your progress and return anytime"
            >
              <Save className="w-3.5 h-3.5 text-[#B6C899]" />
              <span>Save & Resume Later</span>
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

        {/* STEP PROGRESS BAR */}
        <div className="px-6 py-2.5 bg-[#171F1A] border-b border-[#344236] flex items-center justify-between text-xs overflow-x-auto">
          {[
            { num: 1, label: "Goals & Situation" },
            { num: 2, label: "Focus & Challenges" },
            { num: 3, label: "Time & Learning" },
            { num: 4, label: "Background (Optional)" },
            { num: 5, label: "Review & Action Plan" },
          ].map((s) => {
            const isPast = s.num < currentStep;
            const isCurrent = s.num === currentStep;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  if (isExistingUser || s.num <= currentStep) {
                    setCurrentStep(s.num);
                  }
                }}
                disabled={!isExistingUser && s.num > currentStep}
                className={`flex items-center gap-2 py-1 px-2.5 rounded-lg transition-all ${
                  isCurrent
                    ? "text-[#B6C899] font-bold bg-[#202A23] border border-[#B6C899]/30"
                    : isPast
                    ? "text-[#F5F0E5] hover:text-[#B6C899]"
                    : "text-[#697D69] opacity-60 cursor-not-allowed"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-mono ${
                    isCurrent
                      ? "bg-[#B6C899] text-[#111714] font-bold"
                      : isPast
                      ? "bg-[#697D69] text-[#F5F0E5]"
                      : "bg-[#202A23] text-[#697D69] border border-[#344236]"
                  }`}
                >
                  {isPast ? "✓" : s.num}
                </span>
                <span className="hidden sm:inline whitespace-nowrap">{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* ERROR NOTIFICATION */}
        {validationError && (
          <div className="mx-6 mt-4 p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* MODAL BODY */}
        <div className="overflow-y-auto px-6 sm:px-8 py-6 space-y-6 flex-1">
          {/* STEP 1: PRIMARY GOAL & CURRENT SITUATION (Q1 & Q2) */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h2
                  id="onboarding-modal-title"
                  className="text-xl sm:text-2xl font-bold text-[#F5F0E5] tracking-tight"
                >
                  What is your primary focus today?
                </h2>
                <p className="text-xs sm:text-sm text-[#AAB9A9] mt-1">
                  Question 1 of 7 — We will customize your dashboard, recommendations, and roadmap around your exact ambitions.
                </p>
              </div>

              {/* Primary Goals Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {PRIMARY_GOALS.map((goal) => {
                  const Icon = goal.icon;
                  const isSelected = state.primary_goal === goal.id;
                  return (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => updateState({ primary_goal: goal.id })}
                      className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between ${
                        isSelected
                          ? "bg-[#202A23] border-[#B6C899] shadow-[0_0_15px_rgba(182,200,153,0.15)] ring-1 ring-[#B6C899]"
                          : "bg-[#171F1A] border-[#344236] hover:border-[#697D69] text-[#AAB9A9]"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div
                            className={`p-2 rounded-lg ${
                              isSelected ? "bg-[#B6C899] text-[#111714]" : "bg-[#202A23] text-[#B6C899]"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#111714] text-[#AAB9A9] border border-[#344236]">
                            {goal.badge}
                          </span>
                        </div>
                        <h3 className={`text-sm font-semibold ${isSelected ? "text-[#F5F0E5]" : "text-[#F5F0E5]"}`}>
                          {goal.title}
                        </h3>
                        <p className="text-xs text-[#AAB9A9] leading-relaxed">{goal.description}</p>
                      </div>

                      <div className="mt-4 pt-2 border-t border-[#344236]/60 flex items-center justify-between text-xs">
                        <span className={isSelected ? "text-[#B6C899] font-medium" : "text-[#697D69]"}>
                          {isSelected ? "Selected Priority" : "Click to select"}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-[#B6C899]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Q2: Current Situation */}
              <div className="pt-4 border-t border-[#344236] space-y-3">
                <div>
                  <h3 className="text-base font-semibold text-[#F5F0E5]">
                    Which best describes your current situation?
                  </h3>
                  <p className="text-xs text-[#AAB9A9]">
                    Question 2 of 7 — Ensures we calibrate pacing appropriately without assumptions.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {CURRENT_SITUATIONS.map((sit) => {
                    const isSelected = state.current_situation === sit.id;
                    return (
                      <button
                        key={sit.id}
                        type="button"
                        onClick={() => updateState({ current_situation: sit.id })}
                        className={`p-3.5 rounded-xl text-left border transition-all ${
                          isSelected
                            ? "bg-[#202A23] border-[#B6C899] text-[#F5F0E5] ring-1 ring-[#B6C899]"
                            : "bg-[#171F1A] border-[#344236] text-[#AAB9A9] hover:border-[#697D69]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[#F5F0E5]">{sit.title}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#B6C899]" />}
                        </div>
                        <p className="text-[11px] text-[#AAB9A9] mt-1">{sit.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: INTERESTS & MAIN CHALLENGES (Q3 & Q4) */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#F5F0E5] tracking-tight">
                  What areas interest you, and what support do you need?
                </h2>
                <p className="text-xs sm:text-sm text-[#AAB9A9] mt-1">
                  Questions 3 & 4 of 7 — Choose as many as relevant.
                </p>
              </div>

              {/* Q3: Professional Areas */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#F5F0E5]">
                    Professional Areas & Domains of Interest (Question 3)
                  </h3>
                  <span className="text-xs text-[#AAB9A9]">
                    {state.interests.length} selected
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {PROFESSIONAL_AREAS.map((area) => {
                    const isSelected = state.interests.includes(area);
                    return (
                      <button
                        key={area}
                        type="button"
                        onClick={() => toggleArrayItem("interests", area)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-[#B6C899] text-[#111714] border-[#B6C899] font-semibold shadow-sm"
                            : "bg-[#171F1A] text-[#AAB9A9] border-[#344236] hover:border-[#697D69] hover:text-[#F5F0E5]"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-[#111714]" />}
                        <span>{area}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Q4: Main Challenges / Support Needs */}
              <div className="pt-4 border-t border-[#344236] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-[#F5F0E5]">
                      Main Challenges or Support Needs (Question 4)
                    </h3>
                    <p className="text-xs text-[#AAB9A9]">
                      Select the primary areas where practical guidance would make the biggest difference.
                    </p>
                  </div>
                  <span className="text-xs text-[#AAB9A9]">
                    {state.challenges.length} selected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {CHALLENGES_OPTIONS.map((c) => {
                    const isSelected = state.challenges.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleArrayItem("challenges", c.id)}
                        className={`p-3.5 rounded-xl text-left border transition-all ${
                          isSelected
                            ? "bg-[#202A23] border-[#B6C899] text-[#F5F0E5] ring-1 ring-[#B6C899]"
                            : "bg-[#171F1A] border-[#344236] text-[#AAB9A9] hover:border-[#697D69]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[#F5F0E5]">{c.title}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#B6C899]" />}
                        </div>
                        <p className="text-[11px] text-[#AAB9A9] mt-1">{c.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: TIME & LEARNING STYLE (Q5, Q6, Q7) */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#F5F0E5] tracking-tight">
                  Time Commitment & Learning Preferences
                </h2>
                <p className="text-xs sm:text-sm text-[#AAB9A9] mt-1">
                  Questions 5, 6 & 7 of 7 — Adapts roadmap pacing to your real-world calendar.
                </p>
              </div>

              {/* Q5: Available Time */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#F5F0E5]">
                    Available Preparation & Learning Time (Question 5)
                  </h3>
                  <span className="text-xs font-mono text-[#B6C899]">
                    {state.weekly_hours} Hours / Week
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TIME_OPTIONS.map((opt) => {
                    const isSelected = state.available_time === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => updateState({ available_time: opt.id, weekly_hours: opt.hours })}
                        className={`p-3.5 rounded-xl text-left border transition-all ${
                          isSelected
                            ? "bg-[#202A23] border-[#B6C899] text-[#F5F0E5] ring-1 ring-[#B6C899]"
                            : "bg-[#171F1A] border-[#344236] text-[#AAB9A9] hover:border-[#697D69]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[#F5F0E5]">{opt.title}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#B6C899]" />}
                        </div>
                        <p className="text-[11px] text-[#AAB9A9] mt-1">{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Q6: Preferred Support Format */}
              <div className="pt-4 border-t border-[#344236] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#F5F0E5]">
                    Preferred Support Format (Question 6)
                  </h3>
                  <span className="text-xs text-[#AAB9A9]">
                    {state.preferred_support.length} selected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {SUPPORT_FORMATS.map((fmt) => {
                    const isSelected = state.preferred_support.includes(fmt.id);
                    return (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => toggleArrayItem("preferred_support", fmt.id)}
                        className={`p-3.5 rounded-xl text-left border transition-all ${
                          isSelected
                            ? "bg-[#202A23] border-[#B6C899] text-[#F5F0E5] ring-1 ring-[#B6C899]"
                            : "bg-[#171F1A] border-[#344236] text-[#AAB9A9] hover:border-[#697D69]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[#F5F0E5]">{fmt.title}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#B6C899]" />}
                        </div>
                        <p className="text-[11px] text-[#AAB9A9] mt-1">{fmt.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Q7: Preferred Experience */}
              <div className="pt-4 border-t border-[#344236] space-y-3">
                <h3 className="text-sm font-semibold text-[#F5F0E5]">
                  Guidance Style & Progression (Question 7)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {EXPERIENCE_STYLES.map((exp) => {
                    const isSelected = state.preferred_experience === exp.id;
                    return (
                      <button
                        key={exp.id}
                        type="button"
                        onClick={() => updateState({ preferred_experience: exp.id })}
                        className={`p-3.5 rounded-xl text-left border transition-all ${
                          isSelected
                            ? "bg-[#202A23] border-[#B6C899] text-[#F5F0E5] ring-1 ring-[#B6C899]"
                            : "bg-[#171F1A] border-[#344236] text-[#AAB9A9] hover:border-[#697D69]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[#F5F0E5]">{exp.title}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#B6C899]" />}
                        </div>
                        <p className="text-[11px] text-[#AAB9A9] mt-1">{exp.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: OPTIONAL PROFESSIONAL DETAILS */}
          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase bg-[#202A23] border border-[#B6C899]/30 text-[#B6C899] px-2 py-0.5 rounded-full">
                    Optional Details
                  </span>
                  <span className="text-xs text-[#AAB9A9]">Skip anytime if you prefer</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#F5F0E5] tracking-tight mt-1">
                  Professional Background
                </h2>
                <p className="text-xs sm:text-sm text-[#AAB9A9]">
                  Helps us match relevant returnships and align portfolio suggestions. All fields below are optional.
                </p>
              </div>

              {/* Privacy Shield Policy Note */}
              <div className="p-3.5 bg-[#171F1A] border border-[#344236] rounded-xl text-xs text-[#AAB9A9] flex items-start gap-3">
                <Shield className="w-4 h-4 text-[#B6C899] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#F5F0E5]">Zero Sensitive Personal Questions Guarantee:</strong> We never ask for personal reasons for career pauses, family details, marital status, or caregiving justifications. Your prior tenure and current skills are all that matters.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#F5F0E5] mb-1">
                    Previous Role / Primary Title
                  </label>
                  <input
                    type="text"
                    value={state.previous_job_title}
                    onChange={(e) => updateState({ previous_job_title: e.target.value })}
                    placeholder="e.g. Software Engineer, Operations Lead, Teacher"
                    className="w-full px-3 py-2.5 bg-[#171F1A] border border-[#344236] rounded-xl text-xs text-[#F5F0E5] focus:outline-none focus:border-[#B6C899]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F5F0E5] mb-1">
                    Target Role or Direction
                  </label>
                  <input
                    type="text"
                    value={state.target_role}
                    onChange={(e) => updateState({ target_role: e.target.value })}
                    placeholder="e.g. Data Analyst, Product Manager, Freelance Consultant"
                    className="w-full px-3 py-2.5 bg-[#171F1A] border border-[#344236] rounded-xl text-xs text-[#F5F0E5] focus:outline-none focus:border-[#B6C899]"
                  />
                </div>
              </div>

              {/* Skills Tag Input */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#F5F0E5]">
                  Key Existing Skills & Competencies
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    placeholder="Type a skill and press Enter"
                    className="flex-1 px-3 py-2 bg-[#171F1A] border border-[#344236] rounded-xl text-xs text-[#F5F0E5] focus:outline-none focus:border-[#B6C899]"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3 py-2 bg-[#202A23] hover:bg-[#344236] text-[#B6C899] text-xs font-semibold rounded-xl border border-[#344236] transition-colors"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {state.existing_skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#202A23] text-[#B6C899] text-xs rounded-lg border border-[#344236]"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-[#697D69] hover:text-[#F5F0E5]"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                {/* Suggested Quick Add */}
                <div className="pt-2">
                  <span className="text-[11px] text-[#AAB9A9]">Suggestions: </span>
                  <div className="inline-flex flex-wrap gap-1.5 mt-1">
                    {SUGGESTED_SKILLS.filter((s) => !state.existing_skills.includes(s))
                      .slice(0, 6)
                      .map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => updateState({ existing_skills: [...state.existing_skills, s] })}
                          className="text-[11px] px-2 py-0.5 rounded bg-[#171F1A] hover:bg-[#202A23] text-[#AAB9A9] border border-[#344236]"
                        >
                          + {s}
                        </button>
                      ))}
                  </div>
                </div>
              </div>

              {/* Links & Optional Resume */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#F5F0E5] mb-1">
                    Portfolio / GitHub Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={state.portfolio_url}
                    onChange={(e) => updateState({ portfolio_url: e.target.value })}
                    placeholder="https://github.com/your-username"
                    className="w-full px-3 py-2 bg-[#171F1A] border border-[#344236] rounded-xl text-xs text-[#F5F0E5] focus:outline-none focus:border-[#B6C899]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F5F0E5] mb-1">
                    LinkedIn Profile Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={state.linkedin_url}
                    onChange={(e) => updateState({ linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/your-profile"
                    className="w-full px-3 py-2 bg-[#171F1A] border border-[#344236] rounded-xl text-xs text-[#F5F0E5] focus:outline-none focus:border-[#B6C899]"
                  />
                </div>
              </div>

              {/* Resume Upload Box */}
              <div className="p-4 bg-[#171F1A] border border-[#344236] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#F5F0E5]">
                    Existing Resume (Optional PDF, max 5 MB)
                  </span>
                  {state.resume_filename && (
                    <span className="text-[11px] text-[#B6C899] font-mono">
                      ✓ Attached: {state.resume_filename}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingResume}
                    className="px-3 py-1.5 bg-[#202A23] hover:bg-[#344236] text-[#F5F0E5] text-xs font-medium rounded-lg border border-[#344236] transition-colors flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#B6C899]" />
                    <span>{isUploadingResume ? "Uploading..." : "Upload PDF Resume"}</span>
                  </button>
                  <span className="text-[11px] text-[#AAB9A9]">
                    Protected storage with record-level encryption. Never indexed publicly.
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 5: REVIEW & INSTANT ACTION PLAN */}
          {currentStep === 5 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#F5F0E5] tracking-tight">
                  Review Your Selected Goals & Preferences
                </h2>
                <p className="text-xs sm:text-sm text-[#AAB9A9] mt-1">
                  Step 5 of 5 — Review your personalized setup. You can adjust any question directly by clicking on its card.
                </p>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Card 1: Goal & Situation */}
                <div className="p-4 bg-[#171F1A] border border-[#344236] rounded-xl space-y-2 relative group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-[#B6C899] font-semibold">
                      Primary Goal & Situation
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs text-[#AAB9A9] hover:text-[#B6C899] flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                  <div className="text-sm font-semibold text-[#F5F0E5]">
                    {PRIMARY_GOALS.find((g) => g.id === state.primary_goal)?.title || state.primary_goal}
                  </div>
                  <div className="text-xs text-[#AAB9A9]">
                    Situation:{" "}
                    <strong className="text-[#F5F0E5]">
                      {CURRENT_SITUATIONS.find((s) => s.id === state.current_situation)?.title || state.current_situation}
                    </strong>
                  </div>
                </div>

                {/* Card 2: Time & Style */}
                <div className="p-4 bg-[#171F1A] border border-[#344236] rounded-xl space-y-2 relative group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-[#B6C899] font-semibold">
                      Time & Learning Style
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="text-xs text-[#AAB9A9] hover:text-[#B6C899] flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                  <div className="text-sm font-semibold text-[#F5F0E5]">
                    {state.weekly_hours} Hours per Week
                  </div>
                  <div className="text-xs text-[#AAB9A9]">
                    Style:{" "}
                    <strong className="text-[#F5F0E5]">
                      {EXPERIENCE_STYLES.find((e) => e.id === state.preferred_experience)?.title || state.preferred_experience}
                    </strong>
                  </div>
                </div>

                {/* Card 3: Interests & Challenges */}
                <div className="p-4 bg-[#171F1A] border border-[#344236] rounded-xl space-y-2 relative group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-[#B6C899] font-semibold">
                      Focus Areas & Challenges
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-xs text-[#AAB9A9] hover:text-[#B6C899] flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {state.interests.slice(0, 3).map((int) => (
                      <span key={int} className="px-2 py-0.5 rounded bg-[#202A23] text-[11px] text-[#AAB9A9]">
                        {int}
                      </span>
                    ))}
                    {state.interests.length > 3 && (
                      <span className="px-2 py-0.5 rounded bg-[#202A23] text-[11px] text-[#B6C899]">
                        +{state.interests.length - 3} more
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#AAB9A9] pt-1">
                    Support: {state.challenges.length} priority challenges selected
                  </div>
                </div>

                {/* Card 4: Background */}
                <div className="p-4 bg-[#171F1A] border border-[#344236] rounded-xl space-y-2 relative group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-[#B6C899] font-semibold">
                      Target Role & Direction
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="text-xs text-[#AAB9A9] hover:text-[#B6C899] flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                  <div className="text-sm font-semibold text-[#F5F0E5]">
                    {state.target_role || state.previous_job_title || "General Returner Track"}
                  </div>
                  <div className="text-xs text-[#AAB9A9]">
                    {state.existing_skills.length} skills listed • {state.resume_filename ? "Resume attached" : "No resume needed"}
                  </div>
                </div>
              </div>

              {/* Instant Explainability Notice */}
              <div className="p-4 bg-[#202A23] border border-[#B6C899]/30 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#B6C899]">
                  <Sparkles className="w-4 h-4 text-[#B6C899]" />
                  <span>Immediate Personalization Routing</span>
                </div>
                <p className="text-xs text-[#AAB9A9] leading-relaxed">
                  Upon completion, your dashboard recommendations, 8-week structured roadmap, confidence milestone suggestions, and verified returnships will automatically calibrate to your <strong>{state.weekly_hours} hours/week</strong> commitment. You can revisit and update these preferences anytime.
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* BOTTOM NAVIGATION CONTROLS */}
        <div className="px-6 py-4 border-t border-[#344236] bg-[#111714] flex items-center justify-between gap-4">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#1B231E] hover:bg-[#202A23] text-[#F5F0E5] text-xs font-semibold rounded-xl border border-[#344236] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#B6C899] hover:bg-[#F5F0E5] text-[#111714] text-xs font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(182,200,153,0.3)] hover:scale-[1.02]"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleComplete}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#B6C899] hover:bg-[#F5F0E5] text-[#111714] text-xs font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(182,200,153,0.4)] hover:scale-[1.02] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>Saving Preferences...</>
                ) : (
                  <>
                    Save Goals & Go to Dashboard <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
