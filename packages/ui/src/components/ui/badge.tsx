import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex h-[26px] items-center gap-1.5 rounded-full border-[1.5px] px-3 font-mono text-[0.68rem] font-bold uppercase tracking-[.04em]",
  {
    variants: {
      variant: {
        default: "border-transparent bg-solid text-solid-foreground",
        ok: "border-transparent bg-solid text-solid-foreground",
        attn: "border-transparent bg-primary text-primary-foreground",
        wait: "border-muted-foreground text-foreground",
        mut: "border-border text-muted-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

const glyphs = { default: "✓", ok: "✓", attn: "!", wait: "…", mut: "·" } as const;

function Badge({ children, className, variant = "default", ...props }: BadgeProps) {
  const safeVariant = variant ?? "default";
  return (
    <span className={cn(badgeVariants({ className, variant: safeVariant }))} {...props}>
      <span aria-hidden="true">{glyphs[safeVariant]}</span>
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
