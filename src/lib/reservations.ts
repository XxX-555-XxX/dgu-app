// src/lib/reservations.ts
// Единая точка API для бронирований + настройки буфера. Совместимо с App.tsx.

export type { Reservation } from "@/lib/storage";

// --- Буфер рабочих дней между бронями (локально) ---
const BUFFER_KEY = "reservation:bufferDays";
const DEFAULT_BUFFER = 1;

export function getReservationBufferDays(): number {
  try {
    const raw = localStorage.getItem(BUFFER_KEY);
    const n = raw == null ? NaN : parseInt(raw, 10);
    return Number.isFinite(n) && n >= 0 ? n : DEFAULT_BUFFER;
  } catch {
    return DEFAULT_BUFFER;
  }
}

export function setReservationBufferDays(n: number): number {
  const v = Math.max(0, Math.floor(Number(n)));
  try { localStorage.setItem(BUFFER_KEY, String(v)); } catch {}
  return v;
}

// --- Базовые CRUD/утилиты из storage.ts ---
import {
  addReservation as _addReservation,
  removeReservation as _removeReservation,
  listReservationsByAsset as _listReservationsByAsset,
  overlapsAny as _overlapsAny,
} from "@/lib/storage";

export const addReservation    = _addReservation;
export const deleteReservation = _removeReservation; // имя, которое ждут компоненты
export const overlapsAny       = _overlapsAny;

// --- Совместимые с App.tsx обёртки ---

export type CalendarReservation = {
  id: string;
  customer: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  comment?: string;
};

/** Возвращает брони по активу в формате {startDate,endDate} */
export function listReservations(assetCode: string): CalendarReservation[] {
  const rows = _listReservationsByAsset(assetCode);
  return rows.map(r => ({
    id: r.id,
    customer: r.customer,
    startDate: r.start,
    endDate: r.end,
    comment: r.comment,
  }));
}

/** Ближайшая будущая бронь для актива */
export function nextReservation(assetCode: string): CalendarReservation | null {
  const today = new Date().toISOString().slice(0,10);
  const rows = listReservations(assetCode)
    .filter(r => r.startDate >= today)
    .sort((a,b) => a.startDate.localeCompare(b.startDate));
  return rows[0] ?? null;
}

/** Исходный список без маппинга — нужен для модулей */
export const listReservationsByAsset = _listReservationsByAsset;
