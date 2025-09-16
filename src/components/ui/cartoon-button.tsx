import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cartoonButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-bold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 outline-none",
  {
    variants: {
      variant: {
        // Header nav button style (bg-light-primary with hover:text-accent-primary)
        nav: "bg-[#fafafa] text-white hover:text-[#f5ba31] w-fit active:bg-[#e0e0e0] rounded ",

        // Social media button style (square with icon)
        social:
          "bg-[#fafafa] text-white hover:text-[#f5ba31] w-fit active:bg-[#e0e0e0] rounded flex items-center justify-center ",

        // Hero CTA button style (gradient with cartoon shadow)
        cta: "bg-gradient-to-b from-[#ffd700] to-[#f5ba31] w-fit text-[#0f1012] border-2 border-[#0f1012] active:from-[#e6c400] active:to-[#e0a728] rounded ",

        // Regular button with cartoon shadow
        primary:
          "bg-gradient-to-b from-[#ffd700] to-[#f5ba31] w-fit text-[#0f1012] border-2 border-dark-primary active:from-[#e6c400] active:to-[#e0a728] rounded-2xl hover:scale-101 duration-400 transition-transform ",

        // Light background button
        secondary:
          "bg-[#fafafa] text-[#0f1012] border-2 border-[#0f1012] w-fit active:bg-[#e0e0e0] rounded-2xl disabled:cursor-not-allowed opacity-80 ",
      },
      size: {
        sm: "h-12 px-3 text-sm",
        md: "h-12 lg:h-14 px-3 sm:px-5 text-sm sm:text-lg",
        lg: "py-3 sm:py-4 px-4 sm:px-6 text-base sm:text-lg",
        icon: "h-12 w-16 lg:h-14 lg:w-18",
        "icon-lg": "w-16 sm:w-20 lg:w-24 h-16 sm:h-20 lg:h-24",
      },
      shadow: {
        none: "",
        cartoon:
          "shadow-[4px_4px_0px_#0f1012] hover:shadow-[8px_8px_0px_#0f1012] active:shadow-[2px_2px_0px_#0f1012] transition-shadow duration-400",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      shadow: "cartoon",
    },
  },
);

export interface CartoonButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof cartoonButtonVariants> {
  asChild?: boolean;
}

const CartoonButton = React.forwardRef<HTMLButtonElement, CartoonButtonProps>(
  ({ className, variant, size, shadow, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          cartoonButtonVariants({ variant, size, shadow, className }),
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
CartoonButton.displayName = "CartoonButton";

export { CartoonButton, cartoonButtonVariants };
