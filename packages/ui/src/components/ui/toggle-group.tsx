import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { cn } from "../../lib/utils";

function SegmentedControl({
  className,
  ...props
}: Omit<ToggleGroupPrimitive.ToggleGroupSingleProps, "type">) {
  return (
    <ToggleGroupPrimitive.Root
      type="single"
      className={cn("flex gap-0.5 rounded-[12px] bg-secondary p-[3px]", className)}
      {...props}
    />
  );
}

function SegmentedControlItem({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>) {
  return (
    <ToggleGroupPrimitive.Item
      className={cn(
        "min-h-9 flex-1 rounded-[9px] px-1.5 text-[0.82rem] font-bold text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-[3px] focus-visible:ring-offset-background data-[state=on]:bg-solid data-[state=on]:text-solid-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { SegmentedControl, SegmentedControlItem };
