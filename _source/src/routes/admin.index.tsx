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
import { Separator } from "@/components/ui/separator";
import { Block, formatARS, formatDate, Lead, leadStages, Reservation } from "@/data/admin";
import { buildOccupancyMap } from "@/lib/dates";
import { blockService, leadService, propertyService, reservationService } from "@/lib/services";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const [propName, setPropName] = useState<string>("Todas las Propiedades");
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

  const occupancy = useMemo(
    () => buildOccupancyMap(reservationsData, blocksData),
    [reservationsData, blocksData]
  );

  const activeReservations = useMemo(
    () => reservationsData.filter((r) => r.status !== "cancelada"),
    [reservationsData]
  );

  const upcomingIn = useMemo(
    () => activeReservations.filter((r) => r.status === "confirmada").slice(0, 3),
    [activeReservations]
  );
  const upcomingOut = useMemo(
    () => activeReservations.filter((r) => r.status === "confirmada").slice(1, 4),
    [activeReservations]
  );

  const totalEstimatedRevenue = useMemo(
    () => activeReservations.reduce((sum, r) => sum + (r.amount || 0), 0),
    [activeReservations]
  );

  const occupancyPercent = useMemo(() => {
    if (occupancy.reservada.length === 0) return 0;
    return Math.min(100, Math.round((occupancy.reservada.length / 31) * 100));
  }, [occupancy]);

  const kpis = [
    { label: "Reservas del mes", value: String(activeReservations.length), delta: "Total en sistema", icon: CalendarDays },
    { label: "Consultas nuevas", value: String(leadsData.length), delta: "Registradas", icon: Inbox },
    { label: "Ingresos estimados", value: formatARS(totalEstimatedRevenue), delta: "Total proyectado", icon: Wallet },
    { label: "Ocupación", value: `${occupancyPercent}%`, delta: "Agosto 2026", icon: Percent },
  ];

  const monthsNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const chartData = useMemo(() => {
    const totals = new Array(12).fill(0);
    activeReservations.forEach((r) => {
      if (!r.checkIn) return;
      const d = new Date(`${r.checkIn}T12:00:00`);
      const m = d.getMonth();
      if (m >= 0 && m < 12) {
        totals[m] += Number(r.amount || 0);
      }
    });
    return monthsNames.map((name, i) => ({
      month: name,
      ingresos: totals[i],
    }));
  }, [activeReservations]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Resumen operativo de ${propName} — Agosto 2026`}
        actions={
          <Button asChild size="sm" className="rounded-full">
            <Link to="/admin/calendario">
              Abrir calendario <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-teal" />
        </div>
      ) : (
        <>
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

          <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
            <Card className="border-border/70 shadow-soft">
              <CardHeader>
                <CardTitle className="font-display text-base">Ingresos y ocupación 2026 ({propName})</CardTitle>
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
                      <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                      <YAxis
                        tickFormatter={(v) => `${Math.round(v / 1_000_000)}M`}
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
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
                <CardTitle className="font-display text-base">Ocupación del mes ({propName})</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Calendar
                  mode="single"
                  defaultMonth={new Date(2026, 7, 1)}
                  modifiers={occupancy}
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
                <CardTitle className="font-display text-base">Próximos movimientos ({propName})</CardTitle>
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
                      <p className="text-xs text-muted-foreground">No hay check-ins próximos registrados.</p>
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
                      <p className="text-xs text-muted-foreground">No hay check-outs próximos registrados.</p>
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
                  <p className="text-xs text-muted-foreground py-2">No hay consultas registradas para esta propiedad.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/70 shadow-soft">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="font-display text-base">Últimas reservas ({propName})</CardTitle>
              <Button asChild variant="ghost" size="sm" className="rounded-full">
                <Link to="/admin/reservas">Ver todas</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {reservationsData.length > 0 ? (
                reservationsData.slice(0, 5).map((r) => (
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
                <p className="text-xs text-muted-foreground py-2">No hay reservas registradas para esta propiedad.</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
