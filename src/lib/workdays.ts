// src/lib/workdays.ts
// Рабочие дни/праздники РФ (простая модель) + утилиты

const HOLIDAYS_KEY = "dgu.holidays.v1";

// Формат дат: "YYYY-MM-DD"
export function getHolidays(): string[] {
  try {
    const raw = localStorage.getItem(HOLIDAYS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as string[]) : [];
  } catch {
    return [];
  }
}

export function setHolidays(list: string[]) {
  const norm = Array.from(new Set(list.map((d) => d.slice(0, 10))).values()).sort();
  localStorage.setItem(HOLIDAYS_KEY, JSON.stringify(norm));
}

function isWeekend(d: Date) {
  const wd = d.getDay(); // 0 вс, 6 сб
  return wd === 0 || wd === 6;
}

function isHolidayISO(iso: string, holidays: string[]) {
  return holidays.includes(iso);
}

export function addWorkingDays(date: Date, n: number, holidays: string[]): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  let added = 0;
  while (added < n) {
    d.setDate(d.getDate() + 1);
    const iso = toISO(d);
    if (!isWeekend(d) && !isHolidayISO(iso, holidays)) {
      added++;
    }
  }
  return d;
}

export function addWorkingDaysFrom(startISO: string, n: number, holidays: string[]): string {
  const [y, m, day] = startISO.split("-").map(Number);
  const res = addWorkingDays(new Date(y, (m ?? 1) - 1, day ?? 1), n, holidays);
  return toISO(res);
}

export function calcDefaultEta(startISO: string, bufferDays = 0): string {
  const holidays = getHolidays();
  const [y, m, day] = startISO.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, day ?? 1);
  const end = addWorkingDays(dt, Math.max(0, Math.floor(bufferDays)), holidays);
  return toISO(end);
}

export function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
