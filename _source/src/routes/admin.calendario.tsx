import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import type { DateRange } from "react-day-picker";
import { CalendarPlus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader, StatusBadge } from "@/components/admin/ui-bits";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { formatARS, formatDate, reservations } from "@/data/admin";
import { formatLong, nightsBetween, occupancyDays } from "@/lib/dates";

export const Route = createFileRoute("/admin/calendario")({
  component: CalendarioMaestro,
});

const legend = [
  { label: "Disponible", cls: "bg-background border border-border" },
  { label: "Reservado", cls: "bg-primary/85" },
  { label: "Pendiente", cls: "bg-warning" },
  { label: "Bloqueado", cls: "bg-muted-foreground/40" },
  { label: "Mantenimiento", cls: "bg-lake/70" },
  { label: "Uso personal", cls: "bg-teal/60" },
];

const views = [
  { id: "dia", label: "Diaria", months: 1 },
  { id: "semana", label: "Semanal", months: 1 },
  { id: "mes", label: "Mensual", months: 2 },
  { id: "ano", label: "Anual", months: 12 },
];

function CalendarioMaestro() {
  const [view, setView] = useState("mes");
  const [range, setRange] = useState<DateRange | undefined>();
  const [open, setOpen] = useState(false);
  const occupancy = useMemo(() => occupancyDays(), []);
  const months = views.find((v) => v.id === view)!.months;
  const nights = nightsBetween(range?.from, range?.to);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendario maestro"
        description="Seleccioná un rango de fechas para crear una reserva o bloquear el alojamiento."
        actions={
          <>
            <Tabs value={view} onValueChange={setView}>
              <TabsList>
                {views.map((v) => (
                  <TabsTrigger key={v.id} value={v.id}>
                    {v.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <Button size="sm" className="rounded-full" onClick={() => setOpen(true)} disabled={nights === 0}>
              <CalendarPlus className="mr-1.5 h-3.5 w-3.5" /> Nueva reserva
            </Button>
          </>
        }
      />

      <Card className="border-border/70 shadow-soft">
        <CardContent className="overflow-x-auto p-4 sm:p-6">
          <Calendar
            mode="range"
            numberOfMonths={months}
            selected={range}
            onSelect={setRange}
            defaultMonth={new Date(2026, 7, 1)}
            modifiers={occupancy}
            modifiersClassNames={{
              reservada: "bg-primary/85 text-primary-foreground rounded-md",
              pendiente: "bg-warning text-warning-foreground rounded-md",
              bloqueada: "bg-muted-foreground/30 rounded-md",
            }}
            className="w-full [--cell-size:2.3rem]"
          />

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-4">
            {legend.map((l) => (
              <span key={l.label} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className={`h-3 w-3 rounded-[4px] ${l.cls}`} />
                {l.label}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {nights > 0 && (
        <Card className="border-teal/40 bg-accent/40 shadow-soft">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="min-w-0">
              <p className="font-display text-base font-semibold">
                {formatLong(range?.from)} → {formatLong(range?.to)}
              </p>
              <p className="text-sm text-muted-foreground">{nights} noches seleccionadas</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" className="rounded-full" onClick={() => setOpen(true)}>
                Crear reserva
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                onClick={() => toast.success("Rango bloqueado", { description: "Las fechas quedaron no disponibles." })}
              >
                Bloquear
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full"
                onClick={() => toast("Rango desbloqueado")}
              >
                Desbloquear
              </Button>
              <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setRange(undefined)}>
                Limpiar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/70 shadow-soft">
        <CardHeader>
          <CardTitle className="font-display text-base">Eventos del período</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {reservations.map((r) => (
            <div
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{r.guest}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {formatDate(r.checkIn)} → {formatDate(r.checkOut)} · {r.channel}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="hidden text-sm sm:inline">{r.amount ? formatARS(r.amount) : "—"}</span>
                <StatusBadge status={r.status} />
                <Button variant="ghost" size="icon" onClick={() => toast("Reserva cancelada")} aria-label="Cancelar">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Nueva reserva</DialogTitle>
            <DialogDescription>
              {formatLong(range?.from)} → {formatLong(range?.to)} · {nights} noches
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="huesped">Huésped</Label>
              <Input id="huesped" placeholder="Nombre y apellido" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="personas">Personas</Label>
              <Input id="personas" type="number" defaultValue={2} min={1} max={6} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="importe">Importe</Label>
              <Input id="importe" placeholder="1.290.000" />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select defaultValue="pendiente">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmada">Confirmada</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="bloqueo">Bloqueo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Origen</Label>
              <Select defaultValue="Directo">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Directo", "Airbnb", "Booking", "VRBO"].map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="nota">Nota interna</Label>
              <Textarea id="nota" rows={3} placeholder="Llega de madrugada, dejar llaves en la caja." />
            </div>
          </div>

          <Separator />

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setOpen(false);
                toast.success("Reserva creada", { description: "Se agregó al calendario maestro." });
              }}
            >
              Guardar reserva
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
