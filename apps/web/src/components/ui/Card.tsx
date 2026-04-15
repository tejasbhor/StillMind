import { cn } from "@/lib/cn";
import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export default function Card({
  className,
  hover = true,
  glow = false,
  padding = "md",
  children,
  ...props
}: CardProps) {
  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={cn(
        "bg-white border border-[#E8F2EE] rounded-[20px] shadow-[0_2px_16px_0_rgba(61,90,84,0.07)]",
        hover && "transition-all duration-200 hover:shadow-[0_4px_24px_0_rgba(61,90,84,0.10)] hover:-translate-y-px",
        glow && "ring-1 ring-[#B8D4C0]",
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
