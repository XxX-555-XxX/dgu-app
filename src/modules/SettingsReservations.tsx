// src/modules/SettingsReservations.tsx
import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getReservationBufferDays, setReservationBufferDays } from "@/lib/reservations";
import { addWorkingDaysFrom, getHolidays } from "@/lib/workdays";

export default function SettingsReservations() {
  const [buffer, setBuffer] = useState<number>(() => getReservationBufferDays());
  const holidays = useMemo(() => getHolidays(), []);

  const [previewStart, setPreviewStart] = useState(() => new Date().toISOString().slice(0, 10));
  const previewEnd = useMemo(
    () => addWorkingDaysFrom(previewStart, buffer, holidays),
    [previewStart, buffer, holidays],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Настройки бронирований</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <div className="text-sm">
            Буфер рабочих дней после возврата (учитывать праздники/выходные)
          </div>
          <Input
            type="number"
            min={0}
            value={buffer}
            onChange={(e) => setBuffer(Number(e.target.value || 0))}
            className="w-32"
          />
        </div>

        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Превью расчёта</div>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={previewStart}
              onChange={(e) => setPreviewStart(e.target.value)}
            />
            <span>→</span>
            <Input type="date" value={previewEnd} readOnly />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            className="rounded-xl"
            onClick={() => {
              setReservationBufferDays(buffer);
              alert("Сохранено");
            }}
          >
            Сохранить
          </Button>
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => setBuffer(getReservationBufferDays())}
          >
            Отменить
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
