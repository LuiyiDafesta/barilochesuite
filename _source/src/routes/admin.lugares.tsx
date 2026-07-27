import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/ui-bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { places } from "@/data/site";

export const Route = createFileRoute("/admin/lugares")({
  component: Lugares,
});

function Lugares() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Lugares cercanos"
        description="Curá las recomendaciones que ven los huéspedes en la página de ubicación."
        actions={
          <Button size="sm" className="rounded-full" onClick={() => toast("Nuevo lugar")}>
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Agregar lugar
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {places.map((p) => (
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
                  <Switch defaultChecked={p.visible} onCheckedChange={() => toast("Visibilidad actualizada")} />
                  Visible
                </label>
                <Button variant="ghost" size="icon" aria-label="Eliminar" onClick={() => toast("Lugar eliminado")}>
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
