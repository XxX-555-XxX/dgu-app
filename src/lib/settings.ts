// Настройки проекта: праздники и т.п. (локальное хранилище)

const LS = typeof window !== "undefined" ? window.localStorage : undefined;
const HOLIDAYS_KEY = "settings:holidays"; // массив ISO-дат 'YYYY-MM-DD'

// Прочитать список праздников
export function getHolidays(): string[] {
  if (!LS) return [];
  try {
    const raw = LS.getItem(HOLIDAYS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as string[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

// Сохранить список праздников
export function setHolidays(list: string[]) {
  if (!LS) return;
  const clean = (list ?? []).map((s) => String(s).trim()).filter(Boolean);
  LS.setItem(HOLIDAYS_KEY, JSON.stringify(clean));
}
