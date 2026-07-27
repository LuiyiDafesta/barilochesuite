import { createFileRoute } from "@tanstack/react-router";

import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { BookingSection } from "@/components/public/BookingSection";
import { SectionHeading } from "@/components/public/sections";

export const Route = createFileRoute("/reservar")({
  head: () => ({
    meta: [
      { title: "Consultar disponibilidad — Casa Nahuel Bariloche" },
      {
        name: "description",
        content:
          "Elegí tus fechas, mirá el precio estimado y enviá tu consulta. Confirmamos la disponibilidad real en menos de 24 horas.",
      },
      { property: "og:title", content: "Consultar disponibilidad — Casa Nahuel" },
      {
        property: "og:description",
        content: "Calendario de disponibilidad y cotización estimada del departamento boutique en Bariloche.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/reservar" },
    ],
    links: [{ rel: "canonical", href: "/reservar" }],
  }),
  component: ReservarPage,
});

function ReservarPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 pb-24 pt-32 lg:px-8 lg:pt-40">
        <SectionHeading
          eyebrow="Disponibilidad"
          title="Reservá tus fechas en Casa Nahuel"
          description="Seleccioná check in y check out para ver el precio estimado. Ninguna reserva se confirma automáticamente: validamos la disponibilidad real porque también recibimos reservas de Airbnb y otros canales."
        />
        <div className="mt-14">
          <BookingSection />
        </div>
      </main>
      <Footer />
    </div>
  );
}
