import { createFileRoute } from "@tanstack/react-router";
import { GripVertical, Star, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/ui-bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { gallery, galleryCategories } from "@/data/site";

export const Route = createFileRoute("/admin/galeria")({
  component: GaleriaAdmin,
});

function GaleriaAdmin() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Galería"
        description={`${gallery.length} piezas publicadas · arrastrá para reordenar`}
        actions={
          <Button size="sm" className="rounded-full" onClick={() => toast("Selector de archivos")}>
            <Upload className="mr-1.5 h-3.5 w-3.5" /> Subir medios
          </Button>
        }
      />

      <div
        onClick={() => toast("Arrastrá tus fotos o videos acá")}
        className="cursor-pointer rounded-2xl border-2 border-dashed border-border bg-card/50 px-6 py-12 text-center transition-colors hover:border-teal/60"
      >
        <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">Arrastrá fotos, videos o tours 360</p>
        <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, WEBP, MP4 · hasta 50 MB por archivo</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {galleryCategories.map((c) => (
          <Badge key={c.id} variant="secondary" className="rounded-full font-normal">
            {c.label}
          </Badge>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {gallery.map((m) => (
          <Card key={m.id} className="overflow-hidden border-border/70 p-0 shadow-soft">
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              <img src={m.src} alt={m.title} loading="lazy" className="h-full w-full object-cover" />
              <div className="absolute left-2 top-2 flex items-center gap-1">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-background/85 backdrop-blur">
                  <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
                </span>
                {m.featured && (
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-background/85 backdrop-blur">
                    <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                  </span>
                )}
              </div>
              <Badge className="absolute right-2 top-2 rounded-full bg-background/85 font-normal text-foreground backdrop-blur">
                {m.type}
              </Badge>
            </div>
            <CardContent className="space-y-3 p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{m.title}</p>
                <p className="text-xs text-muted-foreground">{m.category}</p>
              </div>
              <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Switch defaultChecked onCheckedChange={() => toast("Visibilidad actualizada")} />
                  Visible
                </label>
                <Button variant="ghost" size="icon" aria-label="Eliminar" onClick={() => toast("Medio eliminado")}>
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
