import { cn } from "@/lib/cn";
import { type RiskLevel } from "@/lib/constants";

interface RiskBadgeProps {
  level: RiskLevel;
  size?: "sm" | "md";
  pulse?: boolean;
  className?: string;
  /** Show counselor-facing label (YELLOW/RED/GREEN) vs student-safe label */
  clinical?: boolean;
}

const CLINICAL_LABELS: Record<RiskLevel, string> = {
  GREEN: "Green",
  YELLOW: "Yellow",
  RED: "Red",
};

const STUDENT_LABELS: Record<RiskLevel, string> = {
  GREEN: "Doing well",
  YELLOW: "Support available",
  RED: "Prioritised for care",
};

export default function RiskBadge({
  level,
  size = "md",
  pulse = false,
  className,
  clinical = false,
}: RiskBadgeProps) {
  const styles: Record<RiskLevel, string> = {
    GREEN:  "bg-[#E8F2EE] text-[#3D5A54] border border-[#B8D4C0]",
    YELLOW: "bg-[#FEF4E0] text-[#A0700A] border border-[#E8D4B0]",
    RED:    "bg-[#FDEAEA] text-[#B03030] border border-[#F5B8B8]",
  };

  const dots: Record<RiskLevel, string> = {
    GREEN:  "bg-[#7BA89A]",
    YELLOW: "bg-[#D4900A]",
    RED:    "bg-[#B03030]",
  };

  const sizes = {
    sm: "text-xs px-2.5 py-0.5 gap-1",
    md: "text-sm px-3 py-1 gap-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-sans font-medium",
        styles[level],
        sizes[size],
        pulse && level === "RED" && "animate-pulse-ring",
        className
      )}
    >
      <span
        className={cn(
          "rounded-full flex-shrink-0",
          dots[level],
          size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2"
        )}
      />
      {clinical ? CLINICAL_LABELS[level] : STUDENT_LABELS[level]}
    </span>
  );
}
