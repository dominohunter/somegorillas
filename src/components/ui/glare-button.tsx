import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const glareButtonVariants = cva(
  "relative flex place-items-center overflow-hidden border-2 cursor-pointer transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 outline-none",
  {
    variants: {
      variant: {
        default: "",
      },
      size: {
        default: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface GlareButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glareButtonVariants> {
  asChild?: boolean;
  width?: string;
  height?: string;
  background?: string;
  borderRadius?: string;
  borderColor?: string;
  glareColor?: string;
  glareOpacity?: number;
  glareAngle?: number;
  glareSize?: number;
  glowColor?: string;
  glowDuration?: number;
}

const GlareButton = React.forwardRef<HTMLButtonElement, GlareButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false,
    width = "auto",
    height = "56",
    background = "#000",
    borderRadius = "16px",
    borderColor = "rgba(15, 16, 18, 0.16)",
    glareColor = "#ffffff",
    glareOpacity = 0.5,
    glareAngle = -45,
    glareSize = 250,
    glowColor,
    glowDuration = 300,
    style,
    ...props 
  }, ref) => {
    const overlayRef = React.useRef<HTMLDivElement | null>(null);
    const Comp = asChild ? Slot : "button";

    const hex = glareColor.replace("#", "");
    let rgba = glareColor;
    if (/^[\dA-Fa-f]{6}$/.test(hex)) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      rgba = `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
    } else if (/^[\dA-Fa-f]{3}$/.test(hex)) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      rgba = `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
    }

    const overlayStyle: React.CSSProperties = {
      position: "absolute",
      inset: 0,
      background: `linear-gradient(${glareAngle}deg,
          hsla(0,0%,0%,0) 60%,
          ${rgba} 70%,
          hsla(0,0%,0%,0) 100%)`,
      backgroundSize: `${glareSize}% ${glareSize}%, 100% 100%`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "-100% -100%, 0 0",
      pointerEvents: "none",
    };

    // If className has bg- class, use white as default glow, otherwise use background
    const shadowColor = glowColor || (className && className.includes('bg-') ? '#ffffff' : background);

    return (
      <Comp
        className={cn(glareButtonVariants({ variant, size }), className)}
        ref={ref}
        style={{
          width,
          height,
          ...(className && className.includes('bg-') ? {} : { background }),
          borderRadius,
          borderColor,
          ...style,
        }}
        onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
          if (!props.disabled) {
            e.currentTarget.style.transition = `box-shadow ${glowDuration}ms ease`;
            e.currentTarget.style.boxShadow = `0px 0px 16px 0px ${shadowColor}`;
          }
        }}
        onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
          if (!props.disabled) {
            e.currentTarget.style.transition = `box-shadow ${glowDuration}ms ease`;
            e.currentTarget.style.boxShadow = "none";
          }
        }}
        {...props}
      >
        <div ref={overlayRef} style={overlayStyle} />
        {props.children}
      </Comp>
    );
  },
);
GlareButton.displayName = "GlareButton";

export { GlareButton, glareButtonVariants };
