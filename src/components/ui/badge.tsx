import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none transition-all duration-200 overflow-hidden font-['Montserrat']",
  {
    variants: {
      variant: {
        // Default - Solid black
        default: "bg-black text-white border border-black",

        // Gold - Primary accent
        gold: "bg-[#C5A572] text-black border border-[#C5A572]",

        // Outline - Black border
        outline: "bg-transparent text-black border-2 border-black",

        // Outline Gold - Gold border
        "outline-gold":
          "bg-transparent text-[#C5A572] border-2 border-[#C5A572]",

        // Soft - Muted background
        soft: "bg-black/5 text-black border border-transparent",

        // Soft Gold - Gold tinted background
        "soft-gold": "bg-[#C5A572]/10 text-[#C5A572] border border-transparent",

        // Secondary - Light gray
        secondary: "bg-[#F8F6F3] text-[#4B5563] border border-[#E5E5E5]",

        // Success - Green
        success: "bg-emerald-500 text-white border border-emerald-500",

        // Warning - Amber
        warning: "bg-amber-500 text-black border border-amber-500",

        // Destructive - Red
        destructive: "bg-red-500 text-white border border-red-500",

        // Info - Blue
        info: "bg-blue-500 text-white border border-blue-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
