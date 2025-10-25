import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wrench, Truck, ClipboardList } from "lucide-react";
import FormsSectionComponent from "@/components/FormsSection";
import SettingsHolidays from "@/modules/SettingsHolidays";
import { addWorkingDaysFrom } from "@/lib/workdays";
import { download, typeLabel, sortAssets, sortService, validateWO } from "@/lib/utils";

const assetsSeed = [
  { code: "DGU-089", serialNumber: "SN-089-P800", brand: "FG Wilson", model: "P800", kva: 800, status: "rented", engine: "Perkins", alternator: "Leroy Somer", controller: "DSE 8610", hours: 5400, site: "СПб, объект-7", customer: "ООО ЭнергоСервис", lastService: "2025-09-12" },
  { code: "DGU-036", serialNumber: "SN-036-A1250", brand: "AKSA", model: "A1250", kva: 1250, status: "ready", engine: "Cummins", alternator: "Stamford", controller: "DSE 8610", hours: 210, site: "Склад СПб", lastService: "2025-10-10" },
  { code: "DGU-121", serialNumber: "SN-121-V1500", brand: "VibroPower", model: "V1500", kva: 1500, status: "maintenance", engine: "Doosan", alternator: "Leroy Somer", controller: "DSE 8610", hours: 7200, site: "Москва, ЦОД", eta: "2025-11-05", lastService: "2025-08-01" },
  { code: "DGU-150", serialNumber: "SN-150-V40", brand: "VibroPower", model: "V40", kva: 40, status: "ready", engine: "Perkins", alternator: "Stamford", controller: "DSE 8610", hours: 120, site: "Склад СПб", lastService: "2025-10-01" },
  { code: "DGU-001", serialNumber: "SN-001-P500", brand: "FG Wilson", model: "P500", kva: 500, status: "rented", engine: "Perkins", alternator: "Stamford", controller: "DSE 8610", hours: 3100, site: "Тюмень", customer: "ООО СтройИнж", lastService: "2025-07-20" },
];
const serviceSeed = [
  { id: "WO-1001", type: "PM", status: "open", priority: 2, assetCode: "DGU-121", eta: "2025-11-05", start: "2025-10-21", end: "", desc: "ТО-7500 м/ч, фильтры, масло" },
  { id: "WO-1002", type: "CM", status: "waiting_parts", priority: 1, assetCode: "DGU-089", eta: "2025-10-29", start: "2025-10-20", end: "", desc: "Замена ТНВД, ожидание ЗИП" },
  { id: "WO-1003", type: "PM", status: "in_progress", priority: 3, assetCode: "DGU-001", eta: "2025-10-26", start: "2025-10-22", end: "", desc: "ТО-3000 м/ч" },
  { id: "WO-1004", type: "CM", status: "completed", priority: 2, assetCode: "DGU-036", eta: "2025-10-18", start: "2025-10-15", end: "2025-10-18", desc: "Замена датчика давления масла" },
];

function KPI({ label, value, onClick }:{ label:string; value:number|string; onClick?: ()=>void }){
  return (
    <Card onClick={onClick} className="rounded-2xl cursor-pointer hover:shadow-md transition">
      <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{label}</CardTitle></CardHeader>
      <CardContent className="text-3xl font-semibold">{value}</CardContent>
    </Card>
  );
}

export default function App(){
  const [activeTab, setActiveTab] = useState("assets");
  const [assetSort, setAssetSort] = useState<{key: string; dir: 'asc'|'desc'}>({ key: 'status', dir: 'asc' });
  const [serviceSort, setServiceSort] = useState<{key: string; dir: 'asc'|'desc'}>({ key: 'eta', dir: 'asc' });
  const [assetQuery, setAssetQuery] = useState("");
  const [serviceStore, setServiceStore] = useState<any[]>(serviceSeed);

  const kpi = useMemo(()=>{
    const total = assetsSeed.length;
    const rented = assetsSeed.filter(a=>a.status==='rented').length;
    const ready = assetsSeed.filter(a=>a.status==='ready').length;
    const maint = assetsSeed.filter(a=>a.status==='maintenance').length;
    const repair = assetsSeed.filter(a=>a.status==='repair').length;
    return [
      { key:'total', label:'Всего ДГУ', value: total, click: ()=>{ setActiveTab('assets'); } },
      { key:'rented', label:'В аренде', value: rented, click: ()=>{ setActiveTab('assets'); } },
      { key:'ready', label:'Готово к аренде', value: ready, click: ()=>{ setActiveTab('assets'); } },
      { key:'maintenance', label:'ТО', value: maint, click: ()=>{ setActiveTab('service'); } },
      { key:'repair', label:'Ремонт', value: repair, click: ()=>{ setActiveTab('service'); } },
    ];
  },[]);

  const assetsFiltered = useMemo(()=>{
    const base = assetsSeed.filter(a=> [a.brand, a.model, a.site, a.customer, a.serialNumber, a.code].join(' ').toLowerCase().includes(assetQuery.toLowerCase()));
    return sortAssets(base, assetSort.key, assetSort.dir);
  }, [assetQuery, assetSort]);

  const service = useMemo(()=> sortService(serviceStore, serviceSort.key, serviceSort.dir), [serviceStore, serviceSort]);

  const tests = [
    { name:"KPI total matches seed", pass: kpi.find(i=>i.key==='total')!.value === assetsSeed.length },
    { name:"Sort assets by kva asc", pass: sortAssets(assetsSeed, 'kva', 'asc').map(x=>x.kva).join(',') === [...assetsSeed].sort((a,b)=>a.kva-b.kva).map(x=>x.kva).join(',') },
    { name:"addWorkingDaysFrom skips weekend", pass: (function(){ const r = addWorkingDaysFrom('2025-10-24',1); return r === '2025-10-27'; })() },
    { name:"addWorkingDaysFrom skips 2025-11-04 holiday", pass: (function(){ const r = addWorkingDaysFrom('2025-11-03',1); return r === '2025-11-05'; })() },
    { name:"sortService by type asc (ru)", pass: (function(){ const res = sortService(serviceSeed, 'type', 'asc').map(x=>typeLabel(x.type)); const chk = res.slice().sort((a,b)=>a.localeCompare(b,'ru',{sensitivity:'base'})); return res.join('\u0001')===chk.join('\u0001'); })() },
    { name:"validateWO guards required", pass: (function(){ const r = validateWO({ assetCode:'', type:'PM', priority:'1', eta:''}); return (r as any).ok===false; })() },
  ];
  const failed = tests.filter(t=>!t.pass);
  if (failed.length) console.warn('Self-tests failed:', failed);

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Управление парком ДГУ</h1>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {kpi.map(item=> (
          <KPI key={item.key} label={item.label} value={item.value} onClick={item.click}/>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="rounded-2xl">
          <TabsTrigger value="assets">Активы</TabsTrigger>
          <TabsTrigger value="service">Сервис/ТО</TabsTrigger>
          <TabsTrigger value="calendar">Календарь</TabsTrigger>
          <TabsTrigger value="forms">Формы</TabsTrigger>
          <TabsTrigger value="settings">Настройки</TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="mt-4">
          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle>Активы</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-3">
                <Input placeholder="Поиск: бренд, модель, объект, клиент, серийный номер" value={assetQuery} onChange={(e)=>setAssetQuery(e.target.value)} className="rounded-xl"/>
                <Button variant="outline" className="rounded-xl" onClick={()=>{ const cols=['code','serialNumber','brand','model','kva','status','site','customer']; const rows=[cols.join(',')].concat(assetsFiltered.map(a=>cols.map(c=>a[c]??'').join(','))); download('assets.csv', rows.join("\n")); }}>CSV</Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead onClick={()=>setAssetSort(s=>({ key:'status', dir: s.dir==='asc'?'desc':'asc'}))}>Статус</TableHead>
                    <TableHead>Код</TableHead>
                    <TableHead onClick={()=>setAssetSort(s=>({ key:'kva', dir: s.dir==='asc'?'desc':'asc'}))}>кВА</TableHead>
                    <TableHead>Бренд/Модель</TableHead>
                    <TableHead>Зав.№</TableHead>
                    <TableHead onClick={()=>setAssetSort(s=>({ key:'site', dir: s.dir==='asc'?'desc':'asc'}))}>Объект</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assetsFiltered.map(a=> (
                    <TableRow key={a.code}>
                      <TableCell>{a.status}</TableCell>
                      <TableCell>{a.code}</TableCell>
                      <TableCell>{a.kva}</TableCell>
                      <TableCell>{a.brand} {a.model}</TableCell>
                      <TableCell>{a.serialNumber||'—'}</TableCell>
                      <TableCell>{a.site||'—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="service" className="mt-4">
          <Card className="rounded-2xl">
            <CardHeader className="pb-2"><CardTitle>Сервис/ТО</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-3">
                <Button variant="outline" className="rounded-xl" onClick={()=>setServiceSort(s=>({ key:'eta', dir: s.dir==='asc'?'desc':'asc'}))}>Срок выполнения</Button>
                <Button variant="outline" className="rounded-xl" onClick={()=>setServiceSort(s=>({ key:'priority', dir: s.dir==='asc'?'desc':'asc'}))}>Приоритет</Button>
                <Button variant="outline" className="rounded-xl" onClick={()=>setServiceSort(s=>({ key:'type', dir: s.dir==='asc'?'desc':'asc'}))}>Тип</Button>
                <Button className="rounded-xl" onClick={()=>{ const cols=['id','type','status','priority','assetCode','eta','start','end','desc']; const rows=[cols.join(',')].concat(service.map(w=> cols.map(c=> c==='type'? typeLabel(w[c]) : (w[c]??'')).join(','))); download('service.csv', rows.join("\n")); }}>CSV</Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Тип</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Приоритет</TableHead>
                    <TableHead>Актив</TableHead>
                    <TableHead>Срок выполнения</TableHead>
                    <TableHead>Описание</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {service.map(w=> (
                    <TableRow key={w.id}>
                      <TableCell>{typeLabel(w.type)}</TableCell>
                      <TableCell>{w.status}</TableCell>
                      <TableCell>{w.priority}</TableCell>
                      <TableCell>{w.assetCode}</TableCell>
                      <TableCell>{w.eta||'—'}</TableCell>
                      <TableCell className="max-w-[360px] truncate" title={w.desc}>{w.desc}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forms" className="mt-4">
          <FormsSectionComponent assets={assetsSeed} onCreate={(wo)=>{ setServiceStore(prev=>[...prev, wo]); setActiveTab('service'); }}/>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <SettingsHolidays/>
        </TabsContent>
      </Tabs>

      <footer className="text-xs text-muted-foreground text-center py-6">© 2025 ООО «Тэтра Инжиниринг» • Управление аренды и сервиса ДГУ • cos φ 0.8, 0.4 кВ</footer>
    </div>
  );
}