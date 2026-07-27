import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Home, Loader2, MapPin, Mountain, ShieldCheck, Sparkles, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatARS } from "@/data/admin";
import { property as defaultProperty } from "@/data/site";
import { PropertyItem, propertyService } from "@/lib/services";

export const Route = createFileRoute("/propiedades")({
  component: PropiedadesCatalog,
});

function PropiedadesCatalog() {
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true);
        const data = await propertyService.getAll();
        setProperties(data);
      } catch (e) {
        console.error("Error al cargar catálogo de propiedades:", e);
      } finally {
        setLoading(false);
      }
    };
    loadProperties();
  }, []);

  return (
    <div className="space-y-12 py-12 px-4 max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <Badge className="bg-teal/15 text-teal hover:bg-teal/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
          Portal de Hospedajes
        </Badge>
        <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight">
          Nuestras Propiedades en Bariloche
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
          Descubrí nuestras exclusivas residencias y departamentos de diseño frente al lago y en la base del Cerro Catedral.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-teal" />
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          {properties.map((p) => (
            <Card key={p.id} className="overflow-hidden border-border/80 shadow-lift transition-all hover:shadow-2xl">
              <div className="relative h-64 bg-gradient-to-tr from-primary to-primary/80 p-6 flex flex-col justify-between text-white">
                <div className="flex items-center justify-between">
                  {p.isMain ? (
                    <Badge className="bg-teal text-teal-foreground font-semibold">
                      Propiedad Principal
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-white/30 text-white font-medium">
                      Exclusivo
                    </Badge>
                  )}
                  {p.petsAllowed && (
                    <Badge className="bg-white/20 text-white backdrop-blur-md">
                      Pet Friendly 🐾
                    </Badge>
                  )}
                </div>

                <div className="space-y-1">
                  <h2 className="font-display text-2xl font-bold">{p.name}</h2>
                  <p className="text-xs text-white/80 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-teal" /> {p.address}
                  </p>
                </div>
              </div>

              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="rounded-xl border border-border bg-secondary/30 p-3">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Capacidad</p>
                    <p className="font-display font-semibold text-sm mt-0.5 flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-teal" /> Hasta {p.maxGuests} personas
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-secondary/30 p-3">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Tarifa base</p>
                    <p className="font-display font-semibold text-sm mt-0.5 text-teal">
                      {formatARS(p.basePrice)} <span className="text-[10px] text-muted-foreground font-normal">/ noche</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal shrink-0" /> {p.tagline || "Totalmente equipada con vistas panorámicas."}
                  </p>
                  <p className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-teal shrink-0" /> WiFi de alta velocidad, cerradura digital y check-in autónomo.
                  </p>
                </div>

                <Button asChild size="lg" className="w-full rounded-full group">
                  <Link to="/propiedad/$id" params={{ id: p.id }}>
                    Ver propiedad y disponibilidad <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
