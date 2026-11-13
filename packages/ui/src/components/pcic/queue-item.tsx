import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";
function QueueItem({
  selected,
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean; children?: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "w-full rounded-[14px] border border-border bg-card p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-[3px] focus-visible:ring-offset-background aria-pressed:border-primary aria-pressed:bg-primary/10",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
export { QueueItem };
