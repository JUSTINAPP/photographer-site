import { ReactNode } from "react";
import { cn } from "./model";

const VARIANTS = {
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
  draft: "bg-slate-100 text-slate-600 border-slate-200",
  scheduled: "bg-blue-50 text-blue-700 border-blue-200",
  published: "bg-emerald-50 text-emerald-700 border-emerald-200",
  failed: "bg-rose-50 text-rose-700 border-rose-200",
  neutral: "bg-cream-dim text-ink-soft border-border",
  gold: "bg-gold/10 text-[#8a6d1f] border-gold/30",
};

export function Badge({
  children,
  variant = "neutral",
  className,
}: {
  children: ReactNode;
  variant?: keyof typeof VARIANTS;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        VARIANTS[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
