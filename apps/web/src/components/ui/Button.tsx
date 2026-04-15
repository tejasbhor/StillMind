import { cn } from "@/lib/cn";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger" | "amber" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 rounded-full font-sans font-medium transition-all duration-200 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D5A54] focus-visible:ring-offset-2 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
      primary:
        "bg-[#5C8A7B] text-white hover:bg-[#3D5A54] hover:shadow-[0_4px_16px_rgba(61,90,84,0.25)]",
      ghost:
        "bg-transparent text-[#3E5C52] border border-[#B8D4C0] hover:border-[#7BA89A] hover:bg-[#E8F2EE]",
      danger:
        "bg-[#FDEAEA] text-[#B03030] border border-[#F5B8B8] hover:bg-[#F5B8B8] hover:text-white",
      amber:
        "bg-[#FEF4E0] text-[#855C08] border border-[#E8D4B0] hover:bg-[#E8D4B0] hover:text-[#3D5A54]",
      outline:
        "bg-transparent text-[#3D5A54] border border-[#B8D4C0] hover:border-[#3D5A54] hover:bg-[#F5F3EF]",
    };

    const sizes = {
      sm: "text-sm px-4 py-1.5",
      md: "text-[0.9375rem] px-6 py-2.5",
      lg: "text-base px-8 py-3.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? (
          <>
            <span
              className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              aria-hidden
            />
            <span>Loading…</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
