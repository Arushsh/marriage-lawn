"use client";

import React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

/**
 * Premium shared form/table primitives for the owner dashboard.
 * Refined luxury aesthetic: elegant subtle shadows, rounded-xl containers,
 * champagne-gold accents, and clean micro-interactions.
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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-stone-200/80">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-stone-500 mt-1 max-w-[65ch] leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2.5 flex-wrap">{actions}</div>}
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
      className={`flex items-start gap-3 p-4 text-sm rounded-xl border mb-6 shadow-xs ${
        kind === "error"
          ? "border-rose-200 bg-rose-50/90 text-rose-900"
          : "border-emerald-200 bg-emerald-50/90 text-emerald-900"
      }`}
    >
      {kind === "error" ? (
        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
      ) : (
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
      )}
      <div className="flex-1 leading-relaxed">{children}</div>
    </div>
  );
}

const inputClass =
  "w-full px-3.5 py-2.5 text-sm text-stone-900 bg-white border border-stone-200 rounded-lg shadow-xs transition-all duration-200 focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/20 focus:outline-none placeholder:text-stone-400 disabled:bg-stone-100 disabled:text-stone-400";

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
      <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-600 block">
        {label}
      </span>
      {children}
      {hint && <span className="text-xs text-stone-400 block">{hint}</span>}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={props.rows ?? 4}
      {...props}
      className={`${inputClass} resize-y ${props.className ?? ""}`}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        {...props}
        className={`${inputClass} appearance-none cursor-pointer pr-9 ${props.className ?? ""}`}
      />
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-stone-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
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
    <label className="inline-flex items-center gap-3 cursor-pointer select-none py-1.5 group">
      <div
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
          checked ? "bg-[#7A1528]" : "bg-stone-300"
        }`}
      >
        <div
          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>
      <span className="text-sm font-medium text-stone-700 group-hover:text-stone-900 transition-colors">
        {label}
      </span>
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
      "bg-[#7A1528] text-white hover:bg-[#5C0F1E] active:scale-[0.99] shadow-xs shadow-[#7A1528]/20 border border-[#9A2238]",
    secondary:
      "bg-white text-stone-800 border border-stone-200 hover:bg-stone-50 hover:border-stone-300 active:scale-[0.99] shadow-xs",
    danger:
      "bg-white text-rose-700 border border-rose-200 hover:bg-rose-50 active:scale-[0.99]",
    ghost:
      "bg-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-100/80 active:scale-[0.99]",
  };
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={`inline-flex items-center justify-center gap-2 px-4 h-10 text-xs uppercase tracking-wider font-semibold rounded-lg transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className ?? ""}`}
    >
      {loading && (
        <span
          className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"
          aria-hidden="true"
        />
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
    <div className="overflow-hidden border border-stone-200/90 rounded-xl bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px] text-left">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50/80 text-stone-500">
              {headers.map((h) => (
                <th
                  key={h}
                  className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="border border-dashed border-stone-300 rounded-xl bg-stone-50/50 px-6 py-16 text-center text-sm text-stone-500">
      <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center mb-3">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <p className="font-medium text-stone-600">{message}</p>
      <p className="text-xs text-stone-400 mt-1">Items will appear here once created or received.</p>
    </div>
  );
}
