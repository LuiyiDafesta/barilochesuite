import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import type { DateRange } from "react-day-picker";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Home,
  KeyRound,
  Loader2,
  MapPin,
  Mountain,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wifi,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Block, formatARS, property as defaultProperty, Reservation } from "@/data/site";
import { buildOccupancyMap, checkRangeOverlap, formatLong, nightsBetween, sameDay } from "@/lib/dates";
import { GalleryExplorer } from "@/components/public/GalleryExplorer";
import { blockService, PropertyItem, propertyService, reservationService, reviewService } from "@/lib/services";

export const Route = createFileRoute("/propiedad/$id")({
  component: DetallePropiedad,
});

function DetallePropiedad() {
  const { id } = Route.useParams();
  const [prop, setProp] = useState<PropertyItem | null>(null);
  const [loading, setLoading] = useState(true);

  const [range, setRange] = useState<DateRange | undefined>();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    const loadPropertyData = async () => {
      try {
        setLoading(true);
        const propsData = await propertyService.getAll();
        const found = propsData.find((p) => p.id === id) || propsData[0];
        setProp(found);

        if (found) {
          const [resData, blockData, revData] = await Promise.all([
            reservationService.getAll(found.id),
            blockService.getAll(found.id),
            reviewService.getAll(found.id),
          ]);
          setReservations(resData as any);
          setBlocks(blockData as any);
          setReviews(revData);
        }
      } catch (e) {
        console.error("Error al cargar detalle de propiedad:", e);
      } finally {
        setLoading(false);
      }
    };
    loadPropertyData();
  }, [id]);

  const occupancy = useMemo(() => buildOccupancyMap(reservations, blocks), [reservations, blocks]);
  const nights = nightsBetween(range?.from, range?.to);

  const allOccupiedDates = useMemo(() => {
    return [
      ...occupancy.reservada,
      ...occupancy.pendiente,
      ...occupancy.bloqueada,
      ...occupancy.mantenimiento,
      ...occupancy.personal,
    ];
  }, [occupancy]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-teal" />
      </div>
    );
  }

  if (!prop) throw notFound();

  const basePrice = prop.basePrice || 185000;
  const subtotal = nights * basePrice;
  const taxes = Math.round((subtotal + defaultProperty.cleaningFee) * defaultProperty.taxRate);
  const total = subtotal + defaultProperty.cleaningFee + taxes;

  const isDayDisabled = (day: Date) => {
    const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
    if (isPast) return true;
    return allOccupiedDates.some((d) => sameDay(d, day));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!range?.from || !range?.to) {
      toast.error("Por favor seleccioná las fechas de tu estadía.");
      return;
    }

    const fromStr = range.from.toISOString().split("T")[0];
    const toStr = range.to.toISOString().split("T")[0];

    const conflict = checkRangeOverlap(fromStr, toStr, reservations, blocks);
    if (conflict.hasConflict) {
      toast.error("Las fechas seleccionadas ya no están disponibles.");
      return;
    }

    toast.success(`Consulta enviada para "${prop.name}"`, {
      description: "Te responderemos a la brevedad por WhatsApp o email.",
    });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-10 py-8 px-4 sm:px-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 rounded-full">
        <Link to="/propiedades">
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Volver al catálogo de propiedades
        </Link>
      </Button>

      {/* Hero Propiedad */}
      <div className="rounded-3xl border border-border/80 bg-gradient-to-r from-primary via-primary/95 to-primary p-8 text-primary-foreground shadow-lift space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge className="bg-teal text-teal-foreground font-semibold">
              {prop.isMain ? "Propiedad Principal" : "Residencia Exclusiva"}
            </Badge>
            {prop.petsAllowed && (
              <Badge className="bg-white/20 text-white backdrop-blur-md">
                Pet Friendly 🐾
              </Badge>
            )}
          </div>
          <p className="font-display text-2xl font-bold text-teal">
            {formatARS(basePrice)} <span className="text-xs text-white/70 font-normal">/ noche</span>
          </p>
        </div>

        <div>
          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight">{prop.name}</h1>
          <p className="mt-2 text-sm sm:text-base text-primary-foreground/80 flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-teal" /> {prop.address} · Hasta {prop.maxGuests} personas
          </p>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-16">
        <div className="space-y-10">
          {/* Comodidades de la Propiedad */}
          <Card className="border-border/70 shadow-soft">
            <CardHeader>
              <CardTitle className="font-display text-xl">Comodidades y Servicios de {prop.name}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-2xl border border-border p-4">
                <Wifi className="h-5 w-5 text-teal" />
                <div>
                  <p className="text-sm font-semibold">WiFi de Alta Velocidad</p>
                  <p className="text-xs text-muted-foreground">{prop.wifiNetwork || "Red dedicada"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-border p-4">
                <KeyRound className="h-5 w-5 text-teal" />
                <div>
                  <p className="text-sm font-semibold">Cerradura Digital / Caja Fuerte</p>
                  <p className="text-xs text-muted-foreground">Check-in autónomo sin llave física</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-border p-4">
                <Users className="h-5 w-5 text-teal" />
                <div>
                  <p className="text-sm font-semibold">Capacidad Máxima</p>
                  <p className="text-xs text-muted-foreground">{prop.maxGuests} personas cómodamente</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-border p-4">
                <MapPin className="h-5 w-5 text-teal" />
                <div>
                  <p className="text-sm font-semibold">Ubicación Privilegiada</p>
                  <p className="text-xs text-muted-foreground">{prop.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Galería Exclusiva de la Propiedad */}
          <Card className="border-border/70 shadow-soft">
            <CardHeader>
              <CardTitle className="font-display text-xl">Galería de fotos de {prop.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <GalleryExplorer propertyId={prop.id} />
            </CardContent>
          </Card>

          {/* Calendario de Disponibilidad */}
          <Card className="overflow-hidden border-border/70 shadow-soft">
            <CardHeader>
              <CardTitle className="font-display text-xl">Disponibilidad de {prop.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-secondary/40 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Check in</p>
                  <p className="mt-1 truncate font-display text-sm font-semibold">{formatLong(range?.from)}</p>
                </div>
                <div className="rounded-xl border border-border bg-secondary/40 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Check out</p>
                  <p className="mt-1 truncate font-display text-sm font-semibold">{formatLong(range?.to)}</p>
                </div>
              </div>

              <Calendar
                mode="range"
                numberOfMonths={2}
                selected={range}
                onSelect={setRange}
                disabled={isDayDisabled}
                modifiers={{
                  ocupada: allOccupiedDates,
                }}
                modifiersClassNames={{
                  ocupada: "bg-primary/85 text-primary-foreground rounded-md font-medium opacity-85",
                }}
                className="w-full [--cell-size:2.4rem]"
              />
            </CardContent>
          </Card>

          {/* Formulario de Consulta */}
          <form onSubmit={submit} className="rounded-3xl border border-border bg-card p-6 shadow-soft space-y-4">
            <h3 className="font-display text-xl font-semibold">Reservar en {prop.name}</h3>
            <p className="text-sm text-muted-foreground">
              Completá el formulario para consultar disponibilidad directa.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input id="nombre" placeholder="Tu nombre" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido</Label>
                <Input id="apellido" placeholder="Tu apellido" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="vos@email.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input id="whatsapp" placeholder="+54 9 294 ..." required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adultos">Adultos</Label>
                <Select defaultValue="2">
                  <SelectTrigger id="adultos">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: prop.maxGuests }, (_, i) => i + 1).map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} {n === 1 ? "adulto" : "adultos"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ninos">Niños</Label>
                <Select defaultValue="0">
                  <SelectTrigger id="ninos">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} {n === 1 ? "niño" : "niños"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full rounded-full mt-4">
              Consultar disponibilidad en {prop.name}
            </Button>
          </form>

          {/* Reseñas de la Propiedad */}
          {reviews.length > 0 && (
            <Card className="border-border/70 shadow-soft">
              <CardHeader>
                <CardTitle className="font-display text-xl">Opiniones sobre {prop.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="rounded-xl border border-border p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm">{r.name}</p>
                      <div className="flex text-warning">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-warning" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{r.comment}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Resumen Tarjeta */}
        <div className="lg:sticky lg:top-28 lg:h-fit">
          <Card className="border-border/70 shadow-lift">
            <CardContent className="p-6">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-display text-2xl font-semibold">{formatARS(basePrice)}</p>
                <span className="text-sm text-muted-foreground">por noche</span>
              </div>
              <p className="mt-1 text-xs text-teal font-medium">{prop.name}</p>

              <Separator className="my-5" />

              {nights > 0 ? (
                <div className="space-y-3 text-sm">
                  <Row label={`${formatARS(basePrice)} × ${nights} noches`} value={formatARS(subtotal)} />
                  <Row label="Limpieza final" value={formatARS(defaultProperty.cleaningFee)} />
                  <Row label="Impuestos" value={formatARS(taxes)} />
                  <Separator className="my-4" />
                  <div className="flex items-center justify-between font-bold">
                    <span>Total estimado</span>
                    <span className="text-xl text-teal">{formatARS(total)}</span>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
                  <CalendarDays className="mx-auto h-6 w-6 text-muted-foreground" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    Elegí tus fechas para calcular la tarifa total.
                  </p>
                </div>
              )}

              <Button className="mt-6 w-full rounded-full" size="lg" disabled={nights === 0} onClick={submit}>
                Consultar disponibilidad
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  );
}
