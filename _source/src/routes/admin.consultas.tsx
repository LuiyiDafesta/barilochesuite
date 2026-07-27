import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Kanban, Rows3 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader, StageBadge } from "@/components/admin/ui-bits";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatARS, formatDate, leadStages, leads, type Lead, type LeadStage } from "@/data/admin";

export const Route = createFileRoute("/admin/consultas")({
  component: Consultas,
});

function Consultas() {
  const [items, setItems] = useState<Lead[]>(leads);
  const [dragging, setDragging] = useState<string | null>(null);

  const drop = (stage: LeadStage) => {
    if (!dragging) return;
    setItems((prev) => prev.map((l) => (l.id === dragging ? { ...l, stage } : l)));
    setDragging(null);
    toast.success("Consulta actualizada", {
      description: `Movida a "${leadStages.find((s) => s.id === stage)!.label}".`,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Consultas"
        description="Mini CRM: cada consulta del sitio genera un lead que podés mover por el pipeline."
      />

      <Tabs defaultValue="kanban">
        <TabsList>
          <TabsTrigger value="kanban">
            <Kanban className="mr-1.5 h-3.5 w-3.5" /> Pipeline
          </TabsTrigger>
          <TabsTrigger value="tabla">
            <Rows3 className="mr-1.5 h-3.5 w-3.5" /> Tabla
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="mt-6">
          <div className="overflow-x-auto pb-4">
            <div className="flex min-w-max gap-4">
              {leadStages.map((stage) => {
                const stageLeads = items.filter((l) => l.stage === stage.id);
                return (
                  <div
                    key={stage.id}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => drop(stage.id)}
                    className="w-[280px] shrink-0 rounded-2xl border border-border bg-card/60 p-3"
                  >
                    <div className="flex items-center justify-between px-1 pb-3">
                      <p className="text-sm font-medium">{stage.label}</p>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {stageLeads.length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {stageLeads.map((l) => (
                        <Card
                          key={l.id}
                          draggable
                          onDragStart={() => setDragging(l.id)}
                          className="cursor-grab border-border/70 shadow-soft active:cursor-grabbing"
                        >
                          <CardContent className="p-4">
                            <p className="truncate text-sm font-medium">{l.name}</p>
                            <p className="text-xs text-muted-foreground">{l.country}</p>
                            <p className="mt-2 text-xs text-muted-foreground">
                              {formatDate(l.checkIn)} → {formatDate(l.checkOut)}
                            </p>
                            <div className="mt-3 flex items-center justify-between gap-2">
                              <span className="text-xs font-medium">{formatARS(l.amount)}</span>
                              <Button asChild variant="ghost" size="sm" className="h-7 rounded-full px-2 text-xs">
                                <Link to="/admin/clientes/$id" params={{ id: l.clientId || "c1" }}>
                                  Ver ficha
                                </Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {stageLeads.length === 0 && (
                        <div className="rounded-xl border border-dashed border-border px-3 py-8 text-center text-xs text-muted-foreground">
                          Arrastrá una consulta acá
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tabla" className="mt-6">
          <Card className="border-border/70 shadow-soft">
            <CardContent className="overflow-x-auto p-4 sm:p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Consulta</TableHead>
                    <TableHead>Fechas</TableHead>
                    <TableHead className="text-center">Noches</TableHead>
                    <TableHead className="text-center">Huéspedes</TableHead>
                    <TableHead className="text-right">Estimado</TableHead>
                    <TableHead>Estado</TableHead>
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
                      <TableCell className="whitespace-nowrap text-right">{formatARS(l.amount)}</TableCell>
                      <TableCell>
                        <StageBadge stage={l.stage} label={leadStages.find((s) => s.id === l.stage)!.label} />
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
