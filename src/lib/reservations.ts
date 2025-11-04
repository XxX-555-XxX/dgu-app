// Простое хранилище броней + события для подписки

export type Reservation = {
  id: string;
  assetCode: string;
  customer: string;
  comment?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD включительно
};

const STORAGE_KEY = "dgu.reservations.v1";

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

function fmt(d: string) {
  // валидация
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) throw new Error("Bad date format, expected YYYY-MM-DD");
}

function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return aStart <= bEnd && bStart <= aEnd;
}

// ---------- публичное API

export function listReservationsForAsset(assetCode: string): Reservation[] {
  return readAll()
    .filter((r) => r.assetCode === assetCode)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export function listReservations(): Reservation[] {
  return readAll().sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export function addReservation(input: Omit<Reservation, "id">): Reservation {
  fmt(input.startDate);
  fmt(input.endDate);
  if (input.startDate > input.endDate) {
    throw new Error("Дата начала позже даты окончания");
  }

  const all = readAll();
  // запрет пересечений по одному активу
  const sameAsset = all.filter((r) => r.assetCode === input.assetCode);
  const conflict = sameAsset.find((r) => overlaps(r.startDate, r.endDate, input.startDate, input.endDate));
  if (conflict) {
    throw new Error("Даты пересекаются с существующей бронью");
  }

  const created: Reservation = { ...input, id: crypto.randomUUID() };
  all.push(created);
  writeAll(all);

  // событие на весь проект — чтобы обновлялись таблицы/карточки
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
  const today = new Date().toISOString().slice(0, 10);
  const list = listReservationsForAsset(assetCode);
  return list.find((r) => r.endDate >= today) || null;
}

export function isReservedNow(assetCode: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return listReservationsForAsset(assetCode).some((r) => r.startDate <= today && today <= r.endDate);
}

export function hasFutureWithin(assetCode: string, days: number): boolean {
  const today = new Date();
  const limit = new Date(today);
  limit.setDate(limit.getDate() + days);
  const lim = limit.toISOString().slice(0, 10);
  return listReservationsForAsset(assetCode).some((r) => r.startDate > today.toISOString().slice(0, 10) && r.startDate <= lim);
}
