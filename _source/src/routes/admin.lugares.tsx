import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/ui-bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Place } from "@/data/site";
import { placeService } from "@/lib/services";

export const Route = createFileRoute("/admin/lugares")({
  component: Lugares,
});

function Lugares() {
  const [items, setItems] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Formulario Nuevo Lugar
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Excursión");
  const [distance, setDistance] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

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

  const handleCreatePlace = async () => {
    if (!name || !description) {
      toast.error("Por favor completa el nombre y la descripción.");
      return;
    }

    try {
      setSubmitting(true);
      const newPlace = await placeService.create({
        name,
        category,
        distance: distance || "5 km · 10 min",
        description,
        image: image || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
        visible: true,
      });

      setItems((prev) => [...prev, newPlace]);
      toast.success("Lugar cercano guardado en Supabase", { description: name });
      setOpenModal(false);
      setName("");
      setDistance("");
      setDescription("");
      setImage("");
    } catch (e: any) {
      toast.error(e.message || "Error al crear lugar");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: string, visible: boolean) => {
    try {
      await placeService.toggleVisibility(id, visible);
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, visible } : p)));
      toast.success("Visibilidad de lugar actualizada en Supabase");
    } catch (e) {
      toast.error("Error al actualizar visibilidad");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await placeService.delete(id);
      setItems((prev) => prev.filter((p) => p.id !== id));
      toast.success("Lugar eliminado de Supabase");
    } catch (e) {
      toast.error("Error al eliminar lugar");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lugares cercanos"
        description="Puntos de interés sincronizados con Supabase DB."
        actions={
          <Button size="sm" className="rounded-full" onClick={() => setOpenModal(true)}>
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
            <Card key={p.id} className="overflow-hidden border-border/70 p-0 shadow-soft flex flex-col justify-between">
              <div>
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
                </CardContent>
              </div>

              <div className="flex items-center justify-between border-t border-border px-5 py-3 bg-muted/20">
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Switch
                    checked={p.visible}
                    onCheckedChange={(v) => handleToggle(p.id, v)}
                  />
                  Visible
                </label>
                <Button variant="ghost" size="icon" aria-label="Eliminar" onClick={() => handleDelete(p.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Nuevo Lugar */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Nuevo Lugar Cercano</DialogTitle>
            <DialogDescription>
              Cargá una recomendación turística o punto de interés para mostrar a los huéspedes.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="placeName">Nombre del Lugar *</Label>
              <Input
                id="placeName"
                placeholder="Ej: Cerro Catedral / Circuito Chico"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Centro">Centro</SelectItem>
                  <SelectItem value="Ski">Ski</SelectItem>
                  <SelectItem value="Excursión">Excursión</SelectItem>
                  <SelectItem value="Restaurante">Restaurante</SelectItem>
                  <SelectItem value="Supermercado">Supermercado</SelectItem>
                  <SelectItem value="Playa">Playa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="distance">Distancia / Tiempo</Label>
              <Input
                id="distance"
                placeholder="Ej: 6,4 km · 8 min"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="image">URL de Imagen</Label>
              <Input
                id="image"
                placeholder="https://..."
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                rows={3}
                placeholder="Breve reseña o recomendación para los huéspedes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <Separator />

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreatePlace} disabled={submitting}>
              {submitting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Guardar Lugar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
