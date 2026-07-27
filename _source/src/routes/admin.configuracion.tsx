import { createFileRoute } from "@tanstack/react-router";
import { Plug, Save } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/ui-bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { integrations, properties } from "@/data/admin";
import { property } from "@/data/site";

export const Route = createFileRoute("/admin/configuracion")({
  component: Configuracion,
});

function Configuracion() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración"
        description="Datos del negocio, notificaciones e integraciones."
        actions={
          <Button size="sm" className="rounded-full" onClick={() => toast.success("Configuración guardada")}>
            <Save className="mr-1.5 h-3.5 w-3.5" /> Guardar
          </Button>
        }
      />

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="propiedades">Propiedades</TabsTrigger>
          <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>
          <TabsTrigger value="integraciones">Integraciones</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <Card className="border-border/70 shadow-soft">
            <CardHeader>
              <CardTitle className="font-display text-base">Datos del alojamiento</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre comercial</Label>
                <Input id="nombre" defaultValue={property.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dir">Dirección</Label>
                <Input id="dir" defaultValue={property.address} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wsp">WhatsApp</Label>
                <Input id="wsp" defaultValue={property.whatsapp} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mail">Email de contacto</Label>
                <Input id="mail" defaultValue={property.email} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="politicas">Políticas de la casa</Label>
                <Textarea
                  id="politicas"
                  rows={4}
                  defaultValue="Check in 15:00 · Check out 10:00. No se permiten fiestas ni eventos. Prohibido fumar dentro del departamento."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="propiedades" className="mt-6">
          <Card className="border-border/70 shadow-soft">
            <CardHeader>
              <CardTitle className="font-display text-base">Multipropiedad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {properties.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.location}</p>
                  </div>
                  <Switch defaultChecked={p.id === "prop-1"} onCheckedChange={() => toast("Propiedad actualizada")} />
                </div>
              ))}
              <Button variant="outline" size="sm" className="rounded-full" onClick={() => toast("Nueva propiedad")}>
                Agregar propiedad
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificaciones" className="mt-6">
          <Card className="border-border/70 shadow-soft">
            <CardHeader>
              <CardTitle className="font-display text-base">Avisos automáticos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Nueva consulta por email", detail: "Recibí un aviso apenas llega un lead" },
                { label: "Nueva consulta por WhatsApp", detail: "Notificación instantánea al celular" },
                { label: "Recordatorio de check in", detail: "24 horas antes de la llegada" },
                { label: "Solicitud de reseña", detail: "48 horas después del check out" },
                { label: "Resumen semanal", detail: "Cada lunes a las 9:00" },
              ].map((n, i, arr) => (
                <div key={n.label}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{n.label}</p>
                      <p className="text-xs text-muted-foreground">{n.detail}</p>
                    </div>
                    <Switch defaultChecked onCheckedChange={() => toast("Preferencia actualizada")} />
                  </div>
                  {i < arr.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integraciones" className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {integrations.map((i) => (
              <Card key={i.name} className="border-border/70 shadow-soft">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-display text-base font-semibold">{i.name}</p>
                      <p className="text-xs text-muted-foreground">{i.description}</p>
                    </div>
                    <Plug className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="rounded-full font-normal">
                      {i.status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => toast(`Conectar ${i.name}`, { description: "Próximamente disponible." })}
                    >
                      Conectar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
