import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Grid2x2, LayoutGrid, Play, RotateCcw, ZoomIn } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { gallery as initialGallery, galleryCategories, type MediaItem } from "@/data/site";
import { supabase } from "@/lib/supabase";

const typeBadge: Record<MediaItem["type"], string | null> = {
  foto: null,
  video: "Video",
  "video-vertical": "Video vertical",
  drone: "Drone",
  tour: "Tour 360°",
};

export function GalleryExplorer({ compact = false }: { compact?: boolean }) {
  const [filter, setFilter] = useState<string>("todas");
  const [view, setView] = useState<"grid" | "masonry">("masonry");
  const [index, setIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(false);
  const [galleryItems, setGalleryItems] = useState<MediaItem[]>(initialGallery);

  useEffect(() => {
    const loadSupabaseGallery = async () => {
      try {
        const { data, error } = await supabase
          .from("gallery_media")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          setGalleryItems(
            data.map((item) => ({
              id: item.id,
              src: item.src,
              title: item.title,
              category: item.category as any,
              type: item.type as any,
              ratio: item.ratio as any,
              featured: item.featured,
            }))
          );
        }
      } catch (e) {
        console.error("Error cargando galería pública:", e);
      }
    };
    loadSupabaseGallery();
  }, []);

  const items = useMemo(
    () => (filter === "todas" ? galleryItems : galleryItems.filter((g) => g.category === filter)),
    [filter, galleryItems],
  );
  const visible = compact ? items.slice(0, 6) : items;
  const current = index !== null ? visible[index] : null;

  const move = (delta: number) => {
    if (index === null) return;
    setZoom(false);
    setIndex((index + delta + visible.length) % visible.length);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {galleryCategories.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setFilter(c.id);
                setIndex(null);
              }}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm transition-all",
                filter === c.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        {!compact && (
          <div className="flex items-center gap-1 rounded-full border border-border p-1">
            <Button
              variant={view === "masonry" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-full"
              onClick={() => setView("masonry")}
            >
              <LayoutGrid className="mr-1.5 h-4 w-4" /> Masonry
            </Button>
            <Button
              variant={view === "grid" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-full"
              onClick={() => setView("grid")}
            >
              <Grid2x2 className="mr-1.5 h-4 w-4" /> Grid
            </Button>
          </div>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border py-20 text-center">
          <p className="font-display text-lg">Sin material en esta categoría</p>
          <p className="mt-1 text-sm text-muted-foreground">Probá con otro filtro de la galería.</p>
        </div>
      ) : view === "masonry" && !compact ? (
        <div className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
          {visible.map((item, i) => (
            <Tile key={item.id} item={item} onClick={() => setIndex(i)} masonry />
          ))}
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((item, i) => (
            <Tile key={item.id} item={item} onClick={() => setIndex(i)} />
          ))}
        </div>
      )}

      <Dialog open={index !== null} onOpenChange={(o) => !o && setIndex(null)}>
        <DialogContent className="max-w-[100vw] border-none bg-primary/97 p-0 sm:max-w-[96vw]">

          <DialogTitle className="sr-only">{current?.title ?? "Galería"}</DialogTitle>
          {current && (
            <div className="relative flex h-[92vh] w-full items-center justify-center">
              {current.type === "video" || current.type === "video-vertical" ? (
                <video src={current.src} controls autoPlay className="max-h-full max-w-full object-contain" />
              ) : (
                <img
                  src={current.src}
                  alt={current.title}
                  className={cn(
                    "max-h-full max-w-full object-contain transition-transform duration-500",
                    zoom && "scale-150 cursor-zoom-out",
                  )}
                  onClick={() => setZoom((z) => !z)}
                />
              )}

              <button
                onClick={() => setZoom((z) => !z)}
                aria-label="Zoom"
                className="absolute right-16 top-4 grid h-10 w-10 place-items-center rounded-full bg-background/15 text-primary-foreground backdrop-blur transition-colors hover:bg-background/30"
              >
                <ZoomIn className="h-5 w-5" />
              </button>

              <button
                onClick={() => move(-1)}
                aria-label="Anterior"
                className="absolute left-4 grid h-11 w-11 place-items-center rounded-full bg-background/15 text-primary-foreground backdrop-blur transition-colors hover:bg-background/30"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => move(1)}
                aria-label="Siguiente"
                className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-background/15 text-primary-foreground backdrop-blur transition-colors hover:bg-background/30"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 bg-gradient-to-t from-primary to-transparent px-6 py-6">
                <div>
                  <p className="font-display text-lg text-primary-foreground">{current.title}</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-primary-foreground/60">
                    {current.category} · {index! + 1} / {visible.length}
                  </p>
                </div>
                {current.type === "tour" && (
                  <Badge className="gap-1.5 bg-teal text-teal-foreground">
                    <RotateCcw className="h-3.5 w-3.5" /> Tour 360°
                  </Badge>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Tile({ item, onClick, masonry }: { item: MediaItem; onClick: () => void; masonry?: boolean }) {
  const badge = typeBadge[item.type];
  const aspect = masonry
    ? item.ratio === "tall"
      ? "aspect-[3/4]"
      : item.ratio === "wide"
        ? "aspect-[4/3]"
        : "aspect-square"
    : "aspect-[4/3]";

  return (
    <button
      onClick={onClick}
      className={cn(
        "zoom-frame group relative block w-full break-inside-avoid rounded-2xl border border-border/60 bg-muted text-left shadow-soft transition-shadow hover:shadow-lift",
        aspect,
      )}
    >
      {item.type === "video" || item.type === "video-vertical" ? (
        <video src={item.src} className="h-full w-full rounded-2xl object-cover" />
      ) : (
        <img
          src={item.src}
          alt={item.title}
          loading="lazy"
          className="h-full w-full rounded-2xl object-cover"
        />
      )}
      <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-primary/70 via-primary/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      {badge && (
        <Badge className="absolute left-3 top-3 gap-1 bg-background/90 text-foreground backdrop-blur">
          {item.type === "tour" ? <RotateCcw className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {badge}
        </Badge>
      )}
      <span className="pointer-events-none absolute bottom-4 left-4 translate-y-2 font-display text-sm text-primary-foreground opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
        {item.title}
      </span>
    </button>
  );
}
