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
    const baseStyles =
      "inline-flex items-center justify-center font-semibold text-xs tracking-[0.14em] uppercase whitespace-nowrap select-none cursor-pointer transition-all duration-300 ease-out " +
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rani focus-visible:ring-offset-2 focus-visible:ring-offset-bg " +
      "active:scale-[0.97] " +
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none";

    const variantStyles: Record<ButtonVariant, string> = {
      // The pallu: rani silk with a pearl zari frame and a shine that
      // sweeps across on hover.
      primary:
        "silk-btn bg-rani hover:bg-rani-deep text-white border border-zari/50 shadow-[0_10px_30px_-10px_rgba(224,20,124,0.45)] hover:shadow-[0_14px_38px_-10px_rgba(224,20,124,0.55)] hover:-translate-y-0.5",
      // Gota glass: frosted panel with pearl hairline.
      secondary:
        "gota-glass text-ink hover:text-zari-bright hover:border-border-strong hover:-translate-y-0.5",
      whatsapp:
        "silk-btn bg-[#0f6f43] hover:bg-[#0b5734] text-white border border-[#4ade80]/30 shadow-[0_10px_30px_-10px_rgba(15,111,67,0.5)] hover:-translate-y-0.5",
      outline:
        "border border-border-strong text-ink hover:bg-surface-2 hover:border-zari/50 bg-transparent hover:-translate-y-0.5",
      text:
        "text-teal hover:text-zari underline underline-offset-4 decoration-zari/40 hover:decoration-zari bg-transparent p-0 h-auto min-h-0 normal-case tracking-normal text-sm font-medium",
      ghost:
        "text-ink hover:bg-surface-2 bg-transparent border border-transparent hover:-translate-y-0.5",
    };

    const sizeStyles: Record<ButtonSize, string> = {
      sm: "h-11 min-h-[44px] px-4 text-sm gap-2 rounded-lg",
      md: "h-12 min-h-[48px] px-6 text-base gap-2 rounded-lg",
      lg: "h-13 min-h-[52px] px-8 text-base gap-2 rounded-lg",
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
