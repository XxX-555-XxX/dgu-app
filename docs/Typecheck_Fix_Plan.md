Typecheck Fix Plan — dgu-app

Цель: привести типы и импорты к актуальной модели данных, чтобы CI typecheck проходил зелёным.

1. Что ломает сборку (сводка из CI)

Неверные/устаревшие импорты:

calcDefaultEta (из @/lib/workdays) — нет в коде.

subscribe, toISO, getReservationBufferDays, setReservationBufferDays (из @/lib/reservations) — нет в коде.

addWorkingDaysFrom — корректная функция называется addWorkingDays.

Модель Reservation используется старая:

в коде встречаются start/end, нужно startDate/endDate (ISO-строки).

при создании записи где-то передаётся assetCode вместо assetId.

Вторично: any, неиспользуемые переменные, import/order (почистим после зелёного typecheck).

2. Истина по моделям/АПИ
   // src/lib/reservations.ts
   export interface Reservation {
   id: string;
   assetId: string;
   customer: string;
   comment?: string;
   startDate: string; // 'YYYY-MM-DD'
   endDate: string; // 'YYYY-MM-DD'
   }

export function listReservations(assetId?: string): Reservation[];
export function addReservation(input: Omit<Reservation, 'id'>): Reservation;
export function removeReservation(id: string): void;

// src/lib/workdays.ts
export function addWorkingDays(date: Date, n: number, holidays: string[]): Date;
export function getHolidays(): string[];
export function setHolidays(list: string[]): void;

3. Файлы к правке (минимум для зелёного typecheck)
   A) src/modules/ReservationDialog.tsx

Удалить импорт subscribe, toISO.

Везде заменить r.start/r.end → r.startDate/r.endDate.

«Ближайшая бронь» формировать по startDate/endDate.

B) src/modules/ReservationForm.tsx

Удалить импорт toISO.

Пересечения:

const intersect = listReservations(asset.id).some(
r => !(isoEnd < r.startDate || isoStart > r.endDate)
);

Создание:

addReservation({
assetId: asset.id,
startDate: isoStart,
endDate: isoEnd,
customer,
comment: comment?.trim() || undefined,
});

C) src/components/FormsSection.tsx

Убрать импорт calcDefaultEta. Если вызывался — временно закомментировать/заменить на TODO
(или посчитать через addWorkingDays при наличии входных данных).

D) src/modules/SettingsHolidays.tsx

Использовать только getHolidays и setHolidays из @/lib/workdays.

E) src/modules/SettingsReservations.tsx

Удалить getReservationBufferDays / setReservationBufferDays.

Заменить addWorkingDaysFrom → addWorkingDays.

F) src/components/AssetCard.tsx

«Быстрая бронь»:

addReservation({
assetId: asset.id,
customer,
startDate: startISO,
endDate: endISO,
comment: comment?.trim() || undefined,
});

Отображение использовать r.startDate/r.endDate и форматировать их fmtHuman().

4. Чек-лист (проставишь галочки в PR)

ReservationDialog.tsx — без subscribe/toISO, только startDate/endDate.

ReservationForm.tsx — корректная проверка пересечений, assetId при создании.

FormsSection.tsx — удалён calcDefaultEta.

SettingsHolidays.tsx — getHolidays/setHolidays.

SettingsReservations.tsx — убраны буферы, addWorkingDays.

AssetCard.tsx — создание с assetId, отображение startDate/endDate.

5. Локальная проверка
   npm run typecheck
   npm run build

6. Коммит/PR
   git checkout -b fix/types-and-imports
   git add -A
   git commit -m "fix(types): align reservations/workdays API and fields"
   git push -u origin fix/types-and-imports

# открыть PR в main

7. Что оставить «на потом» (после зелёного CI)

Почистить any, неиспользуемые переменные.

Упорядочить импорты (правило import/order).

Вынести форматирование дат в lib/utils с типами.

Добавить e2e сценарий создания/удаления брони.

Ответственный: Виталий
Дата: (08.11.2025)
