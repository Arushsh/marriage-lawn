"use client";

import React from "react";

/**
 * Small shared form/table primitives for the owner dashboard.
 * DESIGN.md style: 0px radius, 1px hairline borders, ivory surfaces.
 */

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
      <div>
        <h1 className="font-serif text-[26px] sm:text-[32px] font-normal leading-[1.2] text-primary">
          {title}
        </h1>
        {subtitle && <p className="text-sm text-muted mt-1 max-w-[60ch]">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Banner({
  kind,
  children,
}: {
  kind: "error" | "success";
  children: React.ReactNode;
}) {
  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      className={`px-4 py-3 text-sm border mb-5 ${
        kind === "error"
          ? "border-red-700/40 bg-red-50 text-red-800"
          : "border-green-700/30 bg-green-50 text-green-800"
      }`}
    >
      {children}
    </div>
  );
}

const inputClass =
  "w-full px-3 py-2.5 text-sm text-text bg-white border border-border focus:border-accent focus:outline-none placeholder:text-muted/60 disabled:bg-surface disabled:text-muted";

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block space-y-1.5 ${className ?? ""}`}>
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted block">
        {label}
      </span>
      {children}
      {hint && <span className="text-xs text-muted block">{hint}</span>}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={props.rows ?? 4} {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <label className="inline-flex items-center gap-2.5 cursor-pointer select-none py-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 accent-[#6B1426] cursor-pointer"
      />
      <span className="text-sm text-text">{label}</span>
    </label>
  );
}

export function AdminButton({
  variant = "primary",
  loading,
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  loading?: boolean;
}) {
  const variants: Record<string, string> = {
    primary:
      "bg-primary text-white border border-accent hover:bg-primary-dark disabled:opacity-50",
    secondary:
      "bg-white text-primary border border-accent hover:bg-surface disabled:opacity-50",
    danger:
      "bg-white text-red-800 border border-red-700/50 hover:bg-red-50 disabled:opacity-50",
    ghost:
      "bg-transparent text-muted border border-transparent hover:text-text hover:bg-surface",
  };
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={`inline-flex items-center justify-center gap-2 px-4 h-10 text-xs uppercase tracking-[0.12em] font-semibold transition-colors cursor-pointer ${variants[variant]} ${className ?? ""}`}
    >
      {loading && (
        <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" aria-hidden="true" />
      )}
      {children}
    </button>
  );
}

export function TableShell({
  headers,
  children,
}: {
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto border border-border bg-white">
      <table className="w-full text-sm min-w-[640px]">
        <thead>
          <tr className="border-b border-border bg-surface">
            {headers.map((h) => (
              <th
                key={h}
                className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="border border-dashed border-border bg-surface px-6 py-14 text-center text-sm text-muted">
      {message}
    </div>
  );
}
