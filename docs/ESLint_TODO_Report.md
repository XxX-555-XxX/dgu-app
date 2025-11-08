# ?? ESLint TODO & Code Quality Fix Plan � ������ DGU-APP

����: ��������������� � �������� ������� ���� `dgu-app` ����� ��������� CI/CD � ��������. ����������� ���������� �� ���������� ������ TypeScript/ESLint, ������� �������� � ��������� ����������.

---

## ?? ������� ��������, ���������� ESLint

### A. `@typescript-eslint/no-explicit-any`

**��������:** ������������� `any` ������ ���������� �����.  
**����� (�������):**

- `src/App.tsx` (��������� ����)
- `src/components/AssetCard.tsx`
- `src/components/AssetPassport.tsx`
- `src/components/FormsSection.tsx`
- `src/lib/utils.ts`
- `src/modules/ReservationForm.tsx`

**��������:** ������ ����������/���� ��� `Asset`, `Reservation`, �������� ���� � ����������.

---

### B. `@typescript-eslint/no-unused-vars`

**��������:** �������������� ����������/���������.  
**����� (�������):**

- `src/App.tsx`: `applyStatus`, `reservRefresh`
- `src/components/FormsSection.tsx`: `val`
- `src/modules/ReservationDialog.tsx`: `addReservation`, `Reservation`, `toISO`, `version`
- `src/modules/SettingsReservations.tsx`: `saved`

**��������:** �������/��������������� � `_name` ��� �������������.

---

### C. `@typescript-eslint/no-empty-object-type`

**��������:** ������ ���������� ��� ������.  
**����:** `src/components/ui/textarea.tsx`  
**��������:** ������� ��� ��������� ���������.

---

### D. `import/order`

**��������:** ������� ��������.  
**������� �������:**

1. ������� (`react`, `react-dom`, `lucide-react`, � ��.)
2. UI-���������� (`@/components/ui/...`)
3. ���������� (`@/components/...`, `@/modules/...`, `@/lib/...`)

**��������:** `npx eslint --fix "src/**/*.{ts,tsx}"`

---

### E. `react-hooks/exhaustive-deps`

**��������:** ������������ ����� �� �������/������.  
**����:** `src/App.tsx` � ������� ������������� `assetsSafe` � ��������� `useMemo`, ������������ ����������� `reservRefresh`.

---

### F. ������ ��������� (TypeScript)

**��������:** �������������������� ���� � `Reservation`/`Asset`/`Settings`, ����� ������ ������.  
**����������:**

- ������������� `Reservation` (������ ���: `startDate`, `endDate`; �������� `assetId` �����������);
- ���������������� ������������� API (`listReservations(assetId?)`, ���������: `isReservedNow`, `getNextReservation`, `hasFutureWithin`, � �.�.);
- ����������� ������� � `workdays.ts` � `settings.ts` (������� `getHolidays`/`setHolidays`).

---

### G. �������������� (Prettier)

**��������:** `npx prettier --write .`

---

## ?? �������� ���������� ������ (�������������)

1. ����� ��������� ����� ���������� � ��������� `useReservations` � ���������� ��������� ��������.
2. ������ ������ �� ������� � ������������ ������ `AssetCard ? Reservations`.
3. ����������������� `Asset / Reservation / Status` � �������� � ������ ������.
4. ���������� ������� (`useSyncExternalStore`) � ���������� ��� React 18/19.
5. ������������ ������ ����������/���������� � ������� � `src/lib/assetSelectors.ts`.
6. ������������ UI � �������� � ������������� ������� Dialog + Tabs + ��������� (������������� header/footer, ������ � ������).

---

## ?? ��������������� ������� �����������

| ���� | ��� ������                    | ��������� | ����              |
| ---: | ----------------------------- | :-------: | ----------------- |
|    1 | ������� � ��������������      |  �������  | ������� ����      |
|    2 | ������ `any`, �������� ����   |  �������  | ����������������  |
|    3 | �������� ������������ �����   |  �������  | ����������� React |
|    4 | ����������� `reservations.ts` |  �������  | ���������� ������ |
|    5 | ������� �����. ���            |  �������  | ����������������  |
|    6 | ������������ UI (AssetCard)   |  ������   | ������ ���������  |

---

## ?? ���� ��������

����� ���������� `feat/reservations-status`:

```bash
git switch -c chore/eslint-cleanup
# �������� ��������� ��������������/������
git commit -m "chore: ESLint cleanup � step 1 (imports/format)"
git commit -m "chore: ESLint cleanup � step 2 (types)"
git commit -m "chore: ESLint cleanup � step 3 (hooks deps)"
git push -u origin chore/eslint-cleanup
# ������� PR � main
```
