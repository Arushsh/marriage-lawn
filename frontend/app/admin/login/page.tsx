"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getStoredUser, getValidAccessToken, login } from "@/lib/admin/auth";
import { AdminButton, Banner, Field, TextInput } from "@/components/admin/ui";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already signed in? Straight to the dashboard.
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
      setError(err instanceof Error ? err.message : "Login failed.");
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-bg flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <span className="inline-flex w-12 h-12 border border-accent items-center justify-center font-serif text-accent text-lg">
            GRL
          </span>
          <h1 className="font-serif text-[28px] text-primary font-normal leading-[1.2] mt-4">
            Owner Dashboard
          </h1>
          <p className="text-sm text-muted mt-1">
            Sign in with your estate staff account to manage the website.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-border p-7 sm:p-9 space-y-5"
        >
          {error && <Banner kind="error">{error}</Banner>}

          <Field label="Username">
            <TextInput
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              placeholder="e.g. owner"
            />
          </Field>

          <Field label="Password">
            <TextInput
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              placeholder="••••••••••"
            />
          </Field>

          <AdminButton type="submit" loading={submitting} className="w-full !h-12">
            Sign In
          </AdminButton>

          <p className="text-xs text-muted text-center">
            Not the venue owner? This area is staff-only —{" "}
            <Link href="/" className="text-primary underline underline-offset-2">
              return to the website
            </Link>
            .
          </p>
        </form>
      </div>
    </main>
  );
}
