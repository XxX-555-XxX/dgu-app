// src/components/AssetCard.tsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AssetPassport from "@/components/AssetPassport";
import ReservationDialog from "@/modules/ReservationDialog";
import {
  listReservationsByAsset,
  deleteReservation,
  type Reservation,
} from "@/lib/reservations";

type Asset = {
  code: string;
  brand: string;
  model: string;
  serialNumber?: string;
  kva?: number;
  status?: string;
};

export default function AssetCard({
  asset,
  open,
  onOpenChange,
  onOpenWorkOrder,
  onReady,
}: {
  asset: Asset | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onOpenWorkOrder: () => void;
  onReady: () => void;
}) {
  const [tab, setTab] = React.useState<"passport" | "reservations">("passport");
  const [resOpen, setResOpen] = React.useState(false);
  const [resEdit, setResEdit] = React.useState<Reservation | null>(null);
  const [reservations, setReservations] = React.useState<Reservation[]>([]);

  const refreshReservations = React.useCallback(() => {
    if (asset) setReservations(listReservationsByAsset(asset.code));
  }, [asset]);

  React.useEffect(() => {
    if (open) refreshReservations();
  }, [open, refreshReservations]);

  if (!asset) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {/* ФИКС-HEADER/FOOTER + СКРОЛЛ-СЕРЕДИНА */}
        <DialogContent className="sm:max-w-3xl p-0 flex flex-col max-h-[85vh]">
          {/* HEADER (фиксированный) */}
          <div className="border-b px-6 pt-5 pb-3">
            <DialogHeader className="mb-2 px-0">
              <DialogTitle>Карточка актива — {asset.code}</DialogTitle>
            </DialogHeader>
            <Tabs
              value={tab}
              onValueChange={(v) => setTab(v as "passport" | "reservations")}
              className="w-full"
            >
              <TabsList className="rounded-xl">
                <TabsTrigger value="passport" className="rounded-lg">Паспорт</TabsTrigger>
                <TabsTrigger value="reservations" className="rounded-lg">Брони</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* BODY (скроллируемая середина) */}
          <div className="px-6 py-4 space-y-4 flex-1 overflow-y-auto">
            {tab === "passport" && <AssetPassport asset={asset} />}

            {tab === "reservations" && (
              <div className="space-y-3">
                {reservations.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Бронирований пока нет.</div>
                ) : (
                  <div className="space-y-2">
                    {reservations.map((r) => (
                      <div key={r.id} className="flex items-center justify-between rounded-xl border p-3 bg-white">
                        <div className="min-w-0">
                          <div className="font-medium truncate">{r.customer}</div>
                          <div className="text-sm text-muted-foreground">{r.start} — {r.end}</div>
                          {r.comment && <div className="text-xs mt-1 text-muted-foreground truncate">{r.comment}</div>}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="rounded-xl" onClick={() => { setResEdit(r); setResOpen(true); }}>
                            Изменить
                          </Button>
                          <Button variant="destructive" size="sm" className="rounded-xl" onClick={() => { deleteReservation(r.id); refreshReservations(); }}>
                            Отменить
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div>
                  <Button className="rounded-xl" onClick={() => { setResEdit(null); setResOpen(true); }}>
                    Добавить бронь
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* FOOTER (фиксированный) */}
          <div className="border-t px-6 py-4">
            <DialogFooter className="gap-2">
              <Button variant="outline" className="rounded-xl" onClick={onOpenWorkOrder}>Открыть наряд</Button>
              <Button className="rounded-xl" onClick={() => { setResEdit(null); setResOpen(true); }}>Забронировать</Button>
              <Button variant="secondary" className="rounded-xl" onClick={onReady}>Готов к аренде</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Модалка бронирования */}
      <ReservationDialog
        open={resOpen}
        onOpenChange={(v) => { setResOpen(v); if (!v) setResEdit(null); }}
        assetCode={asset.code}
        edit={resEdit}
        onSaved={refreshReservations}
      />
    </>
  );
}
