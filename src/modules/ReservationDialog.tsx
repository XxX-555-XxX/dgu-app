// src/modules/ReservationDialog.tsx
import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as UITextarea from "@/components/ui/textarea";
import {
  addReservation,
  deleteReservation,
  listReservationsByAsset,
  type Reservation,
  overlapsAny,
} from "@/lib/reservations";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  assetCode: string;
  edit?: Reservation | null;
  onSaved?: () => void;
};

const ShadTextarea: any = (UITextarea as any)?.Textarea ?? (UITextarea as any)?.default ?? null;

export default function ReservationDialog({ open, onOpenChange, assetCode, edit, onSaved }: Props) {
  const [customer, setCustomer] = React.useState(edit?.customer ?? "");
  const [start, setStart] = React.useState(edit?.start ?? "");
  const [end, setEnd] = React.useState(edit?.end ?? "");
  const [comment, setComment] = React.useState(edit?.comment ?? "");
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setCustomer(edit?.customer ?? "");
    setStart(edit?.start ?? "");
    setEnd(edit?.end ?? "");
    setComment(edit?.comment ?? "");
    setError(null);
  }, [edit, open]);

  const submit = async () => {
    setError(null);
    if (!customer.trim()) return setError("Укажите клиента.");
    if (!start || !end)   return setError("Укажите даты (с/по).");
    if (start > end)      return setError("Дата начала позже даты окончания.");

    const existing = listReservationsByAsset(assetCode).filter(r => r.id !== edit?.id);
    if (overlapsAny(start, end, existing)) return setError("Период пересекается с существующей бронью.");

    setSaving(true);
    try {
      if (edit) deleteReservation(edit.id);
      addReservation({ assetCode, customer, start, end, comment });
      onOpenChange(false);
      onSaved?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* ФИКС-HEADER/FOOTER + СКРОЛЛ-СЕРЕДИНА */}
      <DialogContent className="max-w-[560px] p-0 flex flex-col max-h-[80vh]">
        {/* Header (фикс.) */}
        <div className="px-6 pt-5 pb-3 border-b">
          <DialogHeader className="px-0">
            <DialogTitle>{edit ? "Редактировать бронь" : "Новая бронь"}</DialogTitle>
            <DialogDescription className="mt-1">
              Актив: <span className="font-medium">{assetCode}</span>
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Body (скролл) */}
        <div className="px-6 py-4 space-y-4 flex-1 overflow-y-auto">
          <div className="space-y-1">
            <div className="text-sm">Клиент</div>
            <Input value={customer} onChange={(e)=>setCustomer(e.target.value)} placeholder="ООО Ромашка" className="rounded-xl" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="text-sm">С</div>
              <Input type="date" value={start} onChange={(e)=>setStart(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-1">
              <div className="text-sm">По (включительно)</div>
              <Input type="date" value={end} onChange={(e)=>setEnd(e.target.value)} className="rounded-xl" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-sm">Комментарий</div>
            {ShadTextarea ? (
              <ShadTextarea rows={4} value={comment} onChange={(e: any)=>setComment(e.target.value)} placeholder="Доп. сведения (необязательно)" />
            ) : (
              <textarea className="w-full border rounded-xl p-2 h-28 text-sm" value={comment} onChange={(e)=>setComment(e.target.value)} placeholder="Доп. сведения (необязательно)" />
            )}
          </div>

          {error && <div className="text-sm text-rose-700">{error}</div>}
        </div>

        {/* Footer (фикс.) */}
        <div className="px-6 py-4 border-t">
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline" className="rounded-xl">Отмена</Button>
            </DialogClose>
            <Button onClick={submit} disabled={saving} className="rounded-xl">
              {edit ? "Сохранить" : "Забронировать"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
