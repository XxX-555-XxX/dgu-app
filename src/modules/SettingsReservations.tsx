import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getReservationBufferDays, setReservationBufferDays } from "@/lib/reservations";
import { addWorkingDays } from "@/lib/workdays";
import { getHolidays } from "@/lib/settings";
import React from "react";

export default function SettingsReservations() {
  const [buffer, setBuffer] = React.useState<number>(getReservationBufferDays());

  const save = () => {
    setReservationBufferDays(buffer);
    alert("Буфер сохранён");
  };

  // демонстрация addWorkingDays
  const demo = () => {
    const d = addWorkingDays(new Date(), buffer, getHolidays());
    alert(`Через ${buffer} рабочих дн.: ${d.toISOString().slice(0, 10)}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Настройки бронирований</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-3">
        <Input
          type="number"
          value={buffer}
          onChange={(e) => setBuffer(Number(e.target.value || 0))}
          className="w-32"
        />
        <Button onClick={save}>Сохранить</Button>
        <Button variant="secondary" onClick={demo}>
          Проверить расчёт
        </Button>
      </CardContent>
    </Card>
  );
}
