import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

function Tag({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex h-8 items-center rounded-full bg-secondary px-3.5 text-[0.84rem] font-bold",
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
        "font-mono text-[0.72rem] uppercase tracking-[.08em] text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
function Meta({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-[0.92rem] text-muted-foreground", className)} {...props} />;
}

export { Eyebrow, Meta, Tag };
