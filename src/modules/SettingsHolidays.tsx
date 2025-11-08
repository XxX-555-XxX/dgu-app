import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { getHolidays, setHolidays } from "@/lib/settings";

export default function SettingsHolidays() {
  const [raw, setRaw] = React.useState<string>(() => getHolidays().join("\n"));

  const save = () => {
    const list = raw
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    setHolidays(list);
    alert("Праздники сохранены");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Праздничные дни</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea rows={8} value={raw} onChange={(e) => setRaw(e.target.value)} />
        <Button onClick={save}>Сохранить</Button>
      </CardContent>
    </Card>
  );
}
