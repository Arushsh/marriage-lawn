"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { adminFetch } from "@/lib/admin/api";
import {
  AdminButton,
  Banner,
  Field,
  PageHeader,
  Select,
  TextInput,
} from "@/components/admin/ui";

interface AvailabilityRow {
  id: number;
  date: string; // YYYY-MM-DD
  status: "booked" | "tentative";
  note: string;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Local-time YYYY-MM-DD key (never toISOString — dates are IST business data). */
function dateKey(year: number, month: number, day: number): string {
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

export default function AdminAvailabilityPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [rows, setRows] = useState<AvailabilityRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<"booked" | "tentative">("booked");
  const [bulkNote, setBulkNote] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const end = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
      const data = await adminFetch<AvailabilityRow[]>(
        `/owner/availability/?start=${start}&end=${end}`
      );
      setRows(data);
      setSelected(new Set());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load availability.");
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const statusMap = useMemo(() => {
    const map = new Map<string, AvailabilityRow>();
    rows.forEach((row) => map.set(row.date, row));
    return map;
  }, [rows]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay(); // 0 = Sunday

  const toggleDate = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const applyBulk = async (mode: "block" | "unblock") => {
    if (selected.size === 0) {
      setError("Select one or more dates on the calendar first.");
      return;
    }
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === "block") {
        await adminFetch("/owner/availability/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dates: [...selected], status: bulkStatus, note: bulkNote }),
        });
        setNotice(`${selected.size} date(s) marked ${bulkStatus}.`);
      } else {
        for (const key of selected) {
          await adminFetch(`/owner/availability/${key}/`, { method: "DELETE" });
        }
        setNotice(`${selected.size} date(s) unblocked.`);
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  const shiftMonth = (delta: number) => {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  };

  return (
    <div>
      <PageHeader
        title="Availability Calendar"
        subtitle="Click dates to select, then block or unblock them. Blocked dates show as unavailable on the public website instantly."
      />

      {error && <Banner kind="error">{error}</Banner>}
      {notice && <Banner kind="success">{notice}</Banner>}
      {loading && (
        <p className="text-sm text-muted font-mono uppercase tracking-[0.2em] mb-4">
          Loading calendar…
        </p>
      )}

      <div className="grid lg:grid-cols-[1fr_300px] gap-8 items-start max-w-[1100px]">
        {/* Calendar */}
        <section className="bg-white border border-border">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
            <AdminButton variant="ghost" onClick={() => shiftMonth(-1)} aria-label="Previous month">
              ←
            </AdminButton>
            <p className="font-serif text-lg text-primary">
              {MONTH_NAMES[month]} {year}
            </p>
            <AdminButton variant="ghost" onClick={() => shiftMonth(1)} aria-label="Next month">
              →
            </AdminButton>
          </div>

          <div className="grid grid-cols-7 border-b border-border bg-surface/60 text-center text-[10px] uppercase tracking-wider text-muted">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="py-2 border-r border-border last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {Array.from({ length: firstWeekday }).map((_, i) => (
              <div key={`pad-${i}`} className="min-h-[72px] border-r border-b border-border bg-surface/30" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const key = dateKey(year, month, day);
              const row = statusMap.get(key);
              const isSelected = selected.has(key);
              const cellClass = row?.status === "booked"
                ? "bg-red-50 text-red-900 border-red-200"
                : row?.status === "tentative"
                  ? "bg-amber-50 text-amber-900 border-amber-200"
                  : "bg-white text-text hover:bg-surface";
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleDate(key)}
                  className={`min-h-[72px] border-r border-b border-border text-left p-2 transition-colors cursor-pointer ${cellClass} ${
                    isSelected ? "!bg-primary !text-white" : ""
                  }`}
                >
                  <span className="text-sm font-medium">{day}</span>
                  {row && (
                    <span className="block text-[9px] uppercase tracking-wider mt-1 opacity-80 truncate">
                      {row.status}
                      {row.note ? " · note" : ""}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Bulk actions */}
        <section className="bg-white border border-border p-5 space-y-4">
          <h2 className="font-serif text-lg text-primary font-normal">Bulk Actions</h2>
          <p className="text-xs text-muted">
            {selected.size === 0
              ? "No dates selected — click calendar cells to select."
              : `${selected.size} date(s) selected.`}
          </p>

          <Field label="Status">
            <Select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value as "booked" | "tentative")}>
              <option value="booked">Booked (confirmed)</option>
              <option value="tentative">Tentative (holding)</option>
            </Select>
          </Field>

          <Field label="Private Note" hint="Only visible here, never on the website.">
            <TextInput
              value={bulkNote}
              onChange={(e) => setBulkNote(e.target.value)}
              placeholder="e.g. Sharma wedding — advance received"
            />
          </Field>

          <div className="space-y-2 pt-1">
            <AdminButton onClick={() => applyBulk("block")} loading={saving} className="w-full">
              Block Selected Dates
            </AdminButton>
            <AdminButton variant="secondary" onClick={() => applyBulk("unblock")} loading={saving} className="w-full">
              Unblock Selected Dates
            </AdminButton>
            <AdminButton variant="ghost" onClick={() => setSelected(new Set())} className="w-full">
              Clear Selection
            </AdminButton>
          </div>

          <div className="pt-3 border-t border-border space-y-1.5 text-[10px] uppercase tracking-wider text-muted">
            <p><span className="inline-block w-3 h-3 bg-red-100 border border-red-200 align-middle mr-1.5" /> Booked</p>
            <p><span className="inline-block w-3 h-3 bg-amber-50 border border-amber-200 align-middle mr-1.5" /> Tentative</p>
            <p><span className="inline-block w-3 h-3 bg-white border border-border align-middle mr-1.5" /> Available</p>
          </div>
        </section>
      </div>
    </div>
  );
}
