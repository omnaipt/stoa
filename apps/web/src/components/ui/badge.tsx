import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Cores via tokens semânticos (definidos em index.css), nunca hardcoded.
// Todas as combinações fg/bg verificadas para contraste AA em texto pequeno.
export const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        neutral: "border-transparent bg-muted text-muted-foreground",
        confirmada:
          "border-transparent bg-[hsl(var(--status-confirmed-bg))] text-[hsl(var(--status-confirmed-fg))]",
        sentada:
          "border-transparent bg-[hsl(var(--status-seated-bg))] text-[hsl(var(--status-seated-fg))]",
        cancelada:
          "border-transparent bg-[hsl(var(--status-cancelled-bg))] text-[hsl(var(--status-cancelled-fg))]",
        no_show:
          "border-transparent bg-[hsl(var(--status-noshow-bg))] text-[hsl(var(--status-noshow-fg))]",
        pendente:
          "border-transparent bg-[hsl(var(--status-pending-bg))] text-[hsl(var(--status-pending-fg))]",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
