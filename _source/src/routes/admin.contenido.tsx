import { createFileRoute } from "@tanstack/react-router";
import { Plus, Save } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/ui-bits";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { amenities, faqs, heroContent, property } from "@/data/site";

export const Route = createFileRoute("/admin/contenido")({
  component: Contenido,
});

function Contenido() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Contenido"
        description="Editá los textos del sitio público sin tocar código."
        actions={
          <Button size="sm" className="rounded-full" onClick={() => toast.success("Contenido publicado")}>
            <Save className="mr-1.5 h-3.5 w-3.5" /> Publicar cambios
          </Button>
        }
      />

      <Tabs defaultValue="hero">
        <TabsList>
          <TabsTrigger value="hero">Portada</TabsTrigger>
          <TabsTrigger value="descripcion">Descripción</TabsTrigger>
          <TabsTrigger value="servicios">Servicios</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="mt-6">
          <Card className="border-border/70 shadow-soft">
            <CardHeader>
              <CardTitle className="font-display text-base">Sección hero</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="eyebrow">Antetítulo</Label>
                <Input id="eyebrow" defaultValue={heroContent.eyebrow} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="titulo">Título</Label>
                <Input id="titulo" defaultValue={heroContent.title} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sub">Subtítulo</Label>
                <Textarea id="sub" rows={3} defaultValue={heroContent.subtitle} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="descripcion" className="mt-6">
          <Card className="border-border/70 shadow-soft">
            <CardHeader>
              <CardTitle className="font-display text-base">Sobre la propiedad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input id="nombre" defaultValue={property.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Descripción larga</Label>
                <Textarea
                  id="desc"
                  rows={8}
                  defaultValue={`${property.tagline}. ${property.name} está en ${property.address}, con capacidad para ${property.guests} huéspedes, ${property.bedrooms} dormitorios y ${property.bathrooms} baños.`}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="servicios" className="mt-6">
          <Card className="border-border/70 shadow-soft">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="font-display text-base">Servicios y comodidades</CardTitle>
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => toast("Nuevo servicio")}>
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Agregar
              </Button>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {amenities.map((a) => (
                <div key={a.label} className="rounded-xl border border-border px-4 py-3">
                  <p className="text-sm font-medium">{a.label}</p>
                  <p className="text-xs text-muted-foreground">{a.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="mt-6">
          <Card className="border-border/70 shadow-soft">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="font-display text-base">Preguntas frecuentes</CardTitle>
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => toast("Nueva pregunta")}>
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Agregar
              </Button>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                {faqs.map((f, i) => (
                  <AccordionItem key={f.q} value={`f${i}`}>
                    <AccordionTrigger className="text-left text-sm">{f.q}</AccordionTrigger>
                    <AccordionContent>
                      <Textarea rows={4} defaultValue={f.a} />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
