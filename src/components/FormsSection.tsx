import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Wrench, Truck, ClipboardList, ChevronsUpDown, Check } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";

import { calcDefaultEta } from "@/lib/workdays";
import { validateWO } from "@/lib/utils";

export type FormsSectionProps = {
  assets: any[];
  onCreate: (wo: any) => void;
};

export default function FormsSectionComponent({ assets, onCreate }: FormsSectionProps){
  const [open, setOpen] = useState(false);
  const [assetCode, setAssetCode] = useState<string>(assets[0]?.code || "");
  const [type, setType] = useState<'PM'|'CM'>("PM");
  const [priority, setPriority] = useState<'1'|'2'|'3'>("2");
  const [eta, setEta] = useState<string>(calcDefaultEta('PM'));
  const [desc, setDesc] = useState<string>("");
  const [err, setErr] = useState<string>("");
  const [assetSearch, setAssetSearch] = useState<string>("");
  const [assetComboOpen, setAssetComboOpen] = useState<boolean>(false);

  const selectedAsset = useMemo(()=> assets.find(a=>a.code===assetCode), [assets, assetCode]);
  const filteredAssets = useMemo(()=>{
    const q = assetSearch.trim().toLowerCase();
    if (!q) return assets;
    return assets.filter(a=> (
      (a.serialNumber||"").toLowerCase().includes(q) ||
      (a.code||"").toLowerCase().includes(q) ||
      [a.brand,a.model].join(" ").toLowerCase().includes(q)
    ));
  }, [assets, assetSearch]);

  useEffect(()=>{
    const q = assetSearch.trim();
    if (q && filteredAssets.length === 1) {
      const only = filteredAssets[0];
      if (only && only.code !== assetCode) setAssetCode(only.code);
    }
  }, [assetSearch, filteredAssets, assetCode]);

  function submit(){
    const check = validateWO({ assetCode, type, priority, eta, desc });
    if (!(check as any).ok){ setErr((check as any).err); return; }
    const id = 'WO-' + Math.floor(1000 + Math.random()*9000);
    const wo = { id, type, status: 'open', priority: Number(priority), assetCode, eta, start: new Date().toISOString().slice(0,10), end: '', desc };
    onCreate(wo);
    setOpen(false);
    setErr('');
    setDesc('');
    const nextType:'PM'|'CM' = 'PM';
    setType(nextType);
    setEta(calcDefaultEta(nextType));
    setPriority('2');
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader><CardTitle>Формы</CardTitle></CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-3">
          <Button className="rounded-xl" onClick={()=>setOpen(true)}><Wrench className="h-4 w-4 mr-2"/>Наряд ТО / Ремонт</Button>
          <Button className="rounded-xl"><Truck className="h-4 w-4 mr-2"/>Отгрузка / ПНР</Button>
          <Button className="rounded-xl"><ClipboardList className="h-4 w-4 mr-2"/>Возврат / Инспекция</Button>
        </div>
      </CardContent>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Новый наряд ТО / Ремонт</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 gap-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">Актив</label>
                <Popover open={assetComboOpen} onOpenChange={setAssetComboOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={assetComboOpen} className="w-full justify-between rounded-xl mt-1">
                      {selectedAsset ? (
                        <span>{selectedAsset.code} • {selectedAsset.brand} {selectedAsset.model} • {selectedAsset.serialNumber||'—'}</span>
                      ) : (
                        <span className="text-muted-foreground">Выберите актив…</span>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
                    <Command>
                      <CommandInput placeholder="Поиск по зав. № / коду / модели" value={assetSearch} onValueChange={setAssetSearch} />
                      <CommandList>
                        <CommandEmpty>Ничего не найдено</CommandEmpty>
                        <CommandGroup>
                          {filteredAssets.map(a=> (
                            <CommandItem key={a.code} value={a.code} onSelect={(val)=>{ setAssetCode(a.code); setAssetComboOpen(false); setErr(""); }}>
                              <Check className={`mr-2 h-4 w-4 ${a.code===assetCode? 'opacity-100' : 'opacity-0'}`} />
                              {a.code} • {a.brand} {a.model} • {a.serialNumber||'—'}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Тип работ</label>
                <Select value={type} onValueChange={(v)=>{ const t = v as 'PM'|'CM'; setType(t); setEta(calcDefaultEta(t)); }}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Тип"/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PM">ТО</SelectItem>
                    <SelectItem value="CM">Ремонт</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">Приоритет</label>
                <Select value={priority} onValueChange={(v)=>setPriority(v as any)}>
                  <SelectTrigger className="rounded-xl"><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 (высокий)</SelectItem>
                    <SelectItem value="2">2 (средний)</SelectItem>
                    <SelectItem value="3">3 (низкий)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Срок выполнения работ</label>
                <Input type="date" value={eta} onChange={(e)=>setEta(e.target.value)} className="rounded-xl" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Описание работ</label>
              <Input placeholder="Кратко опишите работы" value={desc} onChange={(e)=>setDesc(e.target.value)} className="rounded-xl" />
            </div>
            {err && <div className="text-sm text-rose-700">{err}</div>}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" className="rounded-xl" onClick={()=>setOpen(false)}>Отмена</Button>
              <Button className="rounded-xl" onClick={submit}>Создать наряд</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
