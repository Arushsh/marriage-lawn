import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  formatDateKey,
  buildDateKey,
  getMonthRange,
  formatAriaDate,
  isPastDate,
} from "../lib/dates.ts";

describe("Date utilities for IST / Local Time", () => {
  it("buildDateKey correctly formats YYYY-MM-DD", () => {
    assert.equal(buildDateKey(2026, 10, 21), "2026-11-21");
    assert.equal(buildDateKey(2026, 0, 5), "2026-01-05");
  });

  it("formatDateKey preserves the local calendar date without timezone shift", () => {
    // Construct local midnight: Nov 21, 2026 00:00:00
    const localMidnight = new Date(2026, 10, 21, 0, 0, 0);

    const formatted = formatDateKey(localMidnight);
    assert.equal(formatted, "2026-11-21");

    // In IST (+05:30), local midnight Nov 21 is Nov 20 18:30:00 UTC.
    // If the local timezone has a positive offset (like IST), toISOString() would yield "2026-11-20"
    const tzOffsetMinutes = localMidnight.getTimezoneOffset();
    if (tzOffsetMinutes < 0) {
      // Positive UTC offset (like IST UTC+5:30 -> offset is -330)
      const isoShifted = localMidnight.toISOString().split("T")[0];
      assert.notEqual(
        formatted,
        isoShifted,
        "formatDateKey must NOT suffer from the toISOString date rollback bug"
      );
      assert.equal(isoShifted, "2026-11-20", "toISOString incorrectly shifts to previous day");
      assert.equal(formatted, "2026-11-21", "formatDateKey correctly keeps local day");
    }
  });

  it("getMonthRange returns exact start and end for month", () => {
    const novRange = getMonthRange(2026, 10); // Nov 2026
    assert.equal(novRange.start, "2026-11-01");
    assert.equal(novRange.end, "2026-11-30");

    const febRange = getMonthRange(2024, 1); // Feb 2024 (leap year)
    assert.equal(febRange.start, "2024-02-01");
    assert.equal(febRange.end, "2024-02-29");
  });

  it("formatAriaDate generates accessible screen reader labels", () => {
    assert.equal(
      formatAriaDate("2026-11-21", "booked"),
      "21 November, booked"
    );
    assert.equal(
      formatAriaDate("2026-11-22", "available"),
      "22 November, available"
    );
  });

  it("isPastDate correctly identifies past dates", () => {
    assert.equal(isPastDate("2020-01-01"), true);
    assert.equal(isPastDate("2099-01-01"), false);
  });
});
