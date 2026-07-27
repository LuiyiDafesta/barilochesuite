import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/ui-bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Place } from "@/data/site";
import { placeService } from "@/lib/services";

export const Route = createFileRoute("/admin/lugares")({
  component: Lugares,
});

function Lugares() {
  const [items, setItems] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPlaces = async () => {
    try {
      setLoading(true);
      const data = await placeService.getAll();
      setItems(data);
    } catch (e) {
      console.error("Error al cargar lugares de Supabase:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlaces();
  }, []);

  const handleToggle = async (id: string, visible: boolean) => {
    try {
      await placeService.toggleVisibility(id, visible);
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, visible } : p)));
      toast.success("Visibilidad de lugar actualizada en Supabase");
    } catch (e) {
      toast.error("Error al actualizar visibilidad");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lugares cercanos"
        description="Puntos de interés sincronizados con Supabase DB."
        actions={
          <Button size="sm" className="rounded-full" onClick={() => toast("Nuevo lugar")}>
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Agregar lugar
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-teal" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((p) => (
            <Card key={p.id} className="overflow-hidden border-border/70 p-0 shadow-soft">
              <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
                <Badge className="absolute left-2 top-2 rounded-full bg-background/85 font-normal text-foreground backdrop-blur">
                  {p.category}
                </Badge>
              </div>
              <CardContent className="space-y-3 p-5">
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-semibold">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.distance}</p>
                </div>
                <p className="line-clamp-3 text-sm text-muted-foreground">{p.description}</p>
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Switch
                      checked={p.visible}
                      onCheckedChange={(v) => handleToggle(p.id, v)}
                    />
                    Visible
                  </label>
                  <Button variant="ghost" size="icon" aria-label="Eliminar" onClick={() => toast("Lugar eliminado")}>
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
