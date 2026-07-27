import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import type { DateRange } from "react-day-picker";
import { Ban, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/ui-bits";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Block, BlockReason, formatDate } from "@/data/admin";
import { formatLong, nightsBetween } from "@/lib/dates";
import { blockService } from "@/lib/services";

export const Route = createFileRoute("/admin/bloqueos")({
  component: Bloqueos,
});

function Bloqueos() {
  const [items, setItems] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [range, setRange] = useState<DateRange | undefined>();
  const [reason, setReason] = useState<BlockReason>("Mantenimiento");
  const [note, setNote] = useState("");

  const nights = nightsBetween(range?.from, range?.to);

  const loadBlocks = async () => {
    try {
      setLoading(true);
      const data = await blockService.getAll();
      setItems(data);
    } catch (e) {
      console.error("Error cargando bloqueos de Supabase:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlocks();
  }, []);

  const handleCreateBlock = async () => {
    if (!range?.from || !range?.to) return;
    try {
      setCreating(true);
      const fromStr = range.from.toISOString().split("T")[0];
      const toStr = range.to.toISOString().split("T")[0];
      const newBlock = await blockService.create({
        from: fromStr,
        to: toStr,
        reason,
        note,
      });
      setItems((prev) => [...prev, newBlock]);
      toast.success("Bloqueo creado en Supabase", {
        description: `${formatLong(range.from)} → ${formatLong(range.to)}`,
      });
      setRange(undefined);
      setNote("");
    } catch (e) {
      toast.error("Error al guardar bloqueo en Supabase");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteBlock = async (id: string) => {
    try {
      await blockService.delete(id);
      setItems((prev) => prev.filter((b) => b.id !== id));
      toast.success("Bloqueo eliminado de Supabase");
    } catch (e) {
      toast.error("Error al eliminar bloqueo");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bloqueos"
        description="Gestión de bloqueos conectada en tiempo real a Supabase DB."
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
              className="mx-auto [--cell-size:2.1rem]"
            />
            <div className="space-y-2">
              <Label>Motivo</Label>
              <Select value={reason} onValueChange={(val: BlockReason) => setReason(val)}>
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
              <Input
                id="nota"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Service de caldera, uso familiar, etc."
              />
            </div>
            <Button
              className="w-full rounded-full"
              disabled={nights === 0 || creating}
              onClick={handleCreateBlock}
            >
              {creating ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Ban className="mr-1.5 h-3.5 w-3.5" />
              )}
              {nights > 0 ? `Bloquear ${nights} noches` : "Seleccioná un rango"}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-soft">
          <CardHeader>
            <CardTitle className="font-display text-base">Bloqueos activos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-teal" />
              </div>
            ) : (
              items.map((b) => (
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
                    onClick={() => handleDeleteBlock(b.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))
            )}
            {!loading && items.length === 0 && (
              <p className="py-8 text-center text-xs text-muted-foreground">No hay bloqueos registrados.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
