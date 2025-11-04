// src/lib/settings.ts
// Единая точка для настроек буфера и праздников.
// Читает то, что выставляют страницы настроек (если они у тебя уже есть).

export type Settings = {
  bufferWorkingDays: number;
  holidays: string[]; // массив ISO-дат YYYY-MM-DD
};

const LS_RESERVATION = "reservationSettings"; // { bufferWorkingDays }
const LS_HOLIDAYS = "holidays";               // string[] ISO

const defaults: Settings = {
  bufferWorkingDays: 2,
  holidays: [],
};

export function getSettings(): Settings {
  try {
    const rawRes = localStorage.getItem(LS_RESERVATION);
    const rawHol = localStorage.getItem(LS_HOLIDAYS);
    const res = rawRes ? JSON.parse(rawRes) : {};
    const hol = rawHol ? JSON.parse(rawHol) : [];
    return {
      bufferWorkingDays: Number(res.bufferWorkingDays ?? defaults.bufferWorkingDays),
      holidays: Array.isArray(hol) ? hol : [],
    };
  } catch {
    return defaults;
  }
}
