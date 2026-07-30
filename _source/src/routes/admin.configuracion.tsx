import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Code,
  Edit,
  Globe,
  KeyRound,
  Languages,
  Loader2,
  Palette,
  Plus,
  Save,
  Search,
  Trash2,
  Webhook,
  Wifi,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/ui-bits";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { formatARS, integrations } from "@/data/admin";
import { PropertyItem, propertyService, settingService } from "@/lib/services";

export const Route = createFileRoute("/admin/configuracion")({
  component: Configuracion,
});

function Configuracion() {
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [loadingProps, setLoadingProps] = useState(true);

  // Estado Tab General
  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [houseRules, setHouseRules] = useState("");
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // Branding & Themeing
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("215 45% 20%");
  const [accentColor, setAccentColor] = useState("174 62% 47%");

  // Idiomas
  const [enabledLangs, setEnabledLangs] = useState<string[]>(["es"]);

  // Webhooks CRM
  const [whLead, setWhLead] = useState("");
  const [whResCreated, setWhResCreated] = useState("");
  const [whResConfirmed, setWhResConfirmed] = useState("");
  const [whResCancelled, setWhResCancelled] = useState("");

  // Analytics & Tracking
  const [gaId, setGaId] = useState("");
  const [gtmId, setGtmId] = useState("");
  const [pixelId, setPixelId] = useState("");
  const [customScript, setCustomScript] = useState("");

  // SEO & Geo
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [keywords, setKeywords] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [lat, setLat] = useState(-41.1335);
  const [lng, setLng] = useState(-71.3103);
  const [currency, setCurrency] = useState("ARS");

  // Modal Crear / Editar Propiedad
  const [editingProp, setEditingProp] = useState<Partial<PropertyItem> | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadAll = async () => {
    try {
      setLoadingProps(true);
      setLoadingSettings(true);
      const [propsData, settsData] = await Promise.all([
        propertyService.getAll(),
        settingService.get(),
      ]);
      setProperties(propsData);

      setBusinessName(settsData.businessName || "Bariloche Suite");
      setAddress(settsData.address || "");
      setWhatsapp(settsData.whatsapp || "");
      setEmail(settsData.email || "");
      setHouseRules(settsData.houseRules || "");

      setLogoUrl(settsData.logoUrl || "");
      setPrimaryColor(settsData.primaryColor || "215 45% 20%");
      setAccentColor(settsData.accentColor || "174 62% 47%");

      setEnabledLangs(settsData.enabledLanguages || ["es"]);

      setWhLead(settsData.webhookLeadCreated || "");
      setWhResCreated(settsData.webhookReservationCreated || "");
      setWhResConfirmed(settsData.webhookReservationConfirmed || "");
      setWhResCancelled(settsData.webhookReservationCancelled || "");

      setGaId(settsData.googleAnalyticsId || "");
      setGtmId(settsData.googleTagManagerId || "");
      setPixelId(settsData.metaPixelId || "");
      setCustomScript(settsData.customHeadScript || "");

      setMetaTitle(settsData.metaTitle || "");
      setMetaDesc(settsData.metaDescription || "");
      setKeywords(settsData.keywords || "");
      setOgImage(settsData.ogImage || "");
      setFaviconUrl(settsData.faviconUrl || "");
      setLat(settsData.latitude || -41.1335);
      setLng(settsData.longitude || -71.3103);
      setCurrency(settsData.currencyCode || "ARS");
    } catch (e) {
      console.error("Error al cargar configuración:", e);
    } finally {
      setLoadingProps(false);
      setLoadingSettings(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleSaveGeneralSettings = async () => {
    try {
      setSavingSettings(true);
      const current = await settingService.get();
      await settingService.update({
        ...current,
        businessName,
        address,
        whatsapp,
        email,
        houseRules,
        logoUrl,
        primaryColor,
        accentColor,
        enabledLanguages: enabledLangs,
        webhookLeadCreated: whLead,
        webhookReservationCreated: whResCreated,
        webhookReservationConfirmed: whResConfirmed,
        webhookReservationCancelled: whResCancelled,
        googleAnalyticsId: gaId,
        googleTagManagerId: gtmId,
        metaPixelId: pixelId,
        customHeadScript: customScript,
        metaTitle,
        metaDescription: metaDesc,
        keywords,
        ogImage,
        faviconUrl,
        latitude: lat,
        longitude: lng,
        currencyCode: currency,
      });
      toast.success("Configuración White-Label guardada en el sistema");
    } catch (e) {
      toast.error("Error al guardar configuración");
    } finally {
      setSavingSettings(false);
    }
  };

  const toggleLanguage = (lang: string) => {
    if (lang === "es") return; // Español siempre activo
    setEnabledLangs((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const handleOpenModal = (p?: PropertyItem) => {
    if (p) {
      setEditingProp({ ...p });
    } else {
      setEditingProp({
        name: "",
        tagline: "",
        address: "",
        maxGuests: 6,
        bedrooms: 3,
        bathrooms: 2,
        petsAllowed: false,
        isMain: properties.length === 0,
        active: true,
        wifiNetwork: "",
        wifiPassword: "",
        lockCode: "",
        checkInInfo: "Check-in a partir de las 15:00 hs con clave digital",
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
        const updated = await propertyService.update(editingProp.id, editingProp as PropertyItem);
        setProperties((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        toast.success("Propiedad actualizada");
      } else {
        const created = await propertyService.create(editingProp as PropertyItem);
        setProperties((prev) => [...prev, created]);
        toast.success("Nueva propiedad registrada");
      }
      setEditingProp(null);
    } catch (e: any) {
      toast.error("Error al guardar propiedad");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProperty = async (id: string) => {
    if (!confirm("¿Estás seguro de que querés eliminar esta propiedad del sistema?")) return;

    try {
      setSubmitting(true);
      await propertyService.delete(id);
      setProperties((prev) => prev.filter((p) => p.id !== id));
      toast.success("Propiedad eliminada correctamente.");
      setEditingProp(null);
    } catch (e: any) {
      toast.error("Error al eliminar la propiedad");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración White-Label"
        description="Identidad de marca, idiomas, integraciones CRM, analítica SPA y SEO."
        actions={
          <Button size="sm" className="rounded-full" onClick={handleSaveGeneralSettings} disabled={savingSettings}>
            {savingSettings ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
            Guardar Configuración
          </Button>
        }
      />

      <Tabs defaultValue="general">
        <TabsList className="flex flex-wrap gap-1">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="branding"><Palette className="mr-1.5 h-3.5 w-3.5 text-teal" /> Branding</TabsTrigger>
          <TabsTrigger value="idiomas"><Languages className="mr-1.5 h-3.5 w-3.5 text-teal" /> Idiomas</TabsTrigger>
          <TabsTrigger value="webhooks"><Webhook className="mr-1.5 h-3.5 w-3.5 text-teal" /> Webhooks CRM</TabsTrigger>
          <TabsTrigger value="analytics"><Globe className="mr-1.5 h-3.5 w-3.5 text-teal" /> Tracking & Analytics</TabsTrigger>
          <TabsTrigger value="seo"><Search className="mr-1.5 h-3.5 w-3.5 text-teal" /> SEO & Geo</TabsTrigger>
          <TabsTrigger value="propiedades">Propiedades</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <Card className="border-border/70 shadow-soft">
            <CardHeader>
              <CardTitle className="font-display text-base">Datos de la empresa / alojamiento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingSettings ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-teal" />
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre comercial</Label>
                    <Input id="nombre" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dir">Dirección principal</Label>
                    <Input id="dir" value={address} onChange={(e) => setAddress(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wsp">WhatsApp comercial</Label>
                    <Input id="wsp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mail">Email de reservas</Label>
                    <Input id="mail" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="politicas">Políticas de la casa</Label>
                    <Textarea id="politicas" rows={3} value={houseRules} onChange={(e) => setHouseRules(e.target.value)} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="mt-6">
          <Card className="border-border/70 shadow-soft">
            <CardHeader>
              <CardTitle className="font-display text-base">Personalización de Marca y Colores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <ImageUploader
                    preset="logo"
                    value={logoUrl}
                    onChange={setLogoUrl}
                    label="Logo de la Empresa"
                    description="Optimizado automáticamente a máx 600px (PNG, SVG, WebP)."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pColor">Color Primario (HSL o Hex)</Label>
                  <Input id="pColor" placeholder="215 45% 20%" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aColor">Color de Acento (Teal / Lake)</Label>
                  <Input id="aColor" placeholder="174 62% 47%" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="idiomas" className="mt-6">
          <Card className="border-border/70 shadow-soft">
            <CardHeader>
              <CardTitle className="font-display text-base">Idiomas Habilitados en la Web</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Seleccioná qué idiomas estarán disponibles para los visitantes. Si solo seleccionás **Español**, el selector de idiomas en la cabecera **se ocultará automáticamente**.
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 rounded-xl border p-3 bg-muted/20">
                  <Checkbox checked disabled />
                  <div>
                    <p className="text-sm font-semibold">🇪🇸 Español (Principal)</p>
                    <p className="text-xs text-muted-foreground">Siempre activo por defecto.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border p-3">
                  <Checkbox
                    id="enLang"
                    checked={enabledLangs.includes("en")}
                    onCheckedChange={() => toggleLanguage("en")}
                  />
                  <Label htmlFor="enLang" className="cursor-pointer">
                    <p className="text-sm font-semibold">🇬🇧 English (Inglés)</p>
                    <p className="text-xs text-muted-foreground">Habilita selector [EN] en el Navbar y traducciones.</p>
                  </Label>
                </div>

                <div className="flex items-center gap-3 rounded-xl border p-3">
                  <Checkbox
                    id="ptLang"
                    checked={enabledLangs.includes("pt")}
                    onCheckedChange={() => toggleLanguage("pt")}
                  />
                  <Label htmlFor="ptLang" className="cursor-pointer">
                    <p className="text-sm font-semibold">🇧🇷 Português (Portugués)</p>
                    <p className="text-xs text-muted-foreground">Habilita selector [PT] en el Navbar para turismo de Brasil.</p>
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="mt-6">
          <Card className="border-border/70 shadow-soft">
            <CardHeader>
              <CardTitle className="font-display text-base">Webhooks de Automatización (Make / Zapier / n8n / CRM)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Configurá las URLs de webhook donde el sistema enviará notificaciones JSON automáticas ante cada evento.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="whLead">Webhook: Nueva Consulta (Lead)</Label>
                  <Input id="whLead" placeholder="https://hook.make.com/..." value={whLead} onChange={(e) => setWhLead(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whResCreated">Webhook: Reserva Generada</Label>
                  <Input id="whResCreated" placeholder="https://hook.make.com/..." value={whResCreated} onChange={(e) => setWhResCreated(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whResConfirmed">Webhook: Reserva Confirmada</Label>
                  <Input id="whResConfirmed" placeholder="https://hook.make.com/..." value={whResConfirmed} onChange={(e) => setWhResConfirmed(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whResCancelled">Webhook: Reserva Cancelada</Label>
                  <Input id="whResCancelled" placeholder="https://hook.make.com/..." value={whResCancelled} onChange={(e) => setWhResCancelled(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card className="border-border/70 shadow-soft">
            <CardHeader>
              <CardTitle className="font-display text-base">Métricas, Google Analytics y Pixels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="ga">Google Analytics ID</Label>
                  <Input id="ga" placeholder="G-XXXXXXXXXX" value={gaId} onChange={(e) => setGaId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gtm">Google Tag Manager ID</Label>
                  <Input id="gtm" placeholder="GTM-XXXXXXX" value={gtmId} onChange={(e) => setGtmId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pixel">Meta Pixel ID (Facebook)</Label>
                  <Input id="pixel" placeholder="1234567890" value={pixelId} onChange={(e) => setPixelId(e.target.value)} />
                </div>
                <div className="space-y-2 sm:col-span-3">
                  <Label htmlFor="script">Script Personalizado de Seguimiento (&lt;head&gt;)</Label>
                  <Textarea id="script" rows={3} placeholder="<!-- Script de tracking -->" value={customScript} onChange={(e) => setCustomScript(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="mt-6">
          <Card className="border-border/70 shadow-soft">
            <CardHeader>
              <CardTitle className="font-display text-base">SEO, OpenGraph y Geolocalización</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="mTitle">Meta Title Global</Label>
                  <Input id="mTitle" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="mDesc">Meta Description</Label>
                  <Textarea id="mDesc" rows={2} value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="kw">Palabras Clave (Keywords)</Label>
                  <Input id="kw" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <ImageUploader
                    preset="opengraph"
                    value={ogImage}
                    onChange={setOgImage}
                    label="Imagen OpenGraph (WhatsApp / Redes)"
                    description="Redimensionada automáticamente a 1200x630px para vistas previas en redes."
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <ImageUploader
                    preset="favicon"
                    value={faviconUrl}
                    onChange={setFaviconUrl}
                    label="Favicon / Icono de Navegador"
                    description="Recorte cuadrado automático 1:1 (128x128px)."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lat">Latitud GEO</Label>
                  <Input id="lat" type="number" step="any" value={lat} onChange={(e) => setLat(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lng">Longitud GEO</Label>
                  <Input id="lng" type="number" step="any" value={lng} onChange={(e) => setLng(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="curr">Código de Moneda</Label>
                  <Input id="curr" placeholder="ARS / USD / EUR" value={currency} onChange={(e) => setCurrency(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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
              {loadingProps ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-teal" />
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {properties.map((p) => (
                    <div key={p.id} className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-soft flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-display text-base font-semibold">{p.name}</p>
                              {p.isMain && <Badge className="bg-teal text-teal-foreground text-[10px]">Principal</Badge>}
                              {p.active === false ? (
                                <Badge variant="outline" className="border-warning/50 text-warning text-[10px]">Pausada (Standby)</Badge>
                              ) : (
                                <Badge className="bg-success text-success-foreground text-[10px]">Publicada</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{p.address}</p>
                            {p.tagline && <p className="text-xs text-muted-foreground/80 italic mt-0.5">{p.tagline}</p>}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenModal(p)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" title="Eliminar propiedad" onClick={() => handleDeleteProperty(p.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div><span className="text-muted-foreground">Capacidad:</span> <span className="font-medium">{p.maxGuests} personas</span></div>
                          <div><span className="text-muted-foreground">Distribución:</span> <span className="font-medium">{p.bedrooms || 3} habs · {p.bathrooms || 2} baños</span></div>
                          <div><span className="text-muted-foreground">Mascotas:</span> <span className="font-medium">{p.petsAllowed ? "Sí permite 🐾" : "No"}</span></div>
                          <div><span className="text-muted-foreground">Precio base:</span> <span className="font-semibold text-teal">{formatARS(p.basePrice)}</span></div>
                        </div>
                      </div>
                      <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-1.5 text-xs mt-2">
                        <p className="flex items-center gap-1.5 font-medium text-foreground">
                          <Wifi className="h-3.5 w-3.5 text-teal shrink-0" /> Red WiFi: <span className="font-mono font-semibold">{p.wifiNetwork || "Sin definir"}</span> {p.wifiPassword ? <span className="text-muted-foreground text-[11px]">(Clave: {p.wifiPassword})</span> : null}
                        </p>
                        <p className="flex items-center gap-1.5 font-medium text-foreground">
                          <KeyRound className="h-3.5 w-3.5 text-teal shrink-0" /> Cerradura: <span className="font-mono font-semibold">{p.lockCode || "Sin definir"}</span>
                        </p>
                        {p.checkInInfo && (
                          <p className="text-[11px] text-muted-foreground pt-1.5 border-t border-border/40">
                            ℹ️ {p.checkInInfo}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={editingProp !== null} onOpenChange={(o) => !o && setEditingProp(null)}>
            <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display">{editingProp?.id ? "Editar Propiedad" : "Nueva Propiedad"}</DialogTitle>
                <DialogDescription>Configurá los datos operativos y credenciales para el huésped.</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="pName">Nombre de la propiedad *</Label>
                  <Input id="pName" placeholder="ej: Casa Nahuel" value={editingProp?.name || ""} onChange={(e) => setEditingProp((prev) => ({ ...prev, name: e.target.value }))} />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="pTagline">Subtítulo / Bajada corta</Label>
                  <Input id="pTagline" placeholder="ej: Vista panorámica al Lago Nahuel Huapi" value={editingProp?.tagline || ""} onChange={(e) => setEditingProp((prev) => ({ ...prev, tagline: e.target.value }))} />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="pAddress">Dirección o Ubicación *</Label>
                  <Input id="pAddress" placeholder="ej: Av. Bustillo Km 6,400" value={editingProp?.address || ""} onChange={(e) => setEditingProp((prev) => ({ ...prev, address: e.target.value }))} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pMaxGuests">Capacidad (Huéspedes)</Label>
                  <Input id="pMaxGuests" type="number" min={1} value={editingProp?.maxGuests || 6} onChange={(e) => setEditingProp((prev) => ({ ...prev, maxGuests: Number(e.target.value) }))} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pBedrooms">Habitaciones / Dormitorios</Label>
                  <Input id="pBedrooms" type="number" min={1} value={editingProp?.bedrooms ?? 3} onChange={(e) => setEditingProp((prev) => ({ ...prev, bedrooms: Number(e.target.value) }))} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pBathrooms">Baños completos</Label>
                  <Input id="pBathrooms" type="number" min={1} value={editingProp?.bathrooms ?? 2} onChange={(e) => setEditingProp((prev) => ({ ...prev, bathrooms: Number(e.target.value) }))} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pBasePrice">Precio Base Noche (ARS)</Label>
                  <Input id="pBasePrice" type="number" value={editingProp?.basePrice || 185000} onChange={(e) => setEditingProp((prev) => ({ ...prev, basePrice: Number(e.target.value) }))} />
                </div>

                <div className="sm:col-span-2 pt-2 border-t border-border/60 space-y-3">
                  <p className="text-xs font-semibold text-teal flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5" /> Datos Extra & Credenciales de Acceso
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="pWifiNet" className="text-xs">Nombre de Red WiFi (SSID)</Label>
                      <Input id="pWifiNet" placeholder="ej: Catedral_Guest" value={editingProp?.wifiNetwork || ""} onChange={(e) => setEditingProp((prev) => ({ ...prev, wifiNetwork: e.target.value }))} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pWifiPass" className="text-xs">Contraseña de WiFi</Label>
                      <Input id="pWifiPass" placeholder="ej: Nieve2026" value={editingProp?.wifiPassword || ""} onChange={(e) => setEditingProp((prev) => ({ ...prev, wifiPassword: e.target.value }))} />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="pLockCode" className="text-xs">Código de Cerradura Digital / Alarma</Label>
                      <Input id="pLockCode" placeholder="ej: 1192#" value={editingProp?.lockCode || ""} onChange={(e) => setEditingProp((prev) => ({ ...prev, lockCode: e.target.value }))} />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="pCheckInInfo" className="text-xs">Instrucciones de Check-in para el Huésped</Label>
                      <Textarea id="pCheckInInfo" rows={2} placeholder="ej: Check-in a partir de las 15:00 hs con clave digital en la puerta." value={editingProp?.checkInInfo || ""} onChange={(e) => setEditingProp((prev) => ({ ...prev, checkInInfo: e.target.value }))} />
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2 pt-2 border-t border-border/60 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground">Opciones y Visibilidad</p>

                  <div className="flex items-center justify-between rounded-xl border border-border p-3 bg-muted/20">
                    <div>
                      <p className="text-xs font-semibold">¿Publicada y Activa en la Web?</p>
                      <p className="text-[11px] text-muted-foreground">Si se desactiva, la propiedad queda en Standby y se oculta de toda la web pública.</p>
                    </div>
                    <Switch checked={editingProp?.active !== false} onCheckedChange={(val) => setEditingProp((prev) => ({ ...prev, active: val }))} />
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-border p-3">
                    <div>
                      <p className="text-xs font-semibold">¿Admite Mascotas?</p>
                      <p className="text-[11px] text-muted-foreground">Muestra icono de pet-friendly al huésped.</p>
                    </div>
                    <Switch checked={editingProp?.petsAllowed || false} onCheckedChange={(val) => setEditingProp((prev) => ({ ...prev, petsAllowed: val }))} />
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-border p-3">
                    <div>
                      <p className="text-xs font-semibold">¿Es Propiedad Principal?</p>
                      <p className="text-[11px] text-muted-foreground">Se muestra por defecto en la portada de la web.</p>
                    </div>
                    <Switch checked={editingProp?.isMain || false} onCheckedChange={(val) => setEditingProp((prev) => ({ ...prev, isMain: val }))} />
                  </div>
                </div>
              </div>

              <Separator />

              <DialogFooter className="flex flex-row items-center justify-between sm:justify-between">
                <div>
                  {editingProp?.id && properties.length > 1 && (
                    <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteProperty(editingProp.id!)}>
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Eliminar
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={() => setEditingProp(null)}>Cancelar</Button>
                  <Button onClick={handleSaveProperty} disabled={submitting}>
                    {submitting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />} Guardar Propiedad
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
