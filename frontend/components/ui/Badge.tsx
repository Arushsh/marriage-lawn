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
    default: "bg-black/[0.04] text-text border border-border",
    accent: "bg-[#FDF6E2] text-[#8F7014] border border-[#E9D8A6]",
    popular: "bg-primary text-white border border-transparent",
    success: "bg-emerald-50 text-emerald-800 border border-emerald-200",
    danger: "bg-rose-50 text-rose-800 border border-rose-200",
    warning: "bg-amber-50 text-amber-800 border border-amber-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-normal tracking-normal ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
