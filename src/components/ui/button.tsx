import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "liquid-pill relative inline-flex items-center justify-center gap-2 whitespace-nowrap text-[11px] font-medium tracking-[0.08em] transition-all duration-250 text-white/80 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
  {
    variants: {
      variant: {
        default:
          "border border-white/20 bg-white/5 text-white hover:border-white/30 hover:text-white hover:bg-white/10",
        gradient:
          "border border-white/20 bg-[linear-gradient(135deg,rgba(255,122,41,0.55),rgba(143,91,255,0.50))] text-white shadow-[0_16px_48px_-32px_rgba(255,122,41,0.55)] hover:border-white/30 hover:shadow-[0_20px_56px_-32px_rgba(255,122,41,0.65)]",
        destructive:
          "border border-[#ff3b30]/40 bg-[#ff3b30]/40 text-white hover:border-[#ff3b30]/60",
        outline:
          "border border-white/20 bg-white/5 text-white/70 hover:text-white hover:border-white/30 hover:bg-white/10",
        ghost:
          "border border-transparent bg-transparent text-white/60 hover:text-white hover:border-white/20 hover:bg-white/5",
        link: "border-0 bg-transparent px-0 text-white/70 underline-offset-4 hover:text-white hover:underline",
      },
      size: {
        default: "h-10 px-5",
        sm: "h-8 px-3.5 gap-1.5 text-[10px]",
        lg: "h-11 px-7 text-[11px]",
        icon: "h-10 w-10",
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
