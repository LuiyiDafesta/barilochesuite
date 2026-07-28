import { useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { CalendarDays, Home, MapPin, ShieldCheck, Sparkles, Users } from "lucide-react";
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
import { buildOccupancyMap, calculateEstimatedPrice, checkRangeOverlap, formatLong, nightsBetween, sameDay } from "@/lib/dates";
import { getCurrentLanguage, Language, translations } from "@/lib/i18n";
import { blockService, PropertyItem, propertyService, rateService, reservationService, settingService } from "@/lib/services";

// Leyenda Pública simplificada
const legend = [
  { label: "Disponible", className: "bg-background border border-border" },
  { label: "No disponible (Ocupado)", className: "bg-primary/85 text-primary-foreground" },
];

export function BookingSection() {
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [selectedPropId, setSelectedPropId] = useState<string>("p_nahuel");
  const [settings, setSettings] = useState<any>({});
  const [rateRules, setRateRules] = useState<any[]>([]);

  const [range, setRange] = useState<DateRange | undefined>();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);

  const [currentLang, setCurrentLang] = useState<Language>(getCurrentLanguage());

  useEffect(() => {
    const onLangChange = (e: any) => setCurrentLang(e.detail);
    window.addEventListener("language_changed", onLangChange);
    return () => window.removeEventListener("language_changed", onLangChange);
  }, []);

  const t = translations[currentLang]?.booking || translations.es.booking;

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [rawProps, settsData] = await Promise.all([
          propertyService.getAll(),
          settingService.get(),
        ]);
        const activeList = rawProps.filter((p) => p.active !== false);
        setProperties(activeList);
        setSettings(settsData);
        const mainProp = activeList.find((p) => p.isMain) || activeList[0];
        if (mainProp) setSelectedPropId(mainProp.id);

        const [resData, blockData, rateData] = await Promise.all([
          reservationService.getAll(mainProp?.id),
          blockService.getAll(mainProp?.id),
          rateService.getAll(mainProp?.id),
        ]);
        setReservations(resData as any);
        setBlocks(blockData as any);
        setRateRules(rateData);
      } catch (e) {
        console.error("Error al cargar datos públicos de Supabase:", e);
      }
    };
    loadAll();
  }, []);

  const handleSelectProperty = async (propId: string) => {
    setSelectedPropId(propId);
    setRange(undefined);
    try {
      const [resData, blockData, rateData] = await Promise.all([
        reservationService.getAll(propId),
        blockService.getAll(propId),
        rateService.getAll(propId),
      ]);
      setReservations(resData as any);
      setBlocks(blockData as any);
      setRateRules(rateData);
    } catch (e) {
      console.error("Error al filtrar por propiedad:", e);
    }
  };

  const activeProp = properties.find((p) => p.id === selectedPropId) || properties[0] || {
    id: "p_nahuel",
    name: property.name,
    address: property.address,
    basePrice: property.basePrice,
    maxGuests: 4,
    petsAllowed: false,
  };

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

  const priceCalc = useMemo(() => {
    if (!range?.from || !range?.to || !activeProp) return null;
    const yearFrom = range.from.getFullYear();
    const monthFrom = String(range.from.getMonth() + 1).padStart(2, "0");
    const dayFrom = String(range.from.getDate()).padStart(2, "0");
    const fromStr = `${yearFrom}-${monthFrom}-${dayFrom}`;

    const yearTo = range.to.getFullYear();
    const monthTo = String(range.to.getMonth() + 1).padStart(2, "0");
    const dayTo = String(range.to.getDate()).padStart(2, "0");
    const toStr = `${yearTo}-${monthTo}-${dayTo}`;

    return calculateEstimatedPrice(fromStr, toStr, rateRules, settings, activeProp.basePrice);
  }, [range, rateRules, settings, activeProp]);

  const basePrice = activeProp.basePrice || property.basePrice;
  const subtotal = priceCalc && priceCalc.nights > 0 ? priceCalc.amount : nights * basePrice;
  const displayRatePerNight = priceCalc && priceCalc.nights > 0 ? priceCalc.averagePerNight : basePrice;
  const cleaningFee = Number(settings.cleaningFee || 0);
  const taxPercent = Number(settings.taxPercent || 0);
  const taxes = taxPercent > 0 ? Math.round((subtotal + cleaningFee) * (taxPercent / 100)) : 0;
  const total = subtotal + cleaningFee + taxes;

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

    toast.success(`Consulta de disponibilidad para "${activeProp.name}" enviada`, {
      description: "Validamos tu solicitud y te respondemos por WhatsApp o email en breve.",
    });
  };

  return (
    <div className="space-y-8">
      {/* Selector de Propiedad si hay 2 o más activas */}
      {properties.length > 1 && (
        <div className="rounded-3xl border border-border/80 bg-card p-4 sm:p-6 shadow-soft space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Home className="h-4 w-4 text-teal" /> {t.selectProperty}
          </div>
          <div className="flex flex-wrap gap-3">
            {properties.map((p) => {
              const selected = p.id === selectedPropId;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectProperty(p.id)}
                  className={`flex flex-col items-start gap-1 rounded-2xl border px-5 py-3 text-left transition-all ${
                    selected
                      ? "border-teal bg-teal/15 text-teal shadow-soft"
                      : "border-border/80 bg-secondary/30 text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  }`}
                >
                  <span className="font-display text-sm font-semibold text-foreground flex items-center gap-1.5">
                    {p.name} {p.petsAllowed && "🐾"}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {p.address} · Hasta {p.maxGuests} personas
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-16">
        <div>
          <Card className="overflow-hidden border-border/70 shadow-soft">
            <CardContent className="p-4 sm:p-6">
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-secondary/40 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{t.checkIn}</p>
                  <p className="mt-1 truncate font-display text-sm font-semibold">{formatLong(range?.from)}</p>
                </div>
                <div className="rounded-xl border border-border bg-secondary/40 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{t.checkOut}</p>
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

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-4">
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-3 w-3 rounded-[4px] bg-primary/85" />
                  {t.occupied}
                </span>
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-3 w-3 rounded-[4px] bg-secondary border border-border" />
                  {t.available}
                </span>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={submit} className="mt-8">
            <h3 className="font-display text-xl font-semibold">{t.yourTrip}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Reserva para <span className="font-semibold text-foreground">{activeProp.name}</span> ({activeProp.address}).
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nombre">{t.firstName}</Label>
                <Input id="nombre" placeholder="Valentina" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellido">{t.lastName}</Label>
                <Input id="apellido" placeholder="Rossi" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t.email}</Label>
                <Input id="email" type="email" placeholder="vos@email.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">{t.phone}</Label>
                <Input id="whatsapp" placeholder="+54 9 294 ..." required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adultos">Adultos</Label>
                <Select defaultValue="2">
                  <SelectTrigger id="adultos">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: activeProp.maxGuests || 4 }, (_, i) => i + 1).map((n) => (
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
                    {[0, 1, 2, 3].map((n) => (
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
              {activeProp.petsAllowed && (
                <div className="sm:col-span-2 flex items-center gap-3 rounded-xl border border-border bg-secondary/30 px-4 py-3">
                  <Checkbox id="mascotas" />
                  <Label htmlFor="mascotas" className="text-sm font-normal text-muted-foreground">
                    Viajo con mascota 🐾 (sujeto a confirmación)
                  </Label>
                </div>
              )}
            </div>

            <Button type="submit" size="lg" className="mt-6 w-full rounded-full sm:w-auto sm:px-10">
              {t.sendInquiry}
            </Button>
          </form>
        </div>

        <div className="lg:sticky lg:top-28 lg:h-fit">
          <Card className="border-border/70 shadow-lift">
            <CardContent className="p-6">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-display text-2xl font-semibold">{formatARS(displayRatePerNight)}</p>
                <span className="text-sm text-muted-foreground">{nights > 0 ? `/${t.nights}` : `/${t.nights}`}</span>
              </div>
              <p className="mt-1 text-xs text-teal font-medium">{activeProp.name}</p>

              <Separator className="my-5" />

              {nights > 0 ? (
                <div className="space-y-3 text-sm">
                  {priceCalc && priceCalc.breakdown.length > 0 ? (
                    priceCalc.breakdown.map((item, idx) => (
                      <Row
                        key={idx}
                        label={
                          priceCalc.breakdown.length > 1
                            ? `${formatARS(item.pricePerNight)} × ${item.nights} ${item.nights === 1 ? t.nights : t.nights} (${item.label})`
                            : `${formatARS(item.pricePerNight)} × ${item.nights} ${item.nights === 1 ? t.nights : t.nights}`
                        }
                        value={formatARS(item.total)}
                      />
                    ))
                  ) : (
                    <Row label={`${formatARS(displayRatePerNight)} × ${nights} ${t.nights}`} value={formatARS(total)} />
                  )}
                  {priceCalc && priceCalc.discountAmount > 0 && (
                    <Row label={priceCalc.discountLabel} value={`-${formatARS(priceCalc.discountAmount)}`} />
                  )}
                  {cleaningFee > 0 && <Row label="Limpieza final" value={formatARS(cleaningFee)} />}
                  {taxes > 0 && <Row label={`Impuestos (${taxPercent}%)`} value={formatARS(taxes)} />}
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
