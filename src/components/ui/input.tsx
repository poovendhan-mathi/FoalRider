import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base styles
        "w-full h-12 px-4 text-base",
        "font-['Montserrat'] text-black placeholder:text-[#9CA3AF]",

        // Border & Background
        "bg-white border border-[#E5E5E5] rounded-lg",

        // Focus state - Gold accent
        "focus:outline-none focus:border-[#C5A572] focus:ring-2 focus:ring-[#C5A572]/20",

        // Transition
        "transition-all duration-200",

        // Disabled
        "disabled:bg-[#F8F6F3] disabled:cursor-not-allowed disabled:opacity-60",

        // File input styles
        "file:border-0 file:bg-[#C5A572] file:text-black file:px-4 file:py-2 file:mr-4 file:rounded-md file:font-medium file:cursor-pointer",

        // Error state
        "aria-invalid:border-red-500 aria-invalid:ring-red-500/20",

        className
      )}
      {...props}
    />
  );
}

export { Input };
