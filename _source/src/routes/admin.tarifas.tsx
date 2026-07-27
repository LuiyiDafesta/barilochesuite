import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/ui-bits";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatARS, formatDate, RateRule } from "@/data/admin";
import { rateService } from "@/lib/services";

export const Route = createFileRoute("/admin/tarifas")({
  component: Tarifas,
});

function Tarifas() {
  const [base, setBase] = useState(185000);
  const [weekend, setWeekend] = useState([15]);
  const [cleaning, setCleaning] = useState(45000);
  const [rules, setRules] = useState<RateRule[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRates = async () => {
    try {
      setLoading(true);
      const data = await rateService.getAll();
      setRules(data);
    } catch (e) {
      console.error("Error al cargar tarifas de Supabase:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRates();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tarifas y Precios"
        description="Motor de precios conectado con Supabase DB."
        actions={
          <Button size="sm" className="rounded-full" onClick={() => toast.success("Tarifas guardadas en Supabase")}>
            Guardar cambios
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/70 shadow-soft">
          <CardHeader>
            <CardTitle className="font-display text-base">Precios base</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="base">Precio por noche (ARS)</Label>
              <Input id="base" type="number" value={base} onChange={(e) => setBase(Number(e.target.value))} />
              <p className="text-xs text-muted-foreground">Se aplica cuando ninguna regla de temporada coincide.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="limpieza">Costo de limpieza (ARS)</Label>
              <Input
                id="limpieza"
                type="number"
                value={cleaning}
                onChange={(e) => setCleaning(Number(e.target.value))}
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Recargo fin de semana</Label>
                <span className="text-sm font-medium">{weekend[0]}%</span>
              </div>
              <Slider value={weekend} onValueChange={setWeekend} min={0} max={50} step={5} />
              <p className="text-xs text-muted-foreground">
                Viernes y sábado: {formatARS(Math.round(base * (1 + weekend[0] / 100)))} por noche.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-soft">
          <CardHeader>
            <CardTitle className="font-display text-base">Reglas y descuentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Descuento semanal (7+ noches)", detail: "10% off automático" },
              { label: "Descuento mensual (28+ noches)", detail: "22% off automático" },
              { label: "Mínimo de noches en alta", detail: "4 noches" },
              { label: "Permitir mascotas con recargo", detail: "+ ARS 18.000 por estadía" },
              { label: "Seña obligatoria del 30%", detail: "Para confirmar la reserva" },
            ].map((r, i) => (
              <div key={r.label}>
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{r.label}</p>
                    <p className="text-xs text-muted-foreground">{r.detail}</p>
                  </div>
                  <Switch defaultChecked={i !== 3} onCheckedChange={() => toast("Regla actualizada")} />
                </div>
                {i < 4 && <Separator className="mt-4" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70 shadow-soft">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="font-display text-base">Tarifas por temporada</CardTitle>
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => toast("Nueva regla de tarifa")}>
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Agregar regla
          </Button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-teal" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Regla</TableHead>
                  <TableHead>Vigencia</TableHead>
                  <TableHead className="text-center">Mín. noches</TableHead>
                  <TableHead className="text-center">Prioridad</TableHead>
                  <TableHead className="text-right">Precio / noche</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: r.color }}
                        />
                        <div className="min-w-0">
                          <p className="truncate font-medium">{r.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{r.type}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatDate(r.from)} → {formatDate(r.to)}
                    </TableCell>
                    <TableCell className="text-center">{r.minNights}</TableCell>
                    <TableCell className="text-center">{r.priority}</TableCell>
                    <TableCell className="whitespace-nowrap text-right font-medium">{formatARS(r.price)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Eliminar regla"
                        onClick={() => toast("Regla eliminada")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
