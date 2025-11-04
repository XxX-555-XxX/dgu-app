// src/modules/ReservationDialog.tsx

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { addReservation, listReservations, removeReservation, Reservation, subscribe, toISO } from "@/lib/reservations";
import ReservationForm from "./ReservationForm";

type Asset = {
  id: string;
  code: string;
  brandModel: string;
};

export default function ReservationTab({ asset }: { asset: Asset }) {
  const [version, setVersion] = useState(0);
  const [formOpen, setFormOpen] = useState(false);

  // подписка на изменения хранилища
  useMemo(() => subscribe(() => setVersion(v => v + 1)), []);

  const items = listReservations(asset.id);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {items.length
            ? `Ближайшая бронь: ${items[0].start} — ${items[0].end} (${items[0].customer})`
            : "Ближайшая бронь не запланирована"}
        </div>
        <Button onClick={() => setFormOpen(true)}>Создать бронь</Button>
      </div>

      {items.length === 0 ? (
        <div className="text-sm text-muted-foreground">Нет данных для бронирования.</div>
      ) : (
        <div className="space-y-3">
          {items.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-4 flex justify-between items-start gap-3">
                <div>
                  <div className="font-medium">{r.customer || "—"}</div>
                  <div className="text-sm text-muted-foreground">
                    {r.start} — {r.end}
                  </div>
                  {r.comment && (
                    <div className="text-sm mt-1">{r.comment}</div>
                  )}
                </div>
                <Button variant="destructive" onClick={() => removeReservation(r.id)}>
                  Удалить
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Форма создания */}
      {formOpen && (
        <ReservationForm
          asset={asset}
          onCancel={() => setFormOpen(false)}
          onSaved={() => setFormOpen(false)}
        />
      )}
    </div>
  );
}
