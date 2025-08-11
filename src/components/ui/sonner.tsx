"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      expand={true}
      richColors
      closeButton
      style={
        {
          "--normal-bg": "rgba(255, 255, 255, 0.12)",
          "--normal-text": "var(--light-primary, #FAFAFA)",
          "--normal-border": "rgba(255, 255, 255, 0.08)",
          "--success-bg": "rgba(34, 197, 94, 0.12)",
          "--success-text": "var(--light-primary, #FAFAFA)",
          "--success-border": "rgba(34, 197, 94, 0.2)",
          "--error-bg": "rgba(239, 68, 68, 0.12)",
          "--error-text": "var(--light-primary, #FAFAFA)",
          "--error-border": "rgba(239, 68, 68, 0.2)",
          "--warning-bg": "rgba(245, 208, 32, 0.12)",
          "--warning-text": "var(--light-primary, #FAFAFA)",
          "--warning-border": "rgba(245, 208, 32, 0.2)",
          "--info-bg": "rgba(59, 130, 246, 0.12)",
          "--info-text": "var(--light-primary, #FAFAFA)",
          "--info-border": "rgba(59, 130, 246, 0.2)",
        } as React.CSSProperties
      }
      toastOptions={{
        style: {
          background: "rgba(255, 255, 255, 0.12)",
          backdropFilter: "blur(48px)",
          border: "2px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "24px",
          color: "var(--light-primary, #FAFAFA)",
          fontSize: "16px",
          fontWeight: "500",
          fontFamily: "var(--font-clash-display, system-ui)",
          padding: "16px 20px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
        },
        className: "toast-custom",
      }}
      {...props}
    />
  );
};

export { Toaster };
