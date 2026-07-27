import { createFileRoute } from "@tanstack/react-router";

import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { GalleryExplorer } from "@/components/public/GalleryExplorer";
import { SectionHeading } from "@/components/public/sections";

export const Route = createFileRoute("/galeria")({
  head: () => ({
    meta: [
      { title: "Galería — Casa Nahuel Bariloche" },
      {
        name: "description",
        content:
          "Fotos, videos, tomas de drone y tour virtual 360° del departamento boutique Casa Nahuel en San Carlos de Bariloche.",
      },
      { property: "og:title", content: "Galería — Casa Nahuel Bariloche" },
      {
        property: "og:description",
        content: "Recorré cada ambiente: interiores, habitaciones, cocina, baños, terraza y vistas al lago.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/galeria" },
    ],
    links: [{ rel: "canonical", href: "/galeria" }],
  }),
  component: GaleriaPage,
});

function GaleriaPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 pb-24 pt-32 lg:px-8 lg:pt-40">
        <SectionHeading
          eyebrow="Galería premium"
          title="Cada rincón, en detalle"
          description="Fotografías, videos verticales, tomas de drone y un tour virtual 360° para recorrer el departamento antes de llegar."
        />
        <div className="mt-14">
          <GalleryExplorer />
        </div>
      </main>
      <Footer />
    </div>
  );
}
