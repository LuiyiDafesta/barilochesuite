import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Edit, KeyRound, Loader2, Plus, Save, Star, Wifi } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/ui-bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { formatARS, integrations } from "@/data/admin";
import { property } from "@/data/site";
import { PropertyItem, propertyService } from "@/lib/services";

export const Route = createFileRoute("/admin/configuracion")({
  component: Configuracion,
});

function Configuracion() {
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Crear / Editar Propiedad
  const [editingProp, setEditingProp] = useState<Partial<PropertyItem> | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const data = await propertyService.getAll();
      setProperties(data);
    } catch (e) {
      console.error("Error al cargar propiedades de Supabase:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const handleOpenModal = (p?: PropertyItem) => {
    if (p) {
      setEditingProp(p);
    } else {
      setEditingProp({
        name: "",
        tagline: "",
        address: "",
        maxGuests: 4,
        petsAllowed: false,
        isMain: properties.length === 0,
        wifiNetwork: "",
        wifiPassword: "",
        lockCode: "",
        checkInInfo: "Check-in a partir de las 15:00 hs",
        basePrice: 185000,
      });
    }
  };

  const handleSaveProperty = async () => {
    if (!editingProp || !editingProp.name) {
      toast.error("Por favor ingresá el nombre de la propiedad.");
      return;
    }

    try {
      setSubmitting(true);
      if (editingProp.id) {
        const updated = await propertyService.update(editingProp.id, editingProp);
        setProperties((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        toast.success("Propiedad actualizada en Supabase");
      } else {
        const created = await propertyService.create(editingProp);
        setProperties((prev) => [...prev, created]);
        toast.success("Nueva propiedad registrada en Supabase");
      }
      setEditingProp(null);
    } catch (e: any) {
      toast.error("Error al guardar propiedad");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración"
        description="Datos del negocio, notificaciones, integraciones y gestión multipropiedad."
        actions={
          <Button size="sm" className="rounded-full" onClick={() => toast.success("Configuración guardada")}>
            <Save className="mr-1.5 h-3.5 w-3.5" /> Guardar
          </Button>
        }
      />

      <Tabs defaultValue="propiedades">
        <TabsList>
          <TabsTrigger value="propiedades">Propiedades (Multipropiedad)</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>
          <TabsTrigger value="integraciones">Integraciones</TabsTrigger>
        </TabsList>

        <TabsContent value="propiedades" className="mt-6 space-y-6">
          <Card className="border-border/70 shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-display text-lg">Propiedades Registradas</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Gestioná los datos específicos de cada propiedad (WiFi, claves de acceso, capacidad y precios).
                </p>
              </div>
              <Button size="sm" className="rounded-full" onClick={() => handleOpenModal()}>
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Nueva Propiedad
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-teal" />
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {properties.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-soft"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-display text-base font-semibold">{p.name}</p>
                            {p.isMain && (
                              <Badge className="bg-teal text-teal-foreground text-[10px]">
                                Principal
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{p.address}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenModal(p)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Capacidad:</span>{" "}
                          <span className="font-medium">{p.maxGuests} personas</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Mascotas:</span>{" "}
                          <span className="font-medium">{p.petsAllowed ? "Sí permite 🐾" : "No"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Precio base:</span>{" "}
                          <span className="font-semibold text-teal">{formatARS(p.basePrice)}</span>
                        </div>
                      </div>

                      <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-1 text-xs">
                        <p className="flex items-center gap-1.5 font-medium text-foreground">
                          <Wifi className="h-3.5 w-3.5 text-teal" /> WiFi: {p.wifiNetwork || "Sin definir"}
                        </p>
                        <p className="flex items-center gap-1.5 font-medium text-foreground">
                          <KeyRound className="h-3.5 w-3.5 text-teal" /> Cerradura / Safe: {p.lockCode || "Sin definir"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Modal Crear / Editar Propiedad */}
          <Dialog open={editingProp !== null} onOpenChange={(o) => !o && setEditingProp(null)}>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle className="font-display">
                  {editingProp?.id ? "Editar Propiedad" : "Nueva Propiedad"}
                </DialogTitle>
                <DialogDescription>
                  Configurá los datos operativos y credenciales para el huésped.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="pName">Nombre de la propiedad *</Label>
                  <Input
                    id="pName"
                    placeholder="ej: Casa Nahuel / Loft Catedral"
                    value={editingProp?.name || ""}
                    onChange={(e) => setEditingProp((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="pAddress">Dirección o Ubicación *</Label>
                  <Input
                    id="pAddress"
                    placeholder="ej: Av. Bustillo Km 6,400"
                    value={editingProp?.address || ""}
                    onChange={(e) => setEditingProp((prev) => ({ ...prev, address: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pMaxGuests">Capacidad Máxima</Label>
                  <Input
                    id="pMaxGuests"
                    type="number"
                    min={1}
                    value={editingProp?.maxGuests || 4}
                    onChange={(e) => setEditingProp((prev) => ({ ...prev, maxGuests: Number(e.target.value) }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pBasePrice">Precio Base por Noche (ARS)</Label>
                  <Input
                    id="pBasePrice"
                    type="number"
                    value={editingProp?.basePrice || 185000}
                    onChange={(e) => setEditingProp((prev) => ({ ...prev, basePrice: Number(e.target.value) }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pWifiNet">Red WiFi</Label>
                  <Input
                    id="pWifiNet"
                    placeholder="ej: CasaNahuel_5G"
                    value={editingProp?.wifiNetwork || ""}
                    onChange={(e) => setEditingProp((prev) => ({ ...prev, wifiNetwork: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pWifiPass">Clave WiFi</Label>
                  <Input
                    id="pWifiPass"
                    placeholder="ej: Nahuel2026"
                    value={editingProp?.wifiPassword || ""}
                    onChange={(e) => setEditingProp((prev) => ({ ...prev, wifiPassword: e.target.value }))}
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="pLockCode">Código de Cerradura / Caja Fuerte</Label>
                  <Input
                    id="pLockCode"
                    placeholder="ej: 4829#"
                    value={editingProp?.lockCode || ""}
                    onChange={(e) => setEditingProp((prev) => ({ ...prev, lockCode: e.target.value }))}
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border p-3 sm:col-span-2">
                  <div>
                    <p className="text-xs font-semibold">¿Admite Mascotas?</p>
                    <p className="text-[11px] text-muted-foreground">Muestra icono de pet-friendly al huésped.</p>
                  </div>
                  <Switch
                    checked={editingProp?.petsAllowed || false}
                    onCheckedChange={(val) => setEditingProp((prev) => ({ ...prev, petsAllowed: val }))}
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border p-3 sm:col-span-2">
                  <div>
                    <p className="text-xs font-semibold">¿Es Propiedad Principal / Destacada?</p>
                    <p className="text-[11px] text-muted-foreground">Se muestra por defecto en la portada de la web.</p>
                  </div>
                  <Switch
                    checked={editingProp?.isMain || false}
                    onCheckedChange={(val) => setEditingProp((prev) => ({ ...prev, isMain: val }))}
                  />
                </div>
              </div>

              <Separator />

              <DialogFooter>
                <Button variant="ghost" onClick={() => setEditingProp(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveProperty} disabled={submitting}>
                  {submitting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                  Guardar Propiedad
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

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
              ].map((n, i, arr) => (
                <div key={n.label}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{n.label}</p>
                      <p className="text-xs text-muted-foreground">{n.detail}</p>
                    </div>
                    <Switch defaultChecked onCheckedChange={() => toast("Preferencia actualizada")} />
                  </div>
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
