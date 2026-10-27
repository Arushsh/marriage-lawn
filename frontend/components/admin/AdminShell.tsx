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
  Crown,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { getValidAccessToken, getStoredUser, logout, type AdminUser } from "@/lib/admin/auth";
import { getApiBase } from "@/lib/api";

const NAV_GROUPS = [
  {
    title: "Core Overview",
    items: [
      { href: "/admin", label: "Overview", icon: LayoutDashboard },
      { href: "/admin/leads", label: "Customer Leads", icon: Inbox },
      { href: "/admin/bookings", label: "Confirmed Bookings", icon: ReceiptText },
      { href: "/admin/availability", label: "Date Availability", icon: CalendarDays },
    ],
  },
  {
    title: "Venue & Content",
    items: [
      { href: "/admin/packages", label: "Wedding Packages", icon: PackageIcon },
      { href: "/admin/menu", label: "Royal Menu", icon: UtensilsCrossed },
      { href: "/admin/gallery", label: "Photo Gallery", icon: Images },
      { href: "/admin/content", label: "Halls, FAQs & Reviews", icon: FileText },
      { href: "/admin/settings", label: "Estate Settings", icon: Settings },
    ],
  },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

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

  // Ping backend to check health
  useEffect(() => {
    if (!checked) return;
    const checkApi = async () => {
      try {
        const apiBase = getApiBase();
        const res = await fetch(`${apiBase}/site/`, { method: "HEAD", signal: AbortSignal.timeout(4000) });
        setApiOnline(res.ok || res.status === 401 || res.status === 403);
      } catch {
        setApiOnline(false);
      }
    };
    checkApi();
    const interval = setInterval(checkApi, 30000);
    return () => clearInterval(interval);
  }, [checked]);

  // Re-check auth on navigation
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
      <div className="min-h-screen bg-[#0E0608] flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-2 border-[#C5A880] border-t-transparent rounded-full animate-spin mb-4" />
        <span className="font-serif tracking-widest text-xs uppercase text-[#C5A880]">
          Securing Estate Session…
        </span>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.replace("/admin/login");
  };

  const navContent = (
    <div className="space-y-6">
      {NAV_GROUPS.map((group) => (
        <div key={group.title} className="space-y-1.5">
          <span className="px-3.5 text-[11px] uppercase font-bold tracking-widest text-[#D4AF37] block">
            {group.title}
          </span>
          <nav className="space-y-1">
            {group.items.map(({ href, label, icon: Icon }) => {
              const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileNavOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs tracking-wider transition-all duration-200 group ${
                    active
                      ? "bg-gradient-to-r from-[#D4AF37]/25 to-[#7A1528]/40 text-[#FFF8EE] font-semibold border-l-4 border-[#D4AF37] shadow-sm"
                      : "text-stone-300 hover:text-white hover:bg-white/10 border-l-4 border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                        active ? "text-[#D4AF37]" : "text-stone-400 group-hover:text-stone-200"
                      }`}
                      strokeWidth={1.75}
                    />
                    <span className={active ? "text-[#FFF8EE] font-semibold" : "text-stone-300 group-hover:text-white"}>
                      {label}
                    </span>
                  </div>
                  {active && <ChevronRight className="w-3.5 h-3.5 text-[#D4AF37]" />}
                </Link>
              );
            })}
          </nav>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col lg:flex-row">
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between bg-[#150308] border-b border-[#C5A880]/20 px-4 py-3 text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C5A880] to-[#7A1528] flex items-center justify-center shadow-xs">
            <Crown className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-serif text-white font-medium text-sm leading-tight block">
              Shree Palace
            </span>
            <span className="text-[10px] tracking-wider uppercase text-[#C5A880]/80 block">
              Estate Management
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileNavOpen((v) => !v)}
          className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10"
          aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
        >
          {mobileNavOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer nav */}
      {mobileNavOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 pt-[61px] bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileNavOpen(false)}
        >
          <div
            className="w-72 h-full bg-[#150308] text-stone-300 border-r border-[#C5A880]/20 p-5 overflow-y-auto flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            {navContent}
            <div className="pt-6 border-t border-white/10 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#7A1528] border border-[#C5A880]/40 flex items-center justify-center text-sm font-serif text-white">
                  {user?.username?.[0]?.toUpperCase() || "A"}
                </div>
                <div className="truncate">
                  <p className="text-xs text-white font-medium truncate">{user?.username}</p>
                  <p className="text-[10px] text-stone-400 truncate">{user?.email || "Admin Staff"}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-rose-300 hover:text-white hover:bg-rose-900/30 rounded-lg border border-rose-900/40 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 bg-[#140207] text-stone-300 border-r border-[#C5A880]/30 z-30 shadow-xl">
        {/* Estate Branding */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] via-[#C5A880] to-[#7A1528] flex items-center justify-center shadow-md">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-serif text-white text-base font-bold tracking-wide leading-tight block">
              Shree Palace
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold block">
                Owner Portal
              </span>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 px-3 py-6 overflow-y-auto custom-scrollbar">
          {navContent}
        </div>

        {/* Backend health status pill */}
        <div className="px-4 py-2.5 border-t border-white/10 bg-black/40">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  apiOnline === true
                    ? "bg-emerald-400 shadow-xs shadow-emerald-400/50"
                    : apiOnline === false
                    ? "bg-rose-400 animate-pulse"
                    : "bg-amber-400"
                }`}
              />
              <span className={apiOnline === true ? "text-emerald-300 font-medium" : "text-stone-300"}>
                {apiOnline === true
                  ? "API Connected"
                  : apiOnline === false
                  ? "API Cold Starting"
                  : "Checking API…"}
              </span>
            </span>
            <span className="text-[10px] text-stone-400 font-mono">v1.2</span>
          </div>
        </div>

        {/* User Card & Actions */}
        <div className="border-t border-white/10 p-4 bg-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#7A1528] border border-[#D4AF37]/60 flex items-center justify-center text-xs font-serif text-white font-bold">
              {user?.username?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="truncate flex-1">
              <span className="text-xs font-semibold text-white truncate block">{user?.username}</span>
              <span className="text-[10px] text-stone-300 truncate block">{user?.email || "Manager"}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/10 gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] tracking-wider text-[#D4AF37] hover:text-white transition-colors font-medium"
            >
              <ExternalLink className="w-3.5 h-3.5" /> View Website
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1 text-[11px] tracking-wider text-stone-300 hover:text-rose-400 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Desktop Top Header Bar */}
        <header className="hidden lg:flex items-center justify-between h-16 px-8 bg-white border-b border-stone-200/80 sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <Crown className="w-4 h-4 text-[#C5A880]" />
            <span className="font-serif font-medium text-stone-700">Estate Administration</span>
            <span className="text-stone-300">/</span>
            <span className="capitalize text-stone-900 font-medium">
              {pathname === "/admin"
                ? "Overview"
                : pathname.replace("/admin/", "").replace(/-/g, " ")}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-xs text-stone-600">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Royal Banquet & Lawn</span>
            </div>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-900 text-white hover:bg-[#7A1528] transition-all shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open Website
            </a>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 px-4 sm:px-8 py-8 sm:py-10 max-w-[1400px] w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
