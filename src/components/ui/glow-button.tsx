import React from "react";

interface GlowButtonProps {
  width?: string;
  height?: string;
  background?: string;
  borderRadius?: string;
  borderColor?: string;
  children?: React.ReactNode;
  glowColor?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  disabled?: boolean;
  duration?: number;
  enableGlow?: boolean;
}

const GlowButton: React.FC<GlowButtonProps> = ({
  width = "auto",
  height = "auto",
  background = "#000",
  borderRadius = "16px",
  borderColor = "rgba(15, 16, 18, 0.16)",
  children,
  glowColor,
  className = "",
  style = {},
  onClick,
  disabled = false,
  duration = 150,
  enableGlow = true,
}) => {
  // Use background color as glow color if not specified
  const shadowColor = glowColor || background;

  return (
    <button
      className={`relative cursor-pointer transition-all ease-in-out ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
      style={{
        width,
        height,
        background,
        borderRadius,
        border: `2px solid ${borderColor}`,
        boxShadow: disabled || !enableGlow ? "none" : undefined,
        transition: `all ${duration}ms ease-in-out`,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled && enableGlow) {
          e.currentTarget.style.boxShadow = `0px 0px 8px 0px ${shadowColor}`;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && enableGlow) {
          e.currentTarget.style.boxShadow = "none";
        }
      }}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default GlowButton;
