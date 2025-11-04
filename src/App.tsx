// src/App.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import AssetCard from "@/components/AssetCard";
import KPI from "@/components/KPI";
import { downloadCSV, sortAssets } from "@/lib/utils";
import { loadAssets, setStatus, type Asset } from "@/lib/storage";
import {
  availabilityLabel,
  getNextReservation,
  hasCurrentOrFutureReservation,
  hasFutureReservationWithin,
  isFree,
} from "@/lib/assetSelectors";

// Минимальный seed — остальное подхватывается из storage.ts миграцией
const assetsSeed: Asset[] = [
  {
    code: "DGU-001",
    brand: "FG Wilson",
    model: "P500",
    kva: 500,
    status: "rented",
    site: "Тюмень",
    serialNumber: "SN-001-P500",
    customer: "ООО СтройИнж",
    contract: "Д-452/25",
  },
  {
    code: "DGU-036",
    brand: "AKSA",
    model: "A1250",
    kva: 1250,
    status: "ready",
    site: "Склад СПб",
    serialNumber: "SN-036-A1250",
  },
  {
    code: "DGU-121",
    brand: "VibroPower",
    model: "V1500",
    kva: 1500,
    status: "maintenance",
    site: "Москва, ЦОД",
    serialNumber: "SN-121-V1500",
  },
];

type ReservFilter = "all" | "has" | "free" | "soon7";

export default function App() {
  const [activeTab, setActiveTab] = useState<"assets" | "service">("assets");

  // загрузка активов из storage (с seed по умолчанию)
  const [assets, setAssets] = useState<Asset[]>(() => {
    const loaded = loadAssets(assetsSeed);
    return Array.isArray(loaded) ? loaded : assetsSeed;
  });
  const assetsSafe: Asset[] = Array.isArray(assets) ? assets : [];

  const [assetSort, setAssetSort] = useState<{ key: string; dir: "asc" | "desc" }>({
    key: "status",
    dir: "asc",
  });
  const [assetQuery, setAssetQuery] = useState("");
  const [assetStatusFilter, setAssetStatusFilter] = useState<Asset["status"] | null>(null);
  const [reservFilter, setReservFilter] = useState<ReservFilter>("all");

  // ---- Управление карточкой
  const [assetCardOpen, setAssetCardOpen] = useState(false);
  const [assetSelected, setAssetSelected] = useState<Asset | null>(null);

  // Триггер для перерасчёта строк таблицы после обновлений броней
  const [reservRefresh, setReservRefresh] = useState(0);
  const bump = () => setReservRefresh((x) => x + 1);

  // Подписка на событие из ReservationDialog/ReservationForm
  useEffect(() => {
    const handler = () => bump();
    window.addEventListener("reservations:updated", handler);
    return () => window.removeEventListener("reservations:updated", handler);
  }, []);

  // KPI
  const kpi = useMemo(() => {
    const total = assetsSafe.length;
    return [
      {
        key: "total",
        label: "Всего ДГУ",
        value: total,
        click: () => {
          setActiveTab("assets");
          setAssetStatusFilter(null);
        },
      },
      {
        key: "rented",
        label: "В аренде",
        value: assetsSafe.filter((a) => a.status === "rented").length,
        click: () => {
          setActiveTab("assets");
          setAssetStatusFilter("rented");
        },
      },
      {
        key: "ready",
        label: "Готово к аренде",
        value: assetsSafe.filter((a) => a.status === "ready").length,
        click: () => {
          setActiveTab("assets");
          setAssetStatusFilter("ready");
        },
      },
      {
        key: "maintenance",
        label: "ТО",
        value: assetsSafe.filter((a) => a.status === "maintenance").length,
        click: () => setActiveTab("service"),
      },
      {
        key: "repair",
        label: "Ремонт",
        value: assetsSafe.filter((a) => a.status === "repair").length,
        click: () => setActiveTab("service"),
      },
    ];
  }, [assetsSafe]);

  // Поиск/фильтр/сорт + фильтры по резервам
  const assetsFiltered = useMemo(() => {
    const baseStatus = assetsSafe
      .filter((a) => !assetStatusFilter || a.status === assetStatusFilter)
      .filter((a) =>
        [a.brand, a.model, a.site, a.code, a.serialNumber, a.customer, a.contract]
          .join(" ")
          .toLowerCase()
          .includes(assetQuery.toLowerCase())
      );

    const baseReserv = baseStatus.filter((a) => {
      if (reservFilter === "all") return true;
      if (reservFilter === "has") return hasCurrentOrFutureReservation(a.code);
      if (reservFilter === "free") return isFree(a.code);
      if (reservFilter === "soon7") return hasFutureReservationWithin(a.code, 7);
      return true;
    });

    return sortAssets(baseReserv as any, assetSort.key, assetSort.dir) as Asset[];
  }, [assetsSafe, assetQuery, assetSort, assetStatusFilter, reservFilter, reservRefresh]);

  function applyStatus(code: string, status: Asset["status"]) {
    const updated = setStatus(code, status);
    const nextArr = Array.isArray(updated) ? updated : assetsSafe;
    setAssets(nextArr);
    setAssetSelected(nextArr.find((a) => a.code === code) || null);
  }

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Управление парком ДГУ</h1>
      </header>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {kpi.map((item) => (
          <KPI key={item.key} label={item.label} value={item.value} onClick={item.click} />
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="rounded-2xl">
          <TabsTrigger value="assets">Активы</TabsTrigger>
          <TabsTrigger value="service">Сервис/ТО</TabsTrigger>
        </TabsList>

        {/* АКТИВЫ */}
        <TabsContent value="assets" className="mt-4">
          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle>Активы</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Поиск: бренд, модель, объект, код, серийный №, заказчик, договор"
                    value={assetQuery}
                    onChange={(e) => setAssetQuery(e.target.value)}
                    className="rounded-xl"
                  />
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => {
                      const cols = [
                        "code",
                        "brand",
                        "model",
                        "kva",
                        "status",
                        "serialNumber",
                        "site",
                        "customer",
                        "contract",
                      ];
                      const rows = [cols].concat(
                        assetsFiltered.map((a) => cols.map((c) => (a as any)[c] ?? ""))
                      );
                      downloadCSV("assets.csv", rows as any);
                    }}
                  >
                    CSV
                  </Button>
                </div>

                {/* Быстрые фильтры по броне */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Быстрый фильтр:</span>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant={reservFilter === "all" ? "default" : "outline"}
                      className="rounded-xl"
                      onClick={() => setReservFilter("all")}
                    >
                      Все
                    </Button>
                    <Button
                      size="sm"
                      variant={reservFilter === "has" ? "default" : "outline"}
                      className="rounded-xl"
                      onClick={() => setReservFilter("has")}
                    >
                      Забронированные
                    </Button>
                    <Button
                      size="sm"
                      variant={reservFilter === "free" ? "default" : "outline"}
                      className="rounded-xl"
                      onClick={() => setReservFilter("free")}
                    >
                      Свободные
                    </Button>
                    <Button
                      size="sm"
                      variant={reservFilter === "soon7" ? "default" : "outline"}
                      className="rounded-xl"
                      onClick={() => setReservFilter("soon7")}
                    >
                      Бронь ≤ 7 дней
                    </Button>
                  </div>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      onClick={() =>
                        setAssetSort((s) => ({
                          key: "status",
                          dir: s.dir === "asc" ? "desc" : "asc",
                        }))
                      }
                    >
                      Статус
                    </TableHead>
                    <TableHead>Код</TableHead>
                    <TableHead
                      onClick={() =>
                        setAssetSort((s) => ({
                          key: "kva",
                          dir: s.dir === "asc" ? "desc" : "asc",
                        }))
                      }
                    >
                      кВА
                    </TableHead>
                    <TableHead>Бренд/Модель</TableHead>
                    <TableHead>Зав.№</TableHead>
                    <TableHead
                      onClick={() =>
                        setAssetSort((s) => ({
                          key: "site",
                          dir: s.dir === "asc" ? "desc" : "asc",
                        }))
                      }
                    >
                      Объект
                    </TableHead>
                    <TableHead>Доступность</TableHead>
                    <TableHead>Бронь</TableHead>
                    <TableHead>Карточка</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assetsFiltered.map((a) => {
                    const avail = availabilityLabel(a.code);
                    const nr = getNextReservation(a.code);
                    return (
                      <TableRow key={a.code}>
                        <TableCell>{a.status}</TableCell>
                        <TableCell>{a.code}</TableCell>
                        <TableCell>{a.kva}</TableCell>
                        <TableCell>
                          {a.brand} {a.model}
                        </TableCell>
                        <TableCell>{a.serialNumber ?? "—"}</TableCell>
                        <TableCell>{a.site ?? "—"}</TableCell>
                        <TableCell
                          className={avail.muted ? "text-sm text-muted-foreground" : "text-sm"}
                        >
                          {avail.text}
                        </TableCell>
                        <TableCell className="text-sm">
                          {nr && nr.startDate && nr.endDate ? (
                            <>
                              Забронирован{" "}
                              {nr.startDate.split("-").reverse().join(".")}–{nr.endDate
                                .split("-")
                                .reverse()
                                .join(".")}{" "}
                              ({nr.customer})
                            </>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-xl"
                            onClick={() => {
                              setAssetSelected(a);
                              setAssetCardOpen(true);
                            }}
                          >
                            Открыть
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* СЕРВИС/ТО (заглушка) */}
        <TabsContent value="service" className="mt-4">
          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle>Сервис/ТО</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Форма создания наряда (в разработке). Переход сюда с кнопки «Открыть наряд» в
                карточке работает.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Модалка карточки */}
      <AssetCard
        open={assetCardOpen}
        onOpenChange={(v) => {
          setAssetCardOpen(v);
          if (!v) {
            // ВАЖНО: очищаем выбранный актив, чтобы кнопка «Открыть» снова работала
            setAssetSelected(null);
            // На всякий случай дёрнем перерасчёт таблицы
            setTimeout(bump, 0);
          }
        }}
        asset={assetSelected as any}
      />

      <footer className="text-xs text-muted-foreground text-center py-6">
        © 2025 ООО «Тэтра Инжиниринг» • Управление аренды и сервиса ДГУ •
      </footer>
    </div>
  );
}
