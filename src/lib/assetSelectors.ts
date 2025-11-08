import { listReservations, Reservation } from "@/lib/reservations";

// утилита форматирования
function toHuman(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("ru-RU");
}

export function nextReservation(assetId: string): Reservation | undefined {
  const now = new Date().toISOString();
  return listReservations()
    .filter((r) => r.assetId === assetId && r.startDate && r.startDate >= now)
    .sort((a, b) => (a.startDate! < b.startDate! ? -1 : 1))[0];
}

export function isReservedNow(assetId: string, atISO = new Date().toISOString()): boolean {
  const at = atISO;
  return listReservations().some((r) => {
    const s = r.startDate ?? "";
    const e = r.endDate ?? "";
    return !!s && !!e && s <= at && at <= e;
  });
}

export function hasFutureWithin(assetId: string, days: number): boolean {
  const thr = new Date();
  thr.setDate(thr.getDate() + Math.max(0, Math.floor(days)));
  const thrISO = thr.toISOString();
  return listReservations().some((r) => {
    const s = r.startDate ?? "";
    return !!s && s <= thrISO && r.assetId === assetId;
  });
}

// Небольшая подсказка-дисплей
export function availabilityLabel(assetId: string): { text: string } {
  const nowISO = new Date().toISOString();
  const nr = nextReservation(assetId);
  if (isReservedNow(assetId, nowISO)) {
    // найдём текущую бронь
    const cur = listReservations().find((r) => {
      const s = r.startDate ?? "";
      const e = r.endDate ?? "";
      return r.assetId === assetId && !!s && !!e && s <= nowISO && nowISO <= e;
    });
    if (cur) return { text: `Забронирован до: ${toHuman(cur.endDate)} (${cur.customer ?? ""})` };
    return { text: "Забронирован" };
  }
  if (nr)
    return { text: `Доступен до начала брони: ${toHuman(nr.startDate)} (${nr.customer ?? ""})` };
  return { text: "Свободен" };
}
