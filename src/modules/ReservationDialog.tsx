// src/modules/ReservationDialog.tsx
import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Asset } from "@/lib/storage";
import {
  addReservation,
  listReservations,
  removeReservation,
  type Reservation,
} from "@/lib/reservations";

type Props = {
  asset: Asset;
};

function fmtHuman(iso: string) {
  return iso.split("-").reverse().join(".");
}

export default function ReservationDialog({ asset }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [customer, setCustomer] = useState("");
  const [comment, setComment] = useState("");

  const items = useMemo<Reservation[]>(() => listReservations(asset.code), [asset.code]);

  const nearest = items[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Бронирования — {asset.code}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Ближайшая бронь:{" "}
          {nearest
            ? `${fmtHuman(nearest.startDate)} — ${fmtHuman(nearest.endDate)} (${nearest.customer})`
            : "не запланирована"}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Дата начала</div>
            <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Дата окончания</div>
            <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
          <div className="col-span-2">
            <div className="text-xs text-muted-foreground mb-1">Клиент</div>
            <Input value={customer} onChange={(e) => setCustomer(e.target.value)} />
          </div>
          <div className="col-span-2">
            <div className="text-xs text-muted-foreground mb-1">Комментарий</div>
            <Input value={comment} onChange={(e) => setComment(e.target.value)} />
          </div>
        </div>

        {error && <div className="text-sm text-red-500">{error}</div>}

        <div className="flex items-center gap-2">
          <Button
            className="rounded-xl"
            disabled={!start || !end}
            onClick={() => {
              try {
                addReservation({
                  assetCode: asset.code,
                  startDate: start,
                  endDate: end,
                  customer: customer.trim() || "—",
                  comment: comment.trim() || undefined,
                });
                setError(null);
                setStart("");
                setEnd("");
                setCustomer("");
                setComment("");
              } catch (e: any) {
                setError(e?.message ?? "Ошибка сохранения");
              }
            }}
          >
            Сохранить
          </Button>
        </div>

        <div className="space-y-2">
          {items.length === 0 && (
            <div className="text-sm text-muted-foreground">Нет данных для бронирования.</div>
          )}
          {items.map((r) => (
            <div key={r.id} className="border rounded-xl p-3 flex items-center justify-between">
              <div className="text-sm">
                <div className="font-medium">
                  {fmtHuman(r.startDate)} — {fmtHuman(r.endDate)}
                </div>
                <div className="text-muted-foreground">{r.customer}</div>
                {r.comment && <div className="text-muted-foreground mt-1">{r.comment}</div>}
              </div>
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => removeReservation(r.id)}
              >
                Удалить
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
