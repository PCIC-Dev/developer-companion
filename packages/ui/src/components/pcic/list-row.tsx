import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";
function ListRow({
  highlight = false,
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { highlight?: boolean; children?: ReactNode }) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 border-b border-border py-3.5 first:pt-0 last:border-b-0 last:pb-0",
        highlight && "m-[-12px] rounded-[10px] border-b-0 bg-primary/20 p-3",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
export { ListRow };
