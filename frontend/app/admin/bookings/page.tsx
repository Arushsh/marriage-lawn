"use client";

import React, { useCallback, useEffect, useState } from "react";
import { adminFetch, adminList } from "@/lib/admin/api";
import {
  AdminButton,
  Banner,
  EmptyState,
  Field,
  PageHeader,
  Select,
  TableShell,
  TextInput,
} from "@/components/admin/ui";
import { StatusPill } from "@/app/admin/page";

interface Booking {
  id: number;
  booking_reference: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  hall_name: string;
  package_name: string;
  event_type: string;
  event_date: string;
  slot: string;
  guest_count: number;
  base_amount: string;
  advance_amount: string;
  paid_amount: string;
  balance_amount: string;
  status: "pending_payment" | "confirmed" | "cancelled" | "completed" | "refunded";
  payment_status: "unpaid" | "partial_advance" | "fully_paid" | "refunded";
  payment_provider: string;
  customer_notes: string;
  admin_notes: string;
  created_at: string;
}

const STATUSES = ["pending_payment", "confirmed", "cancelled", "completed", "refunded"] as const;

const SLOT_LABELS: Record<string, string> = {
  full_day: "Full Day",
  morning: "Morning",
  evening: "Evening",
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (search.trim()) params.set("search", search.trim());
      const query = params.toString();
      setBookings(await adminList<Booking>(`/owner/bookings/${query ? `?${query}` : ""}`));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    const timer = setTimeout(load, search ? 350 : 0);
    return () => clearTimeout(timer);
  }, [load, search]);

  const handleUpdate = async (reference: string, payload: Record<string, unknown>) => {
    setError(null);
    try {
      const updated = await adminFetch<Booking>(`/owner/bookings/${reference}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setBookings((prev) =>
        prev.map((row) => (row.booking_reference === reference ? { ...row, ...updated } : row))
      );
      setNotice("Booking updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    }
  };

  return (
    <div>
      <PageHeader
        title="Bookings"
        subtitle="Online reservations with payment state. Recording a payment updates the balance and payment status automatically."
      />

      {error && <Banner kind="error">{error}</Banner>}
      {notice && <Banner kind="success">{notice}</Banner>}

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <TextInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search reference, name, or phone…"
          className="!w-72"
          aria-label="Search bookings"
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="!w-52"
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status.replace("_", " ")}
            </option>
          ))}
        </Select>
        <span className="text-xs text-muted">{bookings.length} bookings</span>
      </div>

      {loading ? (
        <p className="text-sm text-muted font-mono uppercase tracking-[0.2em]">Loading…</p>
      ) : bookings.length === 0 ? (
        <EmptyState message="No bookings match." />
      ) : (
        <TableShell headers={["Reference", "Customer", "Date", "Hall", "Amount", "Payment", "Status", ""]}>
          {bookings.map((booking) => (
            <React.Fragment key={booking.id}>
              <tr
                className="cursor-pointer hover:bg-stone-100/70 transition-colors"
                onClick={() => setExpandedId(expandedId === booking.id ? null : booking.id)}
              >
                <td className="px-4 py-2.5 font-mono text-xs">{booking.booking_reference}</td>
                <td className="px-4 py-2.5">
                  <p className="text-text font-medium">{booking.customer_name}</p>
                  <p className="text-[11px] text-muted font-mono">{booking.customer_phone}</p>
                </td>
                <td className="px-4 py-2.5 text-muted whitespace-nowrap">
                  {booking.event_date}
                  <span className="block text-[11px]">{SLOT_LABELS[booking.slot] ?? booking.slot}</span>
                </td>
                <td className="px-4 py-2.5 text-muted text-xs">{booking.hall_name}</td>
                <td className="px-4 py-2.5 whitespace-nowrap">
                  <span className="text-text font-medium">₹{Number(booking.base_amount).toLocaleString("en-IN")}</span>
                  <span className="block text-[11px] text-muted">
                    paid ₹{Number(booking.paid_amount).toLocaleString("en-IN")}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <span className="text-[10px] uppercase tracking-wider text-muted">
                    {booking.payment_status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <StatusPill status={booking.status} />
                </td>
                <td className="px-4 py-2.5 text-right text-muted">
                  {expandedId === booking.id ? "▲" : "▼"}
                </td>
              </tr>
              {expandedId === booking.id && (
                <tr className="bg-stone-50 border-y border-stone-200">
                  <td colSpan={8} className="px-4 py-4">
                    <BookingDetail booking={booking} onUpdate={handleUpdate} />
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </TableShell>
      )}
    </div>
  );
}

function BookingDetail({
  booking,
  onUpdate,
}: {
  booking: Booking;
  onUpdate: (reference: string, payload: Record<string, unknown>) => void;
}) {
  const [paidInput, setPaidInput] = useState(String(Number(booking.paid_amount)));
  const [saving, setSaving] = useState(false);

  const recordPayment = async () => {
    setSaving(true);
    try {
      await onUpdate(booking.booking_reference, { paid_amount: Number(paidInput) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="space-y-1.5 text-sm md:col-span-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Reservation</p>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1.5">
          <p><span className="text-muted">Event:</span> <span className="capitalize">{booking.event_type}</span></p>
          <p><span className="text-muted">Guests:</span> {booking.guest_count}</p>
          <p><span className="text-muted">Hall:</span> {booking.hall_name}</p>
          <p><span className="text-muted">Package:</span> {booking.package_name || "—"}</p>
          <p><span className="text-muted">Email:</span> {booking.customer_email || "—"}</p>
          <p><span className="text-muted">Booked on:</span> {new Date(booking.created_at).toLocaleDateString("en-IN")}</p>
        </div>
        {booking.customer_notes && (
          <p className="text-xs text-muted pt-2">
            <span className="uppercase tracking-wider block mb-0.5">Customer notes</span>
            {booking.customer_notes}
          </p>
        )}
        <div className="grid grid-cols-3 gap-3 pt-3 max-w-md">
          <SumBox label="Base" value={`₹${Number(booking.base_amount).toLocaleString("en-IN")}`} />
          <SumBox label="Advance (30%)" value={`₹${Number(booking.advance_amount).toLocaleString("en-IN")}`} />
          <SumBox label="Balance" value={`₹${Number(booking.balance_amount).toLocaleString("en-IN")}`} />
        </div>
      </div>

      <div className="space-y-4">
        <Field label="Status">
          <Select
            value={booking.status}
            onChange={(e) => onUpdate(booking.booking_reference, { status: e.target.value })}
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.replace("_", " ")}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Record Offline Payment (₹)" hint="Updates balance + payment status on save.">
          <div className="flex gap-2">
            <TextInput
              type="number"
              min="0"
              step="0.01"
              value={paidInput}
              onChange={(e) => setPaidInput(e.target.value)}
            />
            <AdminButton onClick={recordPayment} loading={saving}>Save</AdminButton>
          </div>
        </Field>

        <Field label="Admin Notes">
          <TextInput
            defaultValue={booking.admin_notes}
            placeholder="Internal notes…"
            onBlur={(e) =>
              e.target.value !== booking.admin_notes &&
              onUpdate(booking.booking_reference, { admin_notes: e.target.value })
            }
          />
        </Field>
      </div>
    </div>
  );
}

function SumBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-white px-3 py-2">
      <p className="text-[9px] uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="text-sm font-medium text-text">{value}</p>
    </div>
  );
}
