import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[#C5A572]/30 active:scale-95 disabled:active:scale-100",
  {
    variants: {
      variant: {
        // Default - Solid black with gold hover (Primary CTA)
        default:
          "bg-black text-white hover:bg-[#C5A572] hover:text-black border border-black hover:border-[#C5A572] font-semibold",

        // Gold - Primary accent button
        gold: "bg-[#C5A572] text-black hover:bg-[#A8894E] border border-[#C5A572] hover:border-[#A8894E] font-semibold",

        // Outline - Elegant black border
        outline:
          "border-2 border-black text-black bg-transparent hover:bg-black hover:text-white font-semibold",

        // Outline Gold - Premium gold outline
        "outline-gold":
          "border-2 border-[#C5A572] text-[#C5A572] bg-transparent hover:bg-[#C5A572] hover:text-black font-semibold",

        // Secondary - Soft background
        secondary:
          "bg-[#F8F6F3] text-black hover:bg-[#E5E5E5] border border-[#E5E5E5] font-medium",

        // Ghost - Minimal
        ghost: "text-black hover:bg-black/5 font-medium",

        // Ghost Gold - Minimal accent
        "ghost-gold": "text-[#C5A572] hover:bg-[#C5A572]/10 font-medium",

        // Link - Underline style
        link: "text-black underline-offset-4 hover:underline hover:text-[#C5A572] font-medium p-0 h-auto",

        // Destructive - Error/Delete actions
        destructive:
          "bg-red-600 text-white hover:bg-red-700 border border-red-600 hover:border-red-700 font-semibold",
      },
      size: {
        sm: "h-9 px-4 text-sm rounded-md",
        default: "h-11 px-6 text-sm rounded-md",
        lg: "h-12 px-8 text-base rounded-md",
        xl: "h-14 px-10 text-base rounded-lg",
        icon: "size-10 rounded-full",
        "icon-sm": "size-8 rounded-full",
        "icon-lg": "size-12 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
