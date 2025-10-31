// src/lib/assetSelectors.ts
// Чистые хелперы и селекторы по броням/доступности активов.
// Цель — разгрузить компоненты (особенно App.tsx).

import { listReservations, nextReservation } from "@/lib/reservations";

export type Availability = { text: string; muted?: boolean };

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function safeReservations(assetCode: string) {
  return (listReservations(assetCode) || [])
    .filter(r => r && typeof r.startDate === "string" && typeof r.endDate === "string" && r.startDate && r.endDate);
}

export function hasCurrentOrFutureReservation(assetCode: string): boolean {
  const t = todayISO();
  return safeReservations(assetCode).some(r => r.endDate >= t);
}

export function hasFutureReservationWithin(assetCode: string, days: number): boolean {
  const t = todayISO();
  const bound = addDaysISO(t, days);
  return safeReservations(assetCode).some(r => r.startDate > t && r.startDate <= bound);
}

export function isFree(assetCode: string): boolean {
  const t = todayISO();
  return !safeReservations(assetCode).some(r => r.endDate >= t);
}

export function availabilityLabel(assetCode: string): Availability {
  const t = todayISO();
  const all = safeReservations(assetCode).sort((a, b) => (a.startDate || "").localeCompare(b.startDate || ""));
  const current = all.find(r => r.startDate <= t && t <= r.endDate);
  if (current) return { text: `Забронирован сейчас (до ${fmtDate(current.endDate)}, ${current.customer})` };
  const next = all.find(r => r.startDate > t);
  if (next) return { text: `Доступен до начала брони: ${fmtDate(next.startDate)} (${next.customer})` };
  return { text: "Свободен", muted: true };
}

export function getNextReservation(assetCode: string) {
  try { return nextReservation(assetCode); } catch { return null; }
}

// --- Вспомогательные утилиты (локальные) ---
export function addDaysISO(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(n => parseInt(n, 10));
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function fmtDate(s?: string) {
  if (!s) return "";
  const [y, m, d] = s.split("-");
  return `${d}.${m}.${y}`;
}
