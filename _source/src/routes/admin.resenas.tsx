import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/ui-bits";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Review } from "@/data/site";
import { formatDate } from "@/data/admin";
import { reviewService } from "@/lib/services";

export const Route = createFileRoute("/admin/resenas")({
  component: Resenas,
});

function Resenas() {
  const [items, setItems] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewService.getAll();
      setItems(data);
    } catch (e) {
      console.error("Error al cargar reseñas de Supabase:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleToggle = async (id: string, visible: boolean) => {
    try {
      await reviewService.toggleVisibility(id, visible);
      setItems((prev) => prev.map((r) => (r.id === id ? { ...r, visible } : r)));
      toast.success("Visibilidad actualizada en Supabase");
    } catch (e) {
      toast.error("Error al actualizar visibilidad");
    }
  };

  const average = items.length
    ? (items.reduce((s, r) => s + r.rating, 0) / items.length).toFixed(2)
    : "5.0";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reseñas"
        description={`${items.length} reseñas · promedio ${average} de 5`}
        actions={
          <Button size="sm" className="rounded-full" onClick={() => toast("Nueva reseña manual")}>
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Agregar reseña
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-teal" />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((r) => (
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
                    <Switch
                      checked={r.visible}
                      onCheckedChange={(v) => handleToggle(r.id, v)}
                    />
                    Visible en el sitio
                  </label>
                  <Button variant="ghost" size="icon" aria-label="Eliminar" onClick={() => toast("Reseña eliminada")}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
