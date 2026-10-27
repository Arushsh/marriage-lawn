"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Crown, Lock, User, ArrowLeft, Sparkles, KeyRound } from "lucide-react";
import { getStoredUser, getValidAccessToken, login } from "@/lib/admin/auth";
import { AdminButton, Banner } from "@/components/admin/ui";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already signed in? Straight to the dashboard
  useEffect(() => {
    let active = true;
    (async () => {
      const token = await getValidAccessToken();
      if (active && token && getStoredUser()) {
        router.replace("/admin");
      }
    })();
    return () => {
      active = false;
    };
  }, [router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username.trim(), password);
      router.replace("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed. Check credentials.");
      setSubmitting(false);
    }
  };

  const fillDefaultCredentials = () => {
    setUsername("admin");
    setPassword("Admin@123456");
  };

  return (
    <main className="min-h-screen relative flex items-center justify-center px-4 py-16 bg-[#0E0407] overflow-hidden">
      {/* Background Radial Glow & Royal Vignette */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 20%, rgba(197, 168, 128, 0.15) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(122, 21, 40, 0.25) 0%, transparent 60%)",
        }}
      />

      <div className="relative w-full max-w-[440px] z-10">
        {/* Estate Emblem & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#C5A880] to-[#7A1528] items-center justify-center shadow-lg shadow-[#7A1528]/30 mb-4 border border-[#C5A880]/40">
            <Crown className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-serif text-3xl font-semibold text-white tracking-wide">
            Shree Palace Lawn
          </h1>
          <p className="text-xs uppercase tracking-widest text-[#C5A880] font-medium mt-1">
            Owner & Staff Portal
          </p>
        </div>

        {/* Glassmorphic Form Card */}
        <div className="backdrop-blur-xl bg-stone-900/90 border border-[#C5A880]/30 rounded-2xl p-7 sm:p-9 shadow-2xl space-y-6">
          {error && <Banner kind="error">{error}</Banner>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                Staff Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                  placeholder="e.g. admin"
                  className="w-full pl-10 pr-3.5 py-3 text-sm text-white bg-stone-800/80 border border-stone-700/80 rounded-xl focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/20 focus:outline-none placeholder:text-stone-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-3 text-sm text-white bg-stone-800/80 border border-stone-700/80 rounded-xl focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/20 focus:outline-none placeholder:text-stone-500 transition-all"
                />
              </div>
            </div>

            <AdminButton
              type="submit"
              loading={submitting}
              className="w-full !h-12 !text-sm !font-semibold !rounded-xl !bg-gradient-to-r !from-[#7A1528] !to-[#9A2238] hover:!brightness-110 shadow-lg shadow-[#7A1528]/40"
            >
              Sign In to Estate Dashboard
            </AdminButton>
          </form>

          {/* Quick Demo Credentials Helper */}
          <div className="pt-4 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
            <span className="flex items-center gap-1.5 text-stone-400">
              <KeyRound className="w-3.5 h-3.5 text-[#C5A880]" />
              Default Superuser
            </span>
            <button
              type="button"
              onClick={fillDefaultCredentials}
              className="text-[#C5A880] hover:text-[#E8D4B8] underline underline-offset-2 font-medium cursor-pointer"
            >
              Autofill Credentials
            </button>
          </div>
        </div>

        {/* Back to Website Link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Public Venue Website
          </Link>
        </div>
      </div>
    </main>
  );
}
