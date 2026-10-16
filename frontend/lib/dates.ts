/**
 * Date utilities avoiding timezone rollback bugs and providing accessible labels.
 */

export function buildDateKey(year: number, monthZeroIndexed: number, day: number): string {
  const m = String(monthZeroIndexed + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getMonthRange(year: number, monthZeroIndexed: number): { start: string; end: string } {
  const start = buildDateKey(year, monthZeroIndexed, 1);
  const lastDay = new Date(year, monthZeroIndexed + 1, 0).getDate();
  const end = buildDateKey(year, monthZeroIndexed, lastDay);
  return { start, end };
}

export function getDaysInMonth(year: number, monthZeroIndexed: number): number {
  return new Date(year, monthZeroIndexed + 1, 0).getDate();
}

export function getFirstDayOfWeek(year: number, monthZeroIndexed: number): number {
  return new Date(year, monthZeroIndexed, 1).getDay();
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function getMonthName(monthZeroIndexed: number): string {
  return MONTH_NAMES[monthZeroIndexed] || "";
}

export function formatAriaDate(dateStr: string, status: string): string {
  if (!dateStr) return "";
  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  const monthIdx = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);
  const monthName = MONTH_NAMES[monthIdx] || "";
  return `${day} ${monthName}, ${status}`;
}

export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "";
  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  const monthIdx = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);
  const monthName = MONTH_NAMES[monthIdx] || "";
  return `${day} ${monthName} ${yearStr}`;
}

export function isPastDate(dateStr: string): boolean {
  if (!dateStr) return false;
  const todayStr = formatDateKey(new Date());
  return dateStr < todayStr;
}
