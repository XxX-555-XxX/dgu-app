import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ReservationForm from "./ReservationForm";
import { listReservations, removeReservation, Reservation, subscribe } from "@/lib/reservations";

type Props = {
  asset: { id: string; code: string; brand?: string; model?: string } | null;
  open: boolean;
  onClose: () => void;
};

export default function ReservationDialog({ asset, open, onClose }: Props) {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const unsub = subscribe(() => setVersion((v) => v + 1));
    return unsub;
  }, []);

  const items = useMemo<Reservation[]>(() => {
    if (!asset) return [];
    return listReservations().filter((r) => r.assetId === asset.id);
  }, [asset?.id, version]);

  if (!asset) {
    return (
      <Dialog open={open} onOpenChange={() => onClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Брони</DialogTitle>
          </DialogHeader>
          Актив не выбран.
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Карточка актива — {asset.code}
            {asset.brand ? ` — ${asset.brand}` : ""} {asset.model ?? ""}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {items.length > 0 ? (
            <ul className="list-disc pl-5">
              {items.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-2">
                  <span>
                    {r.startDate ?? "?"} — {r.endDate ?? "?"} {r.customer ? `(${r.customer})` : ""}
                  </span>
                  <Button variant="secondary" onClick={() => removeReservation(r.id)}>
                    Удалить
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div>Ближайшая бронь не запланирована</div>
          )}

          <ReservationForm asset={asset} onSaved={() => setVersion((v) => v + 1)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
