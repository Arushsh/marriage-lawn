import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverLift?: boolean;
}

/**
 * A silk panel: opaque jewel ground with a woven sheen, pearl hairline.
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", hoverLift = false, children, ...props }, ref) => (
    <div
      ref={ref}
      className={`silk-panel rounded-xl p-6 transition-colors ${
        hoverLift ? "royal-card-hover" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);

Card.displayName = "Card";
