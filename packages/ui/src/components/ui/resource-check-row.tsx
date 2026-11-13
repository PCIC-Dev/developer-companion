import { Check } from "lucide-react";
import { cn } from "../../lib/utils";

function ResourceCheckRow({
  checked,
  onCheckedChange,
  title,
  subtitle,
  xp,
  className,
}: {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  title: string;
  subtitle?: string;
  xp?: number;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "flex min-h-[60px] w-full items-center gap-4 border-0 border-b border-border bg-transparent px-0 py-2 text-left focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-[3px] focus-visible:ring-offset-background",
        className,
      )}
    >
      <span
        className={cn(
          "grid size-[26px] flex-none place-items-center rounded-lg border-2 border-muted-foreground font-bold text-transparent",
          checked && "border-primary bg-primary text-primary-foreground",
        )}
      >
        <Check size={17} aria-hidden="true" />
      </span>
      <span className={cn("flex-1 font-semibold", checked && "text-muted-foreground line-through")}>
        <span>{title}</span>
        {subtitle && (
          <small className="block text-[0.82rem] font-medium text-muted-foreground">
            {subtitle}
          </small>
        )}
      </span>
      {xp !== undefined && <span className="font-mono text-[0.8rem] font-bold">+{xp} XP</span>}
    </button>
  );
}

export { ResourceCheckRow };
