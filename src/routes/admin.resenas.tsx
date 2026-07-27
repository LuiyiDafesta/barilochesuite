import { createFileRoute } from "@tanstack/react-router";
import { Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/ui-bits";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { reviews } from "@/data/site";
import { formatDate } from "@/data/admin";

export const Route = createFileRoute("/admin/resenas")({
  component: Resenas,
});

function Resenas() {
  const average = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(2);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reseñas"
        description={`${reviews.length} reseñas · promedio ${average} de 5`}
        actions={
          <Button size="sm" className="rounded-full" onClick={() => toast("Nueva reseña manual")}>
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Agregar reseña
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {reviews.map((r) => (
          <Card key={r.id} className="border-border/70 shadow-soft">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.country} · {formatDate(r.date)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={
                        i < r.rating ? "h-3.5 w-3.5 fill-warning text-warning" : "h-3.5 w-3.5 text-muted-foreground/40"
                      }
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{r.comment}</p>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Switch defaultChecked={r.visible} onCheckedChange={() => toast("Visibilidad actualizada")} />
                  Visible en el sitio
                </label>
                <Button variant="ghost" size="icon" aria-label="Eliminar" onClick={() => toast("Reseña eliminada")}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
