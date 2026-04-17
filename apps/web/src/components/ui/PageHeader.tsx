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
          <Link href={backHref} className="font-sans text-sm text-[#7BA89A] hover:text-[#3D5A54]">
            ← {backLabel || "Back"}
          </Link>
        )}
        <h1 className="font-serif text-3xl text-[#3D5A54] mt-1">{title}</h1>
        {subtitle && (
          <p className="font-sans text-base text-[#3D5A54]/70 mt-1">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
