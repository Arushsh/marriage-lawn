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
    default: "bg-surface text-text border border-border",
    accent: "bg-surface text-accent border border-accent/60",
    popular: "bg-primary text-white border border-accent",
    success: "bg-emerald-50 text-emerald-900 border border-emerald-300",
    danger: "bg-rose-50 text-rose-900 border border-rose-300",
    warning: "bg-amber-50 text-amber-900 border border-amber-300",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-none text-[10px] font-semibold tracking-[0.14em] uppercase ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
