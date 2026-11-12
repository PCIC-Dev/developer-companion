import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

function Tag({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-full bg-secondary px-3 text-xs font-semibold leading-none text-secondary-foreground",
        className,
      )}
      {...props}
    />
  );
}

function Eyebrow({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "font-mono text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function Meta({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm font-medium leading-6 text-muted-foreground", className)}
      {...props}
    />
  );
}

export { Eyebrow, Meta, Tag };
