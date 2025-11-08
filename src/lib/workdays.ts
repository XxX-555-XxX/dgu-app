// Работа с рабочими днями

/**
 * Возвращает true, если дата НЕ праздник и не выходной (сб/вс).
 * holidays: массив ISO-дней 'YYYY-MM-DD'
 */
export function isWorkingDay(date: Date, holidays: string[]): boolean {
  const d = new Date(date);
  const day = d.getDay(); // 0..6 (0=вс)
  if (day === 0 || day === 6) return false;
  const iso = d.toISOString().slice(0, 10);
  return !holidays.includes(iso);
}

/**
 * Прибавляет N рабочих дней к дате (учитывая выходные и holidays).
 * Возвращает новую дату (UTC ISO корректна).
 */
export function addWorkingDays(date: Date, n: number, holidays: string[]): Date {
  let left = Math.max(0, Math.floor(n));
  let cur = new Date(date);
  while (left > 0) {
    cur.setDate(cur.getDate() + 1);
    if (isWorkingDay(cur, holidays)) left -= 1;
  }
  return cur;
}
