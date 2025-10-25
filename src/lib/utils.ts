// src/lib/utils.ts — общие утилиты и сортировки для проекта + shadcn/ui

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// shadcn/ui ожидает эту функцию из "@/lib/utils"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function download(filename: string, text: string){
  const a = document.createElement("a");
  a.href = "data:text/plain;charset=utf-8," + encodeURIComponent(text);
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function typeLabel(t: string){
  return t === "PM" ? "ТО" : t === "CM" ? "Ремонт" : t;
}

export function sortAssets(arr: any[], sortKey: string, dir: "asc"|"desc"){
  const asc = dir === "asc";
  const copy = [...arr];
  copy.sort((a,b)=>{
    if (sortKey === "kva"){
      const diff = (Number(a.kva)||0) - (Number(b.kva)||0);
      return asc ? diff : -diff;
    }
    if (sortKey === "site"){
      const aa = (a.site||"").toString();
      const bb = (b.site||"").toString();
      const cmp = aa.localeCompare(bb, "ru", {sensitivity:"base"});
      return asc ? cmp : -cmp;
    }
    if (sortKey === "status"){
      const aa = (a.status||"").toString();
      const bb = (b.status||"").toString();
      const cmp = aa.localeCompare(bb, "ru", {sensitivity:"base"});
      if (cmp !== 0) return asc ? cmp : -cmp;
      const diff = (Number(a.kva)||0) - (Number(b.kva)||0);
      return asc ? diff : -diff;
    }
    const aa = (a[sortKey]||"").toString();
    const bb = (b[sortKey]||"").toString();
    const cmp = aa.localeCompare(bb, "ru", {sensitivity:"base"});
    return asc ? cmp : -cmp;
  });
  return copy;
}

export function sortService(arr: any[], sortKey: string, dir: "asc"|"desc"){
  const asc = dir === "asc";
  const copy = [...arr];
  copy.sort((a,b)=>{
    if (sortKey === "priority"){
      const diff = (Number(a.priority)||0) - (Number(b.priority)||0);
      return asc ? diff : -diff;
    }
    if (sortKey === "eta"){
      const ad = a.eta ? new Date(a.eta).getTime() : 0;
      const bd = b.eta ? new Date(b.eta).getTime() : 0;
      const diff = ad - bd;
      return asc ? diff : -diff;
    }
    if (sortKey === "type"){
      const aa = typeLabel(a.type);
      const bb = typeLabel(b.type);
      const cmp = aa.localeCompare(bb, "ru", {sensitivity:"base"});
      return asc ? cmp : -cmp;
    }
    const aa = (a[sortKey]||"").toString();
    const bb = (b[sortKey]||"").toString();
    const cmp = aa.localeCompare(bb, "ru", {sensitivity:"base"});
    return asc ? cmp : -cmp;
  });
  return copy;
}

export function validateWO(p:{assetCode?:string; type?:'PM'|'CM'; priority?:'1'|'2'|'3'; eta?:string; desc?:string}){
  if (!p.assetCode) return {ok:false, err:"Актив обязателен"};
  if (!p.type) return {ok:false, err:"Тип обязателен"};
  if (!p.priority) return {ok:false, err:"Приоритет обязателен"};
  if (!p.eta) return {ok:false, err:"Срок выполнения обязателен"};
  return {ok:true};
}
