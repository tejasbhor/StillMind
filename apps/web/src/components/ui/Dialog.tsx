"use client";

import { cn } from "@/utils/cn";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react";

/**
 * StillMind Dialog (Modal) Component
 * Built on Radix UI for accessibility (Focus trapping, Aria-labels, ESC).
 * Stylized with premium glassmorphic overlay and smooth motion.
 */

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;

export const DialogOverlay = forwardRef<
  ElementRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    asChild
  >
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "fixed inset-0 z-50 bg-teal/10 backdrop-blur-md transition-opacity duration-300",
        className
      )}
      {...Object.fromEntries(Object.entries(props).filter(([key]) => !key.startsWith("onAnimation")))}
    />
  </DialogPrimitive.Overlay>
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

export const DialogContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      asChild
      {...props}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-6 border border-white/30 bg-white/95 p-8 shadow-float backdrop-blur-2xl rounded-3xl md:w-full",
          className
        )}
        {...Object.fromEntries(Object.entries(props).filter(([key]) => !key.startsWith("onAnimation")))}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-6 top-6 rounded-full opacity-50 ring-offset-white transition-opacity hover:opacity-100 outline-none focus:ring-2 focus:ring-teal-mid focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-cream data-[state=open]:text-teal">
          <X className="h-6 w-6" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </motion.div>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

export const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-2 text-left", className)}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

export const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3", className)}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

export const DialogTitle = forwardRef<
  ElementRef<typeof DialogPrimitive.Title>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-2xl font-serif text-teal leading-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

export const DialogDescription = forwardRef<
  ElementRef<typeof DialogPrimitive.Description>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-base text-teal-muted font-sans leading-relaxed", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

/**
 * Legacy Modal Alias for StillMind Portal compatibility
 */
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Modal({ open, onClose, title, children, size = "md", className }: ModalProps) {
  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-xl",
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className={cn(sizes[size], className)}>
        {title && (
          <DialogHeader className="mb-2">
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        )}
        <div className="py-2">{children}</div>
      </DialogContent>
    </Dialog>
  );
}

export default Dialog;
