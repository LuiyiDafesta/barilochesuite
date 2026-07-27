import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Calculator, Download, Edit, Loader2, MoreHorizontal, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { PageHeader, StatusBadge } from "@/components/admin/ui-bits";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Block, Channel, formatARS, formatDate, RateRule, Reservation, ReservationStatus } from "@/data/admin";
import { calculateEstimatedPrice, checkRangeOverlap } from "@/lib/dates";
import { blockService, rateService, reservationService, settingService } from "@/lib/services";

export const Route = createFileRoute("/admin/reservas")({
  component: Reservas,
});

function Reservas() {
  const [items, setItems] = useState<Reservation[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [rateRules, setRateRules] = useState<RateRule[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("todas");
  const [channel, setChannel] = useState("todos");

  // Modal Editar Reserva
  const [editingRes, setEditingRes] = useState<Reservation | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Formulario Edición
  const [editGuest, setEditGuest] = useState("");
  const [editCheckIn, setEditCheckIn] = useState("");
  const [editCheckOut, setEditCheckOut] = useState("");
  const [editGuests, setEditGuests] = useState(2);
  const [editAmount, setEditAmount] = useState("");
  const [editStatus, setEditStatus] = useState<ReservationStatus>("confirmada");
  const [editChannel, setEditChannel] = useState<Channel>("Directo");
  const [editNote, setEditNote] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [resData, blockData, ratesData, settsData] = await Promise.all([
        reservationService.getAll(),
        blockService.getAll(),
        rateService.getAll(),
        settingService.get(),
      ]);
      setItems(resData);
      setBlocks(blockData);
      setRateRules(ratesData);
      setSettings(settsData);
    } catch (e) {
      console.error("Error cargando reservas de Supabase:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenEditModal = (r: Reservation) => {
    setEditingRes(r);
    setEditGuest(r.guest);
    setEditCheckIn(r.checkIn);
    setEditCheckOut(r.checkOut);
    setEditGuests(r.guests || 2);
    setEditAmount(r.amount ? String(r.amount) : "");
    setEditStatus(r.status);
    setEditChannel(r.channel);
    setEditNote(r.note || "");
  };

  // Recalculado automático cuando cambian las fechas
  const recalculated = useMemo(() => {
    if (!editCheckIn || !editCheckOut) return null;
    return calculateEstimatedPrice(editCheckIn, editCheckOut, rateRules, settings);
  }, [editCheckIn, editCheckOut, rateRules, settings]);

  const handleRecalculate = () => {
    if (recalculated && recalculated.amount > 0) {
      setEditAmount(String(recalculated.amount));
      toast.info(`Precio recalculado: ${formatARS(recalculated.amount)} (${recalculated.nights} noches)`);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingRes || !editGuest || !editCheckIn || !editCheckOut) {
      toast.error("Por favor completa los campos requeridos.");
      return;
    }

    // Validar superposición si el estado es confirmada
    if (editStatus === "confirmada") {
      const conflict = checkRangeOverlap(editCheckIn, editCheckOut, items, blocks, editingRes.id);
      if (conflict.hasConflict) {
        toast.error("¡Conflicto de fechas!", { description: conflict.reason });
        return;
      }
    }

    try {
      setSubmitting(true);
      const updated = await reservationService.update(editingRes.id, {
        guest: editGuest,
        checkIn: editCheckIn,
        checkOut: editCheckOut,
        guests: editGuests,
        amount: Number(editAmount.replace(/[^0-9]/g, "")) || 0,
        status: editStatus,
        channel: editChannel,
        note: editNote,
      });

      setItems((prev) => prev.map((r) => (r.id === editingRes.id ? updated : r)));
      toast.success("Reserva actualizada en Supabase");
      setEditingRes(null);
    } catch (e: any) {
      toast.error(e.message || "Error al actualizar la reserva");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const targetRes = items.find((r) => r.id === id);
    if (!targetRes) return;

    if (newStatus === "confirmada") {
      const conflict = checkRangeOverlap(targetRes.checkIn, targetRes.checkOut, items, blocks, id);
      if (conflict.hasConflict) {
        toast.error("¡No se puede confirmar la reserva!", {
          description: conflict.reason,
        });
        return;
      }
    }

    try {
      await reservationService.updateStatus(id, newStatus);
      setItems((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus as any } : r)));
      toast.success("Estado de reserva actualizado en Supabase");
    } catch (e) {
      toast.error("Error al actualizar reserva");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await reservationService.delete(id);
      setItems((prev) => prev.filter((r) => r.id !== id));
      toast.success("Reserva eliminada de Supabase");
    } catch (e) {
      toast.error("Error al eliminar reserva");
    }
  };

  const rows = useMemo(
    () =>
      items.filter(
        (r) =>
          r.guest.toLowerCase().includes(q.toLowerCase()) &&
          (status === "todas" || r.status === status) &&
          (channel === "todos" || r.channel === channel),
      ),
    [items, q, status, channel],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reservas"
        description={`${items.length} reservas sincronizadas en tiempo real con Supabase`}
        actions={
          <>
            <Button variant="outline" size="sm" className="rounded-full" onClick={() => toast("Exportando CSV...")}>
              <Download className="mr-1.5 h-3.5 w-3.5" /> Exportar
            </Button>
            <Button asChild size="sm" className="rounded-full">
              <Link to="/admin/calendario">
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Nueva reserva
              </Link>
            </Button>
          </>
        }
      />

      <Card className="border-border/70 shadow-soft">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-wrap gap-3">
            <div className="relative min-w-[220px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por huésped..."
                className="pl-9"
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[170px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todos los estados</SelectItem>
                <SelectItem value="confirmada">Confirmada</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
                <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                <SelectItem value="personal">Uso personal</SelectItem>
              </SelectContent>
            </Select>
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los orígenes</SelectItem>
                {["Directo", "Airbnb", "Booking", "VRBO"].map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-teal" />
            </div>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead className="text-center">Personas</TableHead>
                    <TableHead className="text-right">Importe</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Origen</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <p className="font-medium">{r.guest}</p>
                        <p className="text-xs text-muted-foreground">{r.code}</p>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(r.checkIn)}</TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(r.checkOut)}</TableCell>
                      <TableCell className="text-center">{r.guests || "—"}</TableCell>
                      <TableCell className="whitespace-nowrap text-right">
                        {r.amount ? formatARS(r.amount) : "—"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={r.status} />
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="rounded-full font-normal">
                          {r.channel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Acciones">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenEditModal(r)}>
                              <Edit className="mr-2 h-4 w-4" /> Editar Reserva
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(r.id, "confirmada")}>
                              Marcar Confirmada
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(r.id, "pendiente")}>
                              Marcar Pendiente
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(r.id, "cancelada")}>
                              Marcar Cancelada
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(r.id)}
                            >
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {rows.length === 0 && (
                <p className="py-16 text-center text-sm text-muted-foreground">
                  No hay reservas que coincidan con los filtros.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Editar Reserva */}
      <Dialog open={editingRes !== null} onOpenChange={(o) => !o && setEditingRes(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Editar Reserva ({editingRes?.code})</DialogTitle>
            <DialogDescription>
              Modificá las fechas, huésped o estado. El sistema recalcula el precio según las reglas vigentes.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="editGuest">Nombre del Huésped *</Label>
              <Input
                id="editGuest"
                value={editGuest}
                onChange={(e) => setEditGuest(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editCheckIn">Check In *</Label>
              <Input
                id="editCheckIn"
                type="date"
                value={editCheckIn}
                onChange={(e) => setEditCheckIn(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editCheckOut">Check Out *</Label>
              <Input
                id="editCheckOut"
                type="date"
                value={editCheckOut}
                onChange={(e) => setEditCheckOut(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editGuests">Personas</Label>
              <Input
                id="editGuests"
                type="number"
                min={1}
                max={6}
                value={editGuests}
                onChange={(e) => setEditGuests(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>Origen</Label>
              <Select value={editChannel} onValueChange={(val: any) => setEditChannel(val)}>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="editAmount">Importe Total (ARS)</Label>
                {recalculated && recalculated.nights > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    className="h-7 rounded-full text-xs"
                    onClick={handleRecalculate}
                  >
                    <Calculator className="mr-1 h-3 w-3" /> Aplicar {formatARS(recalculated.amount)} ({recalculated.nights}n)
                  </Button>
                )}
              </div>
              <Input
                id="editAmount"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Estado de Reserva</Label>
              <Select value={editStatus} onValueChange={(val: any) => setEditStatus(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmada">Confirmada</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="editNote">Nota Interna</Label>
              <Textarea
                id="editNote"
                rows={3}
                placeholder="Modificación de fechas a pedido del cliente..."
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
              />
            </div>
          </div>

          <Separator />

          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingRes(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={submitting}>
              {submitting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
