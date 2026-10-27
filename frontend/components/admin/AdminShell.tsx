"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  ExternalLink,
  Images,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  Package as PackageIcon,
  ReceiptText,
  Settings,
  UtensilsCrossed,
  FileText,
  X,
} from "lucide-react";
import { getValidAccessToken, getStoredUser, logout, type AdminUser } from "@/lib/admin/auth";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/settings", label: "Site Settings", icon: Settings },
  { href: "/admin/availability", label: "Availability", icon: CalendarDays },
  { href: "/admin/gallery", label: "Gallery", icon: Images },
  { href: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/admin/packages", label: "Packages", icon: PackageIcon },
  { href: "/admin/leads", label: "Leads", icon: Inbox },
  { href: "/admin/bookings", label: "Bookings", icon: ReceiptText },
  { href: "/admin/content", label: "Halls · Reviews · FAQs", icon: FileText },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const token = await getValidAccessToken();
      if (!active) return;
      if (!token) {
        router.replace("/admin/login");
        return;
      }
      setUser(getStoredUser());
      setChecked(true);
    })();
    return () => {
      active = false;
    };
  }, [router]);

  // Re-check auth on every navigation (cheap — token is local)
  useEffect(() => {
    if (!checked) return;
    let active = true;
    (async () => {
      const token = await getValidAccessToken();
      if (!active && token) return;
      if (!token) router.replace("/admin/login");
    })();
    return () => {
      active = false;
    };
  }, [pathname, checked, router]);

  if (!checked) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
          Verifying session…
        </span>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.replace("/admin/login");
  };

  const navList = (
    <nav className="flex flex-col gap-0.5">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileNavOpen(false)}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 text-xs uppercase tracking-[0.12em] transition-colors border-l-2 ${
              active
                ? "border-accent bg-white/5 text-accent font-semibold"
                : "border-transparent text-white/70 hover:text-white hover:bg-white/5"
            }`}
          >
            <Icon className="w-4 h-4" strokeWidth={1.5} />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-bg flex flex-col lg:flex-row">
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between bg-primary-dark border-b border-accent px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 border border-accent flex items-center justify-center font-serif text-accent text-xs">
            GRL
          </span>
          <span className="font-serif text-white text-sm">Owner Dashboard</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileNavOpen((v) => !v)}
          className="text-white/80 hover:text-white p-1.5"
          aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
        >
          {mobileNavOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile slide-over nav */}
      {mobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-30 pt-[57px] bg-primary-dark" onClick={() => setMobileNavOpen(false)}>
          <div className="py-4" onClick={(e) => e.stopPropagation()}>
            {navList}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs uppercase tracking-[0.12em] text-white/70 hover:text-white border-l-2 border-transparent"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.5} /> Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 bg-primary-dark border-r border-accent/60 z-30">
        <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
          <span className="w-9 h-9 border border-accent flex items-center justify-center font-serif text-accent text-sm">
            GRL
          </span>
          <div>
            <p className="font-serif text-white text-base leading-tight">Owner Dashboard</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-accent/80">Shree Estate</p>
          </div>
        </div>
        <div className="flex-1 py-4 overflow-y-auto">{navList}</div>
        <div className="border-t border-white/10 px-3.5 py-4 space-y-2">
          <p className="text-[11px] text-white/50 truncate">{user?.email || user?.username}</p>
          <div className="flex items-center justify-between gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-accent hover:underline"
            >
              <ExternalLink className="w-3 h-3" /> View Site
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-white/60 hover:text-white"
            >
              <LogOut className="w-3 h-3" /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Content column */}
      <main className="flex-1 lg:ml-64 px-4 sm:px-8 py-8 sm:py-10 max-w-[1360px]">
        {children}
      </main>
    </div>
  );
}
