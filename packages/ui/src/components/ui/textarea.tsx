import type { TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "mt-2 flex min-h-[104px] w-full resize-y rounded-[12px] border-[1.5px] border-input bg-background px-[14px] py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-[3px] focus-visible:ring-offset-background",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
