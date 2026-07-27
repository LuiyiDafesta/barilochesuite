import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader, StageBadge } from "@/components/admin/ui-bits";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatARS, formatDate, leadStages, type Lead, type LeadStage } from "@/data/admin";
import { leadService } from "@/lib/services";

export const Route = createFileRoute("/admin/consultas")({
  component: Consultas,
});

function Consultas() {
  const [items, setItems] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const data = await leadService.getAll();
      setItems(data);
    } catch (e) {
      console.error("Error al cargar leads de Supabase:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleUpdateStage = async (id: string, stage: LeadStage) => {
    try {
      await leadService.updateStage(id, stage);
      setItems((prev) => prev.map((l) => (l.id === id ? { ...l, stage } : l)));
      toast.success("Estado de consulta actualizado en Supabase", {
        description: `Cambiado a "${leadStages.find((s) => s.id === stage)?.label}".`,
      });
    } catch (e) {
      toast.error("Error al actualizar la consulta en Supabase");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Consultas (CRM)"
        description="Listado unificado de consultas de huéspedes sincronizado en tiempo real con Supabase DB."
      />

      <Card className="border-border/70 shadow-soft">
        <CardContent className="overflow-x-auto p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-teal" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Consulta / Huésped</TableHead>
                  <TableHead>Fechas</TableHead>
                  <TableHead className="text-center">Noches</TableHead>
                  <TableHead className="text-center">Huéspedes</TableHead>
                  <TableHead className="text-right">Estimado</TableHead>
                  <TableHead>Estado (CRM)</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>
                      <p className="font-medium">{l.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {l.country} · {formatDate(l.createdAt)}
                      </p>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatDate(l.checkIn)} → {formatDate(l.checkOut)}
                    </TableCell>
                    <TableCell className="text-center">{l.nights}</TableCell>
                    <TableCell className="text-center">
                      {l.adults + l.children}
                      {l.pets && " 🐾"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right font-medium">
                      {formatARS(l.amount)}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={l.stage}
                        onValueChange={(val: LeadStage) => handleUpdateStage(l.id, val)}
                      >
                        <SelectTrigger className="h-8 w-[160px] text-xs">
                          <SelectValue>
                            <StageBadge
                              stage={l.stage}
                              label={leadStages.find((s) => s.id === l.stage)?.label || l.stage}
                            />
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {leadStages.map((s) => (
                            <SelectItem key={s.id} value={s.id} className="text-xs">
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="ghost" size="sm" className="rounded-full">
                        <Link to="/admin/clientes/$id" params={{ id: l.clientId || "c1" }}>
                          Ver ficha
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!loading && items.length === 0 && (
            <p className="py-16 text-center text-sm text-muted-foreground">
              No hay consultas registradas en Supabase.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
