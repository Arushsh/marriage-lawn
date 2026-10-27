"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AvailabilityStatus } from "@/types/api";
import { getAvailability } from "@/lib/api";
import { scrollToTarget } from "@/lib/scroll";
import {
  buildDateKey,
  isPastDate,
  getDaysInMonth,
  getFirstDayOfWeek,
  getMonthRange,
  getMonthName,
  formatAriaDate,
} from "@/lib/dates";
import { FadeUp } from "@/components/ui/FadeUp";
import { AnimatedHeading } from "@/components/animations/AnimatedHeading";

interface AvailabilitySectionProps {
  onSelectDate: (dateKey: string) => void;
  selectedDate?: string;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const AvailabilitySection: React.FC<AvailabilitySectionProps> = ({
  onSelectDate,
  selectedDate,
}) => {
  const today = new Date();
  const todayKey = buildDateKey(today.getFullYear(), today.getMonth(), today.getDate());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed

  // Month cache: key is `${year}-${month}`, value is Record<dateKey, AvailabilityStatus>
  const [cache, setCache] = useState<Record<string, Record<string, AvailabilityStatus>>>({});
  const [loading, setLoading] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const monthKey = `${currentYear}-${currentMonth}`;

  useEffect(() => {
    let ignore = false;
    const key = `${currentYear}-${currentMonth}`;
    if (cache[key]) return;

    // Run asynchronously to avoid synchronous cascading render warning
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const range = getMonthRange(currentYear, currentMonth);
        const res = await getAvailability(range.start, range.end);
        if (ignore) return;
        const statusMap: Record<string, AvailabilityStatus> = {};
        if (res && Array.isArray(res.dates)) {
          for (const item of res.dates) {
            statusMap[item.date] = item.status;
          }
        }
        setCache((prev) => ({ ...prev, [key]: statusMap }));
      } catch (err) {
        console.warn("Failed to fetch availability dates:", err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }, 0);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
    // Intentionally omit `cache` — reading it inside the effect via the guard
    // is sufficient; including it would re-fire the effect on every cache write.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentYear, currentMonth]);

  const isCurrentMonthOrPast =
    currentYear === today.getFullYear() && currentMonth <= today.getMonth();

  const handlePrevMonth = () => {
    if (isCurrentMonthOrPast) return;
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    const monthsAhead =
      (currentYear - today.getFullYear()) * 12 + (currentMonth - today.getMonth());
    if (monthsAhead >= 11) return;

    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const isMaxMonth =
    (currentYear - today.getFullYear()) * 12 + (currentMonth - today.getMonth()) >= 11;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handlePrevMonth();
      } else {
        handleNextMonth();
      }
    }
    touchStartX.current = null;
  };

  const totalDays = getDaysInMonth(currentYear, currentMonth);
  const startDayOfWeek = getFirstDayOfWeek(currentYear, currentMonth);
  const activeMonthStatusMap = cache[monthKey] || {};

  const handleDateClick = (dateKey: string, status: AvailabilityStatus, isPast: boolean) => {
    if (isPast || status === "booked") return;

    onSelectDate(dateKey);
    scrollToTarget("#contact");
  };

  return (
    <section id="availability" className="relative py-20 sm:py-32 bg-bg border-t border-border">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 space-y-10">
        <FadeUp>
          <div className="space-y-4 max-w-2xl">
            <AnimatedHeading
              as="h2"
              className="font-serif text-[30px] sm:text-[44px] leading-[1.12] text-ink"
            >
              Check Date Availability
            </AnimatedHeading>
            <p className="text-[15px] sm:text-[17px] text-muted leading-[1.7] max-w-[62ch]">
              Select an open date to initiate your booking reservation. Struck-through
              squares denote confirmed estate buyouts.
            </p>
          </div>
        </FadeUp>

        {/* Calendar — the estate's date weave, today's knot under a chase light */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="gota-glass rounded-2xl p-6 sm:p-10 max-w-2xl mx-auto space-y-6 select-none"
        >
          {/* Header with Navigation */}
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <span className="font-serif text-2xl text-ink">
              {getMonthName(currentMonth)} {currentYear}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevMonth}
                disabled={isCurrentMonthOrPast}
                aria-label="Previous Month"
                className={`w-10 h-10 flex items-center justify-center rounded-lg border border-border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rani ${
                  isCurrentMonthOrPast
                    ? "opacity-30 cursor-not-allowed"
                    : "hover:bg-white/10 hover:border-border-strong"
                }`}
              >
                <ChevronLeft className="w-5 h-5 text-ink" strokeWidth={1.5} />
              </button>

              <button
                type="button"
                onClick={handleNextMonth}
                disabled={isMaxMonth}
                aria-label="Next Month"
                className={`w-10 h-10 flex items-center justify-center rounded-lg border border-border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rani ${
                  isMaxMonth
                    ? "opacity-30 cursor-not-allowed"
                    : "hover:bg-white/10 hover:border-border-strong"
                }`}
              >
                <ChevronRight className="w-5 h-5 text-ink" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((day) => (
              <span
                key={day}
                className="text-[11px] font-semibold text-muted py-1 block uppercase tracking-[0.16em]"
              >
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div
            className={`grid grid-cols-7 gap-1 sm:gap-1.5 transition-opacity duration-200 ${
              loading ? "opacity-60" : "opacity-100"
            }`}
          >
            {/* Empty prefix cells */}
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[44px] aspect-square" />
            ))}

            {/* Day Cells */}
            {Array.from({ length: totalDays }).map((_, i) => {
              const day = i + 1;
              const dateKey = buildDateKey(currentYear, currentMonth, day);
              const past = isPastDate(dateKey);
              const status: AvailabilityStatus = activeMonthStatusMap[dateKey] || "available";
              const isSelected = selectedDate === dateKey;
              const isToday = dateKey === todayKey && !past;

              const isBooked = status === "booked";
              const isTentative = status === "tentative";

              const ariaStatus = past ? "past" : status;
              const ariaLabel = formatAriaDate(dateKey, ariaStatus);

              return (
                <button
                  key={dateKey}
                  type="button"
                  disabled={past || isBooked}
                  aria-label={ariaLabel}
                  onClick={() => handleDateClick(dateKey, status, past)}
                  className={`min-h-[44px] aspect-square flex items-center justify-center rounded-lg text-sm transition-all relative cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rani ${
                    isSelected
                      ? "bg-rani text-white font-bold ring-1 ring-zari/60"
                      : ""
                  } ${
                    past
                      ? "text-ink/25 cursor-not-allowed"
                      : isBooked
                      ? "text-ink/35 line-through bg-white/[0.04] cursor-not-allowed"
                      : isTentative
                      ? "text-diya bg-diya-soft border border-diya/40 hover:bg-diya/15"
                      : "text-ink border border-transparent hover:border-zari/50 hover:bg-white/[0.06]"
                  } ${isToday && !isSelected ? "animate-[chaseLight_2.2s_ease-in-out_infinite] border-diya/70 text-diya font-semibold" : ""}`}
                >
                  <span>{day}</span>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="pt-5 border-t border-border flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-sm border border-border-strong bg-transparent" />
              <span className="text-xs uppercase tracking-wider text-muted">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-sm bg-white/[0.06] border border-border text-ink/40 flex items-center justify-center text-[10px] line-through">
                -
              </span>
              <span className="text-xs uppercase tracking-wider text-muted">Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-sm bg-diya-soft border border-diya/50" />
              <span className="text-xs uppercase tracking-wider text-muted">Tentative</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-sm border border-diya/70 bg-transparent" />
              <span className="text-xs uppercase tracking-wider text-muted">Today</span>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-muted text-center pt-1 uppercase tracking-wider">
            Dates are indicative. Please confirm reservation with estate concierge.
          </p>
        </div>
      </div>
    </section>
  );
};
