import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

import { addReservation, listReservations, toISO, Reservation } from "@/lib/reservations";
import { availabilityLabel } from "@/lib/assetSelectors";

type Asset = {
  id: string;
  code: string;
  brand?: string;
  model?: string;
};

type Props = {
  asset: Asset;
  onClose?: () => void;
};

// локальный форматтер, устойчивый к undefined
function fmtHuman(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("ru-RU");
}

export default function AssetCard({ asset }: Props) {
  const [customer, setCustomer] = useState("");
  const [comment, setComment] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [ver, setVer] = useState(0);

  const list = useMemo<Reservation[]>(
    () => listReservations().filter((r) => r.assetId === asset.id),
    [asset.id, ver],
  );

  const info = availabilityLabel(asset.id);

  const add = () => {
    if (!start || !end) return;
    const startISO = toISO(new Date(start));
    const endISO = toISO(new Date(end));

    // примитивная проверка пересечений
    const intersect = list.some((r) => {
      const s = toISO(r.startDate ?? "");
      const e = toISO(r.endDate ?? "");
      return !(endISO < s || startISO > e);
    });
    if (intersect) {
      alert("Даты пересекаются с существующей бронью.");
      return;
    }

    addReservation({
      assetId: asset.id,
      startDate: startISO,
      endDate: endISO,
      customer,
      comment: comment.trim() || undefined,
    });

    setCustomer("");
    setComment("");
    setStart("");
    setEnd("");
    setVer((v) => v + 1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Карточка актива — {asset.code}
          {asset.brand ? ` — ${asset.brand}` : ""} {asset.model ?? ""}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm opacity-80">{info.text}</div>

        <Tabs defaultValue="passport">
          <TabsList>
            <TabsTrigger value="passport">Паспорт</TabsTrigger>
            <TabsTrigger value="reservations">Брони</TabsTrigger>
          </TabsList>

          <TabsContent value="passport">Раздел «Паспорт» — ваш контент.</TabsContent>

          <TabsContent value="reservations" className="space-y-3">
            {list.length ? (
              <ul className="list-disc pl-5">
                {list.map((r) => (
                  <li key={r.id}>
                    {fmtHuman(r.startDate)} — {fmtHuman(r.endDate)}{" "}
                    {r.customer ? `(${r.customer})` : ""}
                  </li>
                ))}
              </ul>
            ) : (
              <div>Броней нет</div>
            )}

            <div className="grid gap-2">
              <Label>Начало</Label>
              <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
              <Label>Окончание</Label>
              <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
              <Label>Клиент</Label>
              <Input value={customer} onChange={(e) => setCustomer(e.target.value)} />
              <Label>Комментарий</Label>
              <Input value={comment} onChange={(e) => setComment(e.target.value)} />
              <Button onClick={add}>Создать бронь</Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
