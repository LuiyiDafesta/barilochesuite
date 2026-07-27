import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import type { DateRange } from "react-day-picker";
import { Ban, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/ui-bits";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { blocks, formatDate } from "@/data/admin";
import { formatLong, nightsBetween } from "@/lib/dates";

export const Route = createFileRoute("/admin/bloqueos")({
  component: Bloqueos,
});

function Bloqueos() {
  const [range, setRange] = useState<DateRange | undefined>();
  const nights = nightsBetween(range?.from, range?.to);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bloqueos"
        description="Reservá fechas para uso personal, mantenimiento o reservas tomadas por otros canales."
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <Card className="border-border/70 shadow-soft">
          <CardHeader>
            <CardTitle className="font-display text-base">Nuevo bloqueo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Calendar
              mode="range"
              selected={range}
              onSelect={setRange}
              defaultMonth={new Date(2026, 7, 1)}
              className="mx-auto [--cell-size:2.1rem]"
            />
            <div className="space-y-2">
              <Label>Motivo</Label>
              <Select defaultValue="Mantenimiento">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Uso personal">Uso personal</SelectItem>
                  <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                  <SelectItem value="Reserva externa">Reserva externa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nota">Nota</Label>
              <Input id="nota" placeholder="Service de caldera" />
            </div>
            <Button
              className="w-full rounded-full"
              disabled={nights === 0}
              onClick={() =>
                toast.success("Bloqueo creado", {
                  description: `${formatLong(range?.from)} → ${formatLong(range?.to)}`,
                })
              }
            >
              <Ban className="mr-1.5 h-3.5 w-3.5" />
              {nights > 0 ? `Bloquear ${nights} noches` : "Seleccioná un rango"}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-soft">
          <CardHeader>
            <CardTitle className="font-display text-base">Bloqueos activos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {blocks.map((b) => (
              <div
                key={b.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">
                      {formatDate(b.from)} → {formatDate(b.to)}
                    </p>
                    <Badge variant="secondary" className="rounded-full font-normal">
                      {b.reason}
                    </Badge>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{b.note}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Quitar bloqueo"
                  onClick={() => toast("Bloqueo eliminado")}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
