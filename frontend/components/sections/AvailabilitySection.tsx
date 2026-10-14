"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AvailabilityStatus } from "@/types/api";
import { getAvailability } from "@/lib/api";
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

    const contactElem = document.getElementById("contact");
    if (contactElem) {
      contactElem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="availability" className="py-20 sm:py-32">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-8 space-y-8">
        <FadeUp>
          <div className="space-y-2">
            <h2 className="font-serif text-[28px] sm:text-[40px] font-normal leading-[1.2] text-primary">
              Check Date Availability
            </h2>
            <p className="text-[16px] sm:text-[17px] text-muted leading-[1.65] max-w-[60ch]">
              Select an open date to initiate your booking enquiry. Red strikethrough indicates confirmed events.
            </p>
          </div>
        </FadeUp>

        {/* Calendar Card */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="bg-surface rounded-2xl p-6 sm:p-10 border border-black/[0.08] max-w-2xl mx-auto space-y-6 select-none"
        >
          {/* Header with Navigation */}
          <div className="flex items-center justify-between">
            <span className="font-serif text-2xl font-normal text-text">
              {getMonthName(currentMonth)} {currentYear}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                disabled={isCurrentMonthOrPast}
                aria-label="Previous Month"
                className={`w-11 h-11 flex items-center justify-center rounded-lg border border-black/[0.08] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isCurrentMonthOrPast
                    ? "opacity-30 cursor-not-allowed"
                    : "hover:bg-black/5 active:bg-black/10"
                }`}
              >
                <ChevronLeft className="w-5 h-5 text-text" strokeWidth={1.5} />
              </button>

              <button
                type="button"
                onClick={handleNextMonth}
                disabled={isMaxMonth}
                aria-label="Next Month"
                className={`w-11 h-11 flex items-center justify-center rounded-lg border border-black/[0.08] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isMaxMonth
                    ? "opacity-30 cursor-not-allowed"
                    : "hover:bg-black/5 active:bg-black/10"
                }`}
              >
                <ChevronRight className="w-5 h-5 text-text" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((day) => (
              <span
                key={day}
                className="text-xs font-medium text-muted py-1 block uppercase tracking-wider"
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
                  className={`min-h-[44px] aspect-square flex items-center justify-center rounded-lg text-sm transition-all cursor-pointer relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isSelected
                      ? "ring-2 ring-primary font-medium bg-primary/10 text-primary"
                      : ""
                  } ${
                    past
                      ? "text-black/25 cursor-not-allowed"
                      : isBooked
                      ? "text-red-700/60 line-through bg-red-50/50 cursor-not-allowed"
                      : isTentative
                      ? "text-amber-800 bg-amber-50/60 hover:bg-amber-100"
                      : "text-text hover:bg-black/5 active:bg-black/10"
                  }`}
                >
                  <span>{day}</span>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="pt-4 border-t border-black/[0.06] flex flex-wrap items-center justify-center gap-6 text-xs text-text/80">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm border border-black/20 bg-surface" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-red-100 border border-red-300 text-red-700 flex items-center justify-center text-[10px] line-through">
                -
              </span>
              <span>Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-amber-100 border border-amber-300" />
              <span>Tentative</span>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-muted text-center pt-1">
            Dates are indicative. Please confirm with our team.
          </p>
        </div>
      </div>
    </section>
  );
};
