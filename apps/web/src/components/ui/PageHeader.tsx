import Link from "next/link";
import { cn } from "@/utils/cn";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
  className?: string;
}

export default function PageHeader({ title, subtitle, backHref, backLabel, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4 mb-8", className)}>
      <div>
        {backHref && (
          <Link
            href={backHref}
            className="font-sans text-sm font-semibold text-sage hover:text-teal-dark transition-colors underline-reveal w-fit"
          >
            ← {backLabel || "Back"}
          </Link>
        )}
        <h1 className="font-serif text-3xl md:text-4xl tracking-tight text-teal-dark mt-2">
          {title}
        </h1>
        {subtitle && (
          <p className="font-sans text-base text-teal/70 mt-2 leading-relaxed max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
