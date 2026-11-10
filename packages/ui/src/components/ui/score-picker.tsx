import { cn } from "../../lib/utils";

function ScorePicker({
  value,
  onValueChange,
  className,
}: {
  value?: number;
  onValueChange?: (value: number) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-2", className)} role="group" aria-label="Score from 0 to 4">
      {[0, 1, 2, 3, 4].map((score) => (
        <button
          type="button"
          key={score}
          aria-pressed={value === score}
          onClick={() => onValueChange?.(score)}
          className="min-h-11 min-w-11 rounded-[10px] border-[1.5px] border-border bg-transparent font-mono text-[0.9rem] font-bold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-[3px] focus-visible:ring-offset-background aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
        >
          {score}
        </button>
      ))}
    </div>
  );
}

export { ScorePicker };
