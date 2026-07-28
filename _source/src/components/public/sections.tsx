import { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import { Star, Quote } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { amenities, experiences, faqs, reviews } from "@/data/site";
import { getCurrentLanguage, Language, translations } from "@/lib/i18n";
import { settingService } from "@/lib/services";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && (
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-teal">{eyebrow}</p>
      )}
      <h2 className="mt-3 font-display text-3xl font-semibold leading-[1.1] text-balance-tight sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

export function ExperienceBlocks() {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [currentLang, setCurrentLang] = useState<Language>(getCurrentLanguage());

  useEffect(() => {
    const onLangChange = (e: any) => setCurrentLang(e.detail);
    window.addEventListener("language_changed", onLangChange);

    const load = async () => {
      try {
        const s = await settingService.get();
        if (s.experienceBlocks && s.experienceBlocks.length > 0) {
          setBlocks(s.experienceBlocks);
        } else {
          setBlocks(experiences.map((exp) => ({ title: exp.title, description: exp.text, image: exp.image, badge: exp.tag })));
        }
      } catch (e) {
        console.error("Error al cargar bloques de experiencia:", e);
      }
    };
    load();
    return () => window.removeEventListener("language_changed", onLangChange);
  }, []);

  return (
    <div className="space-y-24 md:space-y-32">
      {blocks.map((exp, i) => {
        const title = (currentLang === "en" && exp.title_en) || (currentLang === "pt" && exp.title_pt) || exp.title;
        const description = (currentLang === "en" && exp.description_en) || (currentLang === "pt" && exp.description_pt) || exp.description || exp.text;

        return (
          <div
            key={exp.id || exp.title}
            className="grid items-center gap-8 md:grid-cols-2 md:gap-16"
          >
            <div className={`zoom-frame rounded-3xl shadow-soft ${i % 2 === 1 ? "md:order-2" : ""}`}>
              <img
                src={exp.image}
                alt={title}
                loading="lazy"
                className="aspect-[4/3] w-full rounded-3xl object-cover"
              />
            </div>
            <div className={i % 2 === 1 ? "md:order-1 md:pr-8" : "md:pl-8"}>
              {exp.badge && (
                <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em]">
                  {exp.badge}
                </Badge>
              )}
              <h3 className="mt-5 font-display text-2xl font-semibold leading-tight sm:text-3xl md:text-4xl">
                {title}
              </h3>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">{description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AmenitiesGrid() {
  const [list, setList] = useState<any[]>([]);
  const [currentLang, setCurrentLang] = useState<Language>(getCurrentLanguage());

  useEffect(() => {
    const onLangChange = (e: any) => setCurrentLang(e.detail);
    window.addEventListener("language_changed", onLangChange);

    const load = async () => {
      try {
        const s = await settingService.get();
        if (s.amenities && s.amenities.length > 0) {
          setList(s.amenities.filter((a: any) => a.visible !== false));
        } else {
          setList(amenities.map((a) => ({ title: a.label, description: a.detail, icon: a.icon })));
        }
      } catch (e) {
        console.error("Error al cargar características:", e);
      }
    };
    load();
    return () => window.removeEventListener("language_changed", onLangChange);
  }, []);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {list.map((a) => {
        const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[a.icon] ?? Icons.Check;
        const title = (currentLang === "en" && a.title_en) || (currentLang === "pt" && a.title_pt) || a.title || a.label;
        const description = (currentLang === "en" && a.description_en) || (currentLang === "pt" && a.description_pt) || a.description || a.detail;

        return (
          <Card key={a.id || a.title} className="hover-lift border-border/70 bg-card shadow-soft">
            <CardContent className="p-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-accent-foreground">
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-4 font-display text-base font-semibold">{title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function Testimonials() {
  return (
    <Carousel opts={{ align: "start", loop: true }} className="mt-12">
      <CarouselContent className="-ml-4">
        {reviews
          .filter((r) => r.visible)
          .map((r) => (
            <CarouselItem key={r.id} className="pl-4 sm:basis-1/2 lg:basis-1/3">
              <Card className="h-full border-border/70 shadow-soft">
                <CardContent className="flex h-full flex-col p-7">
                  <Quote className="h-6 w-6 text-teal" />
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-foreground/85">"{r.comment}"</p>
                  <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent font-display text-sm font-semibold text-accent-foreground">
                      {r.name.split(" ").map((n) => n[0]).join("")}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-display text-sm font-semibold">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.country}</p>
                    </div>
                    <span className="ml-auto flex shrink-0 items-center gap-1 text-sm">
                      <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                      {r.rating.toFixed(1)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
      </CarouselContent>
      <div className="mt-8 flex justify-center gap-3">
        <CarouselPrevious className="static translate-y-0" />
        <CarouselNext className="static translate-y-0" />
      </div>
    </Carousel>
  );
}

export function FaqAccordion() {
  return (
    <Accordion type="single" collapsible className="mt-10 w-full">
      {faqs.map((f, i) => (
        <AccordionItem key={f.q} value={`item-${i}`} className="border-border">
          <AccordionTrigger className="py-6 text-left font-display text-lg font-medium hover:no-underline">
            {f.q}
          </AccordionTrigger>
          <AccordionContent className="pb-6 text-base leading-relaxed text-muted-foreground">
            {f.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
