import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/ui-bits";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { formatARS, formatDate, rateRules } from "@/data/admin";
import { toDate } from "@/lib/dates";

export const Route = createFileRoute("/admin/temporadas")({
  component: Temporadas,
});

function Temporadas() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Temporadas"
        description="Definí los períodos del año que gobiernan precios y estadías mínimas."
        actions={
          <Button size="sm" className="rounded-full" onClick={() => toast("Nueva temporada")}>
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Nueva temporada
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          {rateRules.map((r) => (
            <Card key={r.id} className="overflow-hidden border-border/70 shadow-soft">
              <div className="h-1 w-full" style={{ backgroundColor: r.color }} />
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
                <div className="text-right">
                  <p className="font-display text-lg font-semibold">{formatARS(r.price)}</p>
                  <p className="text-xs text-muted-foreground">por noche</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-border/70 shadow-soft">
          <CardHeader>
            <CardTitle className="font-display text-base">Vista de temporada alta</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="range"
              numberOfMonths={1}
              defaultMonth={toDate(rateRules[0].from)}
              selected={{ from: toDate(rateRules[0].from), to: toDate(rateRules[0].to) }}
              className="[--cell-size:2.1rem]"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
