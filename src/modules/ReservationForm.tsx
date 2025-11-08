import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { addReservation, listReservations, toISO } from "@/lib/reservations";

type Props = {
  asset: { id: string; code: string };
  onSaved?: () => void;
};

export default function ReservationForm({ asset, onSaved }: Props) {
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [customer, setCustomer] = useState<string>("");
  const [comment, setComment] = useState<string>("");

  const current = useMemo(
    () => listReservations().filter((r) => r.assetId === asset.id),
    [asset.id],
  );

  const onCreate = () => {
    if (!start || !end) return;

    const isoStart = toISO(new Date(start));
    const isoEnd = toISO(new Date(end));

    // Пересечения по датам
    const intersect = current.some((r) => {
      const rs = toISO(r.startDate ?? "");
      const re = toISO(r.endDate ?? "");
      return !(isoEnd < rs || isoStart > re);
    });
    if (intersect) {
      alert("Даты пересекаются с существующей бронью.");
      return;
    }

    addReservation({
      assetId: asset.id,
      startDate: isoStart,
      endDate: isoEnd,
      customer,
      comment: comment.trim() || undefined,
    });

    setStart("");
    setEnd("");
    setCustomer("");
    setComment("");
    onSaved?.();
  };

  return (
    <Dialog open onOpenChange={() => {}}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Создать бронь</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          <Input
            placeholder="Клиент"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
          />
          <Input
            placeholder="Комментарий"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="flex gap-2">
            <Button onClick={onCreate}>Создать</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
