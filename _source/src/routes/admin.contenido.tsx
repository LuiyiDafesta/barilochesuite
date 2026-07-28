import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Image, Languages, Loader2, Plus, Save, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/ui-bits";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { settingService } from "@/lib/services";

export const Route = createFileRoute("/admin/contenido")({
  component: Contenido,
});

function Contenido() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabledLangs, setEnabledLangs] = useState<string[]>(["es"]);

  // Hero
  const [eyebrow, setEyebrow] = useState("");
  const [eyebrowEn, setEyebrowEn] = useState("");
  const [eyebrowPt, setEyebrowPt] = useState("");

  const [title, setTitle] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [titlePt, setTitlePt] = useState("");

  const [subtitle, setSubtitle] = useState("");
  const [subtitleEn, setSubtitleEn] = useState("");
  const [subtitlePt, setSubtitlePt] = useState("");

  const [bgImage, setBgImage] = useState("");

  // Experiencia
  const [expTitle, setExpTitle] = useState("");
  const [expTitleEn, setExpTitleEn] = useState("");
  const [expTitlePt, setExpTitlePt] = useState("");

  const [expDesc, setExpDesc] = useState("");
  const [expDescEn, setExpDescEn] = useState("");
  const [expDescPt, setExpDescPt] = useState("");

  const [expBlocks, setExpBlocks] = useState<any[]>([]);

  // Amenities
  const [amenitiesList, setAmenitiesList] = useState<any[]>([]);

  // Footer
  const [footerDesc, setFooterDesc] = useState("");
  const [footerDescEn, setFooterDescEn] = useState("");
  const [footerDescPt, setFooterDescPt] = useState("");

  const [copyright, setCopyright] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");

  const loadContent = async () => {
    try {
      setLoading(true);
      const s = await settingService.get();
      setEnabledLangs(s.enabledLanguages || ["es"]);

      setEyebrow(s.heroEyebrow || "BARILOCHE · PATAGONIA ARGENTINA");
      setEyebrowEn(s.heroEyebrow_en || "");
      setEyebrowPt(s.heroEyebrow_pt || "");

      setTitle(s.heroTitle || "Un refugio de montaña frente al Nahuel Huapi");
      setTitleEn(s.heroTitle_en || "");
      setTitlePt(s.heroTitle_pt || "");

      setSubtitle(s.heroSubtitle || "");
      setSubtitleEn(s.heroSubtitle_en || "");
      setSubtitlePt(s.heroSubtitle_pt || "");

      setBgImage(s.heroBgImage || "/hero-exterior.jpg");

      setExpTitle(s.experienceTitle || "No es un departamento. Es una forma de vivir Bariloche.");
      setExpTitleEn(s.experienceTitle_en || "");
      setExpTitlePt(s.experienceTitle_pt || "");

      setExpDesc(s.experienceDescription || "");
      setExpDescEn(s.experienceDescription_en || "");
      setExpDescPt(s.experienceDescription_pt || "");

      setExpBlocks(s.experienceBlocks || []);
      setAmenitiesList(s.amenities || []);

      setFooterDesc(s.footerDescription || "");
      setFooterDescEn(s.footerDescription_en || "");
      setFooterDescPt(s.footerDescription_pt || "");

      setCopyright(s.copyrightText || "");
      setInstagram(s.instagramUrl || "");
      setFacebook(s.facebookUrl || "");
    } catch (e) {
      console.error("Error cargando contenido CMS:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      const current = await settingService.get();
      await settingService.update({
        ...current,
        heroEyebrow: eyebrow,
        heroEyebrow_en: eyebrowEn,
        heroEyebrow_pt: eyebrowPt,
        heroTitle: title,
        heroTitle_en: titleEn,
        heroTitle_pt: titlePt,
        heroSubtitle: subtitle,
        heroSubtitle_en: subtitleEn,
        heroSubtitle_pt: subtitlePt,
        heroBgImage: bgImage,
        experienceTitle: expTitle,
        experienceTitle_en: expTitleEn,
        experienceTitle_pt: expTitlePt,
        experienceDescription: expDesc,
        experienceDescription_en: expDescEn,
        experienceDescription_pt: expDescPt,
        experienceBlocks: expBlocks,
        amenities: amenitiesList,
        footerDescription: footerDesc,
        footerDescription_en: footerDescEn,
        footerDescription_pt: footerDescPt,
        copyrightText: copyright,
        instagramUrl: instagram,
        facebookUrl: facebook,
      });
      toast.success("¡Contenido publicado correctamente para todos los idiomas!");
    } catch (e) {
      toast.error("Error al publicar contenido");
    } finally {
      setSaving(false);
    }
  };

  const handleAddExpBlock = () => {
    const newBlock = {
      id: `e_${Date.now()}`,
      title: "Nuevo Bloque",
      title_en: "",
      title_pt: "",
      description: "Descripción de la experiencia...",
      description_en: "",
      description_pt: "",
      image: "/lake-view.jpg",
      badge: "Destacado",
    };
    setExpBlocks((prev) => [...prev, newBlock]);
  };

  const handleRemoveExpBlock = (id: string) => {
    setExpBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleUpdateExpBlock = (id: string, key: string, val: string) => {
    setExpBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [key]: val } : b))
    );
  };

  const handleToggleAmenity = (id: string, visible: boolean) => {
    setAmenitiesList((prev) =>
      prev.map((a) => (a.id === id ? { ...a, visible } : a))
    );
  };

  const handleUpdateAmenity = (id: string, key: string, val: string) => {
    setAmenitiesList((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [key]: val } : a))
    );
  };

  const handleAddAmenity = () => {
    const newA = {
      id: `a_${Date.now()}`,
      title: "Nueva Característica",
      title_en: "",
      title_pt: "",
      description: "Detalle del servicio...",
      description_en: "",
      description_pt: "",
      icon: "Sparkles",
      visible: true,
    };
    setAmenitiesList((prev) => [...prev, newA]);
  };

  const showEn = enabledLangs.includes("en");
  const showPt = enabledLangs.includes("pt");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestor de Contenido CMS Multidioma"
        description="Personalizá los textos, fotos y traducciones de la web pública."
        actions={
          <Button size="sm" className="rounded-full" onClick={handleSaveAll} disabled={saving}>
            {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
            Publicar Cambios
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-teal" />
        </div>
      ) : (
        <Tabs defaultValue="hero">
          <TabsList className="flex flex-wrap gap-1">
            <TabsTrigger value="hero">Portada (Hero)</TabsTrigger>
            <TabsTrigger value="experiencia">La Experiencia</TabsTrigger>
            <TabsTrigger value="amenities">Características & Servicios</TabsTrigger>
            <TabsTrigger value="footer">Pie de Página (Footer)</TabsTrigger>
          </TabsList>

          {/* Tab Portada */}
          <TabsContent value="hero" className="mt-6">
            <Card className="border-border/70 shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-display text-base">Sección de Portada (Hero)</CardTitle>
                {enabledLangs.length > 1 && (
                  <Badge variant="outline" className="text-xs font-normal">
                    <Languages className="mr-1 h-3 w-3 text-teal" /> Idiomas habilitados: {enabledLangs.join(", ").toUpperCase()}
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <ImageUploader
                  preset="photo"
                  value={bgImage}
                  onChange={setBgImage}
                  label="Imagen de Fondo de Portada"
                  description="Optimización y compresión automática a HD (máx 1920px)."
                />

                <Separator />

                {enabledLangs.length > 1 ? (
                  <Tabs defaultValue="es">
                    <TabsList className="h-9">
                      <TabsTrigger value="es" className="text-xs">🇪🇸 Español</TabsTrigger>
                      {showEn && <TabsTrigger value="en" className="text-xs">🇬🇧 English</TabsTrigger>}
                      {showPt && <TabsTrigger value="pt" className="text-xs">🇧🇷 Português</TabsTrigger>}
                    </TabsList>

                    <TabsContent value="es" className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="eyebrow">Antetítulo (Eyebrow)</Label>
                        <Input id="eyebrow" value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="titulo">Título Principal</Label>
                        <Input id="titulo" value={title} onChange={(e) => setTitle(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sub">Subtítulo / Descripción</Label>
                        <Textarea id="sub" rows={3} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
                      </div>
                    </TabsContent>

                    {showEn && (
                      <TabsContent value="en" className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label>Eyebrow (English)</Label>
                          <Input placeholder="BARILOCHE · ARGENTINA" value={eyebrowEn} onChange={(e) => setEyebrowEn(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Main Title (English)</Label>
                          <Input placeholder="A mountain sanctuary facing Lake Nahuel Huapi" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Subtitle (English)</Label>
                          <Textarea rows={3} placeholder="High-end boutique apartment in San Carlos de Bariloche..." value={subtitleEn} onChange={(e) => setSubtitleEn(e.target.value)} />
                        </div>
                      </TabsContent>
                    )}

                    {showPt && (
                      <TabsContent value="pt" className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label>Eyebrow (Português)</Label>
                          <Input placeholder="BARILOCHE · PATAGÔNIA ARGENTINA" value={eyebrowPt} onChange={(e) => setEyebrowPt(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Título Principal (Português)</Label>
                          <Input placeholder="Um refúgio de montanha em frente ao Lago Nahuel Huapi" value={titlePt} onChange={(e) => setTitlePt(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Subtítulo (Português)</Label>
                          <Textarea rows={3} placeholder="Apartamento boutique de alto padrão em San Carlos de Bariloche..." value={subtitlePt} onChange={(e) => setSubtitlePt(e.target.value)} />
                        </div>
                      </TabsContent>
                    )}
                  </Tabs>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="eyebrow">Antetítulo (Eyebrow)</Label>
                      <Input id="eyebrow" value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="titulo">Título Principal</Label>
                      <Input id="titulo" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sub">Subtítulo / Descripción</Label>
                      <Textarea id="sub" rows={3} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Experiencia */}
          <TabsContent value="experiencia" className="mt-6 space-y-6">
            <Card className="border-border/70 shadow-soft">
              <CardHeader>
                <CardTitle className="font-display text-base">Encabezado de "La Experiencia"</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {enabledLangs.length > 1 ? (
                  <Tabs defaultValue="es">
                    <TabsList className="h-9">
                      <TabsTrigger value="es" className="text-xs">🇪🇸 Español</TabsTrigger>
                      {showEn && <TabsTrigger value="en" className="text-xs">🇬🇧 English</TabsTrigger>}
                      {showPt && <TabsTrigger value="pt" className="text-xs">🇧🇷 Português</TabsTrigger>}
                    </TabsList>

                    <TabsContent value="es" className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Título de la Sección</Label>
                        <Input value={expTitle} onChange={(e) => setExpTitle(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Descripción de la Sección</Label>
                        <Textarea rows={2} value={expDesc} onChange={(e) => setExpDesc(e.target.value)} />
                      </div>
                    </TabsContent>

                    {showEn && (
                      <TabsContent value="en" className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label>Section Title (English)</Label>
                          <Input value={expTitleEn} onChange={(e) => setExpTitleEn(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Section Description (English)</Label>
                          <Textarea rows={2} value={expDescEn} onChange={(e) => setExpDescEn(e.target.value)} />
                        </div>
                      </TabsContent>
                    )}

                    {showPt && (
                      <TabsContent value="pt" className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label>Título da Seção (Português)</Label>
                          <Input value={expTitlePt} onChange={(e) => setExpTitlePt(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Descrição da Seção (Português)</Label>
                          <Textarea rows={2} value={expDescPt} onChange={(e) => setExpDescPt(e.target.value)} />
                        </div>
                      </TabsContent>
                    )}
                  </Tabs>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="expT">Título de la Sección</Label>
                      <Input id="expT" value={expTitle} onChange={(e) => setExpTitle(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expD">Descripción de la Sección</Label>
                      <Textarea id="expD" rows={2} value={expDesc} onChange={(e) => setExpDesc(e.target.value)} />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-soft">
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="font-display text-base">Bloques de Experiencia</CardTitle>
                <Button size="sm" variant="outline" className="rounded-full" onClick={handleAddExpBlock}>
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Agregar Bloque
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {expBlocks.map((b, idx) => (
                  <div key={b.id || idx} className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-soft">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-display text-sm font-semibold flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-teal" /> Bloque {idx + 1}: {b.title}
                      </p>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRemoveExpBlock(b.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <ImageUploader
                      preset="photo"
                      value={b.image}
                      onChange={(url) => handleUpdateExpBlock(b.id, "image", url)}
                      label="Imagen del Bloque"
                      description="Compresión automática a HD (máx 1920px)."
                    />

                    <Separator />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Título (Español)</Label>
                        <Input value={b.title} onChange={(e) => handleUpdateExpBlock(b.id, "title", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Etiqueta / Badge (ej: Panorámica)</Label>
                        <Input value={b.badge || ""} onChange={(e) => handleUpdateExpBlock(b.id, "badge", e.target.value)} />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label>Descripción (Español)</Label>
                        <Textarea rows={2} value={b.description} onChange={(e) => handleUpdateExpBlock(b.id, "description", e.target.value)} />
                      </div>

                      {showEn && (
                        <>
                          <div className="space-y-2">
                            <Label>Title (English)</Label>
                            <Input value={b.title_en || ""} onChange={(e) => handleUpdateExpBlock(b.id, "title_en", e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Description (English)</Label>
                            <Input value={b.description_en || ""} onChange={(e) => handleUpdateExpBlock(b.id, "description_en", e.target.value)} />
                          </div>
                        </>
                      )}

                      {showPt && (
                        <>
                          <div className="space-y-2">
                            <Label>Título (Português)</Label>
                            <Input value={b.title_pt || ""} onChange={(e) => handleUpdateExpBlock(b.id, "title_pt", e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Descrição (Português)</Label>
                            <Input value={b.description_pt || ""} onChange={(e) => handleUpdateExpBlock(b.id, "description_pt", e.target.value)} />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Amenities */}
          <TabsContent value="amenities" className="mt-6 space-y-6">
            <Card className="border-border/70 shadow-soft">
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-display text-base">Tarjetas de Características</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">Activá o desactivá cada tarjeta según los servicios de tu propiedad.</p>
                </div>
                <Button size="sm" variant="outline" className="rounded-full" onClick={handleAddAmenity}>
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Agregar Servicio
                </Button>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {amenitiesList.map((a) => (
                  <div key={a.id} className="rounded-2xl border border-border p-4 space-y-3 shadow-soft bg-card">
                    <div className="flex items-center justify-between gap-3">
                      <Input
                        className="font-semibold text-sm h-8"
                        value={a.title}
                        onChange={(e) => handleUpdateAmenity(a.id, "title", e.target.value)}
                      />
                      <Switch
                        checked={a.visible !== false}
                        onCheckedChange={(val) => handleToggleAmenity(a.id, val)}
                      />
                    </div>
                    <Textarea
                      rows={2}
                      className="text-xs"
                      value={a.description}
                      onChange={(e) => handleUpdateAmenity(a.id, "description", e.target.value)}
                    />

                    {showEn && (
                      <div className="space-y-1 pt-1 border-t">
                        <Label className="text-[11px] text-muted-foreground">English Translation:</Label>
                        <Input
                          className="text-xs h-7"
                          placeholder="Title (EN)"
                          value={a.title_en || ""}
                          onChange={(e) => handleUpdateAmenity(a.id, "title_en", e.target.value)}
                        />
                      </div>
                    )}

                    {showPt && (
                      <div className="space-y-1 pt-1 border-t">
                        <Label className="text-[11px] text-muted-foreground">Tradução Português:</Label>
                        <Input
                          className="text-xs h-7"
                          placeholder="Título (PT)"
                          value={a.title_pt || ""}
                          onChange={(e) => handleUpdateAmenity(a.id, "title_pt", e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Footer */}
          <TabsContent value="footer" className="mt-6">
            <Card className="border-border/70 shadow-soft">
              <CardHeader>
                <CardTitle className="font-display text-base">Pie de Página (Footer)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {enabledLangs.length > 1 ? (
                  <Tabs defaultValue="es">
                    <TabsList className="h-9">
                      <TabsTrigger value="es" className="text-xs">🇪🇸 Español</TabsTrigger>
                      {showEn && <TabsTrigger value="en" className="text-xs">🇬🇧 English</TabsTrigger>}
                      {showPt && <TabsTrigger value="pt" className="text-xs">🇧🇷 Português</TabsTrigger>}
                    </TabsList>

                    <TabsContent value="es" className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="fDesc">Descripción Institucional</Label>
                        <Textarea id="fDesc" rows={3} value={footerDesc} onChange={(e) => setFooterDesc(e.target.value)} />
                      </div>
                    </TabsContent>

                    {showEn && (
                      <TabsContent value="en" className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label>Institutional Description (English)</Label>
                          <Textarea rows={3} value={footerDescEn} onChange={(e) => setFooterDescEn(e.target.value)} />
                        </div>
                      </TabsContent>
                    )}

                    {showPt && (
                      <TabsContent value="pt" className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label>Descrição Institucional (Português)</Label>
                          <Textarea rows={3} value={footerDescPt} onChange={(e) => setFooterDescPt(e.target.value)} />
                        </div>
                      </TabsContent>
                    )}
                  </Tabs>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="fDesc">Descripción Institucional</Label>
                    <Textarea id="fDesc" rows={3} value={footerDesc} onChange={(e) => setFooterDesc(e.target.value)} />
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="cRight">Texto Copyright</Label>
                  <Input id="cRight" value={copyright} onChange={(e) => setCopyright(e.target.value)} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="ig">Enlace Instagram</Label>
                    <Input id="ig" placeholder="https://instagram.com/..." value={instagram} onChange={(e) => setInstagram(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fb">Enlace Facebook</Label>
                    <Input id="fb" placeholder="https://facebook.com/..." value={facebook} onChange={(e) => setFacebook(e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
