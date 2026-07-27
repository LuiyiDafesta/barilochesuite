import { useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { CalendarDays, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Block, formatARS, property, Reservation } from "@/data/site";
import { buildOccupancyMap, checkRangeOverlap, formatLong, nightsBetween, sameDay } from "@/lib/dates";
import { blockService, reservationService } from "@/lib/services";

const legend = [
  { label: "Disponible", className: "bg-background border border-border" },
  { label: "Reservado", className: "bg-primary/85" },
  { label: "Pendiente", className: "bg-warning" },
  { label: "Bloqueado", className: "bg-muted-foreground/40" },
];

export function BookingSection() {
  const [range, setRange] = useState<DateRange | undefined>();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);

  useEffect(() => {
    const loadOccupancy = async () => {
      try {
        const [resData, blockData] = await Promise.all([
          reservationService.getAll(),
          blockService.getAll(),
        ]);
        setReservations(resData as any);
        setBlocks(blockData as any);
      } catch (e) {
        console.error("Error al cargar ocupación pública de Supabase:", e);
      }
    };
    loadOccupancy();
  }, []);

  const occupancy = useMemo(() => buildOccupancyMap(reservations, blocks), [reservations, blocks]);
  const nights = nightsBetween(range?.from, range?.to);

  const subtotal = nights * property.basePrice;
  const taxes = Math.round((subtotal + property.cleaningFee) * property.taxRate);
  const total = subtotal + property.cleaningFee + taxes;

  const isDayDisabled = (day: Date) => {
    const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
    if (isPast) return true;
    const allTaken = [
      ...occupancy.reservada,
      ...occupancy.pendiente,
      ...occupancy.bloqueada,
      ...occupancy.mantenimiento,
      ...occupancy.personal,
    ];
    return allTaken.some((d) => sameDay(d, day));
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
      toast.error("Las fechas seleccionadas ya no están disponibles.", {
        description: conflict.reason,
      });
      return;
    }

    toast.success("Consulta de disponibilidad enviada", {
      description: "Validamos tu solicitud y te respondemos por WhatsApp o email en breve.",
    });
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-16">
      <div>
        <Card className="overflow-hidden border-border/70 shadow-soft">
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
                reservada: occupancy.reservada,
                pendiente: occupancy.pendiente,
                bloqueada: occupancy.bloqueada,
                mantenimiento: occupancy.mantenimiento,
                personal: occupancy.personal,
              }}
              modifiersClassNames={{
                reservada: "bg-primary/85 text-primary-foreground rounded-md line-through opacity-90",
                pendiente: "bg-warning text-warning-foreground rounded-md",
                bloqueada: "bg-muted-foreground/30 text-muted-foreground rounded-md",
                mantenimiento: "bg-lake/80 text-white rounded-md",
                personal: "bg-teal/80 text-white rounded-md",
              }}
              className="w-full [--cell-size:2.4rem]"
            />

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-4">
              {legend.map((l) => (
                <span key={l.label} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className={`h-3 w-3 rounded-[4px] ${l.className}`} />
                  {l.label}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <form onSubmit={submit} className="mt-8">
          <h3 className="font-display text-xl font-semibold">Contanos sobre tu viaje</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Completá tus datos y coordinamos todo por WhatsApp o email.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" placeholder="Valentina" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellido">Apellido</Label>
              <Input id="apellido" placeholder="Rossi" required />
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
                  {[1, 2, 3, 4, 5, 6].map((n) => (
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
                  {[0, 1, 2, 3, 4].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} {n === 1 ? "niño" : "niños"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="comentarios">Comentarios</Label>
              <Textarea id="comentarios" rows={4} placeholder="Contanos si viajás con mascota, horarios de llegada, etc." />
            </div>
            <div className="sm:col-span-2 flex items-center gap-3 rounded-xl border border-border bg-secondary/30 px-4 py-3">
              <Checkbox id="mascotas" />
              <Label htmlFor="mascotas" className="text-sm font-normal text-muted-foreground">
                Viajo con mascota (sujeto a confirmación)
              </Label>
            </div>
          </div>

          <Button type="submit" size="lg" className="mt-6 w-full rounded-full sm:w-auto sm:px-10">
            Consultar disponibilidad
          </Button>
        </form>
      </div>

      <div className="lg:sticky lg:top-28 lg:h-fit">
        <Card className="border-border/70 shadow-lift">
          <CardContent className="p-6">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-display text-2xl font-semibold">{formatARS(property.basePrice)}</p>
              <span className="text-sm text-muted-foreground">por noche</span>
            </div>

            <Separator className="my-5" />

            {nights > 0 ? (
              <div className="space-y-3 text-sm">
                <Row label={`${formatARS(property.basePrice)} × ${nights} ${nights === 1 ? "noche" : "noches"}`} value={formatARS(subtotal)} />
                <Row label="Limpieza final" value={formatARS(property.cleaningFee)} />
                <Row label="Impuestos y servicios" value={formatARS(taxes)} />
                <Separator className="my-4" />
                <div className="flex items-center justify-between">
                  <span className="font-display text-base font-semibold">Total estimado</span>
                  <span className="font-display text-xl font-semibold">{formatARS(total)}</span>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
                <CalendarDays className="mx-auto h-6 w-6 text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">
                  Elegí tus fechas en el calendario para ver el precio estimado.
                </p>
              </div>
            )}

            <Button className="mt-6 w-full rounded-full" size="lg" disabled={nights === 0} onClick={submit}>
              Consultar disponibilidad
            </Button>

            <div className="mt-5 space-y-3 text-xs leading-relaxed text-muted-foreground">
              <p className="flex gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
                No se cobra nada ahora. La reserva se confirma únicamente después de validar la disponibilidad real.
              </p>
              <p className="flex gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
                También recibimos reservas de Airbnb y Booking, por eso confirmamos cada fecha de forma manual.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}
