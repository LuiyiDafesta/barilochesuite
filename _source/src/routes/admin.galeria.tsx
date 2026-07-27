import { createFileRoute } from "@tanstack/react-router";
import { GripVertical, Loader2, Star, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/ui-bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { gallery as initialGallery, galleryCategories, GalleryCategory, MediaItem } from "@/data/site";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/galeria")({
  component: GaleriaAdmin,
});

function GaleriaAdmin() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<GalleryCategory>("exterior");
  const [selectedType, setSelectedType] = useState<"foto" | "video" | "video-vertical" | "drone" | "tour">("foto");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("gallery_media")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setItems(
          data.map((item) => ({
            id: item.id,
            src: item.src,
            title: item.title,
            category: item.category as GalleryCategory,
            type: item.type as any,
            ratio: item.ratio as any,
            featured: item.featured,
          }))
        );
      } else {
        setItems(initialGallery);
      }
    } catch (err) {
      console.error("Error al cargar galería de Supabase:", err);
      setItems(initialGallery);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    const toastId = toast.loading("Subiendo a Backblaze B2...");

    try {
      // Subir mediante el proxy PHP de la raíz
      const response = await fetch("/upload.php", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || result.status !== "success") {
        throw new Error(result.message || "Error al subir el archivo");
      }

      const isVideo = file.type.startsWith("video/");
      const newItem = {
        id: `m_${Date.now()}`,
        src: result.url,
        title: file.name.split(".")[0] || "Nuevo Medio",
        category: selectedCategory,
        type: isVideo ? "video" : selectedType,
        ratio: "wide",
        featured: false,
      };

      // Guardar registro en Supabase
      const { error: dbError } = await supabase.from("gallery_media").insert([
        {
          id: newItem.id,
          src: newItem.src,
          title: newItem.title,
          category: newItem.category,
          type: newItem.type,
          ratio: newItem.ratio,
          featured: newItem.featured,
        },
      ]);

      if (dbError) {
        console.warn("Advertencia al guardar en DB:", dbError);
      }

      toast.success("Archivo subido exitosamente a Backblaze B2", { id: toastId });
      fetchGallery();
    } catch (err: any) {
      console.error("Error de subida:", err);
      toast.error(err.message || "Error al subir archivo", { id: toastId });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("gallery_media").delete().eq("id", id);
      if (error) throw error;

      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.success("Medio eliminado correctamente");
    } catch (err: any) {
      toast.error("Error al eliminar medio");
    }
  };

  return (
    <div className="space-y-6">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept="image/*,video/*"
      />

      <PageHeader
        title="Galería Multimedia"
        description={`${items.length} piezas sincronizadas con Backblaze B2 y Supabase`}
        actions={
          <Button
            size="sm"
            className="rounded-full"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="mr-1.5 h-3.5 w-3.5" />
            )}
            Subir medio (B2)
          </Button>
        }
      />

      <Card className="p-4 border-border/70">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-medium text-muted-foreground block mb-1">Categoría</label>
            <Select value={selectedCategory} onValueChange={(val: GalleryCategory) => setSelectedCategory(val)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                {galleryCategories
                  .filter((c) => c.id !== "todas")
                  .map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-medium text-muted-foreground block mb-1">Tipo de Medio</label>
            <Select value={selectedType} onValueChange={(val: any) => setSelectedType(val)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="foto">Foto</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="video-vertical">Video Vertical</SelectItem>
                <SelectItem value="drone">Drone</SelectItem>
                <SelectItem value="tour">Tour 360</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            className="flex-1 min-w-[280px] cursor-pointer rounded-xl border-2 border-dashed border-border bg-card/50 p-4 text-center transition-colors hover:border-teal/60 flex items-center justify-center gap-3"
          >
            <Upload className="h-5 w-5 text-muted-foreground" />
            <div className="text-left">
              <p className="text-xs font-medium">Click para seleccionar archivo</p>
              <p className="text-[10px] text-muted-foreground">Subida directa a Backblaze B2 S3</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        {galleryCategories.map((c) => (
          <Badge key={c.id} variant="secondary" className="rounded-full font-normal">
            {c.label}
          </Badge>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-teal" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((m) => (
            <Card key={m.id} className="overflow-hidden border-border/70 p-0 shadow-soft">
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                {m.type === "video" || m.type === "video-vertical" ? (
                  <video src={m.src} controls className="h-full w-full object-cover" />
                ) : (
                  <img src={m.src} alt={m.title} loading="lazy" className="h-full w-full object-cover" />
                )}
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
                  <Button variant="ghost" size="icon" aria-label="Eliminar" onClick={() => handleDelete(m.id)}>
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
