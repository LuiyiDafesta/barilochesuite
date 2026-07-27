import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import type { DateRange } from "react-day-picker";
import { Ban, CalendarPlus, Loader2, Trash2 } from "lucide-react";
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
import { Block, BlockReason, Channel, formatARS, formatDate, Reservation, ReservationStatus } from "@/data/admin";
import { buildOccupancyMap, checkRangeOverlap, formatLong, nightsBetween } from "@/lib/dates";
import { blockService, reservationService } from "@/lib/services";

export const Route = createFileRoute("/admin/calendario")({
  component: CalendarioMaestro,
});

const legend = [
  { label: "Disponible", cls: "bg-background border border-border" },
  { label: "Reservado", cls: "bg-primary/85 text-primary-foreground" },
  { label: "Pendiente", cls: "bg-warning text-warning-foreground" },
  { label: "Bloqueado", cls: "bg-muted-foreground/50 text-white" },
  { label: "Mantenimiento", cls: "bg-lake/80 text-white" },
  { label: "Uso personal", cls: "bg-teal/80 text-white" },
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
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);

  // Modales
  const [openReservaModal, setOpenReservaModal] = useState(false);
  const [openBloqueoModal, setOpenBloqueoModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Formulario Reserva
  const [guestName, setGuestName] = useState("");
  const [guestCount, setGuestCount] = useState(2);
  const [reservaAmount, setReservaAmount] = useState("");
  const [reservaStatus, setReservaStatus] = useState<ReservationStatus>("confirmada");
  const [reservaChannel, setReservaChannel] = useState<Channel>("Directo");
  const [reservaNote, setReservaNote] = useState("");

  // Formulario Bloqueo
  const [blockReason, setBlockReason] = useState<BlockReason>("Uso personal");
  const [blockNote, setBlockNote] = useState("");

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      const [resData, blockData] = await Promise.all([
        reservationService.getAll(),
        blockService.getAll(),
      ]);
      setReservations(resData);
      setBlocks(blockData);
    } catch (e) {
      console.error("Error al cargar datos del calendario desde Supabase:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendarData();
  }, []);

  const occupancy = useMemo(() => buildOccupancyMap(reservations, blocks), [reservations, blocks]);
  const months = views.find((v) => v.id === view)!.months;
  const nights = nightsBetween(range?.from, range?.to);

  // Guardar Reserva en Supabase
  const handleSaveReserva = async () => {
    if (!range?.from || !range?.to || !guestName) {
      toast.error("Por favor completa el nombre del huésped y las fechas.");
      return;
    }

    const fromStr = range.from.toISOString().split("T")[0];
    const toStr = range.to.toISOString().split("T")[0];

    // Validar superposición si la reserva se intenta guardar como confirmada
    if (reservaStatus === "confirmada") {
      const conflict = checkRangeOverlap(fromStr, toStr, reservations, blocks);
      if (conflict.hasConflict) {
        toast.error("¡No se puede crear la reserva!", {
          description: conflict.reason,
        });
        return;
      }
    }

    try {
      setSubmitting(true);

      const newRes = await reservationService.create({
        guest: guestName,
        checkIn: fromStr,
        checkOut: toStr,
        guests: guestCount,
        amount: Number(reservaAmount.replace(/[^0-9]/g, "")) || 0,
        status: reservaStatus,
        channel: reservaChannel,
        note: reservaNote,
      });

      setReservations((prev) => [...prev, newRes]);
      toast.success("Reserva guardada en Supabase", {
        description: `${formatLong(range.from)} → ${formatLong(range.to)}`,
      });
      setOpenReservaModal(false);
      setRange(undefined);
      setGuestName("");
      setReservaNote("");
    } catch (e: any) {
      toast.error(e.message || "Error al guardar reserva");
    } finally {
      setSubmitting(false);
    }
  };

  // Guardar Bloqueo en Supabase (Mantenimiento, Uso personal, Reserva externa)
  const handleSaveBloqueo = async () => {
    if (!range?.from || !range?.to) return;

    const fromStr = range.from.toISOString().split("T")[0];
    const toStr = range.to.toISOString().split("T")[0];

    const conflict = checkRangeOverlap(fromStr, toStr, reservations, blocks);
    if (conflict.hasConflict) {
      toast.error("¡No se puede aplicar el bloqueo!", {
        description: conflict.reason,
      });
      return;
    }

    try {
      setSubmitting(true);

      const newBlock = await blockService.create({
        from: fromStr,
        to: toStr,
        reason: blockReason,
        note: blockNote,
      });

      setBlocks((prev) => [...prev, newBlock]);
      toast.success(`Bloqueo (${blockReason}) guardado en Supabase`, {
        description: `${formatLong(range.from)} → ${formatLong(range.to)}`,
      });
      setOpenBloqueoModal(false);
      setRange(undefined);
      setBlockNote("");
    } catch (e: any) {
      toast.error(e.message || "Error al crear bloqueo");
    } finally {
      setSubmitting(false);
    }
  };

  // Desbloquear / Eliminar reservas o bloqueos en las fechas seleccionadas
  const handleDesbloquear = async () => {
    if (!range?.from || !range?.to) return;

    const fromStr = range.from.toISOString().split("T")[0];
    const toStr = range.to.toISOString().split("T")[0];

    const blocksToDelete = blocks.filter((b) => b.from <= toStr && b.to >= fromStr);
    const resToDelete = reservations.filter(
      (r) => (r.status === "bloqueo" || r.status === "mantenimiento" || r.status === "personal") && r.checkIn <= toStr && r.checkOut >= fromStr
    );

    if (blocksToDelete.length === 0 && resToDelete.length === 0) {
      toast.info("No se encontraron bloqueos en las fechas seleccionadas.");
      return;
    }

    try {
      setLoading(true);
      await Promise.all([
        ...blocksToDelete.map((b) => blockService.delete(b.id)),
        ...resToDelete.map((r) => reservationService.delete(r.id)),
      ]);

      setBlocks((prev) => prev.filter((b) => !blocksToDelete.some((del) => del.id === b.id)));
      setReservations((prev) => prev.filter((r) => !resToDelete.some((del) => del.id === r.id)));

      toast.success("Fechas desbloqueadas y eliminadas de Supabase");
      setRange(undefined);
    } catch (e) {
      toast.error("Error al desbloquear las fechas");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReservation = async (id: string) => {
    try {
      await reservationService.delete(id);
      setReservations((prev) => prev.filter((r) => r.id !== id));
      toast.success("Reserva eliminada de Supabase");
    } catch (e) {
      toast.error("Error al eliminar reserva");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendario maestro"
        description="Calendario unificado conectado a Supabase: gestioná reservas, mantenimiento y uso personal."
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
            <Button size="sm" className="rounded-full" onClick={() => setOpenReservaModal(true)} disabled={nights === 0}>
              <CalendarPlus className="mr-1.5 h-3.5 w-3.5" /> Nueva reserva
            </Button>
          </>
        }
      />

      <Card className="border-border/70 shadow-soft">
        <CardContent className="overflow-x-auto p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-teal" />
            </div>
          ) : (
            <>
              <Calendar
                mode="range"
                numberOfMonths={months}
                selected={range}
                onSelect={setRange}
                modifiers={occupancy}
                modifiersClassNames={{
                  reservada: "bg-primary/85 text-primary-foreground rounded-md font-medium",
                  pendiente: "bg-warning text-warning-foreground rounded-md font-medium",
                  bloqueada: "bg-muted-foreground/50 text-white rounded-md font-medium",
                  mantenimiento: "bg-lake/80 text-white rounded-md font-medium",
                  personal: "bg-teal/80 text-white rounded-md font-medium",
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
            </>
          )}
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
              <Button size="sm" className="rounded-full" onClick={() => setOpenReservaModal(true)}>
                Crear reserva
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                onClick={() => setOpenBloqueoModal(true)}
              >
                <Ban className="mr-1.5 h-3.5 w-3.5" /> Bloquear (Mantenimiento / Personal)
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full text-destructive hover:text-destructive"
                onClick={handleDesbloquear}
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

      {/* Listado de eventos del período */}
      <Card className="border-border/70 shadow-soft">
        <CardHeader>
          <CardTitle className="font-display text-base">Reservas y Bloqueos de Fechas</CardTitle>
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
                <Button variant="ghost" size="icon" onClick={() => handleDeleteReservation(r.id)} aria-label="Eliminar">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}

          {blocks.map((b) => (
            <div
              key={b.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-muted/40 px-4 py-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium">Bloqueo: {b.reason}</p>
                  <span className="rounded-full bg-teal/20 text-teal text-[10px] px-2 py-0.5 font-medium">
                    {b.reason}
                  </span>
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {formatDate(b.from)} → {formatDate(b.to)} {b.note ? `· ${b.note}` : ""}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={async () => {
                  await blockService.delete(b.id);
                  setBlocks((prev) => prev.filter((item) => item.id !== b.id));
                  toast.success("Bloqueo eliminado de Supabase");
                }}
                aria-label="Eliminar Bloqueo"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Modal Crear Reserva */}
      <Dialog open={openReservaModal} onOpenChange={setOpenReservaModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Nueva Reserva</DialogTitle>
            <DialogDescription>
              {formatLong(range?.from)} → {formatLong(range?.to)} · {nights} noches
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="huesped">Nombre del Huésped</Label>
              <Input
                id="huesped"
                placeholder="Nombre y apellido"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="personas">Personas</Label>
              <Input
                id="personas"
                type="number"
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                min={1}
                max={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="importe">Importe (ARS)</Label>
              <Input
                id="importe"
                placeholder="1290000"
                value={reservaAmount}
                onChange={(e) => setReservaAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={reservaStatus} onValueChange={(val: any) => setReservaStatus(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmada">Confirmada</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Origen</Label>
              <Select value={reservaChannel} onValueChange={(val: any) => setReservaChannel(val)}>
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
              <Textarea
                id="nota"
                rows={3}
                placeholder="Notas de llegada, seña recibida, etc."
                value={reservaNote}
                onChange={(e) => setReservaNote(e.target.value)}
              />
            </div>
          </div>

          <Separator />

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenReservaModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveReserva} disabled={submitting}>
              {submitting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Guardar en Supabase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Bloquear Fechas (Mantenimiento, Uso personal, Reserva externa) */}
      <Dialog open={openBloqueoModal} onOpenChange={setOpenBloqueoModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Bloquear Fechas</DialogTitle>
            <DialogDescription>
              {formatLong(range?.from)} → {formatLong(range?.to)} · {nights} noches
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Motivo del Bloqueo</Label>
              <Select value={blockReason} onValueChange={(val: BlockReason) => setBlockReason(val)}>
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
              <Label htmlFor="blockNote">Nota / Detalle</Label>
              <Input
                id="blockNote"
                placeholder="Ej: Service de caldera, Vacaciones familiares..."
                value={blockNote}
                onChange={(e) => setBlockNote(e.target.value)}
              />
            </div>
          </div>

          <Separator />

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenBloqueoModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveBloqueo} disabled={submitting}>
              {submitting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Guardar Bloqueo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
