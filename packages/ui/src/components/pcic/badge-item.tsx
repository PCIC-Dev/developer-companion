import { cn } from "../../lib/utils";
function BadgeItem({
  title,
  earned,
  className,
}: {
  title: string;
  earned?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <i
        className={cn(
          "grid size-10 place-items-center rounded-full bg-solid font-heading text-lg not-italic text-solid-foreground",
          !earned && "border-2 border-dashed border-border bg-transparent text-muted-foreground",
        )}
      >
        {earned ? "★" : "?"}
      </i>
      <div>
        <b>{title}</b>
        <div className="text-[0.92rem] text-muted-foreground">{earned ? "Earned" : "Locked"}</div>
      </div>
    </div>
  );
}
export { BadgeItem };
