import { cn } from "@/lib/cn";
import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="font-sans text-sm font-medium text-[#3D5A54]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-xl border border-[#B8D4C0] bg-white px-4 py-2.5",
            "font-sans text-[0.9375rem] text-[#3D5A54] placeholder:text-[#94A3B8]",
            "transition-all duration-200 outline-none",
            "focus:border-[#7BA89A] focus:ring-2 focus:ring-[#7BA89A]/20",
            error && "border-[#F5B8B8] focus:border-[#B03030] focus:ring-[#B03030]/20",
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="font-sans text-xs text-[#7F96B8]">{hint}</p>
        )}
        {error && (
          <p className="font-sans text-xs text-[#B03030]">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
