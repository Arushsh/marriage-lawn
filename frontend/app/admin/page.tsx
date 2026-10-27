"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { adminFetch } from "@/lib/admin/api";
import { Banner, EmptyState, PageHeader, TableShell } from "@/components/admin/ui";

interface StatsResponse {
  venues: { total_halls: number; total_packages: number; upcoming_blocked_dates: number };
  enquiries: {
    total: number; new: number; contacted: number; visited: number;
    booked: number; lost: number; conversion_rate: number;
  };
  bookings: { total: number; confirmed: number; pending: number };
  revenue: { total_revenue: string; collected_advance: string; outstanding_balance: string };
  voice_calls: { total_calls: number; completed: number; completion_rate: number };
  recent_enquiries: Array<{
    id: number; name: string; phone: string; event_type: string;
    status: string; created_at: string;
  }>;
  recent_bookings: Array<{
    id: number; booking_reference: string; customer_name: string;
    event_date: string; status: string; base_amount: string;
  }>;
}

const STATUS_LABELS: Record<string, string> = {
  new: "New", contacted: "Contacted", visited: "Visited",
  booked: "Booked", lost: "Lost",
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
    <div>
      <PageHeader
        title="Estate Overview"
        subtitle="Live snapshot of leads, bookings, and revenue from the website."
      />

      {error && <Banner kind="error">{error}</Banner>}
      {loading && !stats && !error && (
        <p className="text-sm text-muted font-mono uppercase tracking-[0.2em]">Loading metrics…</p>
      )}

      {stats && (
        <div className="space-y-10">
          {/* Metric cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Total Leads"
              value={String(pipeline?.total ?? 0)}
              note={`${pipeline?.new ?? 0} new`}
              href="/admin/leads"
            />
            <MetricCard
              label="Bookings"
              value={String(stats.bookings.total)}
              note={`${stats.bookings.confirmed} confirmed · ${stats.bookings.pending} pending`}
              href="/admin/bookings"
            />
            <MetricCard
              label="Revenue (confirmed)"
              value={`₹${stats.revenue.total_revenue}`}
              note={`₹${stats.revenue.collected_advance} advance collected`}
              href="/admin/bookings"
            />
            <MetricCard
              label="Conversion"
              value={`${pipeline?.conversion_rate ?? 0}%`}
              note={`${pipeline?.booked ?? 0} leads became bookings`}
              href="/admin/leads"
            />
          </div>

          {/* Lead pipeline strip */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl text-primary font-normal">Lead Pipeline</h2>
            <div className="grid grid-cols-5 border border-border bg-white divide-x divide-border text-center">
              {(["new", "contacted", "visited", "booked", "lost"] as const).map((key) => (
                <div key={key} className="py-4">
                  <p className="font-serif text-2xl text-primary">{pipeline?.[key] ?? 0}</p>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-muted mt-1">
                    {STATUS_LABELS[key]}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Recent activity */}
          <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h2 className="font-serif text-xl text-primary font-normal">Recent Leads</h2>
              {stats.recent_enquiries.length === 0 ? (
                <EmptyState message="No enquiries yet — they will appear here as visitors submit the contact form." />
              ) : (
                <TableShell headers={["Name", "Phone", "Event", "Status"]}>
                  {stats.recent_enquiries.map((enquiry) => (
                    <tr key={enquiry.id}>
                      <td className="px-4 py-2.5 text-text">{enquiry.name}</td>
                      <td className="px-4 py-2.5 font-mono text-xs">{enquiry.phone}</td>
                      <td className="px-4 py-2.5 capitalize text-muted">{enquiry.event_type}</td>
                      <td className="px-4 py-2.5">
                        <StatusPill status={enquiry.status} />
                      </td>
                    </tr>
                  ))}
                </TableShell>
              )}
              <Link href="/admin/leads" className="text-xs uppercase tracking-[0.12em] text-primary hover:underline">
                View all leads →
              </Link>
            </div>

            <div className="space-y-3">
              <h2 className="font-serif text-xl text-primary font-normal">Recent Bookings</h2>
              {stats.recent_bookings.length === 0 ? (
                <EmptyState message="No bookings yet." />
              ) : (
                <TableShell headers={["Reference", "Customer", "Date", "Amount"]}>
                  {stats.recent_bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-4 py-2.5 font-mono text-xs">{booking.booking_reference}</td>
                      <td className="px-4 py-2.5 text-text">{booking.customer_name}</td>
                      <td className="px-4 py-2.5 text-muted">{booking.event_date}</td>
                      <td className="px-4 py-2.5">₹{Number(booking.base_amount).toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </TableShell>
              )}
              <Link href="/admin/bookings" className="text-xs uppercase tracking-[0.12em] text-primary hover:underline">
                View all bookings →
              </Link>
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
  note,
  href,
}: {
  label: string;
  value: string;
  note: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block bg-white border border-border p-5 hover:border-accent transition-colors"
    >
      <p className="text-[10px] uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="font-serif text-[28px] text-primary leading-tight mt-1.5">{value}</p>
      <p className="text-xs text-muted mt-1">{note}</p>
    </Link>
  );
}

export function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    new: "bg-accent/10 text-accent border-accent/40",
    contacted: "bg-blue-50 text-blue-800 border-blue-200",
    visited: "bg-purple-50 text-purple-800 border-purple-200",
    booked: "bg-green-50 text-green-800 border-green-200",
    lost: "bg-red-50 text-red-800 border-red-200",
    pending_payment: "bg-amber-50 text-amber-800 border-amber-200",
    confirmed: "bg-green-50 text-green-800 border-green-200",
    cancelled: "bg-red-50 text-red-800 border-red-200",
    completed: "bg-blue-50 text-blue-800 border-blue-200",
    refunded: "bg-gray-100 text-gray-700 border-gray-300",
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 border text-[10px] uppercase tracking-[0.1em] font-semibold ${
        styles[status] ?? "bg-surface text-muted border-border"
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
