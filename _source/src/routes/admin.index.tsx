import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowUpRight, CalendarDays, Inbox, Loader2, LogIn, LogOut, Percent, Wallet } from "lucide-react";

import { PageHeader, StageBadge, StatusBadge } from "@/components/admin/ui-bits";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Block, formatARS, formatDate, Lead, leadStages, Reservation } from "@/data/admin";
import { buildOccupancyMap } from "@/lib/dates";
import { blockService, leadService, propertyService, reservationService } from "@/lib/services";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

const monthsList = [
  { id: "all", label: "Todo el año (Anual)" },
  { id: "0", label: "Enero" },
  { id: "1", label: "Febrero" },
  { id: "2", label: "Marzo" },
  { id: "3", label: "Abril" },
  { id: "4", label: "Mayo" },
  { id: "5", label: "Junio" },
  { id: "6", label: "Julio" },
  { id: "7", label: "Agosto" },
  { id: "8", label: "Septiembre" },
  { id: "9", label: "Octubre" },
  { id: "10", label: "Noviembre" },
  { id: "11", label: "Diciembre" },
];

const availableYears = [2024, 2025, 2026, 2027, 2028];

function Dashboard() {
  const [propName, setPropName] = useState<string>("Todas las Propiedades");
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<string>("7"); // 7 = Agosto por defecto

  const [reservationsData, setReservationsData] = useState<Reservation[]>([]);
  const [blocksData, setBlocksData] = useState<Block[]>([]);
  const [leadsData, setLeadsData] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const activeProp = localStorage.getItem("active_property_id") || "todas";

      const [props, resList, blockList, leadList] = await Promise.all([
        propertyService.getAll(),
        reservationService.getAll(activeProp),
        blockService.getAll(activeProp),
        leadService.getAll(activeProp),
      ]);

      if (activeProp === "todas") {
        setPropName("Todas las Propiedades");
      } else {
        const found = props.find((p) => p.id === activeProp);
        setPropName(found ? found.name : "Propiedad");
      }

      setReservationsData(resList);
      setBlocksData(blockList);
      setLeadsData(leadList as any);
    } catch (e) {
      console.error("Error al cargar datos del Dashboard:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const handlePropChange = () => loadDashboardData();
    window.addEventListener("property_changed", handlePropChange);
    return () => window.removeEventListener("property_changed", handlePropChange);
  }, []);

  const occupancyMap = useMemo(
    () => buildOccupancyMap(reservationsData, blocksData),
    [reservationsData, blocksData]
  );

  // Reservas filtradas por Año y Mes
  const filteredReservations = useMemo(() => {
    return reservationsData.filter((r) => {
      if (r.status === "cancelada" || !r.checkIn) return false;
      const d = new Date(`${r.checkIn}T12:00:00`);
      if (d.getFullYear() !== selectedYear) return false;

      if (selectedMonth !== "all") {
        return d.getMonth() === Number(selectedMonth);
      }
      return true;
    });
  }, [reservationsData, selectedYear, selectedMonth]);

  // Total de ingresos del período seleccionado
  const periodRevenue = useMemo(() => {
    return filteredReservations.reduce((sum, r) => sum + Number(r.amount || 0), 0);
  }, [filteredReservations]);

  // Nombre del período para etiquetas
  const periodLabel = useMemo(() => {
    if (selectedMonth === "all") return `Año ${selectedYear}`;
    const mName = monthsList.find((m) => m.id === selectedMonth)?.label || "";
    return `${mName} ${selectedYear}`;
  }, [selectedYear, selectedMonth]);

  // Porcentaje de Ocupación del período
  const occupancyPercent = useMemo(() => {
    if (selectedMonth === "all") {
      const daysInYear = 365;
      const taken = occupancyMap.reservada.filter((d) => d.getFullYear() === selectedYear).length;
      return Math.min(100, Math.round((taken / daysInYear) * 100));
    } else {
      const monthIdx = Number(selectedMonth);
      const daysInMonth = new Date(selectedYear, monthIdx + 1, 0).getDate();
      const taken = occupancyMap.reservada.filter(
        (d) => d.getFullYear() === selectedYear && d.getMonth() === monthIdx
      ).length;
      return Math.min(100, Math.round((taken / daysInMonth) * 100));
    }
  }, [occupancyMap, selectedYear, selectedMonth]);

  const kpis = [
    { label: `Reservas (${selectedMonth === "all" ? "Anual" : "Mensual"})`, value: String(filteredReservations.length), delta: periodLabel, icon: CalendarDays },
    { label: "Consultas en sistema", value: String(leadsData.length), delta: "Registradas", icon: Inbox },
    { label: `Ingresos (${selectedMonth === "all" ? "Año" : "Mes"})`, value: formatARS(periodRevenue), delta: periodLabel, icon: Wallet },
    { label: "Ocupación", value: `${occupancyPercent}%`, delta: periodLabel, icon: Percent },
  ];

  // Datos para el gráfico de Ingresos
  const chartData = useMemo(() => {
    if (selectedMonth === "all") {
      // Mostrar evolución mes a mes del año seleccionado
      const monthsNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
      const totals = new Array(12).fill(0);
      reservationsData.forEach((r) => {
        if (r.status === "cancelada" || !r.checkIn) return;
        const d = new Date(`${r.checkIn}T12:00:00`);
        if (d.getFullYear() === selectedYear) {
          totals[d.getMonth()] += Number(r.amount || 0);
        }
      });
      return monthsNames.map((name, i) => ({
        label: name,
        ingresos: totals[i],
      }));
    } else {
      // Mostrar evolución por día del mes seleccionado
      const monthIdx = Number(selectedMonth);
      const daysInMonth = new Date(selectedYear, monthIdx + 1, 0).getDate();
      const daysTotals = new Array(daysInMonth).fill(0);

      reservationsData.forEach((r) => {
        if (r.status === "cancelada" || !r.checkIn) return;
        const d = new Date(`${r.checkIn}T12:00:00`);
        if (d.getFullYear() === selectedYear && d.getMonth() === monthIdx) {
          const dayNum = d.getDate();
          if (dayNum >= 1 && dayNum <= daysInMonth) {
            daysTotals[dayNum - 1] += Number(r.amount || 0);
          }
        }
      });

      return daysTotals.map((tot, idx) => ({
        label: `Día ${idx + 1}`,
        ingresos: tot,
      }));
    }
  }, [reservationsData, selectedYear, selectedMonth]);

  const upcomingIn = useMemo(
    () => filteredReservations.filter((r) => r.status === "confirmada").slice(0, 4),
    [filteredReservations]
  );
  const upcomingOut = useMemo(
    () => filteredReservations.filter((r) => r.status === "confirmada").slice(1, 5),
    [filteredReservations]
  );

  const calendarMonth = useMemo(() => {
    const m = selectedMonth === "all" ? 7 : Number(selectedMonth);
    return new Date(selectedYear, m, 1);
  }, [selectedYear, selectedMonth]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Estadístico"
        description={`Resumen operativo de ${propName} — ${periodLabel}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Selector de Mes */}
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[170px] h-9 text-xs rounded-full bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthsList.map((m) => (
                  <SelectItem key={m.id} value={m.id} className="text-xs">
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Selector de Año */}
            <Select value={String(selectedYear)} onValueChange={(val) => setSelectedYear(Number(val))}>
              <SelectTrigger className="w-[100px] h-9 text-xs rounded-full bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((y) => (
                  <SelectItem key={y} value={String(y)} className="text-xs">
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button asChild size="sm" className="rounded-full">
              <Link to="/admin/calendario">
                Abrir calendario <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-teal" />
        </div>
      ) : (
        <>
          {/* Tarjetas KPI */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((k) => (
              <Card key={k.label} className="border-border/70 shadow-soft">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{k.label}</p>
                    <k.icon className="h-4 w-4 shrink-0 text-teal" />
                  </div>
                  <p className="mt-3 font-display text-2xl font-semibold">{k.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{k.delta}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Gráfico y Calendario */}
          <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
            <Card className="border-border/70 shadow-soft">
              <CardHeader>
                <CardTitle className="font-display text-base">
                  Ingresos ({selectedMonth === "all" ? `Evolución Mensual ${selectedYear}` : `Evolución Diaria - ${periodLabel}`}) — {propName}
                </CardTitle>
              </CardHeader>
              <CardContent className="pl-0">
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                      <defs>
                        <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} stroke="var(--muted-foreground)" />
                      <YAxis
                        tickFormatter={(v) => (v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${Math.round(v / 1000)}k`)}
                        tickLine={false}
                        axisLine={false}
                        fontSize={11}
                        stroke="var(--muted-foreground)"
                      />
                      <RTooltip
                        formatter={(v: number) => formatARS(v)}
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid var(--border)",
                          background: "var(--popover)",
                          fontSize: 12,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="ingresos"
                        stroke="var(--chart-2)"
                        strokeWidth={2}
                        fill="url(#rev)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-soft">
              <CardHeader>
                <CardTitle className="font-display text-base">Mapa de Ocupación ({periodLabel})</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Calendar
                  mode="single"
                  defaultMonth={calendarMonth}
                  key={calendarMonth.toISOString()}
                  modifiers={occupancyMap}
                  modifiersClassNames={{
                    reservada: "bg-primary/85 text-primary-foreground rounded-md",
                    pendiente: "bg-warning text-warning-foreground rounded-md",
                    bloqueada: "bg-muted-foreground/30 rounded-md",
                    mantenimiento: "bg-lake/80 text-white rounded-md",
                    personal: "bg-teal/80 text-white rounded-md",
                  }}
                  className="[--cell-size:2.1rem]"
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-border/70 shadow-soft">
              <CardHeader>
                <CardTitle className="font-display text-base">Próximos movimientos ({periodLabel})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    <LogIn className="h-3.5 w-3.5 text-success" /> Check In
                  </p>
                  <ul className="mt-3 space-y-2">
                    {upcomingIn.length > 0 ? (
                      upcomingIn.map((r) => (
                        <li key={r.id} className="flex items-center justify-between gap-3 text-sm">
                          <span className="min-w-0 truncate font-medium">{r.guest}</span>
                          <span className="shrink-0 text-muted-foreground">{formatDate(r.checkIn)}</span>
                        </li>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground">No hay check-ins para este período.</p>
                    )}
                  </ul>
                </div>
                <Separator />
                <div>
                  <p className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    <LogOut className="h-3.5 w-3.5 text-lake" /> Check Out
                  </p>
                  <ul className="mt-3 space-y-2">
                    {upcomingOut.length > 0 ? (
                      upcomingOut.map((r) => (
                        <li key={r.id} className="flex items-center justify-between gap-3 text-sm">
                          <span className="min-w-0 truncate font-medium">{r.guest}</span>
                          <span className="shrink-0 text-muted-foreground">{formatDate(r.checkOut)}</span>
                        </li>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground">No hay check-outs para este período.</p>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-soft">
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="font-display text-base">Últimas consultas</CardTitle>
                <Button asChild variant="ghost" size="sm" className="rounded-full">
                  <Link to="/admin/consultas">Ver todas</Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {leadsData.length > 0 ? (
                  leadsData.slice(0, 5).map((l) => (
                    <div key={l.id} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{l.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {formatDate(l.checkIn)} → {formatDate(l.checkOut)} · {l.nights} noches
                        </p>
                      </div>
                      <StageBadge stage={l.stage} label={leadStages.find((s) => s.id === l.stage)?.label || l.stage} />
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground py-2">No hay consultas registradas.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/70 shadow-soft">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="font-display text-base">Reservas del período ({periodLabel}) — {propName}</CardTitle>
              <Button asChild variant="ghost" size="sm" className="rounded-full">
                <Link to="/admin/reservas">Ver todas</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredReservations.length > 0 ? (
                filteredReservations.slice(0, 5).map((r) => (
                  <div key={r.id} className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{r.guest}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {r.code} · {formatDate(r.checkIn)} → {formatDate(r.checkOut)} · {r.channel}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="hidden text-sm sm:inline font-medium">{formatARS(r.amount)}</span>
                      <StatusBadge status={r.status} />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground py-2">No hay reservas registradas en este período para esta propiedad.</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
