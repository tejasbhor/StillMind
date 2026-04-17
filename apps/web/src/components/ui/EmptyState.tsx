"use client";

import { cn } from "@/utils/cn";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-8 text-center",
        className
      )}
    >
      {icon && (
        <div className="mb-4 text-[#7BA89A] opacity-60">{icon}</div>
      )}
      <h3 className="font-serif text-xl text-[#3D5A54] mb-2">{title}</h3>
      {description && (
        <p className="font-sans text-sm text-[#3D5A54]/60 max-w-sm mb-6">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="font-sans text-sm font-medium text-[#7BA89A] hover:text-[#5C8A7B] transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
