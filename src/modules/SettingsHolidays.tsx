// src/modules/SettingsHolidays.tsx
import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getHolidays, setHolidays } from "@/lib/workdays";

export default function SettingsHolidays() {
  const [raw, setRaw] = useState<string>(() => getHolidays().join("\n"));

  const holidays = useMemo(
    () =>
      raw
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean),
    [raw],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Праздники (РФ)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          По одному ISO-дню на строку, формат <span className="font-mono">YYYY-MM-DD</span>.
        </p>

        <Textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder={"2025-01-01\n2025-01-02\n..."}
          className="min-h-[200px] font-mono"
        />

        <div className="flex gap-2">
          <Button
            onClick={() => {
              setHolidays(holidays);
              alert("Сохранено");
            }}
            className="rounded-xl"
          >
            Сохранить
          </Button>
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => setRaw(getHolidays().join("\n"))}
          >
            Отменить
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
