import {
  flattenPortalNav,
  STUDENT_NAV_SECTIONS,
  COUNSELOR_NAV_SECTIONS,
  ADMIN_NAV_SECTIONS,
} from "@/utils/portal-nav";

// ── Risk Levels ────────────────────────────────────────────────────────────────
export const RISK_LEVELS = ["GREEN", "YELLOW", "RED"] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

export const RISK_SOFT_LABELS: Record<RiskLevel, string> = {
  GREEN: "You're doing well",
  YELLOW: "Some support is available",
  RED: "You've been prioritised for care",
};

// ── Trend ──────────────────────────────────────────────────────────────────────
export const TREND_VALUES = ["IMPROVING", "STABLE", "WORSENING"] as const;
export type TrendValue = (typeof TREND_VALUES)[number];

// ── Social Isolation ───────────────────────────────────────────────────────────
export const ISOLATION_LEVELS = ["LOW", "MEDIUM", "HIGH"] as const;
export type IsolationLevel = (typeof ISOLATION_LEVELS)[number];

// ── PHQ-9 Questions ────────────────────────────────────────────────────────────
export const PHQ9_QUESTIONS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
  "Trouble concentrating on things, such as reading the newspaper or watching television",
  "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual",
  "Thoughts that you would be better off dead, or of hurting yourself in some way",
] as const;

export const PHQ9_Q9_WARNING =
  "This question asks about thoughts of self-harm. You can answer honestly — this helps us understand how to support you better.";

// ── GAD-7 Questions ────────────────────────────────────────────────────────────
export const GAD7_QUESTIONS = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it is hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid, as if something awful might happen",
] as const;

// ── Assessment frequency labels ────────────────────────────────────────────────
export const ASSESSMENT_FREQUENCY_LABELS: Record<string, string> = {
  GREEN: "Every 30 days",
  YELLOW: "Every 14 days",
  RED: "Every 7 days",
};

// ── Response scale labels ──────────────────────────────────────────────────────
export const RESPONSE_SCALE = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "Several days" },
  { value: 2, label: "More than half the days" },
  { value: 3, label: "Nearly every day" },
] as const;

// ── Key concerns (session notes) ───────────────────────────────────────────────
export const KEY_CONCERNS = [
  "ACADEMIC_STRESS",
  "SLEEP",
  "SOCIAL_ISOLATION",
  "ANXIETY",
  "DEPRESSION",
  "FAMILY",
  "FINANCES",
  "CAREER",
  "RELATIONSHIPS",
  "GRIEF",
] as const;

export const KEY_CONCERN_LABELS: Record<string, string> = {
  ACADEMIC_STRESS: "Academic stress",
  SLEEP: "Sleep issues",
  SOCIAL_ISOLATION: "Social isolation",
  ANXIETY: "Anxiety",
  DEPRESSION: "Low mood",
  FAMILY: "Family concerns",
  FINANCES: "Financial stress",
  CAREER: "Career / future",
  RELATIONSHIPS: "Relationships",
  GRIEF: "Grief / loss",
};

// ── Session status ─────────────────────────────────────────────────────────────
export const SESSION_STATUSES = [
  "SCHEDULED",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "MISSED",
  "CANCELLED",
] as const;

// ── Allocation status ──────────────────────────────────────────────────────────
export const ALLOCATION_STATUSES = [
  "PENDING_RANKING",
  "ASSIGNED",
  "CONFIRMED",
  "DECLINED",
  "EXPIRED",
  "RELEASED",
  "REASSIGNED",
  "COMPLETED",
] as const;
export type AllocationStatus = (typeof ALLOCATION_STATUSES)[number];

// ── Mood ───────────────────────────────────────────────────────────────────────
export const MOODS = ["LOW", "NEUTRAL", "HIGH"] as const;
export type MoodValue = (typeof MOODS)[number];

export const MOOD_LABELS: Record<MoodValue, { emoji: string; label: string }> = {
  LOW:     { emoji: "😔", label: "Low" },
  NEUTRAL: { emoji: "😐", label: "Neutral" },
  HIGH:    { emoji: "😊", label: "Positive" },
};

// ── Engagement ─────────────────────────────────────────────────────────────────
export const ENGAGEMENT_LEVELS = ["LOW", "MEDIUM", "HIGH"] as const;

// ── Nav links per role (flat lists; derived from grouped portal nav — single source) ──

export const STUDENT_NAV = flattenPortalNav(STUDENT_NAV_SECTIONS) as readonly {
  href: string;
  label: string;
  icon: string;
}[];

export const COUNSELOR_NAV = flattenPortalNav(COUNSELOR_NAV_SECTIONS) as readonly {
  href: string;
  label: string;
  icon: string;
}[];

export const ADMIN_NAV = flattenPortalNav(ADMIN_NAV_SECTIONS) as readonly {
  href: string;
  label: string;
  icon: string;
}[];

