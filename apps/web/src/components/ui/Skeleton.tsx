import { cn } from "@/lib/cn";

interface SkeletonProps {
  className?: string;
  rounded?: string;
}

export default function Skeleton({ className, rounded = "rounded-xl" }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("skeleton", rounded, "min-h-[1rem]", className)}
    />
  );
}
