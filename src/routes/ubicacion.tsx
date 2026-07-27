import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Navigation } from "lucide-react";

import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { SectionHeading } from "@/components/public/sections";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { places, property } from "@/data/site";

export const Route = createFileRoute("/ubicacion")({
  head: () => ({
    meta: [
      { title: "Ubicación y lugares cercanos — Casa Nahuel Bariloche" },
      {
        name: "description",
        content:
          "Av. Bustillo km 6,4: a 8 minutos del Centro Cívico y 20 del Cerro Catedral. Descubrí playas, restaurantes y excursiones cercanas.",
      },
      { property: "og:title", content: "Ubicación — Casa Nahuel Bariloche" },
      {
        property: "og:description",
        content: "Entre el lago y la montaña, sobre el corredor de Bustillo en San Carlos de Bariloche.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/ubicacion" },
    ],
    links: [{ rel: "canonical", href: "/ubicacion" }],
  }),
  component: UbicacionPage,
});

function UbicacionPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 pb-24 pt-32 lg:px-8 lg:pt-40">
        <SectionHeading
          eyebrow="Ubicación"
          title="Entre el lago y la montaña"
          description={`${property.address}. A pasos de las playas del Nahuel Huapi y con acceso directo al Circuito Chico.`}
        />

        <div className="mt-12 overflow-hidden rounded-3xl border border-border shadow-soft">
          <iframe
            title="Mapa de Casa Nahuel"
            src="https://www.openstreetmap.org/export/embed.html?bbox=-71.52%2C-41.19%2C-71.18%2C-41.05&layer=mapnik"
            className="h-[520px] w-full"
            loading="lazy"
          />
        </div>

        <div className="mt-16">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">Lugares cercanos</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {places
              .filter((p) => p.visible)
              .map((p) => (
                <Card key={p.id} className="hover-lift overflow-hidden border-border/70 py-0 shadow-soft">
                  <div className="zoom-frame">
                    <img src={p.image} alt={p.name} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                  </div>
                  <CardContent className="p-6">
                    <Badge variant="secondary" className="rounded-full text-[11px] uppercase tracking-[0.14em]">
                      {p.category}
                    </Badge>
                    <h3 className="mt-3 font-display text-lg font-semibold">{p.name}</h3>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-teal">
                      <Navigation className="h-3.5 w-3.5" /> {p.distance}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>

        <div className="mt-16 flex items-start gap-3 rounded-2xl border border-border bg-secondary/40 p-6">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-teal" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            La dirección exacta y las instrucciones de acceso se comparten una vez confirmada la reserva.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
