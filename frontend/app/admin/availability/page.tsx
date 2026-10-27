"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  Lock,
  Unlock,
  RotateCcw,
  Sparkles,
} from "lucide-react";
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
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Local-time YYYY-MM-DD key (never toISOString — dates are IST business data). */
function dateKey(year: number, month: number, day: number): string {
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

export default function AdminAvailabilityPage() {
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(
    () => dateKey(today.getFullYear(), today.getMonth(), today.getDate()),
    [today]
  );

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

  const selectAllBlocked = () => {
    const set = new Set<string>();
    rows.forEach((r) => set.add(r.date));
    setSelected(set);
  };

  const applyBulk = async (mode: "block" | "unblock") => {
    if (selected.size === 0) {
      setError("Please click on one or more dates on the calendar first.");
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
        setNotice(`Successfully marked ${selected.size} date(s) as ${bulkStatus}.`);
      } else {
        for (const key of selected) {
          await adminFetch(`/owner/availability/${key}/`, { method: "DELETE" });
        }
        setNotice(`Successfully unblocked ${selected.size} date(s). Now open for booking.`);
      }
      setBulkNote("");
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

  const jumpToToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  };

  // Month Statistics
  const bookedCount = rows.filter((r) => r.status === "booked").length;
  const tentativeCount = rows.filter((r) => r.status === "tentative").length;
  const availableCount = daysInMonth - (bookedCount + tentativeCount);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Date Availability Calendar"
        subtitle="Manage live wedding date slots and auspicious muhurat locks. Changes reflect on the public website immediately."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={jumpToToday}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors shadow-xs"
            >
              Today
            </button>
          </div>
        }
      />

      {error && <Banner kind="error">{error}</Banner>}
      {notice && <Banner kind="success">{notice}</Banner>}

      {/* Monthly Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200/90 rounded-xl p-4 shadow-xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
            Total Days
          </p>
          <p className="font-serif text-2xl font-bold text-stone-900 mt-1">{daysInMonth}</p>
          <p className="text-xs text-stone-400 mt-1">{MONTH_NAMES[month]} {year}</p>
        </div>

        <div className="bg-white border border-rose-100 rounded-xl p-4 shadow-xs bg-rose-50/20">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-700">
            Booked / Locked
          </p>
          <p className="font-serif text-2xl font-bold text-rose-700 mt-1">{bookedCount}</p>
          <p className="text-xs text-rose-500 mt-1">Confirmed weddings</p>
        </div>

        <div className="bg-white border border-amber-100 rounded-xl p-4 shadow-xs bg-amber-50/20">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
            Tentative Holds
          </p>
          <p className="font-serif text-2xl font-bold text-amber-700 mt-1">{tentativeCount}</p>
          <p className="text-xs text-amber-500 mt-1">Inquiries pending</p>
        </div>

        <div className="bg-white border border-emerald-100 rounded-xl p-4 shadow-xs bg-emerald-50/20">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
            Open Dates
          </p>
          <p className="font-serif text-2xl font-bold text-emerald-700 mt-1">{availableCount}</p>
          <p className="text-xs text-emerald-500 mt-1">Ready to book</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
        {/* Calendar Section */}
        <section className="bg-white border border-stone-200/90 rounded-2xl shadow-xs overflow-hidden">
          {/* Calendar Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50/80">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#C5A880]" />
              <h2 className="font-serif text-lg font-bold text-stone-900 tracking-wide">
                {MONTH_NAMES[month]} {year}
              </h2>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                className="p-2 rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 transition-colors shadow-xs"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                className="p-2 rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 transition-colors shadow-xs"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 border-b border-stone-200 bg-stone-100/70 text-center text-[11px] font-semibold uppercase tracking-wider text-stone-600">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="py-2.5 border-r border-stone-200 last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 bg-stone-100 gap-px">
            {Array.from({ length: firstWeekday }).map((_, i) => (
              <div
                key={`pad-${i}`}
                className="min-h-[85px] sm:min-h-[96px] bg-stone-50/50 p-2 opacity-50"
              />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const key = dateKey(year, month, day);
              const row = statusMap.get(key);
              const isSelected = selected.has(key);
              const isToday = key === todayStr;

              let tileStyle = "bg-white text-stone-800 hover:bg-stone-50/80";
              let badgeStyle = "";

              if (row?.status === "booked") {
                tileStyle = "bg-rose-50/70 text-rose-950 hover:bg-rose-100/70";
                badgeStyle = "bg-rose-100 text-rose-800 border-rose-200";
              } else if (row?.status === "tentative") {
                tileStyle = "bg-amber-50/70 text-amber-950 hover:bg-amber-100/70";
                badgeStyle = "bg-amber-100 text-amber-800 border-amber-200";
              }

              if (isSelected) {
                tileStyle = "!bg-[#7A1528] !text-white shadow-inner";
              }

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleDate(key)}
                  className={`min-h-[85px] sm:min-h-[96px] p-2 sm:p-2.5 text-left flex flex-col justify-between transition-all duration-150 cursor-pointer relative group ${tileStyle}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-sm font-semibold inline-flex items-center justify-center w-6 h-6 rounded-full ${
                        isToday
                          ? isSelected
                            ? "bg-white text-[#7A1528] font-bold"
                            : "bg-[#7A1528] text-white font-bold"
                          : ""
                      }`}
                    >
                      {day}
                    </span>

                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-[#C5A880] shrink-0" />
                    )}
                  </div>

                  {row && (
                    <div className="mt-1">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border truncate max-w-full ${
                          isSelected
                            ? "bg-white/20 text-white border-white/30"
                            : badgeStyle
                        }`}
                      >
                        {row.status}
                      </span>
                      {row.note && (
                        <p
                          className={`text-[10px] truncate mt-0.5 ${
                            isSelected ? "text-stone-200" : "text-stone-500"
                          }`}
                        >
                          {row.note}
                        </p>
                      )}
                    </div>
                  )}

                  {!row && !isSelected && (
                    <span className="text-[10px] text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to lock
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Bulk Action Controls */}
        <section className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="pb-4 border-b border-stone-100">
            <h2 className="text-base font-semibold text-stone-900">Date Action Panel</h2>
            <p className="text-xs text-stone-500 mt-1">
              {selected.size === 0
                ? "Click any calendar dates to select and apply locks."
                : `${selected.size} date(s) currently selected.`}
            </p>
          </div>

          <Field label="Status to Apply">
            <Select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value as "booked" | "tentative")}
            >
              <option value="booked">Booked (Confirmed Wedding)</option>
              <option value="tentative">Tentative Hold (Under Negotiation)</option>
            </Select>
          </Field>

          <Field
            label="Internal Booking Note"
            hint="Private note visible only to estate managers."
          >
            <TextInput
              value={bulkNote}
              onChange={(e) => setBulkNote(e.target.value)}
              placeholder="e.g. Verma Wedding (500 guests)"
            />
          </Field>

          <div className="space-y-2.5 pt-2">
            <AdminButton
              onClick={() => applyBulk("block")}
              loading={saving}
              disabled={selected.size === 0}
              className="w-full flex items-center justify-center gap-2"
            >
              <Lock className="w-3.5 h-3.5" /> Block Selected ({selected.size})
            </AdminButton>

            <AdminButton
              variant="secondary"
              onClick={() => applyBulk("unblock")}
              loading={saving}
              disabled={selected.size === 0}
              className="w-full flex items-center justify-center gap-2"
            >
              <Unlock className="w-3.5 h-3.5" /> Free / Open Dates ({selected.size})
            </AdminButton>

            {selected.size > 0 && (
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                className="w-full py-2 text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3 h-3" /> Clear Selection
              </button>
            )}
          </div>

          {/* Quick Select Helpers */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={selectAllBlocked}
              className="text-[#7A1528] hover:underline font-medium"
            >
              Select All Blocked
            </button>
          </div>

          {/* Visual Legend */}
          <div className="pt-4 border-t border-stone-100 space-y-2 text-xs">
            <p className="font-semibold text-stone-700 text-[11px] uppercase tracking-wider mb-2">
              Calendar Legend
            </p>
            <div className="flex items-center gap-2 text-stone-600">
              <span className="w-3 h-3 rounded bg-rose-500 shrink-0" />
              <span>Booked (Unavailable on site)</span>
            </div>
            <div className="flex items-center gap-2 text-stone-600">
              <span className="w-3 h-3 rounded bg-amber-400 shrink-0" />
              <span>Tentative Hold</span>
            </div>
            <div className="flex items-center gap-2 text-stone-600">
              <span className="w-3 h-3 rounded bg-white border border-stone-300 shrink-0" />
              <span>Available / Open for booking</span>
            </div>
            <div className="flex items-center gap-2 text-stone-600">
              <span className="w-3 h-3 rounded bg-[#7A1528] shrink-0" />
              <span>Selected for bulk action</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
