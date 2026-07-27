import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Loader2, MoreHorizontal, Plus, Search } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Block, formatARS, formatDate, Reservation } from "@/data/admin";
import { checkRangeOverlap } from "@/lib/dates";
import { blockService, reservationService } from "@/lib/services";

export const Route = createFileRoute("/admin/reservas")({
  component: Reservas,
});

function Reservas() {
  const [items, setItems] = useState<Reservation[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("todas");
  const [channel, setChannel] = useState("todos");

  const loadReservations = async () => {
    try {
      setLoading(true);
      const [resData, blockData] = await Promise.all([
        reservationService.getAll(),
        blockService.getAll(),
      ]);
      setItems(resData);
      setBlocks(blockData);
    } catch (e) {
      console.error("Error cargando reservas de Supabase:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const targetRes = items.find((r) => r.id === id);
    if (!targetRes) return;

    // Si se intenta confirmar una reserva, validar que no se superponga con otra confirmada o un bloqueo
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
    </div>
  );
}
