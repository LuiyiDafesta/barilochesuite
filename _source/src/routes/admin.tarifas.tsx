import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatARS, formatDate, RateRule } from "@/data/admin";
import { rateService, settingService } from "@/lib/services";

export const Route = createFileRoute("/admin/tarifas")({
  component: Tarifas,
});

function Tarifas() {
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // Precios Base y Ajustes Globales
  const [basePrice, setBasePrice] = useState(185000);
  const [cleaningFee, setCleaningFee] = useState(45000);
  const [weekendPercent, setWeekendPercent] = useState([15]);

  // Reglas y Descuentos
  const [weeklyEnabled, setWeeklyEnabled] = useState(true);
  const [weeklyPercent, setWeeklyPercent] = useState(10);

  const [monthlyEnabled, setMonthlyEnabled] = useState(true);
  const [monthlyPercent, setMonthlyPercent] = useState(22);

  const [highSeasonMinNightsEnabled, setHighSeasonMinNightsEnabled] = useState(true);
  const [highSeasonMinNights, setHighSeasonMinNights] = useState(4);

  const [petsEnabled, setPetsEnabled] = useState(false);
  const [petFeeAmount, setPetFeeAmount] = useState(18000);

  const [depositEnabled, setDepositEnabled] = useState(true);
  const [depositPercent, setDepositPercent] = useState(30);

  // Reglas por Temporada
  const [rules, setRules] = useState<RateRule[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [submittingRule, setSubmittingRule] = useState(false);

  // Formulario Nueva Regla / Temporada
  const [ruleName, setRuleName] = useState("");
  const [ruleType, setRuleType] = useState("Temporada Alta");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [rulePrice, setRulePrice] = useState("");
  const [minNights, setMinNights] = useState(3);
  const [ruleColor, setRuleColor] = useState("#0d9488");

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [settings, rates] = await Promise.all([
        settingService.get(),
        rateService.getAll(),
      ]);

      // Cargar configuraciones de precios
      setBasePrice(settings.basePrice);
      setCleaningFee(settings.cleaningFee);
      setWeekendPercent([settings.weekendSurchargePercent]);
      setWeeklyEnabled(settings.weeklyDiscountEnabled);
      setWeeklyPercent(settings.weeklyDiscountPercent);
      setMonthlyEnabled(settings.monthlyDiscountEnabled);
      setMonthlyPercent(settings.monthlyDiscountPercent);
      setHighSeasonMinNightsEnabled(settings.minNightsHighSeasonEnabled);
      setHighSeasonMinNights(settings.minNightsHighSeason);
      setPetsEnabled(settings.petsAllowedEnabled);
      setPetFeeAmount(settings.petFeeAmount);
      setDepositEnabled(settings.depositRequiredEnabled);
      setDepositPercent(settings.depositPercent);

      // Cargar tarifas por temporada
      setRules(rates);
    } catch (e) {
      console.error("Error cargando configuración de tarifas:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleSaveSettings = async () => {
    try {
      setSavingSettings(true);
      await settingService.update({
        basePrice,
        cleaningFee,
        weekendSurchargePercent: weekendPercent[0],
        weeklyDiscountEnabled: weeklyEnabled,
        weeklyDiscountPercent: weeklyPercent,
        monthlyDiscountEnabled: monthlyEnabled,
        monthlyDiscountPercent: monthlyPercent,
        minNightsHighSeasonEnabled: highSeasonMinNightsEnabled,
        minNightsHighSeason: highSeasonMinNights,
        petsAllowedEnabled: petsEnabled,
        petFeeAmount,
        depositRequiredEnabled: depositEnabled,
        depositPercent,
      });

      toast.success("Ajustes y reglas guardados en Supabase");
    } catch (e) {
      toast.error("Error al guardar ajustes en Supabase");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleCreateRule = async () => {
    if (!ruleName || !fromDate || !toDate || !rulePrice) {
      toast.error("Por favor completa el nombre, fechas y precio por noche.");
      return;
    }

    try {
      setSubmittingRule(true);
      const newRule = await rateService.create({
        name: ruleName,
        type: ruleType,
        from: fromDate,
        to: toDate,
        price: Number(rulePrice.replace(/[^0-9]/g, "")) || 0,
        minNights,
        color: ruleColor,
        priority: 1,
      });

      setRules((prev) => [...prev, newRule]);
      toast.success("Regla de tarifa creada en Supabase", { description: ruleName });
      setOpenModal(false);
      setRuleName("");
      setFromDate("");
      setToDate("");
      setRulePrice("");
    } catch (e: any) {
      toast.error(e.message || "Error al crear la regla de tarifa");
    } finally {
      setSubmittingRule(false);
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      await rateService.delete(id);
      setRules((prev) => prev.filter((item) => item.id !== id));
      toast.success("Regla de tarifa eliminada de Supabase");
    } catch (e) {
      toast.error("Error al eliminar la regla de tarifa");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tarifas y Precios"
        description="Motor de precios y reglas globales conectadas en tiempo real a Supabase DB."
        actions={
          <Button
            size="sm"
            className="rounded-full"
            disabled={savingSettings}
            onClick={handleSaveSettings}
          >
            {savingSettings ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
            Guardar cambios
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-teal" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Precios Base */}
            <Card className="border-border/70 shadow-soft">
              <CardHeader>
                <CardTitle className="font-display text-base">Precios base</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="base">Precio base por noche (ARS)</Label>
                  <Input
                    id="base"
                    type="number"
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">Se aplica cuando ninguna regla de temporada coincide.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="limpieza">Costo de limpieza (ARS por estadía)</Label>
                  <Input
                    id="limpieza"
                    type="number"
                    value={cleaningFee}
                    onChange={(e) => setCleaningFee(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Recargo fin de semana</Label>
                    <span className="text-sm font-medium">{weekendPercent[0]}%</span>
                  </div>
                  <Slider value={weekendPercent} onValueChange={setWeekendPercent} min={0} max={50} step={5} />
                  <p className="text-xs text-muted-foreground">
                    Viernes y sábado: {formatARS(Math.round(basePrice * (1 + weekendPercent[0] / 100)))} por noche.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Configuración de Reglas y Descuentos */}
            <Card className="border-border/70 shadow-soft">
              <CardHeader>
                <CardTitle className="font-display text-base">Reglas y Descuentos Configurables</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Descuento semanal */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">Descuento semanal (7+ noches)</p>
                      <p className="text-xs text-muted-foreground">Descuento automático por estadía prolongada</p>
                    </div>
                    <Switch checked={weeklyEnabled} onCheckedChange={setWeeklyEnabled} />
                  </div>
                  {weeklyEnabled && (
                    <div className="flex items-center gap-2 pt-1">
                      <Label htmlFor="weeklyPercent" className="text-xs shrink-0">Porcentaje %:</Label>
                      <Input
                        id="weeklyPercent"
                        type="number"
                        min={1}
                        max={50}
                        className="h-8 w-24 text-xs"
                        value={weeklyPercent}
                        onChange={(e) => setWeeklyPercent(Number(e.target.value))}
                      />
                    </div>
                  )}
                  <Separator className="mt-3" />
                </div>

                {/* Descuento mensual */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">Descuento mensual (28+ noches)</p>
                      <p className="text-xs text-muted-foreground">Descuento automático para estadías largas</p>
                    </div>
                    <Switch checked={monthlyEnabled} onCheckedChange={setMonthlyEnabled} />
                  </div>
                  {monthlyEnabled && (
                    <div className="flex items-center gap-2 pt-1">
                      <Label htmlFor="monthlyPercent" className="text-xs shrink-0">Porcentaje %:</Label>
                      <Input
                        id="monthlyPercent"
                        type="number"
                        min={1}
                        max={60}
                        className="h-8 w-24 text-xs"
                        value={monthlyPercent}
                        onChange={(e) => setMonthlyPercent(Number(e.target.value))}
                      />
                    </div>
                  )}
                  <Separator className="mt-3" />
                </div>

                {/* Mínimo de noches en alta */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">Mínimo de noches en temporada alta</p>
                      <p className="text-xs text-muted-foreground">Mínimo de noches exigido por defecto</p>
                    </div>
                    <Switch checked={highSeasonMinNightsEnabled} onCheckedChange={setHighSeasonMinNightsEnabled} />
                  </div>
                  {highSeasonMinNightsEnabled && (
                    <div className="flex items-center gap-2 pt-1">
                      <Label htmlFor="minNightsHigh" className="text-xs shrink-0">Noches mínimas:</Label>
                      <Input
                        id="minNightsHigh"
                        type="number"
                        min={1}
                        max={30}
                        className="h-8 w-24 text-xs"
                        value={highSeasonMinNights}
                        onChange={(e) => setHighSeasonMinNights(Number(e.target.value))}
                      />
                    </div>
                  )}
                  <Separator className="mt-3" />
                </div>

                {/* Mascotas */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">Permitir mascotas con recargo</p>
                      <p className="text-xs text-muted-foreground">Admite mascotas abonando tarifa especial</p>
                    </div>
                    <Switch checked={petsEnabled} onCheckedChange={setPetsEnabled} />
                  </div>
                  {petsEnabled && (
                    <div className="flex items-center gap-2 pt-1">
                      <Label htmlFor="petFee" className="text-xs shrink-0">Recargo (ARS):</Label>
                      <Input
                        id="petFee"
                        type="number"
                        className="h-8 w-32 text-xs"
                        value={petFeeAmount}
                        onChange={(e) => setPetFeeAmount(Number(e.target.value))}
                      />
                    </div>
                  )}
                  <Separator className="mt-3" />
                </div>

                {/* Seña obligatoria */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">Seña obligatoria para confirmar</p>
                      <p className="text-xs text-muted-foreground">Porcentaje de reserva anticipada requerida</p>
                    </div>
                    <Switch checked={depositEnabled} onCheckedChange={setDepositEnabled} />
                  </div>
                  {depositEnabled && (
                    <div className="flex items-center gap-2 pt-1">
                      <Label htmlFor="depositPercent" className="text-xs shrink-0">Porcentaje % de seña:</Label>
                      <Input
                        id="depositPercent"
                        type="number"
                        min={1}
                        max={100}
                        className="h-8 w-24 text-xs"
                        value={depositPercent}
                        onChange={(e) => setDepositPercent(Number(e.target.value))}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabla de Tarifas por Temporada */}
          <Card className="border-border/70 shadow-soft">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="font-display text-base">Tarifas por temporada</CardTitle>
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => setOpenModal(true)}>
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Agregar regla
              </Button>
            </CardHeader>
            <CardContent className="overflow-x-auto">
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
                            style={{ backgroundColor: r.color || "#0d9488" }}
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
                          onClick={() => handleDeleteRule(r.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {/* Modal Nueva Regla / Temporada */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Nueva Regla de Tarifa</DialogTitle>
            <DialogDescription>
              Configurá un precio o mínimo de noches especial para un rango de fechas.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ruleName">Nombre de la Regla / Temporada *</Label>
              <Input
                id="ruleName"
                placeholder="Ej: Invierno Esquí - Nieve Peak"
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Temporada</Label>
              <Select value={ruleType} onValueChange={setRuleType}>
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
                <Label htmlFor="fromDate">Desde (Fecha) *</Label>
                <Input
                  id="fromDate"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="toDate">Hasta (Fecha) *</Label>
                <Input
                  id="toDate"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="rulePrice">Precio por Noche (ARS) *</Label>
                <Input
                  id="rulePrice"
                  placeholder="240000"
                  value={rulePrice}
                  onChange={(e) => setRulePrice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minNights">Mínimo de Noches</Label>
                <Input
                  id="minNights"
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
            <Button onClick={handleCreateRule} disabled={submittingRule}>
              {submittingRule && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Guardar en Supabase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
