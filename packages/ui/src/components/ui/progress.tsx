import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "../../lib/utils";

function Progress({
  className,
  value = 0,
  ...props
}: React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      className={cn("h-2.5 overflow-hidden rounded-[6px] bg-border", className)}
      value={value}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full rounded-[6px] bg-primary transition-[width] duration-500"
        style={{ width: `${value}%` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
