import React from "react";

export type BadgeVariant =
  | "default"
  | "accent"
  | "popular"
  | "success"
  | "danger"
  | "warning";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className = "",
  variant = "default",
  ...props
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    default: "bg-surface-2 text-ink-soft border border-border",
    accent: "bg-teal-ink text-zari-bright border border-zari/40",
    popular: "bg-rani text-white border border-zari/50",
    success: "bg-[#0f3d2a] text-[#7ee2ac] border border-[#2e7d55]/40",
    danger: "bg-[#43101f] text-[#f2a0b5] border border-[#8a2c47]/50",
    warning: "bg-[#3d2a0a] text-diya border border-diya/40",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-semibold tracking-[0.14em] uppercase border ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
