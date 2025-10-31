/**
 * Работа с рабочими днями РФ:
 * - Рабочим считается пн–пт, если дата не входит в список праздников.
 * - Праздники читаются из localStorage по ключу "holidays" (массив строк 'YYYY-MM-DD').
 *   Если список не задан — считаем только выходные.
 *
 * Ключевые функции:
 * - isWorkingDay('YYYY-MM-DD'): boolean
 * - addWorkingDaysFrom('YYYY-MM-DD', n): 'YYYY-MM-DD' (добавить n РАБОЧИХ дней к дате)
 * - nextWorkingDay('YYYY-MM-DD'): ближайший следующий рабочий день
 * - toISO(d: Date): 'YYYY-MM-DD'
 */

const HOLIDAYS_KEY = "holidays";

/** YYYY-MM-DD -> Date (локальная полуночь) */
function fromISO(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map((x) => parseInt(x, 10));
  return new Date(y, m - 1, d);
}

/** Date -> YYYY-MM-DD */
export function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

/** Возвращает множество праздников (строки YYYY-MM-DD) из localStorage */
export function getHolidays(): Set<string> {
  try {
    const raw = localStorage.getItem(HOLIDAYS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((s) => typeof s === "string"));
  } catch {
    return new Set();
  }
}

/** Является ли дата РАБОЧЕЙ (пн–пт и не праздник) */
export function isWorkingDay(dateStr: string): boolean {
  const d = fromISO(dateStr);
  const day = d.getDay(); // 0=вс, 1=пн, ..., 6=сб
  if (day === 0 || day === 6) return false; // выходные
  const holidays = getHolidays();
  return !holidays.has(toISO(d));
}

/**
 * Добавляет n РАБОЧИХ дней к дате (не включая саму начальную дату).
 * Пример: addWorkingDaysFrom('2025-10-24', 1) => '2025-10-27' (24-пт +1рд = 27-пн)
 */
export function addWorkingDaysFrom(dateStr: string, n: number): string {
  if (!Number.isFinite(n) || n <= 0) return dateStr;
  let d = fromISO(dateStr);
  let left = Math.floor(n);

  while (left > 0) {
    d.setDate(d.getDate() + 1);
    const iso = toISO(d);
    if (isWorkingDay(iso)) {
      left -= 1;
    }
  }
  return toISO(d);
}

/** Ближайший следующий РАБОЧИЙ день после указанной даты. */
export function nextWorkingDay(dateStr: string): string {
  return addWorkingDaysFrom(dateStr, 1);
}
