// src/modules/ReservationForm.tsx
import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Asset } from "@/lib/storage";
import { addReservation, listReservations } from "@/lib/reservations";

type Props = {
  asset: Asset;
  onClose?: () => void;
};

export default function ReservationForm({ asset, onClose }: Props) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [customer, setCustomer] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  const items = useMemo(() => listReservations(asset.code), [asset.code]);

  return (
    <div className="space-y-3">
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

      <div className="flex items-center gap-2 justify-end">
        <Button variant="outline" className="rounded-xl" onClick={() => onClose?.()}>
          Отмена
        </Button>
        <Button
          className="rounded-xl"
          disabled={!start || !end}
          onClick={() => {
            try {
              // Пересечения проверяются внутри addReservation (по тому же assetCode)
              addReservation({
                assetCode: asset.code,
                startDate: start,
                endDate: end,
                customer: customer.trim() || "—",
                comment: comment.trim() || undefined,
              });
              setError(null);
              onClose?.();
            } catch (e: any) {
              setError(e?.message ?? "Ошибка сохранения");
            }
          }}
        >
          Сохранить
        </Button>
      </div>

      <div className="text-xs text-muted-foreground">Всего броней по активу: {items.length}</div>
    </div>
  );
}
