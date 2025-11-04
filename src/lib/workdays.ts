// src/lib/workdays.ts
// Работа с рабочими днями: выходные + настраиваемые праздники (массив ISO-дат)

export function isWeekend(date: Date) {
  const d = date.getDay();
  return d === 0 || d === 6; // вс/сб
}

export function isHolidayISO(iso: string, holidays: string[]) {
  return holidays.includes(iso);
}

export function isWeekendOrHoliday(date: Date, holidays: string[]) {
  const iso = date.toISOString().slice(0, 10);
  return isWeekend(date) || isHolidayISO(iso, holidays);
}

/** Добавить N рабочих дней к дате (возвращает новую дату) */
export function addWorkingDays(date: Date, n: number, holidays: string[]) {
  const d = new Date(date);
  let left = n;
  while (left > 0) {
    d.setDate(d.getDate() + 1);
    if (!isWeekendOrHoliday(d, holidays)) left--;
  }
  return d;
}
