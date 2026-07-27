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
import { ArrowUpRight, CalendarDays, Inbox, LogIn, LogOut, Percent, Wallet } from "lucide-react";

import { PageHeader, StageBadge, StatusBadge } from "@/components/admin/ui-bits";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { formatARS, formatDate, leadStages, leads, monthlyRevenue, reservations } from "@/data/admin";
import { occupancyDays } from "@/lib/dates";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

const kpis = [
  { label: "Reservas del mes", value: "7", delta: "+2 vs mes anterior", icon: CalendarDays },
  { label: "Consultas nuevas", value: "12", delta: "+5 esta semana", icon: Inbox },
  { label: "Ingresos estimados", value: formatARS(3_410_000), delta: "+18% interanual", icon: Wallet },
  { label: "Ocupación", value: "94%", delta: "Agosto 2026", icon: Percent },
];

function Dashboard() {
  const occupancy = occupancyDays();
  const upcomingIn = reservations.filter((r) => r.status === "confirmada").slice(0, 3);
  const upcomingOut = reservations.filter((r) => r.status === "confirmada").slice(1, 4);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Resumen operativo de Casa Nahuel — Agosto 2026"
        actions={
          <Button asChild size="sm" className="rounded-full">
            <Link to="/admin/calendario">
              Abrir calendario <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        }
      />

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
            <CardTitle className="font-display text-base">Ingresos y ocupación 2026</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenue} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
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
            <CardTitle className="font-display text-base">Ocupación del mes</CardTitle>
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
              }}
              className="[--cell-size:2.1rem]"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/70 shadow-soft">
          <CardHeader>
            <CardTitle className="font-display text-base">Próximos movimientos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <LogIn className="h-3.5 w-3.5 text-success" /> Check In
              </p>
              <ul className="mt-3 space-y-2">
                {upcomingIn.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate">{r.guest}</span>
                    <span className="shrink-0 text-muted-foreground">{formatDate(r.checkIn)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Separator />
            <div>
              <p className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <LogOut className="h-3.5 w-3.5 text-lake" /> Check Out
              </p>
              <ul className="mt-3 space-y-2">
                {upcomingOut.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate">{r.guest}</span>
                    <span className="shrink-0 text-muted-foreground">{formatDate(r.checkOut)}</span>
                  </li>
                ))}
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
            {leads.slice(0, 5).map((l) => (
              <div key={l.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{l.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {formatDate(l.checkIn)} → {formatDate(l.checkOut)} · {l.nights} noches
                  </p>
                </div>
                <StageBadge stage={l.stage} label={leadStages.find((s) => s.id === l.stage)!.label} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70 shadow-soft">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="font-display text-base">Últimas reservas</CardTitle>
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link to="/admin/reservas">Ver todas</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {reservations.slice(0, 5).map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{r.guest}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {r.code} · {formatDate(r.checkIn)} → {formatDate(r.checkOut)} · {r.channel}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="hidden text-sm sm:inline">{formatARS(r.amount)}</span>
                <StatusBadge status={r.status} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
