import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getSiteSettings } from "@/lib/api";
import { constructMetadata } from "@/lib/seo";
import { ArrowLeft } from "lucide-react";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  return constructMetadata(site, {
    title: `Cookie Policy | ${site.venue_name}`,
    description: `How ${site.venue_name} uses cookies on this website, and how you can control them.`,
    path: "/cookies",
  });
}

export default async function CookiesPage() {
  const site = await getSiteSettings();

  return (
    <main className="py-16 sm:py-24 px-4 sm:px-8">
      <div className="max-w-[720px] mx-auto space-y-10">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            Back to Home
          </Link>
          <h1 className="font-serif text-[28px] sm:text-[40px] text-primary font-normal leading-[1.2]">
            Cookie Policy
          </h1>
          <p className="text-sm text-muted mt-2">
            Effective Date: October 2026 • {site.venue_name}, {site.city}
          </p>
        </div>

        <div className="space-y-8 text-[15px] sm:text-[16px] text-text/85 leading-[1.75]">
          <section className="space-y-3">
            <h2 className="font-serif text-[20px] sm:text-[24px] text-text font-normal leading-[1.25]">
              1. What Are Cookies
            </h2>
            <p>
              Cookies are small text files stored on your device when you visit
              a website. They help websites work correctly, remember your
              preferences, and understand how visitors use them. Similar local
              storage technologies are covered by this policy too.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-[20px] sm:text-[24px] text-text font-normal leading-[1.25]">
              2. Cookies We Use
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border bg-white">
                <thead>
                  <tr className="bg-surface border-b border-border text-left">
                    <th className="px-4 py-2.5 text-[10px] uppercase tracking-[0.14em] text-muted font-semibold">
                      Cookie
                    </th>
                    <th className="px-4 py-2.5 text-[10px] uppercase tracking-[0.14em] text-muted font-semibold">
                      Purpose
                    </th>
                    <th className="px-4 py-2.5 text-[10px] uppercase tracking-[0.14em] text-muted font-semibold">
                      Category
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">ml_cookie_consent</td>
                    <td className="px-4 py-3">
                      Remembers your cookie preference so we do not ask again.
                    </td>
                    <td className="px-4 py-3">Essential</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">Django session cookies</td>
                    <td className="px-4 py-3">
                      Used only for the venue owner&rsquo;s secure sign-in to the
                      dashboard. Never set for regular visitors.
                    </td>
                    <td className="px-4 py-3">Essential</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              At present we do <strong>not</strong> load any advertising or
              third-party tracking cookies. If we ever add analytics, it will
              load only after you accept non-essential cookies in the consent
              banner.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-[20px] sm:text-[24px] text-text font-normal leading-[1.25]">
              3. Managing Your Choice
            </h2>
            <p>
              You can change your cookie preference at any time using the
              &ldquo;Cookie Settings&rdquo; link in the website footer. You can
              also clear cookies from your browser settings at any time — see
              your browser&rsquo;s help pages for instructions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-[20px] sm:text-[24px] text-text font-normal leading-[1.25]">
              4. Contact
            </h2>
            <p>
              Questions about this policy? Call us at{" "}
              <a href={`tel:${site.phone}`} className="text-primary hover:underline">
                {site.phone}
              </a>{" "}
              or use the{" "}
              <Link href="/contact" className="text-primary hover:underline">
                contact form
              </Link>
              . See also our{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
