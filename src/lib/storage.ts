// Хранилище активов (localStorage) + типы

export type AssetStatus = "ready" | "rented" | "maintenance" | "repair";

export type Asset = {
  code: string;
  brand: string;
  model: string;
  kva: number;
  status: AssetStatus;
  site?: string;
  serialNumber?: string;
  customer?: string;
  contract?: string;
};

const STORAGE_KEY = "dgu.assets.v1";

/** Считать активы из localStorage, при отсутствии — записать seed и вернуть его */
export function loadAssets(seed: Asset[]): Asset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as Asset[];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
}

/** Полная перезапись массива активов в localStorage */
export function saveAssets(next: Asset[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

/** Изменить статус конкретного актива и вернуть весь обновлённый список */
export function setStatus(code: string, status: AssetStatus): Asset[] {
  const all = loadAssets([]);
  const idx = all.findIndex((a) => a.code === code);
  if (idx >= 0) {
    all[idx] = { ...all[idx], status };
    saveAssets(all);
  }
  return all;
}
