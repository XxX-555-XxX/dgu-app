import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { Asset } from "@/lib/storage";
import { availabilityLabel } from "@/lib/assetSelectors";
import {
  addReservation,
  listReservationsForAsset,
  removeReservation,
  type Reservation,
} from "@/lib/reservations";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  asset: Asset | null;
};

function fmtHuman(iso: string) {
  return iso.split("-").reverse().join(".");
}

export default function AssetCard({ open, onOpenChange, asset }: Props) {
  const code = asset?.code ?? "";
  const [tab, setTab] = useState<"passport" | "reserv">("passport");

  const list = useMemo<Reservation[]>(
    () => (code ? listReservationsForAsset(code) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [code, open] // при каждом открытии пересчитаем
  );

  const [formOpen, setFormOpen] = useState(false);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [customer, setCustomer] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  const availability = asset ? availabilityLabel(asset.code) : { text: "" };

  function resetForm() {
    setStart("");
    setEnd("");
    setCustomer("");
    setComment("");
    setError(null);
  }

  function createReservation() {
    if (!asset) return;
    try {
      addReservation({
        assetCode: asset.code,
        startDate: start,
        endDate: end,
        customer: customer.trim() || "—",
        comment: comment.trim() || undefined,
      });
      resetForm();
      setFormOpen(false);
      setTab("reserv");
    } catch (e: any) {
      setError(e?.message ?? "Неизвестная ошибка");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {asset
              ? `Карточка актива — ${asset.code} — ${asset.brand} ${asset.model}`
              : "Брони"}
          </DialogTitle>
        </DialogHeader>

        {!asset ? (
          <div className="text-sm text-muted-foreground">Актив не выбран.</div>
        ) : (
          <>
            <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
              <TabsList className="rounded-2xl">
                <TabsTrigger value="passport">Паспорт</TabsTrigger>
                <TabsTrigger value="reserv">Брони</TabsTrigger>
              </TabsList>

              {/* ПАСПОРТ */}
              <TabsContent value="passport" className="pt-3">
                <div className="text-sm space-y-2">
                  <div>
                    <span className="text-muted-foreground">Доступность: </span>
                    <span className={availability.muted ? "text-muted-foreground" : ""}>
                      {availability.text}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Зав. №: </span>
                    {asset.serialNumber ?? "—"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Объект: </span>
                    {asset.site ?? "—"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Заказчик: </span>
                    {asset.customer ?? "—"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Договор: </span>
                    {asset.contract ?? "—"}
                  </div>
                </div>
              </TabsContent>

              {/* БРОНИ */}
              <TabsContent value="reserv" className="pt-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Ближайшая бронь:{" "}
                    {list[0]
                      ? `${fmtHuman(list[0].startDate)} — ${fmtHuman(list[0].endDate)} (${list[0].customer})`
                      : "не запланирована"}
                  </div>
                  <Button className="rounded-xl" onClick={() => setFormOpen(true)}>
                    Создать бронь
                  </Button>
                </div>

                <div className="mt-3 space-y-3">
                  {list.length === 0 && (
                    <div className="text-sm text-muted-foreground">Нет данных для бронирования.</div>
                  )}

                  {list.map((r) => (
                    <div
                      key={r.id}
                      className="border rounded-xl p-3 flex items-center justify-between"
                    >
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
              </TabsContent>
            </Tabs>

            {/* Форма создания брони (вторая модалка внутри карточки) */}
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
              <DialogContent className="max-w-xl rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Создать бронь</DialogTitle>
                </DialogHeader>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label>Дата начала</Label>
                    <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label>Дата окончания</Label>
                    <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label>Клиент / ответственный</Label>
                    <Input value={customer} onChange={(e) => setCustomer(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label>Комментарий (опционально)</Label>
                    <Input value={comment} onChange={(e) => setComment(e.target.value)} />
                  </div>

                  {error && <div className="text-sm text-red-500">{error}</div>}

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => {
                        resetForm();
                        setFormOpen(false);
                      }}
                    >
                      Отмена
                    </Button>
                    <Button
                      className="rounded-xl"
                      disabled={!start || !end}
                      onClick={createReservation}
                    >
                      Сохранить
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
