// src/components/AssetPassport.tsx
import React,{ useState,useEffect }from "react";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

type Asset = {
  brand: string;
  model: string;
  year?: number | null;
  inventoryNumber?: string;
  serialNumber?: string;
  engineSerial?: string | null;
  alternatorSerial?: string | null;

  voltageKV?: number | null;
  frequencyHz?: number | null;
  phases?: 1 | 3 | null;
  kva?: number | null;
  breakerName?: string | null;
  breakerCurrentA?: number | null;
  motorDrive?: boolean | null;

  engineModel?: string | null;
  fuelLph50?: number | null;
  fuelLph75?: number | null;
  fuelLph100?: number | null;
  oilVolumeL?: number | null;
  coolantVolumeL?: number | null;
  batteryCount?: number | null;
  batteryCapacityAh?: number | null;

  hours?: number | null;
  lastMaintDate?: string | null;
  lastMaintWork?: string | null;
  nextMaintDate?: string | null;
  nextMaintHours?: number | null;
  maintIntervalHours?: number | null;

  dimensionsMm?: { L?: number|null; W?: number|null; H?: number|null } | null;
  weightKg?: number | null;
  typeDesign?: "кожух" | "контейнер" | null;
};

function V(v: any, suffix = "") {
  if (v === null || v === undefined || v === "") return "—";
  return (typeof v === "number" && suffix) ? `${v} ${suffix}` : String(v);
}
function kWfromKVA(kva?: number | null) {
  if (!kva || !Number.isFinite(kva)) return null;
  return Math.round(kva * 0.8 * 10) / 10; // cosφ=0.8
}
function dim(asset: Asset) {
  const L = asset.dimensionsMm?.L, W = asset.dimensionsMm?.W, H = asset.dimensionsMm?.H;
  if (!L && !W && !H) return "—";
  return [L, W, H].map(x => (x ? `${x}` : "—")).join(" × ") + " мм";
}
function yesNo(b?: boolean | null) {
  return b === true ? "Да" : b === false ? "Нет" : "—";
}
function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-baseline gap-x-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-sm">{value}</div>
    </div>
  );
}

export default function AssetPassport({ asset }: { asset: Asset }) {
  const kw = kWfromKVA(asset.kva);

  return (
    <div className="space-y-4">
      {/* ИДЕНТИФИКАЦИЯ — всегда открыта как отдельная карточка */}
      <Card className="rounded-xl">
        <CardHeader className="pb-3"><CardTitle>Идентификация</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Бренд / модель" value={`${asset.brand} ${asset.model}`} />
          <Field label="Год выпуска" value={V(asset.year)} />
          <Field label="Инв. № ДГУ" value={V(asset.inventoryNumber)} />
          <Field label="Заводской № ДГУ" value={V(asset.serialNumber)} />
          <Field label="Серийный № двигателя" value={V(asset.engineSerial)} />
          <Field label="Серийный № альтернатора" value={V(asset.alternatorSerial)} />
        </CardContent>
      </Card>

      {/* ОСТАЛЬНЫЕ РАЗДЕЛЫ — в гармошке */}
      <Accordion type="multiple" defaultValue={["electric", "engine"]}>
        {/* Электрика */}
        <AccordionItem value="electric" className="rounded-xl border">
          <AccordionTrigger className="px-4 py-3">Электрика</AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Напряжение" value={V(asset.voltageKV, "кВ")} />
              <Field label="Частота" value={V(asset.frequencyHz, "Гц")} />
              <Field label="Фазы" value={V(asset.phases)} />
              <Field label="Ном. мощность" value={`${V(asset.kva, "кВА")}${kw ? ` / ${kw} кВт` : ""}`} />
              <Field label="Автомат. выключатель" value={V(asset.breakerName)} />
              <Field label="Ном. ток автомата" value={V(asset.breakerCurrentA, "А")} />
              <Field label="Мотор-привод" value={yesNo(asset.motorDrive ?? null)} />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Двигатель */}
        <AccordionItem value="engine" className="rounded-xl border">
          <AccordionTrigger className="px-4 py-3">Двигатель</AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Модель двигателя" value={V(asset.engineModel)} />
              <Field label="Расход @50%" value={V(asset.fuelLph50, "л/ч")} />
              <Field label="Расход @75%" value={V(asset.fuelLph75, "л/ч")} />
              <Field label="Расход @100%" value={V(asset.fuelLph100, "л/ч")} />
              <Field label="Объём масла" value={V(asset.oilVolumeL, "л")} />
              <Field label="Объём ОЖ" value={V(asset.coolantVolumeL, "л")} />
              <Field label="АКБ — количество" value={V(asset.batteryCount)} />
              <Field label="АКБ — ёмкость" value={V(asset.batteryCapacityAh, "А·ч")} />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Эксплуатация */}
        <AccordionItem value="operation" className="rounded-xl border">
          <AccordionTrigger className="px-4 py-3">Эксплуатация</AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Моточасы" value={V(asset.hours)} />
              <Field label="Последнее ТО — дата" value={V(asset.lastMaintDate)} />
              <Field label="Последнее ТО — работы" value={V(asset.lastMaintWork)} />
              <Field label="Следующее ТО — дата" value={V(asset.nextMaintDate)} />
              <Field label="Следующее ТО — по моточасам" value={V(asset.nextMaintHours, "м/ч")} />
              <Field label="Интервал ТО" value={V(asset.maintIntervalHours, "м/ч")} />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Логистика */}
        <AccordionItem value="logistics" className="rounded-xl border">
          <AccordionTrigger className="px-4 py-3">Логистика</AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Габариты (Д×Ш×В)" value={dim(asset)} />
              <Field label="Масса" value={V(asset.weightKg, "кг")} />
              <Field label="Типоисполнение" value={V(asset.typeDesign)} />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Документы / Фото — визуальные плейсхолдеры */}
        <AccordionItem value="docs" className="rounded-xl border">
          <AccordionTrigger className="px-4 py-3">Документы / Фото</AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Паспорт PDF" value="—" />
              <Field label="Схемы" value="—" />
              <Field label="Протокол испытаний" value="—" />
              <Field label="Фото (внешний вид / таблички)" value="—" />
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              На этом этапе секция визуальная. Загрузку/хранение подключим позже.
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
