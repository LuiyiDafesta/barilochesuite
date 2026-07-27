import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/ui-bits";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
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
import { Separator } from "@/components/ui/separator";
import { formatARS, formatDate, RateRule } from "@/data/admin";
import { toDate } from "@/lib/dates";
import { rateService } from "@/lib/services";

export const Route = createFileRoute("/admin/temporadas")({
  component: Temporadas,
});

function Temporadas() {
  const [seasons, setSeasons] = useState<RateRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Formulario Nueva Temporada
  const [seasonName, setSeasonName] = useState("");
  const [seasonType, setSeasonType] = useState("Temporada Alta");
  const [fromDate, setFromDate] = useState("");
  const [toDateStr, setToDateStr] = useState("");
  const [seasonPrice, setSeasonPrice] = useState("");
  const [minNights, setMinNights] = useState(4);

  const loadSeasons = async () => {
    try {
      setLoading(true);
      const data = await rateService.getAll();
      setSeasons(data);
    } catch (e) {
      console.error("Error al cargar temporadas de Supabase:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeasons();
  }, []);

  const handleCreateSeason = async () => {
    if (!seasonName || !fromDate || !toDateStr || !seasonPrice) {
      toast.error("Por favor completa el nombre de temporada, rango de fechas y precio por noche.");
      return;
    }

    try {
      setSubmitting(true);
      const newSeason = await rateService.create({
        name: seasonName,
        type: seasonType,
        from: fromDate,
        to: toDateStr,
        price: Number(seasonPrice.replace(/[^0-9]/g, "")) || 0,
        minNights,
        color: seasonType === "Temporada Alta" ? "#0d9488" : "#3b82f6",
        priority: 1,
      });

      setSeasons((prev) => [...prev, newSeason]);
      toast.success("Nueva temporada creada en Supabase", { description: seasonName });
      setOpenModal(false);
      setSeasonName("");
      setFromDate("");
      setToDateStr("");
      setSeasonPrice("");
    } catch (e: any) {
      toast.error(e.message || "Error al crear la temporada");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSeason = async (id: string) => {
    try {
      await rateService.delete(id);
      setSeasons((prev) => prev.filter((s) => s.id !== id));
      toast.success("Temporada eliminada de Supabase");
    } catch (e) {
      toast.error("Error al eliminar temporada en Supabase");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Temporadas"
        description="Definí los períodos del año que gobiernan precios y estadías mínimas (conectado a Supabase)."
        actions={
          <Button size="sm" className="rounded-full" onClick={() => setOpenModal(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Nueva temporada
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-teal" />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4">
            {seasons.map((r) => (
              <Card key={r.id} className="overflow-hidden border-border/70 shadow-soft">
                <div className="h-1.5 w-full" style={{ backgroundColor: r.color || "#0d9488" }} />
                <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-base font-semibold">{r.name}</p>
                      <Badge variant="secondary" className="rounded-full font-normal">
                        {r.type}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatDate(r.from)} → {formatDate(r.to)} · mínimo {r.minNights} noches
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-display text-lg font-semibold">{formatARS(r.price)}</p>
                      <p className="text-xs text-muted-foreground">por noche</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Eliminar temporada"
                      onClick={() => handleDeleteSeason(r.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {seasons.length === 0 && (
              <p className="py-12 text-center text-sm text-muted-foreground">No hay temporadas registradas.</p>
            )}
          </div>

          <Card className="border-border/70 shadow-soft">
            <CardHeader>
              <CardTitle className="font-display text-base">Vista de Período de Temporada</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="range"
                numberOfMonths={1}
                defaultMonth={seasons[0] ? toDate(seasons[0].from) : new Date()}
                selected={
                  seasons[0]
                    ? { from: toDate(seasons[0].from), to: toDate(seasons[0].to) }
                    : undefined
                }
                className="[--cell-size:2.1rem]"
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Nueva Temporada */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Nueva Temporada</DialogTitle>
            <DialogDescription>
              Creá un nuevo período de temporada para ajustar los precios y las noches mínimas.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="seasonName">Nombre de la Temporada *</Label>
              <Input
                id="seasonName"
                placeholder="Ej: Verano Alta 2027"
                value={seasonName}
                onChange={(e) => setSeasonName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Clasificación</Label>
              <Select value={seasonType} onValueChange={setSeasonType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Temporada Alta">Temporada Alta</SelectItem>
                  <SelectItem value="Temporada Media">Temporada Media</SelectItem>
                  <SelectItem value="Temporada Baja">Temporada Baja</SelectItem>
                  <SelectItem value="Evento / Feriado">Evento / Feriado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="seasonFrom">Desde *</Label>
                <Input
                  id="seasonFrom"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seasonTo">Hasta *</Label>
                <Input
                  id="seasonTo"
                  type="date"
                  value={toDateStr}
                  onChange={(e) => setToDateStr(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="seasonPrice">Precio / Noche (ARS) *</Label>
                <Input
                  id="seasonPrice"
                  placeholder="280000"
                  value={seasonPrice}
                  onChange={(e) => setSeasonPrice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seasonMinNights">Mín. Noches</Label>
                <Input
                  id="seasonMinNights"
                  type="number"
                  min={1}
                  max={30}
                  value={minNights}
                  onChange={(e) => setMinNights(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <Separator />

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateSeason} disabled={submitting}>
              {submitting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Guardar en Supabase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
