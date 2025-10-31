// src/lib/storage.ts
// Локальное хранилище: активы и бронирования (совместимо с текущим UI)

export type AssetStatus = "ready" | "rented" | "maintenance" | "repair";

export type Asset = {
  // Идентификация (UI показывает без code, но код остаётся внутренним ключом)
  code: string;                 // внутренний ключ (скрыт в UI)
  brand: string;
  model: string;
  year?: number | null;         // год выпуска ДГУ
  inventoryNumber?: string;     // инвентарный номер ДГУ
  serialNumber?: string;        // заводской № ДГУ
  engineSerial?: string | null; // серийный № двигателя
  alternatorSerial?: string | null; // серийный № альтернатора

  // Электрика
  voltageKV?: number | null;    // кВ (например 0.4)
  frequencyHz?: number | null;  // Гц (обычно 50)
  phases?: 1 | 3 | null;        // количество фаз
  kva?: number | null;          // ном. мощность, кВА (уже была в проекте)
  // kW считаем на лету = kVA * 0.8 (cosφ 0.8)
  breakerName?: string | null;  // наименование автоматического выключателя
  breakerCurrentA?: number | null; // номинальный ток автомата, А
  motorDrive?: boolean | null;  // наличие мотор-привода, Да/Нет

  // Двигатель
  engineModel?: string | null;  // модель двигателя
  fuelLph50?: number | null;    // расход @50%, л/ч
  fuelLph75?: number | null;    // расход @75%, л/ч
  fuelLph100?: number | null;   // расход @100%, л/ч
  oilVolumeL?: number | null;   // объём масла, л
  coolantVolumeL?: number | null; // объём ОЖ, л
  batteryCount?: number | null; // количество АКБ
  batteryCapacityAh?: number | null; // ёмкость АКБ, А·ч

  // Эксплуатация
  hours?: number | null;                 // моточасы
  lastMaintDate?: string | null;         // последнее ТО — дата (YYYY-MM-DD)
  lastMaintWork?: string | null;         // последнее ТО — выполненные работы (кратко)
  nextMaintDate?: string | null;         // следующее ТО — дата
  nextMaintHours?: number | null;        // следующее ТО — по м/ч
  maintIntervalHours?: number | null;    // интервал ТО (норматив), м/ч

  // Логистика
  dimensionsMm?: { L?: number|null; W?: number|null; H?: number|null } | null; // мм
  weightKg?: number | null;              // кг
  typeDesign?: "кожух" | "контейнер" | null;

  // Прочее из прежней модели (для совместимости)
  status?: AssetStatus;
  site?: string | null;
  customer?: string | null;
  contract?: string | null;
};

export type Reservation = {
  id: string;
  assetCode: string;
  customer: string;
  start: string;   // YYYY-MM-DD
  end: string;     // YYYY-MM-DD
  comment?: string;
};

const LS_ASSETS = "assets";
const LS_RES = "reservations";

// ---------- ASSETS ----------
export function loadAssets(seed?: Asset[]): Asset[] {
  try {
    const raw = localStorage.getItem(LS_ASSETS);
    const parsed = raw ? JSON.parse(raw) : null;
    const base: Asset[] = Array.isArray(parsed) ? parsed : (Array.isArray(seed) ? seed : []);
    const migrated = base.map(migrateAsset);
    // если в стораже ничего не было, но есть сид — сохраним мигрированный сид
    if (!raw && Array.isArray(seed)) saveAssets(migrated);
    return migrated;
  } catch {
    const base = Array.isArray(seed) ? seed.map(migrateAsset) : [];
    if (Array.isArray(seed)) saveAssets(base);
    return base;
  }
}

export function saveAssets(list: Asset[]): Asset[] {
  const normalized = list.map(migrateAsset);
  localStorage.setItem(LS_ASSETS, JSON.stringify(normalized));
  return normalized;
}

export function setStatus(code: string, status: AssetStatus): Asset[] {
  const arr = loadAssets();
  const next = arr.map(a => a.code === code ? { ...a, status } : a);
  return saveAssets(next);
}

function migrateAsset(a: any): Asset {
  // мягкая миграция старых записей к новой схеме
  const out: Asset = {
    code: a.code ?? "",
    brand: a.brand ?? "",
    model: a.model ?? "",
    year: isNum(a.year) ? a.year : null,
    inventoryNumber: a.inventoryNumber ?? null,
    serialNumber: a.serialNumber ?? null,
    engineSerial: a.engineSerial ?? null,
    alternatorSerial: a.alternatorSerial ?? null,

    voltageKV: isNum(a.voltageKV) ? a.voltageKV : (a.voltageKV === 0 ? 0 : 0.4),
    frequencyHz: isNum(a.frequencyHz) ? a.frequencyHz : 50,
    phases: a.phases === 1 || a.phases === 3 ? a.phases : 3,
    kva: isNum(a.kva) ? a.kva : (a.kva ?? null),
    breakerName: a.breakerName ?? null,
    breakerCurrentA: isNum(a.breakerCurrentA) ? a.breakerCurrentA : null,
    motorDrive: typeof a.motorDrive === "boolean" ? a.motorDrive : null,

    engineModel: a.engineModel ?? null,
    fuelLph50: toNumOrNull(a.fuelLph50),
    fuelLph75: toNumOrNull(a.fuelLph75),
    fuelLph100: toNumOrNull(a.fuelLph100),
    oilVolumeL: toNumOrNull(a.oilVolumeL),
    coolantVolumeL: toNumOrNull(a.coolantVolumeL),
    batteryCount: toNumOrNull(a.batteryCount),
    batteryCapacityAh: toNumOrNull(a.batteryCapacityAh),

    hours: toNumOrNull(a.hours),
    lastMaintDate: a.lastMaintDate ?? null,
    lastMaintWork: a.lastMaintWork ?? null,
    nextMaintDate: a.nextMaintDate ?? null,
    nextMaintHours: toNumOrNull(a.nextMaintHours),
    maintIntervalHours: toNumOrNull(a.maintIntervalHours),

    dimensionsMm: a.dimensionsMm ?? null,
    weightKg: toNumOrNull(a.weightKg),
    typeDesign: a.typeDesign ?? null,

    status: a.status ?? "ready",
    site: a.site ?? null,
    customer: a.customer ?? null,
    contract: a.contract ?? null,
  };
  // нормализация размеров (L/W/H как числа)
  if (out.dimensionsMm && typeof out.dimensionsMm === "object") {
    out.dimensionsMm = {
      L: toNumOrNull(out.dimensionsMm.L),
      W: toNumOrNull(out.dimensionsMm.W),
      H: toNumOrNull(out.dimensionsMm.H),
    };
  }
  return out;
}

function isNum(v: any): v is number {
  return typeof v === "number" && Number.isFinite(v);
}
function toNumOrNull(v: any): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// ---------- RESERVATIONS ----------
export function listReservationsByAsset(assetCode: string): Reservation[] {
  const all = loadReservations();
  return all.filter(r => r.assetCode === assetCode);
}

export function addReservation(input: Omit<Reservation, "id">): Reservation {
  const all = loadReservations();
  const res: Reservation = { id: genId(), ...input };
  all.push(res);
  saveReservations(all);
  return res;
}

export function removeReservation(id: string) {
  const all = loadReservations().filter(r => r.id !== id);
  saveReservations(all);
}

export function overlapsAny(start: string, end: string, existing: Reservation[]): boolean {
  // [s1..e1] пересекается с [s2..e2], если s1 <= e2 && s2 <= e1
  return existing.some(r => start <= r.end && r.start <= end);
}

function loadReservations(): Reservation[] {
  try {
    const raw = localStorage.getItem(LS_RES);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
function saveReservations(list: Reservation[]) {
  localStorage.setItem(LS_RES, JSON.stringify(list));
}
function genId() {
  return "RES-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}
