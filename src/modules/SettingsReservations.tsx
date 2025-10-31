import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getReservationBufferDays, setReservationBufferDays } from "@/lib/reservations";
import { addWorkingDaysFrom } from "@/lib/workdays";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

export default function SettingsReservations({ open, onOpenChange }: Props) {
  const [val, setVal] = useState<number>(1);
  const [sample, setSample] = useState<{ from: string; to: string }>({ from: "", to: "" });

  useEffect(() => {
    if (open) {
      const cur = getReservationBufferDays();
      setVal(cur);
      const from = new Date().toISOString().slice(0, 10);
      const to = addWorkingDaysFrom(from, cur);
      setSample({ from, to });
    }
  }, [open]);

  function onChange(n: string) {
    const num = parseInt(n, 10);
    setVal(Number.isFinite(num) && num >= 0 ? num : 0);
    const from = new Date().toISOString().slice(0, 10);
    const to = addWorkingDaysFrom(from, Number.isFinite(num) && num >= 0 ? num : 0);
    setSample({ from, to });
  }

  function save() {
    const saved = setReservationBufferDays(val);
    // Можно подсветить тостом, но сейчас просто закрываем
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle>Настройки бронирования</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium mb-1">Буфер между бронями, рабочих дней</div>
            <Input type="number" min={0} value={val} onChange={(e)=>onChange(e.target.value)} />
            <div className="text-xs text-muted-foreground mt-1">
              Пример: если сегодня {sample.from}, то дата «+ буфер» = {sample.to}.
              Диапазоны бронирований не должны начинаться раньше этой даты относительно соседних окон.
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={()=>onOpenChange(false)}>Отмена</Button>
          <Button onClick={save}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
