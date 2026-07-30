import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown, MapPin, Star } from "lucide-react";

import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { GalleryExplorer } from "@/components/public/GalleryExplorer";
import { BookingSection } from "@/components/public/BookingSection";
import {
  AmenitiesGrid,
  ExperienceBlocks,
  FaqAccordion,
  SectionHeading,
  Testimonials,
} from "@/components/public/sections";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { heroContent as defaultHero, images, places, property } from "@/data/site";
import { getCurrentLanguage, Language, translations } from "@/lib/i18n";
import { PropertyItem, propertyService, settingService } from "@/lib/services";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Casa Nahuel — Departamento boutique frente al lago en Bariloche" },
      {
        name: "description",
        content:
          "Alojate en un departamento de alta gama con vistas al Nahuel Huapi. Diseño cálido, tres habitaciones, parrilla y garage en San Carlos de Bariloche.",
      },
      { property: "og:title", content: "Casa Nahuel — Departamento boutique en Bariloche" },
      {
        property: "og:description",
        content: "Un refugio de montaña de alta gama frente al Nahuel Huapi, en San Carlos de Bariloche.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LodgingBusiness",
          name: property.name,
          address: {
            "@type": "PostalAddress",
            addressLocality: property.city,
            addressRegion: "Río Negro",
            addressCountry: "AR",
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: property.rating,
            reviewCount: property.reviewsCount,
          },
        }),
      },
    ],
  }),
  component: Home,
});

function Home() {
  const [currentLang, setCurrentLang] = useState<Language>(getCurrentLanguage());
  const [mainProp, setMainProp] = useState<PropertyItem | null>(null);
  const [hero, setHero] = useState({
    eyebrow: defaultHero.eyebrow,
    title: defaultHero.title,
    subtitle: defaultHero.subtitle,
    bgImage: images.heroExterior,
  });

  useEffect(() => {
    const onLangChange = (e: any) => setCurrentLang(e.detail);
    window.addEventListener("language_changed", onLangChange);

    const loadHero = async () => {
      try {
        const [s, propsData] = await Promise.all([
          settingService.get(),
          propertyService.getAll(),
        ]);
        const activeMain = propsData.find((p) => p.isMain && p.active !== false) || propsData[0];
        if (activeMain) {
          setMainProp(activeMain);
        }

        const eyebrow = (currentLang === "en" && s.heroEyebrow_en) || (currentLang === "pt" && s.heroEyebrow_pt) || s.heroEyebrow || defaultHero.eyebrow;
        const title = (currentLang === "en" && s.heroTitle_en) || (currentLang === "pt" && s.heroTitle_pt) || s.heroTitle || defaultHero.title;
        const subtitle = (currentLang === "en" && s.heroSubtitle_en) || (currentLang === "pt" && s.heroSubtitle_pt) || s.heroSubtitle || defaultHero.subtitle;

        setHero({
          eyebrow,
          title,
          subtitle,
          bgImage: s.heroBgImage || images.heroExterior,
        });
      } catch (e) {
        console.error("Error al cargar hero:", e);
      }
    };
    loadHero();
    return () => window.removeEventListener("language_changed", onLangChange);
  }, [currentLang]);

  const tNav = translations[currentLang]?.nav || translations.es.nav;
  const tHero = translations[currentLang]?.hero || translations.es.hero;
  const tSec = translations[currentLang]?.sections || translations.es.sections;

  return (
    <div className="min-h-screen bg-background">
      <Navbar transparent />

      {/* HERO */}
      <section className="relative flex min-h-screen items-end overflow-hidden">
        <img
          src={hero.bgImage}
          alt="Fachada iluminada del departamento"
          width={1920}
          height={1088}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/35 to-primary/40" />

        <div className="relative mx-auto w-full max-w-7xl px-5 pb-24 pt-32 lg:px-8">
          <p className="reveal text-xs font-medium uppercase tracking-[0.28em] text-primary-foreground/75">
            {hero.eyebrow}
          </p>
          <h1 className="reveal mt-6 max-w-3xl font-display text-4xl font-semibold leading-[1.05] text-balance-tight text-primary-foreground sm:text-6xl lg:text-7xl">
            {hero.title}
          </h1>
          <p className="reveal mt-6 max-w-xl text-base leading-relaxed text-primary-foreground/80 sm:text-lg">
            {hero.subtitle}
          </p>

          <div className="reveal mt-10 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded-full bg-background px-8 text-foreground hover:bg-background/90">
              <Link to="/reservar">
                {tHero.checkAvailability} <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-primary-foreground/40 bg-transparent px-8 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link to="/galeria">{tHero.viewGallery}</Link>
            </Button>
          </div>

          <div className="mt-16 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-primary-foreground/75">
            <span className="flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-warning text-warning" /> {property.rating} · {property.reviewsCount} {tHero.reviews}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> {property.city}, {property.region}
            </span>
            <span>
              {mainProp?.maxGuests ?? property.guests} {tHero.guests} · {mainProp?.bedrooms ?? property.bedrooms} {tHero.bedrooms} · {mainProp?.bathrooms ?? property.bathrooms} {tHero.bathrooms}
            </span>
          </div>

          <div className="mt-14 flex justify-center">
            <ChevronDown className="animate-scroll-hint h-6 w-6 text-primary-foreground/70" />
          </div>
        </div>
      </section>

      {/* EXPERIENCIA */}
      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
        <SectionHeading
          eyebrow={tSec.experienceEyebrow}
          title={tSec.experienceTitle}
          description="Cada ambiente fue pensado para que el paisaje sea el protagonista y vos sólo tengas que descansar."
        />
        <div className="mt-20">
          <ExperienceBlocks />
        </div>
      </section>

      {/* CARACTERISTICAS */}
      <section className="border-y border-border bg-secondary/30">
        <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
          <SectionHeading
            eyebrow={tSec.amenitiesEyebrow}
            title={tSec.amenitiesTitle}
            align="center"
          />
          <div className="mt-14">
            <AmenitiesGrid />
          </div>
        </div>
      </section>

      {/* GALERIA */}
      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow={tSec.galleryEyebrow}
            title={tSec.galleryTitle}
            description="Recorré cada ambiente antes de llegar."
          />
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/galeria">
              {tHero.viewGallery} <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-12">
          <GalleryExplorer compact />
        </div>
      </section>

      {/* UBICACION */}
      <section className="border-y border-border bg-secondary/30">
        <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
          <SectionHeading
            eyebrow={tSec.locationEyebrow}
            title={tSec.locationTitle}
            description="A minutos del Centro Cívico, del Cerro Catedral y de las mejores mesas de la ciudad."
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <div className="overflow-hidden rounded-3xl border border-border shadow-soft">
              <iframe
                title="Mapa de Casa Nahuel"
                src="https://www.openstreetmap.org/export/embed.html?bbox=-71.46%2C-41.17%2C-71.22%2C-41.07&layer=mapnik"
                className="h-[420px] w-full"
                loading="lazy"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {places
                .filter((p) => p.visible)
                .slice(0, 3)
                .map((p) => (
                  <Card key={p.id} className="hover-lift overflow-hidden border-border/70 shadow-soft">
                    <CardContent className="flex gap-4 p-4">
                      <img
                        src={p.image}
                        alt={p.name}
                        loading="lazy"
                        className="h-20 w-20 shrink-0 rounded-xl object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-display text-base font-semibold">{p.name}</p>
                        <p className="text-xs text-teal">{p.distance}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              <Button asChild variant="ghost" className="justify-start rounded-full">
                <Link to="/ubicacion">
                  Ver todos los lugares cercanos <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* DISPONIBILIDAD */}
      <section id="disponibilidad" className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
        <SectionHeading
          eyebrow="Disponibilidad"
          title="Elegí tus fechas y mirá el precio estimado"
          description="La disponibilidad se valida siempre antes de confirmar: también recibimos reservas de Airbnb y otros canales."
        />
        <div className="mt-12">
          <BookingSection />
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="border-y border-border bg-secondary/30">
        <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
          <SectionHeading eyebrow="Huéspedes" title="Lo que dicen quienes ya se quedaron" align="center" />
          <Testimonials />
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-5 py-24 lg:py-32">
        <SectionHeading eyebrow="Preguntas frecuentes" title="Todo lo que querés saber" align="center" />
        <FaqAccordion />
      </section>

      <Footer />
    </div>
  );
}
