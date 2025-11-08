// Простое локальное хранилище бронирований + вспомогательные утилиты
// Формат брони
export type Reservation = {
  id: string;
  assetId: string;
  startDate?: string; // ISO (может не быть у старых записей)
  endDate?: string; // ISO
  start?: string; // устаревшие поля (для совместимости со старым кодом)
  end?: string;
  customer: string;
  comment?: string;
};

// Ввод для создания брони
export type ReservationInput = Omit<Reservation, "id" | "start" | "end">;

const STORAGE_KEY = "reservations:v1";
const LS = typeof window !== "undefined" ? window.localStorage : undefined;

// --- utils -----------------------------------------------------------------

export function toISO(d: Date | string): string {
  return typeof d === "string" ? d : new Date(d).toISOString();
}

function read(): Reservation[] {
  if (!LS) return [];
  try {
    const raw = LS.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Reservation[];
    // миграция старых полей start/end → startDate/endDate
    parsed.forEach((r) => {
      if (!r.startDate && r.start) r.startDate = r.start;
      if (!r.endDate && r.end) r.endDate = r.end;
    });
    return parsed;
  } catch {
    return [];
  }
}

function write(items: Reservation[]) {
  if (!LS) return;
  LS.setItem(STORAGE_KEY, JSON.stringify(items));
  // уведомим слушателей (если есть окно)
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("reservations:changed"));
  }
}

// --- CRUD ------------------------------------------------------------------

export function listReservations(): Reservation[] {
  // сортируем по дате начала (если есть)
  return read().sort((a, b) => toISO(a.startDate ?? "").localeCompare(toISO(b.startDate ?? "")));
}

export function addReservation(input: ReservationInput): Reservation {
  const items = read();
  const id = typeof crypto !== "undefined" ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  const record: Reservation = {
    id,
    assetId: input.assetId,
    startDate: input.startDate ? toISO(input.startDate) : undefined,
    endDate: input.endDate ? toISO(input.endDate) : undefined,
    customer: input.customer,
    comment: input.comment?.trim() || undefined,
  };
  items.push(record);
  write(items);
  return record;
}

export function removeReservation(id: string) {
  const items = read().filter((r) => r.id !== id);
  write(items);
}

// --- настройки бронирований ------------------------------------------------

// буфер дней до начала брони (для подсказок/предупреждений)
const BUFFER_KEY = "reservations:bufferDays";
let bufferDaysCache: number | null = null;

export function getReservationBufferDays(): number {
  if (bufferDaysCache != null) return bufferDaysCache;
  if (!LS) return 0;
  const raw = LS.getItem(BUFFER_KEY);
  const n = raw ? Number(raw) : 0;
  bufferDaysCache = Number.isFinite(n) ? n : 0;
  return bufferDaysCache;
}

export function setReservationBufferDays(n: number) {
  bufferDaysCache = Math.max(0, Math.floor(n));
  if (LS) LS.setItem(BUFFER_KEY, String(bufferDaysCache));
}

// --- подписка (для совместимости со старым кодом) --------------------------

type Unsub = () => void;

/**
 * Примитивная подписка на изменения списка бронирований.
 * Возвращает функцию отписки.
 */
export function subscribe(cb: () => void): Unsub {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener("reservations:changed", handler);
  return () => window.removeEventListener("reservations:changed", handler);
}
