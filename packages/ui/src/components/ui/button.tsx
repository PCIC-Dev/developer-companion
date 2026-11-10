import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-[12px] border-[1.5px] px-6 text-base font-bold text-primary-foreground transition-transform duration-150 hover:-translate-y-px active:scale-[.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-[3px] focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:translate-y-0 disabled:border-transparent disabled:bg-muted disabled:text-muted-foreground",
  {
    variants: {
      variant: {
        default: "border-primary bg-primary",
        alt: "border-foreground bg-transparent text-foreground",
        ghost:
          "border-transparent bg-transparent text-foreground underline underline-offset-4 hover:bg-transparent",
      },
      size: {
        default: "",
        sm: "px-[18px] text-[0.88rem]",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

function Button({ asChild = false, className, size, variant, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ className, size, variant }))} {...props} />;
}

export { Button, buttonVariants };
