import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const cardVariants = cva(
  "flex flex-col rounded-xl transition-all duration-300",
  {
    variants: {
      variant: {
        // Default - Clean white with subtle border
        default: "bg-white border border-[#E5E5E5] shadow-sm",

        // Elevated - Premium shadow, no border
        elevated:
          "bg-white border-0 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10",

        // Warm - Premium warm white background
        warm: "bg-[#F8F6F3] border border-[#E5E5E5]",

        // Dark - Inverted for dark sections
        dark: "bg-[#1A1A1A] text-white border-0",

        // Accent - With gold top border
        accent:
          "bg-white border border-[#E5E5E5] border-t-2 border-t-[#C5A572]",

        // Glass - Transparent with blur
        glass: "bg-white/80 backdrop-blur-md border border-white/20 shadow-lg",

        // Outline - Border only, no shadow
        outline:
          "bg-transparent border-2 border-[#E5E5E5] hover:border-[#C5A572]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface CardProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof cardVariants> {}

function Card({ className, variant, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-2 p-6 pb-0", className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-['Playfair_Display'] text-xl font-semibold leading-tight text-black",
        className
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("font-['Montserrat'] text-sm text-[#9CA3AF]", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("absolute top-4 right-4", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="card-content" className={cn("p-6", className)} {...props} />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  cardVariants,
};
