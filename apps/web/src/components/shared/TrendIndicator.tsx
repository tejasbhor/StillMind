import { cn } from "@/utils/cn";
import { type TrendValue } from "@/utils/constants";

interface TrendIndicatorProps {
  trend: TrendValue;
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

export default function TrendIndicator({
  trend,
  size = "md",
  showLabel = true,
  className,
}: TrendIndicatorProps) {
  const config: Record<TrendValue, { icon: string; label: string; color: string }> = {
    IMPROVING: { icon: "↑", label: "Improving",  color: "text-[#3D5A54] bg-[#E8F2EE]" },
    STABLE:    { icon: "→", label: "Stable",     color: "text-[#A0700A] bg-[#FEF4E0]" },
    WORSENING: { icon: "↓", label: "Worsening",  color: "text-[#B03030] bg-[#FDEAEA]" },
  };

  const c = config[trend];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-sans font-medium",
        c.color,
        size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-2.5 py-1",
        className
      )}
    >
      <span aria-hidden className={size === "sm" ? "text-xs" : "text-sm"}>
        {c.icon}
      </span>
      {showLabel && c.label}
    </span>
  );
}

