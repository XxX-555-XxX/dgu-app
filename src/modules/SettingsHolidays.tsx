import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getHolidays, setHolidays } from "@/lib/workdays";

export default function SettingsHolidays(){
  const [holidaysState, setHolidaysState] = useState<string[]>(getHolidays());
  const [newHoliday, setNewHoliday] = useState<string>("");

  function sync(next: string[]){
    setHolidays(next);
    setHolidaysState(next);
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader><CardTitle>Настройки: Праздничные дни РФ</CardTitle></CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted-foreground">Добавить праздник</label>
            <div className="flex gap-2 mt-1">
              <Input type="date" value={newHoliday} onChange={(e)=>setNewHoliday(e.target.value)} className="rounded-xl"/>
              <Button className="rounded-xl" onClick={()=>{
                if(!newHoliday) return;
                const next = Array.from(new Set([...holidaysState, newHoliday])).sort();
                sync(next);
                setNewHoliday("");
              }}>Добавить</Button>
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-2">Список праздников</div>
            <ul className="text-sm space-y-1">
              {holidaysState.slice().sort().map(d=> (
                <li key={d} className="flex items-center justify-between border rounded-xl px-3 py-1 bg-white">
                  <span>{d}</span>
                  <Button variant="outline" size="sm" className="rounded-xl" onClick={()=>{
                    const next = holidaysState.filter(x=>x!==d);
                    sync(next);
                  }}>Удалить</Button>
                </li>
              ))}
              {holidaysState.length===0 && <li className="text-muted-foreground">Праздников нет</li>}
            </ul>
          </div>
        </div>
        <div className="text-xs text-muted-foreground mt-3">Эти даты используются при расчёте ETA по умолчанию (PM=+7 р.д., CM=+3 р.д.).</div>
      </CardContent>
    </Card>
  );
}
