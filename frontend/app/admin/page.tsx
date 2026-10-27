"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Receipt,
  TrendingUp,
  Percent,
  CalendarCheck,
  Building2,
  Package,
  MessageCircle,
  ArrowUpRight,
  Clock,
  Sparkles,
} from "lucide-react";
import { adminFetch } from "@/lib/admin/api";
import { Banner, EmptyState, PageHeader, TableShell } from "@/components/admin/ui";

interface StatsResponse {
  venues: { total_halls: number; total_packages: number; upcoming_blocked_dates: number };
  enquiries: {
    total: number;
    new: number;
    contacted: number;
    visited: number;
    booked: number;
    lost: number;
    conversion_rate: number;
  };
  bookings: { total: number; confirmed: number; pending: number };
  revenue: { total_revenue: string; collected_advance: string; outstanding_balance: string };
  voice_calls: { total_calls: number; completed: number; completion_rate: number };
  recent_enquiries: Array<{
    id: number;
    name: string;
    phone: string;
    event_type: string;
    status: string;
    created_at: string;
  }>;
  recent_bookings: Array<{
    id: number;
    booking_reference: string;
    customer_name: string;
    event_date: string;
    status: string;
    base_amount: string;
  }>;
}

const STATUS_LABELS: Record<string, string> = {
  new: "New Inquiry",
  contacted: "Contacted",
  visited: "Site Visited",
  booked: "Booked",
  lost: "Lost",
};

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    adminFetch<StatsResponse>("/owner/stats/")
      .then((data) => active && setStats(data))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const pipeline = stats?.enquiries;

  return (
    <div className="space-y-10">
      <PageHeader
        title="Estate Executive Overview"
        subtitle="Real-time commercial intelligence covering website leads, reservation velocity, and venue booking revenue."
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/leads"
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#7A1528] text-white hover:bg-[#5C0F1E] transition-all shadow-xs"
            >
              Manage Leads
            </Link>
            <Link
              href="/admin/bookings"
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 transition-all shadow-xs"
            >
              View Calendar
            </Link>
          </div>
        }
      />

      {error && <Banner kind="error">{error}</Banner>}

      {loading && !stats && !error && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-stone-200/60 rounded-xl" />
          ))}
        </div>
      )}

      {stats && (
        <div className="space-y-10">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <MetricCard
              label="Total Enquiries"
              value={String(pipeline?.total ?? 0)}
              subtext={`${pipeline?.new ?? 0} requiring action`}
              icon={Users}
              badge={`${pipeline?.new ?? 0} New`}
              href="/admin/leads"
              accentColor="burgundy"
            />
            <MetricCard
              label="Venue Bookings"
              value={String(stats.bookings.total)}
              subtext={`${stats.bookings.confirmed} confirmed · ${stats.bookings.pending} pending`}
              icon={Receipt}
              badge="Confirmed"
              href="/admin/bookings"
              accentColor="gold"
            />
            <MetricCard
              label="Total Revenue"
              value={`₹${stats.revenue.total_revenue}`}
              subtext={`₹${stats.revenue.collected_advance} collected advance`}
              icon={TrendingUp}
              badge="Accrued"
              href="/admin/bookings"
              accentColor="emerald"
            />
            <MetricCard
              label="Lead Conversion"
              value={`${pipeline?.conversion_rate ?? 0}%`}
              subtext={`${pipeline?.booked ?? 0} booked from inquiries`}
              icon={Percent}
              badge="Win Rate"
              href="/admin/leads"
              accentColor="blue"
            />
          </div>

          {/* Quick Estate Capability Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#140207] to-[#2B0812] text-white border border-[#C5A880]/30 shadow-md">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#C5A880]">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-[#C5A880] font-semibold">
                  Banquet Halls
                </p>
                <p className="text-xl font-serif font-medium">{stats.venues.total_halls} Royal Zones</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#C5A880]">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-[#C5A880] font-semibold">
                  Curated Packages
                </p>
                <p className="text-xl font-serif font-medium">{stats.venues.total_packages} Wedding Tiers</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#C5A880]">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-[#C5A880] font-semibold">
                  Reserved Muhurat Dates
                </p>
                <p className="text-xl font-serif font-medium">{stats.venues.upcoming_blocked_dates} Locked Dates</p>
              </div>
            </div>
          </div>

          {/* Lead Funnel Pipeline Strip */}
          <section className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-lg font-semibold text-stone-900">
                  Lead Conversion Pipeline
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Stages of active customer wedding discussions
                </p>
              </div>
              <span className="text-xs text-stone-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#C5A880]" /> Live Status
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {(["new", "contacted", "visited", "booked", "lost"] as const).map((key) => {
                const count = pipeline?.[key] ?? 0;
                const total = pipeline?.total || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div
                    key={key}
                    className="p-4 rounded-xl border border-stone-200/80 bg-stone-50/50 hover:bg-white hover:border-[#C5A880]/60 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <StatusPill status={key} />
                      <span className="text-[11px] font-mono text-stone-400">{pct}%</span>
                    </div>
                    <p className="font-serif text-2xl font-semibold text-stone-900">{count}</p>
                    <div className="w-full bg-stone-200 rounded-full h-1 mt-3 overflow-hidden">
                      <div
                        className="bg-[#7A1528] h-1 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Recent Enquiries & Bookings Tables */}
          <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Recent Leads */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-lg font-semibold text-stone-900">
                    Recent Customer Inquiries
                  </h2>
                  <p className="text-xs text-stone-500">Submitted directly via the website</p>
                </div>
                <Link
                  href="/admin/leads"
                  className="text-xs font-semibold text-[#7A1528] hover:text-[#5C0F1E] flex items-center gap-1"
                >
                  View All <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {stats.recent_enquiries.length === 0 ? (
                <EmptyState message="No customer inquiries yet." />
              ) : (
                <TableShell headers={["Guest Name", "Phone", "Event Type", "Status", "Action"]}>
                  {stats.recent_enquiries.map((enquiry) => (
                    <tr
                      key={enquiry.id}
                      className="hover:bg-stone-50/80 transition-colors duration-150"
                    >
                      <td className="px-5 py-3.5 font-medium text-stone-900">
                        {enquiry.name}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-stone-600">
                        +91 {enquiry.phone}
                      </td>
                      <td className="px-5 py-3.5 capitalize text-xs text-stone-600">
                        {enquiry.event_type}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusPill status={enquiry.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <a
                          href={`https://wa.me/91${enquiry.phone.replace(/\D/g, "")}?text=Namaste%20${encodeURIComponent(enquiry.name)}%20ji,%20greetings%20from%20Shree%20Palace%20Lawn!`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-2 py-1 rounded border border-emerald-200"
                        >
                          <MessageCircle className="w-3 h-3" /> WhatsApp
                        </a>
                      </td>
                    </tr>
                  ))}
                </TableShell>
              )}
            </div>

            {/* Recent Bookings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-lg font-semibold text-stone-900">
                    Recent Venue Reservations
                  </h2>
                  <p className="text-xs text-stone-500">Confirmed dates and bookings</p>
                </div>
                <Link
                  href="/admin/bookings"
                  className="text-xs font-semibold text-[#7A1528] hover:text-[#5C0F1E] flex items-center gap-1"
                >
                  View All <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {stats.recent_bookings.length === 0 ? (
                <EmptyState message="No bookings registered yet." />
              ) : (
                <TableShell headers={["Reference", "Client Name", "Event Date", "Base Amount"]}>
                  {stats.recent_bookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="hover:bg-stone-50/80 transition-colors duration-150"
                    >
                      <td className="px-5 py-3.5 font-mono text-xs font-semibold text-stone-800">
                        {booking.booking_reference}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-stone-900">
                        {booking.customer_name}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-stone-600">
                        {booking.event_date}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-stone-900">
                        ₹{Number(booking.base_amount).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </TableShell>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  subtext,
  icon: Icon,
  badge,
  href,
  accentColor,
}: {
  label: string;
  value: string;
  subtext: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  href: string;
  accentColor: "burgundy" | "gold" | "emerald" | "blue";
}) {
  const colorStyles = {
    burgundy: {
      border: "hover:border-[#7A1528]/50",
      iconBg: "bg-[#7A1528]/10 text-[#7A1528]",
      badge: "bg-[#7A1528]/10 text-[#7A1528]",
    },
    gold: {
      border: "hover:border-[#C5A880]/70",
      iconBg: "bg-[#C5A880]/15 text-[#8F6A35]",
      badge: "bg-[#C5A880]/15 text-[#8F6A35]",
    },
    emerald: {
      border: "hover:border-emerald-400",
      iconBg: "bg-emerald-50 text-emerald-700",
      badge: "bg-emerald-50 text-emerald-700",
    },
    blue: {
      border: "hover:border-blue-400",
      iconBg: "bg-blue-50 text-blue-700",
      badge: "bg-blue-50 text-blue-700",
    },
  }[accentColor];

  return (
    <Link
      href={href}
      className={`group block bg-white border border-stone-200/90 rounded-2xl p-5 hover:-translate-y-0.5 transition-all duration-300 shadow-xs hover:shadow-md ${colorStyles.border}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorStyles.iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${colorStyles.badge}`}>
          {badge}
        </span>
      </div>

      <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
        {label}
      </p>
      <p className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight mt-1 leading-none">
        {value}
      </p>
      <p className="text-xs text-stone-400 mt-2 truncate">{subtext}</p>
    </Link>
  );
}

export function StatusPill({ status }: { status: string }) {
  const styles: Record<string, { bg: string; dot: string; text: string }> = {
    new: { bg: "bg-amber-50 border-amber-200", dot: "bg-amber-500", text: "text-amber-800" },
    contacted: { bg: "bg-blue-50 border-blue-200", dot: "bg-blue-500", text: "text-blue-800" },
    visited: { bg: "bg-purple-50 border-purple-200", dot: "bg-purple-500", text: "text-purple-800" },
    booked: { bg: "bg-emerald-50 border-emerald-200", dot: "bg-emerald-500", text: "text-emerald-800" },
    lost: { bg: "bg-stone-100 border-stone-200", dot: "bg-stone-400", text: "text-stone-600" },
    pending_payment: { bg: "bg-amber-50 border-amber-200", dot: "bg-amber-500", text: "text-amber-800" },
    confirmed: { bg: "bg-emerald-50 border-emerald-200", dot: "bg-emerald-500", text: "text-emerald-800" },
    cancelled: { bg: "bg-rose-50 border-rose-200", dot: "bg-rose-500", text: "text-rose-800" },
    completed: { bg: "bg-blue-50 border-blue-200", dot: "bg-blue-500", text: "text-blue-800" },
    refunded: { bg: "bg-stone-100 border-stone-200", dot: "bg-stone-400", text: "text-stone-600" },
  };

  const style = styles[status] ?? {
    bg: "bg-stone-100 border-stone-200",
    dot: "bg-stone-400",
    text: "text-stone-600",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-medium tracking-wide ${style.bg} ${style.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      <span className="capitalize">{status.replace("_", " ")}</span>
    </span>
  );
}
