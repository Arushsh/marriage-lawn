"use client";

import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "whatsapp"
  | "outline"
  | "text"
  | "ghost";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    // Royal Heritage Editorial: 0px radius, 44px+ tap target, tracked uppercase, gold hairline accents
    const baseStyles =
      "inline-flex items-center justify-center font-semibold text-xs tracking-[0.14em] border border-2 rounded-xl uppercase whitespace-nowrap select-none cursor-pointer transition-colors duration-150 " +
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 " +
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none";

    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        "bg-primary hover:bg-primary-dark text-white border border-accent/80 shadow-none",
      secondary:
        "border border-accent text-primary hover:bg-surface bg-transparent",
      whatsapp:
        "bg-[#1B5E20] hover:bg-[#144A19] text-white border border-transparent",
      outline:
        "border border-border text-text hover:bg-surface bg-transparent",
      text:
        "text-primary hover:text-primary-dark underline underline-offset-4 bg-transparent p-0 h-auto min-h-0 normal-case tracking-normal text-sm font-medium",
      ghost:
        "text-text hover:bg-surface bg-transparent border border-transparent",
    };

    // Standard height 48px (h-12), small 44px (min-h-[44px])
    const sizeStyles: Record<ButtonSize, string> = {
      sm: "h-11 min-h-[44px] px-4 text-sm gap-2",
      md: "h-12 min-h-[48px] px-6 text-base gap-2",
      lg: "h-12 min-h-[48px] px-8 text-base gap-2",
    };

    const finalSizeClass = variant === "text" ? "" : sizeStyles[size];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${finalSizeClass} ${className}`.trim()}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" strokeWidth={1.5} />}
        {!isLoading && leftIcon && (
          <span className="inline-flex shrink-0 items-center justify-center">{leftIcon}</span>
        )}
        {children && (
          <span className="inline-flex items-center gap-2 truncate whitespace-nowrap">
            {children}
          </span>
        )}
        {!isLoading && rightIcon && (
          <span className="inline-flex shrink-0 items-center justify-center">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
