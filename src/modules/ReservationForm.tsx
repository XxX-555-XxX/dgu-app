// src/modules/ReservationForm.tsx

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { addReservation, listReservations, toISO } from "@/lib/reservations";

type Asset = { id: string; code: string; brandModel: string };

export default function ReservationForm({
  asset,
  onSaved,
  onCancel,
}: {
  asset: Asset;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [customer, setCustomer] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const title = useMemo(() => `Создать бронь — ${asset.code} — ${asset.brandModel}`, [asset]);

  const canSave = !!start && !!end && !!customer && !saving;

  const onSubmit = async () => {
    setError(null);
    try {
      const isoStart = toISO(start);
      const isoEnd = toISO(end);
      // легкая проверка на пересечения заранее — для UX
      const intersect = listReservations(asset.id).some(r => !(isoEnd < r.start || isoStart > r.end));
      if (intersect) {
        setError("Даты пересекаются с существующей бронью.");
        return;
      }
      setSaving(true);
      addReservation({
        assetId: asset.id,
        start: isoStart,
        end: isoEnd,
        customer,
        comment,
      });
      onSaved();
    } catch (e: any) {
      setError(e?.message || "Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid gap-2">
            <Label>Дата начала</Label>
            <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>

          <div className="grid gap-2">
            <Label>Дата окончания</Label>
            <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>

          <div className="grid gap-2">
            <Label>Клиент / ответственный</Label>
            <Input placeholder="Иванов / Компания" value={customer} onChange={(e) => setCustomer(e.target.value)} />
          </div>

          <div className="grid gap-2">
            <Label>Комментарий (опционально)</Label>
            <Input placeholder="Опционально" value={comment} onChange={(e) => setComment(e.target.value)} />
          </div>

          {error && <div className="text-sm text-destructive">{error}</div>}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onCancel} disabled={saving}>
            Отмена
          </Button>
          <Button onClick={onSubmit} disabled={!canSave}>
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
