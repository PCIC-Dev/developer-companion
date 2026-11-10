import { cn } from "../../lib/utils";

function SegmentBar({
  count,
  filled,
  complete = false,
  className,
}: {
  count: number;
  filled: number;
  complete?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn("my-4 flex gap-1", className)}
      role="progressbar"
      aria-valuenow={filled}
      aria-valuemin={0}
      aria-valuemax={count}
    >
      {Array.from({ length: count }, (_, index) => (
        <b
          key={index}
          className={cn(
            "h-3 flex-1 rounded-[3px] bg-border",
            index < filled && (complete ? "bg-solid" : "bg-primary"),
          )}
        />
      ))}
    </div>
  );
}

export { SegmentBar };
