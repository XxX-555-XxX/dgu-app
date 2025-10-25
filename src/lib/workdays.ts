// lib/workdays.ts — рабочие/праздничные дни РФ и расчёт ETA
let HOLIDAYS = new Set<string>([
  '2025-01-01','2025-01-02','2025-01-03','2025-01-04','2025-01-05','2025-01-06','2025-01-07','2025-01-08',
  '2025-02-23','2025-03-08','2025-05-01','2025-05-09','2025-06-12','2025-11-04',
]);
export function getHolidays(): string[]{ return Array.from(HOLIDAYS); }
export function setHolidays(dates: string[]): void{ HOLIDAYS = new Set(dates); }
export function toISO(d: Date){ return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString().slice(0,10); }
export function isWeekend(d: Date){ const day = d.getDay(); return day === 0 || day === 6; }
export function isHoliday(d: Date){ return HOLIDAYS.has(toISO(d)); }
function nextDay(d: Date){ const nd = new Date(d); nd.setDate(nd.getDate()+1); return nd; }
export function addWorkingDaysFrom(dateISO: string, n: number){
  let d = new Date(dateISO + 'T00:00:00'); let added = 0;
  while (added < n){ d = nextDay(d); if (!isWeekend(d) && !isHoliday(d)) added++; }
  return toISO(d);
}
export function addWorkingDays(n:number){ return addWorkingDaysFrom(new Date().toISOString().slice(0,10), n); }
export function calcDefaultEta(type:'PM'|'CM'){ return addWorkingDays(type==='PM'?7:3); }
