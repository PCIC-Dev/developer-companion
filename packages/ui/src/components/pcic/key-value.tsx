import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
function KeyValue({
  items,
  className,
}: {
  items: { label: string; value: ReactNode }[];
  className?: string;
}) {
  return (
    <dl className={cn("grid grid-cols-[120px_1fr] gap-x-4 gap-y-3 max-sm:grid-cols-1", className)}>
      {items.map((item) => (
        <div key={item.label} className="contents">
          <dt className="font-mono text-[0.68rem] uppercase tracking-[.07em] text-muted-foreground">
            {item.label}
          </dt>
          <dd className="m-0 font-semibold">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
export { KeyValue };
