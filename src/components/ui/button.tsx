import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "liquid-pill relative inline-flex items-center justify-center gap-2 whitespace-nowrap text-[11px] font-semibold tracking-[0.16em] transition-all duration-300 text-white/80 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
  {
    variants: {
      variant: {
        default:
          "border border-white/25 bg-white/10 text-white hover:border-white/45 hover:text-white hover:bg-white/15",
        gradient:
          "border border-white/35 bg-[linear-gradient(135deg,rgba(91,143,255,0.65),rgba(172,110,255,0.6),rgba(255,138,92,0.65))] text-white shadow-[0_25px_60px_-35px_rgba(96,125,255,0.95)] hover:border-white/55",
        destructive:
          "border border-[#ff3b30]/40 bg-[#ff3b30]/40 text-white hover:border-[#ff3b30]/60",
        outline:
          "border border-white/25 bg-white/5 text-white/75 hover:text-white hover:border-white/45 hover:bg-white/12",
        ghost:
          "border border-transparent bg-transparent text-white/70 hover:text-white hover:border-white/25 hover:bg-white/8",
        link: "border-0 bg-transparent px-0 text-white underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 gap-1.5 text-[10px]",
        lg: "h-12 px-8 text-[12px]",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
    }
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = "Button";

export { Button, buttonVariants };
