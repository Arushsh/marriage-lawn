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
    // Base styles: 44px+ tap target, 8px radius, visible focus ring, no text wrapping
    const baseStyles =
      "inline-flex items-center justify-center font-normal whitespace-nowrap rounded-lg select-none cursor-pointer transition-colors duration-150 " +
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 " +
      "active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none";

    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        "bg-primary hover:bg-primary-dark text-white border border-transparent shadow-none",
      secondary:
        "border border-primary text-primary hover:bg-primary hover:text-white bg-transparent",
      whatsapp:
        "bg-[#1B8046] hover:bg-[#146637] text-white border border-transparent",
      outline:
        "border border-black/[0.12] text-text hover:bg-black/[0.04] bg-transparent",
      text:
        "text-primary hover:underline underline-offset-4 bg-transparent p-0 h-auto min-h-0",
      ghost:
        "text-text hover:bg-black/[0.04] bg-transparent",
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
        {children && <span className="truncate">{children}</span>}
        {!isLoading && rightIcon && (
          <span className="inline-flex shrink-0 items-center justify-center">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
