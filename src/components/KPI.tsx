// src/components/KPI.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default React.memo(function KPI({
  label, value, onClick,
}: { label: string; value: number | string; onClick?: () => void }) {
  return (
    <Card onClick={onClick} className="rounded-2xl cursor-pointer hover:shadow-md transition">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="text-3xl font-semibold">{value}</CardContent>
    </Card>
  );
});
