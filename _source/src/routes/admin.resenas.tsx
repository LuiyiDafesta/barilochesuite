import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Edit, Loader2, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/ui-bits";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Review } from "@/data/site";
import { formatDate } from "@/data/admin";
import { reviewService } from "@/lib/services";

export const Route = createFileRoute("/admin/resenas")({
  component: Resenas,
});

function Resenas() {
  const [items, setItems] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [country, setCountry] = useState("Argentina");
  const [rating, setRating] = useState(5);
  const [date, setDate] = useState("");
  const [comment, setComment] = useState("");
  const [visible, setVisible] = useState(true);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewService.getAll();
      setItems(data);
    } catch (e) {
      console.error("Error al cargar reseñas:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleOpenModal = (r?: Review) => {
    if (r) {
      setEditingReview(r);
      setName(r.name);
      setCountry(r.country);
      setRating(r.rating);
      setDate(r.date || new Date().toISOString().split("T")[0]);
      setComment(r.comment);
      setVisible(r.visible);
    } else {
      setEditingReview(null);
      setName("");
      setCountry("Argentina");
      setRating(5);
      setDate(new Date().toISOString().split("T")[0]);
      setComment("");
      setVisible(true);
    }
    setOpenModal(true);
  };

  const handleSaveReview = async () => {
    if (!name || !comment) {
      toast.error("Por favor completa el nombre del huésped y su comentario.");
      return;
    }

    try {
      setSubmitting(true);
      if (editingReview) {
        const updated = await reviewService.update(editingReview.id, {
          name,
          country,
          rating,
          date,
          comment,
          visible,
        });
        setItems((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        toast.success("Reseña actualizada correctamente");
      } else {
        const created = await reviewService.create({
          name,
          country,
          rating,
          date,
          comment,
          visible,
        });
        setItems((prev) => [created, ...prev]);
        toast.success("Reseña agregada manualmente");
      }

      setOpenModal(false);
      setEditingReview(null);
    } catch (e: any) {
      toast.error("Error al guardar reseña");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: string, isVisible: boolean) => {
    try {
      await reviewService.toggleVisibility(id, isVisible);
      setItems((prev) => prev.map((r) => (r.id === id ? { ...r, visible: isVisible } : r)));
      toast.success("Visibilidad actualizada");
    } catch (e) {
      toast.error("Error al actualizar visibilidad");
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("¿Estás seguro de que querés eliminar esta reseña?")) return;
    try {
      await reviewService.delete(id);
      setItems((prev) => prev.filter((r) => r.id !== id));
      toast.success("Reseña eliminada correctamente");
    } catch (e) {
      toast.error("Error al eliminar reseña");
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
          <Button size="sm" className="rounded-full" onClick={() => handleOpenModal()}>
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
            <Card key={r.id} className="border-border/70 shadow-soft flex flex-col justify-between">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{r.name}</p>
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
                  <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                    <Switch
                      checked={r.visible}
                      onCheckedChange={(v) => handleToggle(r.id, v)}
                    />
                    Visible en el sitio
                  </label>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" aria-label="Editar" onClick={() => handleOpenModal(r)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Eliminar" onClick={() => handleDeleteReview(r.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Crear / Editar Reseña */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">{editingReview ? "Editar Reseña" : "Agregar Reseña Manual"}</DialogTitle>
            <DialogDescription>
              Cargá una opinión enviada por un huésped en Airbnb, Booking o WhatsApp.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="revName">Nombre del Huésped *</Label>
              <Input
                id="revName"
                placeholder="Ej: Valentina Rossi"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="revCountry">País de Origen</Label>
              <Input
                id="revCountry"
                placeholder="Ej: Italia / Argentina"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Puntaje / Estrellas</Label>
              <Select value={String(rating)} onValueChange={(val) => setRating(Number(val))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">⭐⭐⭐⭐⭐ (5 Estrellas)</SelectItem>
                  <SelectItem value="4">⭐⭐⭐⭐ (4 Estrellas)</SelectItem>
                  <SelectItem value="3">⭐⭐⭐ (3 Estrellas)</SelectItem>
                  <SelectItem value="2">⭐⭐ (2 Estrellas)</SelectItem>
                  <SelectItem value="1">⭐ (1 Estrella)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="revDate">Fecha de la Reseña</Label>
              <Input
                id="revDate"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="revComment">Comentario / Opinión *</Label>
              <Textarea
                id="revComment"
                rows={3}
                placeholder="Escribí la reseña del huésped..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border p-3 sm:col-span-2 bg-muted/20">
              <div>
                <p className="text-xs font-semibold">¿Visible públicamente en la Web?</p>
                <p className="text-[11px] text-muted-foreground">Muestra esta reseña en la sección de testimonios.</p>
              </div>
              <Switch checked={visible} onCheckedChange={setVisible} />
            </div>
          </div>

          <Separator />

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveReview} disabled={submitting}>
              {submitting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Guardar Reseña
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

