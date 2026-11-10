import type { HTMLAttributes } from "react";

import { cn } from "../../lib/utils";

function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[14px] border border-border bg-card p-6 text-card-foreground",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mb-4 flex flex-row items-center justify-between gap-4", className)}
      {...props}
    />
  );
}

function CardTitle({
  as: Comp = "h2",
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement> & { as?: "h2" | "h3" }) {
  return (
    <Comp
      className={cn(
        "font-heading font-semibold tracking-[-.01em]",
        Comp === "h2" ? "text-[1.3rem] leading-[1.25]" : "text-[1.05rem] leading-[1.3]",
        className,
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-0", className)} {...props} />;
}

function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center pt-6", className)} {...props} />;
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
