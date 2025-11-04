// Обёртки над reservations для строк таблицы

import {
  isReservedNow,
  nextReservation,
  hasFutureWithin,
} from "@/lib/reservations";

/** Свободен ли актив с точки зрения броней прямо сейчас */
export function isFree(assetCode: string): boolean {
  return !isReservedNow(assetCode);
}

/** Есть ли текущая или будущая бронь */
export function hasCurrentOrFutureReservation(assetCode: string): boolean {
  const nr = nextReservation(assetCode);
  return !!nr;
}

/** Есть ли будущая бронь в пределах N дней */
export function hasFutureReservationWithin(assetCode: string, days: number): boolean {
  return hasFutureWithin(assetCode, days);
}

/** Ближайшая бронь */
export function getNextReservation(assetCode: string) {
  return nextReservation(assetCode);
}

/** Текст в колонке «Доступность» + muted, если текст второстепенный */
export function availabilityLabel(assetCode: string): { text: string; muted?: boolean } {
  const nr = nextReservation(assetCode);
  const today = new Date().toISOString().slice(0, 10);

  const toHuman = (iso: string) => iso.split("-").reverse().join(".");

  if (!nr) return { text: "Свободен" };

  if (nr.startDate <= today && today <= nr.endDate) {
    return { text: `Забронирован до: ${toHuman(nr.endDate)} (${nr.customer})` };
  }
  return {
    text: `Доступен до начала брони: ${toHuman(nr.startDate)} (${nr.customer})`,
    muted: true,
  };
}
