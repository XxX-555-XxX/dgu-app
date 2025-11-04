// src/lib/reservations.ts
// Простое хранилище броней + события для подписки + совместимость со старыми модулями

export type Reservation = {
  id: string;
  assetCode: string;
  customer: string;
  comment?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD (включительно)
};

const STORAGE_KEY = "dgu.reservations.v1";
const BUFFER_KEY = "dgu.reservations.bufferDays.v1";

function readAll(): Reservation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as Reservation[]) : [];
  } catch {
    return [];
  }
}

function writeAll(list: Reservation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return aStart <= bEnd && bStart <= aEnd;
}

export function toISO(d: Date | string): string {
  if (typeof d === "string") {
    // ожидаем YYYY-MM-DD, нормализуем
    return d.slice(0, 10);
  }
  // Локальная дата -> ISO YYYY-MM-DD
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ---------- публичное API

export function listReservationsForAsset(assetCode: string): Reservation[] {
  return readAll()
    .filter((r) => r.assetCode === assetCode)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

// Совместимость: без аргумента — все; с аргументом — по активу
export function listReservations(assetCode?: string): Reservation[] {
  if (assetCode) return listReservationsForAsset(assetCode);
  return readAll().sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export function addReservation(input: Omit<Reservation, "id">): Reservation {
  const all = readAll();
  const sameAsset = all.filter((r) => r.assetCode === input.assetCode);
  const conflict = sameAsset.find((r) =>
    overlaps(r.startDate, r.endDate, input.startDate, input.endDate),
  );
  if (conflict) throw new Error("Даты пересекаются с существующей бронью");

  const created: Reservation = { ...input, id: crypto.randomUUID() };
  all.push(created);
  writeAll(all);

  window.dispatchEvent(new CustomEvent("reservations:updated"));
  return created;
}

export function removeReservation(id: string): void {
  const all = readAll();
  const next = all.filter((r) => r.id !== id);
  writeAll(next);
  window.dispatchEvent(new CustomEvent("reservations:updated"));
}

export function nextReservation(assetCode: string): Reservation | null {
  const today = toISO(new Date());
  const list = listReservationsForAsset(assetCode);
  return list.find((r) => r.endDate >= today) || null;
}

export function isReservedNow(assetCode: string): boolean {
  const today = toISO(new Date());
  return listReservationsForAsset(assetCode).some(
    (r) => r.startDate <= today && today <= r.endDate,
  );
}

export function hasFutureWithin(assetCode: string, days: number): boolean {
  const today = new Date();
  const limit = new Date(today);
  limit.setDate(limit.getDate() + days);
  const lim = toISO(limit);
  return listReservationsForAsset(assetCode).some(
    (r) => r.startDate > toISO(today) && r.startDate <= lim,
  );
}

// Подписка на события изменения броней
export function subscribe(cb: () => void): () => void {
  const handler = () => cb();
  window.addEventListener("reservations:updated", handler);
  return () => window.removeEventListener("reservations:updated", handler);
}

// Настройки буфера дней (для future логики)
export function getReservationBufferDays(): number {
  const raw = localStorage.getItem(BUFFER_KEY);
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}
export function setReservationBufferDays(n: number): void {
  localStorage.setItem(BUFFER_KEY, String(Math.max(0, Math.floor(n))));
  window.dispatchEvent(new CustomEvent("settings:updated"));
}
