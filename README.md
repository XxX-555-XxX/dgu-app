# DGU Fleet — Web Dashboard (ООО «Тэтра Инжиниринг»)

Минимальный проект Vite + React + TypeScript + Tailwind.

## Быстрый старт
```bash
npm i
npm run dev
```
> UI-компоненты `@/components/ui/*` используются из shadcn/ui. Их нужно добавить:

```bash
npm i class-variance-authority tailwind-merge
npx shadcn@latest init
npx shadcn@latest add button card tabs input table dialog select popover command
```

## Структура
```
src/
  App.tsx
  main.tsx
  index.css
  lib/
    utils.ts
    workdays.ts
  modules/
    SettingsHolidays.tsx
  components/
    FormsSection.tsx
```
Алиас `@` настроен в `vite.config.ts` и `tsconfig.json`.
Tailwind включён в `tailwind.config.js` и `postcss.config.js`.
CSV-экспорт есть на вкладках «Активы» и «Сервис/ТО».
Самотесты пишут результат в консоль браузера.
