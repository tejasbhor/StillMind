"use client";

import { cn } from "@/utils/cn";
import { forwardRef } from "react";

/**
 * StillMind Table Components
 * Clean, institutional layout for high-density information.
 */

export const Table = forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto rounded-2xl border border-teal/10 bg-white/40 backdrop-blur-sm">
      <table ref={ref} className={cn("w-full caption-bottom text-sm font-sans", className)} {...props} />
    </div>
  )
);
Table.displayName = "Table";

export const TableHeader = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => <thead ref={ref} className={cn("[&_tr]:border-b border-teal/10", className)} {...props} />
);
TableHeader.displayName = "TableHeader";

export const TableBody = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
);
TableBody.displayName = "TableBody";

export const TableFooter = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot ref={ref} className={cn("bg-teal/5 font-medium [&>tr]:last:border-b-0", className)} {...props} />
  )
);
TableFooter.displayName = "TableFooter";

export const TableRow = forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn("border-b border-teal/5 transition-colors hover:bg-teal/5 data-[state=selected]:bg-teal/10", className)}
      {...props}
    />
  )
);
TableRow.displayName = "TableRow";

export const TableHead = forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "h-12 px-5 text-left align-middle font-semibold text-teal-mid uppercase tracking-wider text-[0.7rem] [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
);
TableHead.displayName = "TableHead";

export const TableCell = forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td ref={ref} className={cn("p-5 align-middle text-teal-muted/90 [&:has([role=checkbox])]:pr-0", className)} {...props} />
  )
);
TableCell.displayName = "TableCell";

/**
 * StillMind Pagination
 */

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "./Button";

export const Pagination = ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
);
Pagination.displayName = "Pagination";

export const PaginationContent = forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn("flex flex-row items-center gap-2", className)} {...props} />
  )
);
PaginationContent.displayName = "PaginationContent";

export const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  ...props
}: any) => (
  <Button
    aria-current={isActive ? "page" : undefined}
    variant={isActive ? "primary" : "ghost"}
    size={size}
    className={className}
    {...props}
  />
);
PaginationLink.displayName = "PaginationLink";

export const PaginationPrevious = ({ className, ...props }: any) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="md"
    className={cn("gap-1 pl-2.5", className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>Previous</span>
  </PaginationLink>
);
PaginationPrevious.displayName = "PaginationPrevious";

export const PaginationNext = ({ className, ...props }: any) => (
  <PaginationLink
    aria-label="Go to next page"
    size="md"
    className={cn("gap-1 pr-2.5", className)}
    {...props}
  >
    <span>Next</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
);
PaginationNext.displayName = "PaginationNext";

export const PaginationEllipsis = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";
