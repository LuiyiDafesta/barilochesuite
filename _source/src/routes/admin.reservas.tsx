import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, MoreHorizontal, Plus, Search } from "lucide-react";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { formatARS, formatDate, reservations } from "@/data/admin";

export const Route = createFileRoute("/admin/reservas")({
  component: Reservas,
});

function Reservas() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("todas");
  const [channel, setChannel] = useState("todos");

  const rows = useMemo(
    () =>
      reservations.filter(
        (r) =>
          r.guest.toLowerCase().includes(q.toLowerCase()) &&
          (status === "todas" || r.status === status) &&
          (channel === "todos" || r.channel === channel),
      ),
    [q, status, channel],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reservas"
        description={`${reservations.length} reservas registradas en todos los canales`}
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
                          <DropdownMenuItem onClick={() => toast("Abriendo detalle")}>Ver detalle</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast("Editar reserva")}>Editar</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.success("Mensaje enviado por WhatsApp")}>
                            Enviar WhatsApp
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => toast("Reserva cancelada")}
                          >
                            Cancelar
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

          <Pagination className="mt-6">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardContent>
      </Card>
    </div>
  );
}
