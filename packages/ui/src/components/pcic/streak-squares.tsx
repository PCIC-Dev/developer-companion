import { cn } from "../../lib/utils";

interface StreakItem {
  state: "done" | "empty" | "next";
  label?: string;
}
function StreakSquares({ items, className }: { items: StreakItem[]; className?: string }) {
  return (
    <div className={cn("my-4 flex gap-2", className)}>
      {items.map((item, index) => (
        <span
          key={`${item.label ?? "square"}-${index}`}
          className={cn(
            "grid min-h-10 flex-1 place-items-center rounded-[10px] px-1 text-center font-mono text-[0.68rem] font-bold",
            item.state === "done" && "bg-solid text-solid-foreground",
            item.state === "next" && "border-2 border-primary text-foreground",
            item.state === "empty" && "border-2 border-dashed border-border text-muted-foreground",
          )}
        >
          {item.label}
        </span>
      ))}
    </div>
  );
}

export { StreakSquares };
