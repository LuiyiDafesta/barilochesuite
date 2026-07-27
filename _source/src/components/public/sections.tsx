import * as Icons from "lucide-react";
import { Star, Quote } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { amenities, experiences, faqs, reviews } from "@/data/site";

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
  return (
    <div className="space-y-24 md:space-y-32">
      {experiences.map((exp, i) => (
        <div
          key={exp.title}
          className="grid items-center gap-8 md:grid-cols-2 md:gap-16"
        >
          <div className={`zoom-frame rounded-3xl shadow-soft ${i % 2 === 1 ? "md:order-2" : ""}`}>
            <img
              src={exp.image}
              alt={exp.title}
              loading="lazy"
              className="aspect-[4/3] w-full rounded-3xl object-cover"
            />
          </div>
          <div className={i % 2 === 1 ? "md:order-1 md:pr-8" : "md:pl-8"}>
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em]">
              {exp.tag}
            </Badge>
            <h3 className="mt-5 font-display text-2xl font-semibold leading-tight sm:text-3xl md:text-4xl">
              {exp.title}
            </h3>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">{exp.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AmenitiesGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {amenities.map((a) => {
        const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[a.icon] ?? Icons.Check;
        return (
          <Card key={a.label} className="hover-lift border-border/70 bg-card shadow-soft">
            <CardContent className="p-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-accent-foreground">
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-4 font-display text-base font-semibold">{a.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{a.detail}</p>
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
